import { Card, CardContent, Stack, Typography } from "@mui/material";
import RequestTable from "../../components/RequestTable";
import { FINANCE_STATUS, REQUEST_STATUS } from "../../components/constants";
import { useRequestsQuery } from "../../api/hooks/requests";

const FinanceRejectedPage = () => {
  const { data } = useRequestsQuery({ status: REQUEST_STATUS.Rejected, pageNumber: 1, pageSize: 100 });
  const rows = (data?.items || []).filter((row) => row.financeStatus === FINANCE_STATUS.Rejected);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Rejected Requests</Typography>
      <Card>
        <CardContent>
          <RequestTable rows={rows} />
        </CardContent>
      </Card>
    </Stack>
  );
};

export default FinanceRejectedPage;
