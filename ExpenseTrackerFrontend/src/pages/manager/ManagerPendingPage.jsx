import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { api } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { useTeamPendingQuery } from "../../api/hooks/requests";
import { useAppMutation } from "../../api/hooks/mutations";

const ManagerPendingPage = () => {
  const { data } = useTeamPendingQuery({ pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];
  const approveMutation = useAppMutation((requestId) =>
    api.post("/requests/approve", { requestId: Number(requestId), comments: "Approved by manager" })
  );
  const rejectMutation = useAppMutation(({ requestId, comment }) =>
    api.post("/requests/reject", { requestId: Number(requestId), comment })
  );

  const reject = (requestId) => {
    const comment = window.prompt("Enter rejection remark");
    if (!comment) return;
    rejectMutation.mutate({ requestId, comment });
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
                <Button size="small" variant="contained" onClick={() => approveMutation.mutate(row.id)}>Approve</Button>
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
