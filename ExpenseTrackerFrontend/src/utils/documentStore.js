const STORAGE_KEY = "expense_documents_v1";

const emptyStore = () => ({
  byDraftId: {},
  byRequestId: {},
  bySignature: {}
});

const normalizeDate = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const safeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "";
};

export const buildRequestSignature = (requestLike) =>
  [
    requestLike?.subject?.trim()?.toLowerCase() || "",
    requestLike?.description?.trim()?.toLowerCase() || "",
    safeNumber(requestLike?.amount),
    Array.isArray(requestLike?.items)
      ? requestLike.items
          .map((item) => [
            item?.description?.trim()?.toLowerCase() || "",
            safeNumber(item?.amount),
            String(item?.categoryId || "")
          ].join(":"))
          .join(",")
      : "",
    normalizeDate(requestLike?.dateOfExpense)
  ].join("|");

const readStore = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return {
      byDraftId: parsed.byDraftId || {},
      byRequestId: parsed.byRequestId || {},
      bySignature: parsed.bySignature || {}
    };
  } catch {
    return emptyStore();
  }
};

const writeStore = (store) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const serializeFiles = async (files) => {
  const serialized = await Promise.all(
    (files || []).map(async (file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size || 0,
      uploadedAt: new Date().toISOString(),
      dataUrl: await fileToDataUrl(file)
    }))
  );
  return serialized;
};

export const saveDocuments = ({ draftId, requestId, requestLike, documents }) => {
  if (!documents?.length) return;
  const store = readStore();
  if (draftId !== undefined && draftId !== null) {
    store.byDraftId[String(draftId)] = documents;
  }
  if (requestId !== undefined && requestId !== null) {
    store.byRequestId[String(requestId)] = documents;
  }
  const signature = buildRequestSignature(requestLike);
  if (signature) {
    store.bySignature[signature] = documents;
  }
  writeStore(store);
};

export const getDocumentsForDraft = (draftId, draftLike) => {
  const store = readStore();
  if (draftId !== undefined && draftId !== null) {
    const byDraft = store.byDraftId[String(draftId)];
    if (byDraft?.length) return byDraft;
  }
  const signature = buildRequestSignature(draftLike);
  return signature ? store.bySignature[signature] || [] : [];
};

export const getDocumentsForRequest = (requestLike) => {
  const store = readStore();
  const byRequest = store.byRequestId[String(requestLike?.id || "")];
  if (byRequest?.length) return byRequest;
  const signature = buildRequestSignature(requestLike);
  return signature ? store.bySignature[signature] || [] : [];
};

export const mapRequestDocuments = (requestLike) => {
  if (!requestLike?.id) return [];
  const docs = getDocumentsForRequest(requestLike);
  if (!docs.length) return [];
  saveDocuments({
    requestId: requestLike.id,
    requestLike,
    documents: docs
  });
  return docs;
};

const dataUrlToBlob = (dataUrl) => {
  const [meta, content] = String(dataUrl || "").split(",");
  if (!meta || !content) {
    throw new Error("Invalid file data");
  }

  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "application/octet-stream";
  const binary = window.atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

export const openDocumentInNewTab = (document) => {
  try {
    const blob = dataUrlToBlob(document?.dataUrl);
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    // Revoke later to avoid leaking object URLs.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return true;
  } catch {
    return false;
  }
};
