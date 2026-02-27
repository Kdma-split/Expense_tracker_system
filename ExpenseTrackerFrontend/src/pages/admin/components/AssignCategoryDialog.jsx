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

const AssignCategoryDialog = ({ open, onClose, categories, onSubmit, pending }) => {
  const [categoryId, setCategoryId] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!open) return;
    setCategoryId("");
    setRemarks("");
  }, [open]);

  const submit = () => {
    if (!categoryId) return;
    onSubmit({ categoryId: Number(categoryId), remarks: remarks.trim() || null });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Category</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Remarks (optional)"
            multiline
            minRows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!categoryId || pending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCategoryDialog;
