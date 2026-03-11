import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const EmployeesTable = ({ employees }) => (
  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <CardContent sx={{ flex: 1, minHeight: 0, p: 0 }}>
      <TableContainer sx={{ height: "100%" }}>
        <Table size="small" stickyHeader>
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
          {employees.map((e) => (
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
      </TableContainer>
    </CardContent>
  </Card>
);

export default EmployeesTable;
