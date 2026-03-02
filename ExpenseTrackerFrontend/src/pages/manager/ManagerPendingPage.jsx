import { useState } from "react";
import { Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Typography } from "@mui/material";
import { api } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { useTeamPendingQuery } from "../../api/hooks/requests";
import { useAppMutation } from "../../api/hooks/mutations";

const ManagerPendingPage = () => {
  const { data } = useTeamPendingQuery({ pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");

  const approveMutation = useAppMutation(({ requestId, comments }) =>
    api.post("/requests/approve", { requestId: Number(requestId), comments })
  );
  const rejectMutation = useAppMutation(({ requestId, comment }) =>
    api.post("/requests/reject", { requestId: Number(requestId), comment })
  );

  const openDialog = (type, requestId) => {
    setDialogType(type);
    setSelectedRequest(requestId);
    setRemarks("");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (dialogType === "approve") {
      approveMutation.mutate({ requestId: selectedRequest, comments: remarks });
    } else {
      if (!remarks.trim()) {
        alert("Please enter a rejection reason");
        return;
      }
      rejectMutation.mutate({ requestId: selectedRequest, comment: remarks });
    }
    setDialogOpen(false);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Pending Requests</Typography>
      <Card>
        <CardContent>
          <RequestTable
            rows={rows}
            actions={(row) => (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={() => openDialog("approve", row.id)}>Approve</Button>
                <Button size="small" color="error" onClick={() => openDialog("reject", row.id)}>Reject</Button>
              </Stack>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{dialogType === "approve" ? "Approve Request" : "Reject Request"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={dialogType === "approve" ? "Comments (optional)" : "Reason for rejection"}
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color={dialogType === "approve" ? "success" : "error"}>
            {dialogType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ManagerPendingPage;
