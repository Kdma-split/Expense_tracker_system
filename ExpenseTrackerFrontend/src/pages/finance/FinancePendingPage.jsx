import { useEffect, useState } from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { api, toQueryString } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";

const FinancePendingPage = () => {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get(`/requests?${toQueryString({ status: REQUEST_STATUS.Approved, pageNumber: 1, pageSize: 100 })}`);
    setRows(data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const markPaid = async (requestId) => {
    await api.post("/finance/pay", { requestId, notes: "Paid by finance" });
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
              <Button size="small" variant="contained" onClick={() => markPaid(row.id)}>
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
