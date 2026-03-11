import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material";

const columns = [
  { id: "id", label: "ID", numeric: true },
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "role", label: "Role" },
  { id: "department", label: "Department" },
  { id: "managerId", label: "Manager ID", numeric: true },
  { id: "isActive", label: "Active" },
  { id: "createdDate", label: "Created" }
];

const EmployeesTable = ({ employees, orderBy, order, onRequestSort }) => (
  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <CardContent sx={{ flex: 1, minHeight: 0, p: 0 }}>
      <TableContainer sx={{ height: "100%" }}>
        <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                sortDirection={orderBy === column.id ? order : false}
                align={column.numeric ? "right" : "left"}
              >
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "asc"}
                  onClick={() => onRequestSort(column.id)}
                  hideSortIcon
                  sx={{
                    fontWeight: 600,
                    "& .MuiTableSortLabel-icon": {
                      opacity: 0.6,
                      fontSize: "1rem"
                    }
                  }}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={e.id}>
              <TableCell align="right">{e.id}</TableCell>
              <TableCell>{e.name}</TableCell>
              <TableCell>{e.email}</TableCell>
              <TableCell>{e.role}</TableCell>
              <TableCell>{e.department}</TableCell>
              <TableCell align="right">{e.managerId}</TableCell>
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
