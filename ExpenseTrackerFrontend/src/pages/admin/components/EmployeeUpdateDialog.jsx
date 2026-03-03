import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { api } from "../../../api/client";
import { useAppMutation } from "../../../api/hooks/mutations";

const DEPARTMENTS = [
  "Microsoft",
  "SalesForce",
  "SAP Technical",
  "Sap MM",
  "Sap OTC",
  "Gen Ai",
  "Data Analytics"
];

const EmployeeUpdateDialog = ({ open, onClose }) => {
  const [id, setId] = useState("");
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", department: "", managerId: "", password: "" });
  const [error, setError] = useState("");
  const updateMutation = useAppMutation(({ id: employeeId, payload }) => api.put(`/admin/employees/${employeeId}`, payload));

  const fetchById = async (value) => {
    if (!value) {
      setEditable(false);
      return;
    }
    setLoading(true);
    setEditable(false);
    setError("");
    try {
      const { data } = await api.get(`/admin/employees/${value}`);
      if (!data) return;
      setForm({
        name: data.name,
        role: data.role,
        department: data.department,
        managerId: data.managerId || "",
        password: ""
      });
      setEditable(true);
    } catch {
      setEditable(false);
      setError("Employee not found");
    } finally {
      setLoading(false);
    }
  };

  const update = async () => {
    await updateMutation.mutateAsync({
      id: Number(id),
      payload: {
        name: form.name,
        role: form.role,
        department: form.department,
        managerId: form.managerId ? Number(form.managerId) : null,
        password: form.password || null
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Update Employee</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Employee ID"
            value={id}
            onChange={(e) => {
              const value = e.target.value;
              setId(value);
              fetchById(value);
            }}
          />
          {error ? <Alert severity="warning">{error}</Alert> : null}
          <TextField label="Name" value={form.name} disabled={!editable || loading} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Role" value={form.role} disabled={!editable || loading} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <FormControl fullWidth disabled={!editable || loading}>
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Manager Id" value={form.managerId} disabled={!editable || loading} onChange={(e) => setForm({ ...form, managerId: e.target.value })} />
          <TextField label="New Password (optional)" type="password" value={form.password} disabled={!editable || loading} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={update} disabled={!editable || loading || updateMutation.isPending}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeUpdateDialog;
