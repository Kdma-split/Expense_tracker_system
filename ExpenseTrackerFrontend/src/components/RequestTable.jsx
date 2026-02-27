import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { STATUS_LABEL } from "./constants";

const RequestTable = ({ rows, actions }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>Employee</TableCell>
        <TableCell>Subject</TableCell>
        <TableCell>Category</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Status</TableCell>
        {actions ? <TableCell>Actions</TableCell> : null}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.id}</TableCell>
          <TableCell>{row.employeeId}</TableCell>
          <TableCell>{row.subject}</TableCell>
          <TableCell>{row.categoryName}</TableCell>
          <TableCell>{row.amount}</TableCell>
          <TableCell>{new Date(row.createdAt || row.dateOfExpense).toLocaleDateString()}</TableCell>
          <TableCell>
            <Chip label={STATUS_LABEL[row.status]} size="small" />
          </TableCell>
          {actions ? <TableCell>{actions(row)}</TableCell> : null}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default RequestTable;
