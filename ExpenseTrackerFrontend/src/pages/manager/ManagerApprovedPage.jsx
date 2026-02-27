import { useEffect, useState } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { api, toQueryString } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS } from "../../components/constants";

const ManagerApprovedPage = () => {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get(`/requests?${toQueryString({ status: REQUEST_STATUS.Approved, pageNumber: 1, pageSize: 100 })}`);
    setRows(data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

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
