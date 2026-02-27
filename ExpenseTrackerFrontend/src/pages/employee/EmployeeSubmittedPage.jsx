import { useState } from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";
import CreateRequestDialog from "../../components/CreateRequestDialog";
import { useRequestsQuery } from "../../api/hooks/requests";
import { useInvalidateExpenseData } from "../../api/hooks/mutations";

const EmployeeSubmittedPage = () => {
  const [open, setOpen] = useState(false);
  const invalidate = useInvalidateExpenseData();
  const { data } = useRequestsQuery({ status: REQUEST_STATUS.Submitted, pageNumber: 1, pageSize: 100 });
  const rows = data?.items || [];

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Submitted Requests</Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ alignSelf: "flex-start" }}>
        Raise A Request
      </Button>
      <Card>
        <CardContent>
          <RequestTable rows={rows} />
        </CardContent>
      </Card>
      <CreateRequestDialog open={open} onClose={() => setOpen(false)} onSaved={invalidate} />
    </Stack>
  );
};

export default EmployeeSubmittedPage;
