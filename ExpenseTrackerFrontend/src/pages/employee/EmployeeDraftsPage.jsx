import { useState } from "react";
import { Button, Card, CardContent, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { api } from "../../api/client";
import CreateRequestDialog from "../../components/CreateRequestDialog";
import { useDraftsQuery } from "../../api/hooks/drafts";
import { useAppMutation, useInvalidateExpenseData } from "../../api/hooks/mutations";
import { getDocumentsForDraft, openDocumentInNewTab, saveDocuments } from "../../utils/documentStore";

const EmployeeDraftsPage = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const invalidate = useInvalidateExpenseData();
  const { data: drafts = [] } = useDraftsQuery();
  const submitDraftMutation = useAppMutation(async (draft) => {
    const response = await api.post(`/drafts/${draft.id}/submit`);
    const docs = getDocumentsForDraft(draft.id, draft);
    if (docs.length) {
      saveDocuments({
        requestId: response?.data?.id,
        requestLike: draft,
        documents: docs
      });
    }
    return response;
  });
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
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drafts.map((d) => {
                const documents = getDocumentsForDraft(d.id, d);
                const itemCategories = (d.items || []).map((item) => item.categoryName || "Uncategorized");
                const distinctCategories = Array.from(new Set(itemCategories));
                const categoryLabel =
                  distinctCategories.length > 1
                    ? "Multiple"
                    : distinctCategories[0] || d.categoryName || "Uncategorized";
                return (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{d.subject}</TableCell>
                    <TableCell>{d.amount}</TableCell>
                    <TableCell>{categoryLabel}</TableCell>
                    <TableCell>{new Date(d.dateOfExpense).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {documents.length
                          ? documents.map((doc) => (
                              <Stack key={doc.id} direction="row" spacing={1}>
                                <Typography variant="caption" sx={{ maxWidth: 140 }} noWrap title={doc.name}>
                                  {doc.name}
                                </Typography>
                                <Link
                                  href="#"
                                  variant="caption"
                                  underline="hover"
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
                              </Stack>
                            ))
                          : "-"}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => { setEditing(d); setOpen(true); }}>Edit</Button>
                        <Button size="small" onClick={() => submitDraftMutation.mutate(d)} variant="contained">Submit</Button>
                        <Button size="small" onClick={() => removeDraftMutation.mutate(d.id)} color="error">Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
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
