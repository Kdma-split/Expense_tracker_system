import { Chip, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { STATUS_LABEL, STATUS_COLOR } from "./constants";
import { mapRequestDocuments, openDocumentInNewTab } from "../utils/documentStore";

const DocumentLinks = ({ documents }) => {
  if (!documents.length) return "-";
  return (
    <Stack spacing={0.5}>
      {documents.map((doc) => (
        <Stack key={doc.id} direction="row" spacing={1}>
          <Typography variant="caption" sx={{ maxWidth: 140 }} noWrap title={doc.name}>
            {doc.name}
          </Typography>
          <Link
            href="#"
            underline="hover"
            variant="caption"
            onClick={(event) => {
              event.preventDefault();
              const opened = openDocumentInNewTab(doc);
              if (!opened) {
                window.alert("Preview is not available for this file.");
              }
            }}
          >
            View
          </Link>
          <Link href={doc.dataUrl} download={doc.name} underline="hover" variant="caption">
            Download
          </Link>
        </Stack>
      ))}
    </Stack>
  );
};

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
        <TableCell>Comments</TableCell>
        <TableCell>Documents</TableCell>
        {actions ? <TableCell>Actions</TableCell> : null}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => {
        const documents = mapRequestDocuments(row);
        const itemCategories = (row.items || []).map((item) => item.categoryName || "Uncategorized");
        const distinctCategories = Array.from(new Set(itemCategories));
        const categoryLabel =
          distinctCategories.length > 1
            ? "Multiple"
            : distinctCategories[0] || row.categoryName || "Uncategorized";
        return (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.employeeId}</TableCell>
            <TableCell>{row.subject}</TableCell>
            <TableCell>{categoryLabel}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>{new Date(row.createdAt || row.dateOfExpense).toLocaleDateString()}</TableCell>
            <TableCell>
              <Chip label={STATUS_LABEL[row.status]} size="small" color={STATUS_COLOR[row.status]} />
            </TableCell>
            <TableCell>{row.remarks || "-"}</TableCell>
            <TableCell>
              <DocumentLinks documents={documents} />
            </TableCell>
            {actions ? <TableCell>{actions(row)}</TableCell> : null}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export default RequestTable;
