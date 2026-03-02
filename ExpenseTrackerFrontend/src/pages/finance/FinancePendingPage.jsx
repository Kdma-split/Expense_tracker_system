import { useState } from "react";
import { Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Typography } from "@mui/material";
import { api } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";
import { useRequestsQuery } from "../../api/hooks/requests";
import { useAppMutation } from "../../api/hooks/mutations";

const FinancePendingPage = () => {
  const { data } = useRequestsQuery({ status: REQUEST_STATUS.Approved, pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");

  const markPaidMutation = useAppMutation(({ requestId, notes }) =>
    api.post("/finance/pay", { requestId: Number(requestId), notes })
  );

  const openDialog = (requestId) => {
    setSelectedRequest(requestId);
    setRemarks("");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    markPaidMutation.mutate({ requestId: selectedRequest, notes: remarks });
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
              <Button size="small" variant="contained" onClick={() => openDialog(row.id)}>
                Mark Paid
              </Button>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Mark as Paid</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Notes (optional)"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="success">
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default FinancePendingPage;
