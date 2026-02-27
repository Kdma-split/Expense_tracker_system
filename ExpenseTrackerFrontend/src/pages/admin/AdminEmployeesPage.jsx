import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { api } from "../../api/client";
import { useEmployeeByIdQuery, useEmployeesQuery } from "../../api/hooks/employees";
import { useAppMutation } from "../../api/hooks/mutations";

const CreatePopup = ({ open, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Employee", department: "", managerId: "" });
  const createMutation = useAppMutation((payload) => api.post("/admin/employees", payload));

  const save = async () => {
    await createMutation.mutateAsync({
      ...form,
      managerId: form.managerId ? Number(form.managerId) : null
    });
    onClose();
    setForm({ name: "", email: "", password: "", role: "Employee", department: "", managerId: "" });
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
        <Button variant="contained" onClick={save}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};

const UpdatePopup = ({ open, onClose }) => {
  const [id, setId] = useState("");
  const [editable, setEditable] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", department: "", managerId: "", password: "" });
  const [error, setError] = useState("");
  const updateMutation = useAppMutation(({ id: employeeId, payload }) => api.put(`/admin/employees/${employeeId}`, payload));
  const employeeQuery = useEmployeeByIdQuery(id, false);

  const fetchById = async (value) => {
    if (!value) {
      setEditable(false);
      return;
    }
    setEditable(false);
    setError("");
    try {
      const result = await employeeQuery.refetch();
      const data = result.data;
      if (!data) {
        setEditable(false);
        return;
      }
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
    }
  };

  const update = async () => {
    await updateMutation.mutateAsync({
      id,
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
              const v = e.target.value;
              setId(v);
              fetchById(v);
            }}
          />
          {error ? <Alert severity="warning">{error}</Alert> : null}
          <TextField label="Name" value={form.name} disabled={!editable || employeeQuery.isFetching} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Role" value={form.role} disabled={!editable || employeeQuery.isFetching} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <TextField label="Department" value={form.department} disabled={!editable || employeeQuery.isFetching} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <TextField label="Manager Id" value={form.managerId} disabled={!editable || employeeQuery.isFetching} onChange={(e) => setForm({ ...form, managerId: e.target.value })} />
          <TextField label="New Password (optional)" type="password" value={form.password} disabled={!editable || employeeQuery.isFetching} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={update} disabled={!editable || employeeQuery.isFetching}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeletePopup = ({ open, onClose, employees }) => {
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
        <Button color="error" variant="contained" onClick={deactivate}>Deactivate</Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminEmployeesPage = () => {
  const { data: employees = [] } = useEmployeesQuery(true);
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const idOk = employeeIdFilter ? String(e.id).includes(employeeIdFilter) : true;
      const dateOk = dateFilter ? new Date(e.createdDate).toISOString().slice(0, 10) === dateFilter : true;
      return idOk && dateOk;
    });
  }, [employees, employeeIdFilter, dateFilter]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Employee Management</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Create Employee</Button>
        <Button variant="outlined" onClick={() => setUpdateOpen(true)}>Update Employee</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Delete Employee</Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Filter by Employee ID" value={employeeIdFilter} onChange={(e) => setEmployeeIdFilter(e.target.value)} />
        <TextField label="Filter by Created Date" type="date" InputLabelProps={{ shrink: true }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </Stack>
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Manager ID</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.id}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>{e.role}</TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell>{e.managerId}</TableCell>
                  <TableCell>{String(e.isActive)}</TableCell>
                  <TableCell>{new Date(e.createdDate).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreatePopup open={createOpen} onClose={() => setCreateOpen(false)} />
      <UpdatePopup open={updateOpen} onClose={() => setUpdateOpen(false)} />
      <DeletePopup open={deleteOpen} onClose={() => setDeleteOpen(false)} employees={employees} />
    </Stack>
  );
};

export default AdminEmployeesPage;
