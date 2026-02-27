import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { api } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";
import { useRequestsQuery } from "../../api/hooks/requests";
import { useAppMutation } from "../../api/hooks/mutations";

const FinancePendingPage = () => {
  const { data } = useRequestsQuery({ status: REQUEST_STATUS.Approved, pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];
  const markPaidMutation = useAppMutation((requestId) =>
    api.post("/finance/pay", { requestId: Number(requestId), notes: "Paid by finance" })
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Pending Requests</Typography>
      <Card>
        <CardContent>
          <RequestTable
            rows={rows}
            actions={(row) => (
              <Button size="small" variant="contained" onClick={() => markPaidMutation.mutate(row.id)}>
                Mark Paid
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </Stack>
  );
};

export default FinancePendingPage;
