import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import { api } from "../api/client";
import { useCategoriesQuery } from "../api/hooks/categories";

const initialState = {
  subject: "",
  description: "",
  amount: "",
  categoryId: "",
  dateOfExpense: new Date().toISOString().slice(0, 10)
};

const CreateRequestDialog = ({ open, onClose, onSaved, draftId, initialData }) => {
  const { data: categories = [] } = useCategoriesQuery(false, open);
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          subject: initialData.subject || "",
          description: initialData.description || "",
          amount: initialData.amount || "",
          categoryId: initialData.categoryId || "",
          dateOfExpense: (initialData.dateOfExpense || "").slice(0, 10)
        });
      } else {
        setForm(initialState);
      }
    }
  }, [open, initialData]);

  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        amount: Number(form.amount),
        categoryId: Number(form.categoryId),
        dateOfExpense: new Date(`${form.dateOfExpense}T00:00:00`).toISOString()
      };

      if (draftId) {
        await api.put(`/drafts/${draftId}`, payload);
      } else {
        await api.post("/drafts", payload);
      }
      onSaved?.();
      onClose();
      setForm(initialState);
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
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={form.categoryId} onChange={(e) => change("categoryId", e.target.value)}>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={saveDraft} disabled={saving}>
          Save Draft
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRequestDialog;
