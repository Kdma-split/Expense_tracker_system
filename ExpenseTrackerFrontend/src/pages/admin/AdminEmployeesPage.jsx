import { useMemo, useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { useEmployeesQuery } from "../../api/hooks/employees";
import EmployeeCreateDialog from "./components/EmployeeCreateDialog";
import EmployeeUpdateDialog from "./components/EmployeeUpdateDialog";
import EmployeeDeactivateDialog from "./components/EmployeeDeactivateDialog";
import EmployeeFilterBar from "./components/EmployeeFilterBar";
import EmployeesTable from "./components/EmployeesTable";

const AdminEmployeesPage = () => {
  const { data: employees = [] } = useEmployeesQuery(true);
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const manageableEmployees = useMemo(
    () =>
      employees.filter((e) => {
        const role = String(e.role || "").toLowerCase();
        return role === "employee" || role === "manager";
      }),
    [employees]
  );

  const filtered = useMemo(() => {
    return manageableEmployees.filter((e) => {
      const idOk = employeeIdFilter ? String(e.id).includes(employeeIdFilter) : true;
      const dateOk = dateFilter ? new Date(e.createdDate).toISOString().slice(0, 10) === dateFilter : true;
      return idOk && dateOk;
    });
  }, [manageableEmployees, employeeIdFilter, dateFilter]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Employee Management</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Create Employee</Button>
        <Button variant="outlined" onClick={() => setUpdateOpen(true)}>Update Employee</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Deactivate Employee</Button>
      </Stack>

      <EmployeeFilterBar
        employeeIdFilter={employeeIdFilter}
        setEmployeeIdFilter={setEmployeeIdFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <EmployeesTable employees={filtered} />

      <EmployeeCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EmployeeUpdateDialog open={updateOpen} onClose={() => setUpdateOpen(false)} />
      <EmployeeDeactivateDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} employees={manageableEmployees} />
    </Stack>
  );
};

export default AdminEmployeesPage;
