import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { api } from "../../../api/client";
import { useAppMutation } from "../../../api/hooks/mutations";

const EmployeeDeactivateDialog = ({ open, onClose, employees }) => {
  const [identifier, setIdentifier] = useState("");
  const deactivateMutation = useAppMutation((id) => api.patch(`/admin/employees/${id}/status`, { isActive: false }));

  const deactivate = async () => {
    const trimmed = identifier.trim();
    if (!trimmed) return;

    let id = /^\d+$/.test(trimmed) ? Number(trimmed) : null;
    if (!id) {
      const found = employees.find((e) => e.email.toLowerCase() === trimmed.toLowerCase());
      id = found?.id;
    }
    if (!id) return;
    await deactivateMutation.mutateAsync(id);
    onClose();
    setIdentifier("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Deactivate Employee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Employee ID or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={deactivate} disabled={deactivateMutation.isPending}>
          Deactivate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDeactivateDialog;
