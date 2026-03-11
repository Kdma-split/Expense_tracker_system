import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../api/client";
import { useCategoriesQuery } from "../api/hooks/categories";
import { getDocumentsForDraft, saveDocuments, serializeFiles } from "../utils/documentStore";

const initialState = {
  subject: "",
  description: "",
  dateOfExpense: new Date().toISOString().slice(0, 10)
};

const emptyItem = () => ({
  description: "",
  categoryId: "",
  amount: ""
});

const CreateRequestDialog = ({ open, onClose, onSaved, draftId, initialData }) => {
  const [form, setForm] = useState(initialState);
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadToastOpen, setUploadToastOpen] = useState(false);
  const { data: categories = [] } = useCategoriesQuery(false, open);
  const selectableCategories = categories.filter((category) => category.name !== "Uncategorized");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          subject: initialData.subject || "",
          description: initialData.description || "",
          dateOfExpense: (initialData.dateOfExpense || "").slice(0, 10)
        });
        if (Array.isArray(initialData.items) && initialData.items.length) {
          setItems(
            initialData.items.map((item) => ({
              description: item.description || "",
              categoryId: item.categoryId || "",
              amount: item.amount ?? ""
            }))
          );
        } else {
          setItems([
            {
              description: initialData.description || "",
              categoryId: initialData.categoryId || "",
              amount: initialData.amount || ""
            }
          ]);
        }
      } else {
        setForm(initialState);
        setItems([emptyItem()]);
      }
      setError("");
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
  const updateItem = (index, patch) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const totalAmount = items.reduce((sum, item) => {
    const value = Number(item.amount);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  useEffect(() => {
    if (!open) return;
    if (!selectableCategories.length) return;
    const defaultCategoryId = selectableCategories[0].id;
    setItems((prev) =>
      prev.map((item) => (item.categoryId ? item : { ...item, categoryId: defaultCategoryId }))
    );
  }, [open, selectableCategories]);

  const validateDraft = () => {
    if (!form.subject.trim()) return "Subject is required";
    if (!items.length) return "At least one item is required";
    if (!selectableCategories.length) return "No active categories available";
    for (const item of items) {
      if (!item.description?.trim()) return "Each item needs a description";
      const amount = Number(item.amount);
      if (!Number.isFinite(amount) || amount <= 0) return "Each item must have a valid amount";
      const categoryId = Number(item.categoryId);
      if (!Number.isFinite(categoryId) || categoryId <= 0) return "Each item must have a category";
    }
    return "";
  };

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
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        subject: form.subject.trim(),
        description: form.description.trim(),
        dateOfExpense: new Date(`${form.dateOfExpense}T00:00:00`).toISOString(),
        items: items.map((item) => ({
          description: item.description.trim(),
          amount: Number(item.amount),
          categoryId: Number(item.categoryId)
        }))
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
      setItems([emptyItem()]);
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
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Subject" value={form.subject} onChange={(e) => change("subject", e.target.value)} />
          <TextField label="Notes (optional)" multiline minRows={2} value={form.description} onChange={(e) => change("description", e.target.value)} />
          <Stack spacing={1}>
            <Typography variant="subtitle2">Items</Typography>
            {items.map((item, index) => (
              <Stack key={`item-${index}`} spacing={1} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    fullWidth
                  />
                  <IconButton
                    aria-label="remove item"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={item.categoryId}
                      onChange={(e) => updateItem(index, { categoryId: e.target.value })}
                    >
                  {selectableCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Amount"
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(index, { amount: e.target.value })}
                    fullWidth
                  />
                </Stack>
              </Stack>
            ))}
            <Button
              variant="text"
              onClick={addItem}
              startIcon={<AddCircleOutlineIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Item
            </Button>
            <Typography variant="body1" sx={{ alignSelf: "flex-end", fontWeight: 700, color: "error.main" }}>
              Total amount: {totalAmount.toFixed(2)}
            </Typography>
          </Stack>
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
