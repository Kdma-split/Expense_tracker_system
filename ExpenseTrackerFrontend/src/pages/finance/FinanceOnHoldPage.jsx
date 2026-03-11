import { useState } from "react";
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, TextField, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";
import { useRequestsQuery } from "../../api/hooks/requests";
import { useAppMutation } from "../../api/hooks/mutations";
import { api } from "../../api/client";

const FinanceOnHoldPage = () => {
  const { data } = useRequestsQuery({ status: REQUEST_STATUS.OnHold, pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);

  const markPaidMutation = useAppMutation(({ requestId, notes }) =>
    api.post("/finance/pay", { requestId: Number(requestId), notes })
  );
  const rejectMutation = useAppMutation(({ requestId, notes }) =>
    api.post("/finance/reject", { requestId: Number(requestId), notes })
  );

  const openDialog = (type, requestId) => {
    setDialogType(type);
    setSelectedRequest(requestId);
    setRemarks("");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (dialogType === "approve") {
      markPaidMutation.mutate({ requestId: selectedRequest, notes: remarks });
    } else {
      rejectMutation.mutate({ requestId: selectedRequest, notes: remarks });
    }
    setDialogOpen(false);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">On Hold Requests</Typography>
      <Card>
        <CardContent>
          <RequestTable
            rows={rows}
            actions={(row) => (
              <IconButton
                size="small"
                onClick={(e) => { setMenuAnchor(e.currentTarget); setSelectedRequest(row.id); }}
                sx={{
                  border: "1px solid",
                  borderColor: "primary.light",
                  bgcolor: "rgba(37, 99, 235, 0.08)",
                  color: "primary.main",
                  borderRadius: 1.5,
                  transition: "all 160ms ease",
                  "&:hover": {
                    bgcolor: "rgba(37, 99, 235, 0.16)",
                    borderColor: "primary.main",
                    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
                    transform: "translateY(-1px)"
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {dialogType === "approve" ? "Mark as Paid" : "Reject Request"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes (optional)"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color={dialogType === "reject" ? "error" : "success"}>
            {dialogType === "approve" ? "Confirm Payment" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            minWidth: 180,
            borderRadius: 2,
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)"
          }
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            openDialog("approve", selectedRequest);
          }}
          sx={{ gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
            <CheckCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Mark Paid"
            primaryTypographyProps={{ fontWeight: 600, color: "success.main" }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            openDialog("reject", selectedRequest);
          }}
          sx={{ gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
            <CancelOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Reject"
            primaryTypographyProps={{ fontWeight: 600, color: "error.main" }}
          />
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default FinanceOnHoldPage;
