import { useState } from "react";
import {
  Alert,
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
  const [error, setError] = useState("");
  const createMutation = useAppMutation((payload) => api.post("/admin/employees", payload));

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) return "Email format is invalid";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.department.trim()) return "Department is required";
    if (!(form.role === "Employee" || form.role === "Manager")) return "Role must be Employee or Manager";
    if (form.managerId.trim()) {
      const managerId = Number(form.managerId.trim());
      if (!Number.isInteger(managerId) || managerId <= 0) return "Manager Id must be a positive integer";
    }
    return "";
  };

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    try {
      await createMutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        role: form.role,
        department: form.department.trim(),
        managerId: form.managerId.trim() ? Number(form.managerId.trim()) : null
      });
      setForm({ name: "", email: "", password: "", role: "Employee", department: "", managerId: "" });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create employee");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create Employee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField required label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField required label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField required label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
            </Select>
          </FormControl>
          <TextField required label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
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
