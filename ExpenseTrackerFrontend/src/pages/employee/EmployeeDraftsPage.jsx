import { useState } from "react";
import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { api } from "../../api/client";
import CreateRequestDialog from "../../components/CreateRequestDialog";
import { useDraftsQuery } from "../../api/hooks/drafts";
import { useAppMutation, useInvalidateExpenseData } from "../../api/hooks/mutations";

const EmployeeDraftsPage = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const invalidate = useInvalidateExpenseData();
  const { data: drafts = [] } = useDraftsQuery();
  const submitDraftMutation = useAppMutation((id) => api.post(`/drafts/${id}/submit`));
  const removeDraftMutation = useAppMutation((id) => api.delete(`/drafts/${id}`));

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Drafts</Typography>
      <Button variant="contained" onClick={() => { setEditing(null); setOpen(true); }} sx={{ alignSelf: "flex-start" }}>
        Raise A Request
      </Button>
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Category (Admin Set After Payment)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drafts.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.subject}</TableCell>
                  <TableCell>{d.amount}</TableCell>
                  <TableCell>{d.categoryName || "Uncategorized"}</TableCell>
                  <TableCell>{new Date(d.dateOfExpense).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => { setEditing(d); setOpen(true); }}>Edit</Button>
                      <Button size="small" onClick={() => submitDraftMutation.mutate(d.id)} variant="contained">Submit</Button>
                      <Button size="small" onClick={() => removeDraftMutation.mutate(d.id)} color="error">Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateRequestDialog
        open={open}
        onClose={() => setOpen(false)}
        onSaved={invalidate}
        draftId={editing?.id}
        initialData={editing}
      />
    </Stack>
  );
};

export default EmployeeDraftsPage;
