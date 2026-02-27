import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { api } from "../../../api/client";
import { useAppMutation } from "../../../api/hooks/mutations";

const EmployeeDeactivateDialog = ({ open, onClose, employees }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const deactivateMutation = useAppMutation((id) => api.patch(`/admin/employees/${id}/status`, { isActive: false }));

  const deactivate = async () => {
    let id = employeeId ? Number(employeeId) : null;
    if (!id && email) {
      const found = employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
      id = found?.id;
    }
    if (!id) return;
    await deactivateMutation.mutateAsync(id);
    onClose();
    setEmployeeId("");
    setEmail("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Delete Employee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          <TextField label="or Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
