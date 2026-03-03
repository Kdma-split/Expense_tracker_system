import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { api } from "../api/client";
import { getDocumentsForDraft, saveDocuments, serializeFiles } from "../utils/documentStore";

const initialState = {
  subject: "",
  description: "",
  amount: "",
  dateOfExpense: new Date().toISOString().slice(0, 10)
};

const CreateRequestDialog = ({ open, onClose, onSaved, draftId, initialData }) => {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadToastOpen, setUploadToastOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          subject: initialData.subject || "",
          description: initialData.description || "",
          amount: initialData.amount || "",
          dateOfExpense: (initialData.dateOfExpense || "").slice(0, 10)
        });
      } else {
        setForm(initialState);
      }
      const existingDocs = getDocumentsForDraft(draftId, initialData);
      setUploadedDocuments(existingDocs);
      setUploadedFiles(
        existingDocs.map((doc) => ({
          name: doc.name,
          size: doc.size,
          type: doc.type
        }))
      );
      setUploadToastOpen(false);
    }
  }, [open, initialData, draftId]);

  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onUploadDocuments = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const serialized = await serializeFiles(files);
    setUploadedFiles(files);
    setUploadedDocuments(serialized);
    setUploadToastOpen(true);
    // Allow re-selecting the same file(s).
    event.target.value = "";
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        amount: Number(form.amount),
        dateOfExpense: new Date(`${form.dateOfExpense}T00:00:00`).toISOString()
      };

      const response = draftId
        ? await api.put(`/drafts/${draftId}`, payload)
        : await api.post("/drafts", payload);
      const persistedDraftId = draftId ?? response?.data?.id;
      if (uploadedDocuments.length) {
        saveDocuments({
          draftId: persistedDraftId,
          requestLike: payload,
          documents: uploadedDocuments
        });
      }
      onSaved?.();
      onClose();
      setForm(initialState);
      setUploadedFiles([]);
      setUploadedDocuments([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Subject" value={form.subject} onChange={(e) => change("subject", e.target.value)} />
          <TextField label="Description" multiline minRows={3} value={form.description} onChange={(e) => change("description", e.target.value)} />
          <TextField label="Amount" type="number" value={form.amount} onChange={(e) => change("amount", e.target.value)} />
          <TextField label="Date of Expense" type="date" InputLabelProps={{ shrink: true }} value={form.dateOfExpense} onChange={(e) => change("dateOfExpense", e.target.value)} />
          <Stack direction="row" spacing={2} alignItems="center">
            <Button component="label" variant="outlined">
              Add Documents
              <input type="file" hidden multiple onChange={onUploadDocuments} />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {uploadedFiles.length
                ? `${uploadedFiles.length} file(s) selected`
                : ""}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={saveDraft} disabled={saving}>
          Save Draft
        </Button>
      </DialogActions>
      <Snackbar
        open={uploadToastOpen}
        autoHideDuration={2200}
        onClose={() => setUploadToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setUploadToastOpen(false)}>
          Document(s) uploaded successfully
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CreateRequestDialog;
