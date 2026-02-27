import { Card, CardContent, Stack, Typography } from "@mui/material";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";
import { useRequestsQuery } from "../../api/hooks/requests";

const ManagerApprovedPage = () => {
  const { data } = useRequestsQuery({ status: REQUEST_STATUS.Approved, pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Approved Requests</Typography>
      <Card>
        <CardContent>
          <RequestTable rows={rows} />
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ManagerApprovedPage;
