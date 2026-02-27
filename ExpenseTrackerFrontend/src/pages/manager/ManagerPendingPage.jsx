import { useEffect, useState } from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { api, toQueryString } from "../../api/client";
import RequestTable from "../../components/RequestTable";

const ManagerPendingPage = () => {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get(`/requests/team-pending?${toQueryString({ pageNumber: 1, pageSize: 100 })}`);
    setRows(data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (requestId) => {
    await api.post("/requests/approve", { requestId, comments: "Approved by manager" });
    load();
  };

  const reject = async (requestId) => {
    const comment = window.prompt("Enter rejection remark");
    if (!comment) return;
    await api.post("/requests/reject", { requestId, comment });
    load();
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
                <Button size="small" variant="contained" onClick={() => approve(row.id)}>Approve</Button>
                <Button size="small" color="error" onClick={() => reject(row.id)}>Reject</Button>
              </Stack>
            )}
          />
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ManagerPendingPage;
