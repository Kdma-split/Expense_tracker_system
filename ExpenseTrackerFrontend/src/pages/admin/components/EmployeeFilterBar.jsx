import { Stack, TextField } from "@mui/material";

const EmployeeFilterBar = ({ employeeIdFilter, setEmployeeIdFilter, dateFilter, setDateFilter }) => (
  <Stack direction="row" spacing={2}>
    <TextField label="Search by Employee ID" value={employeeIdFilter} onChange={(e) => setEmployeeIdFilter(e.target.value)} />
    <TextField label="Filter by Created Date" type="date" InputLabelProps={{ shrink: true }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
  </Stack>
);

export default EmployeeFilterBar;
