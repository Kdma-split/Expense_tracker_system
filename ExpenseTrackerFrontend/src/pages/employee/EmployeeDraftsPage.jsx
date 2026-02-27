import { useEffect, useState } from "react";
import { Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { api } from "../../api/client";
import CreateRequestDialog from "../../components/CreateRequestDialog";

const EmployeeDraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await api.get("/drafts");
    setDrafts(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submitDraft = async (id) => {
    await api.post(`/drafts/${id}/submit`);
    load();
  };

  const removeDraft = async (id) => {
    await api.delete(`/drafts/${id}`);
    load();
  };

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
                <TableCell>Category</TableCell>
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
                  <TableCell>{d.categoryName}</TableCell>
                  <TableCell>{new Date(d.dateOfExpense).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => { setEditing(d); setOpen(true); }}>Edit</Button>
                      <Button size="small" onClick={() => submitDraft(d.id)} variant="contained">Submit</Button>
                      <Button size="small" onClick={() => removeDraft(d.id)} color="error">Delete</Button>
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
        onSaved={load}
        draftId={editing?.id}
        initialData={editing}
      />
    </Stack>
  );
};

export default EmployeeDraftsPage;
