import { useEffect, useState } from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { api, toQueryString } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";
import CreateRequestDialog from "../../components/CreateRequestDialog";

const EmployeeApprovedPage = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const approved = await api.get(`/requests?${toQueryString({ status: REQUEST_STATUS.Approved, pageNumber: 1, pageSize: 100 })}`);
    const paid = await api.get(`/requests?${toQueryString({ status: REQUEST_STATUS.Paid, pageNumber: 1, pageSize: 100 })}`);
    setRows([...(approved.data.items || []), ...(paid.data.items || [])]);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Approved Requests</Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ alignSelf: "flex-start" }}>
        Raise A Request
      </Button>
      <Card>
        <CardContent>
          <RequestTable rows={rows} />
        </CardContent>
      </Card>
      <CreateRequestDialog open={open} onClose={() => setOpen(false)} onSaved={load} />
    </Stack>
  );
};

export default EmployeeApprovedPage;
