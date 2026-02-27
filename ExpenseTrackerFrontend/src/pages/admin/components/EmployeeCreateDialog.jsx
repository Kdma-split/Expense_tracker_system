import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { api } from "../../../api/client";
import { useAppMutation } from "../../../api/hooks/mutations";

const EmployeeCreateDialog = ({ open, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    department: "",
    managerId: ""
  });
  const createMutation = useAppMutation((payload) => api.post("/admin/employees", payload));

  const save = async () => {
    await createMutation.mutateAsync({
      ...form,
      managerId: form.managerId ? Number(form.managerId) : null
    });
    setForm({ name: "", email: "", password: "", role: "Employee", department: "", managerId: "" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create Employee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <TextField label="Role (Employee/Manager)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <TextField label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <TextField label="Manager Id" value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={createMutation.isPending}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeCreateDialog;
