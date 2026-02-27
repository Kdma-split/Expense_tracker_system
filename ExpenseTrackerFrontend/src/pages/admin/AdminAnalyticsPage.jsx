import { useMemo, useState } from "react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import RequestTable from "../../components/RequestTable";
import { STATUS_LABEL } from "../../components/constants";
import { useEmployeesQuery } from "../../api/hooks/employees";
import { useRequestsQuery } from "../../api/hooks/requests";
import AnalyticsFilterPanel from "./components/AnalyticsFilterPanel";
import StatusPieChartCard from "./components/StatusPieChartCard";
import CategoryBarChartCard from "./components/CategoryBarChartCard";
import TrendLineChartCard from "./components/TrendLineChartCard";

const AdminAnalyticsPage = () => {
  const { data: requestData } = useRequestsQuery({ pageNumber: 1, pageSize: 500 });
  const { data: employees = [] } = useEmployeesQuery(true);
  const requests = requestData?.items || [];
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    employee: "",
    status: "",
    sortBy: "date",
    sortOrder: "asc"
  });

  const employeeIdFromFilter = useMemo(() => {
    if (!filters.employee) return null;
    if (filters.employee.includes("@")) {
      const found = employees.find((e) => e.email.toLowerCase() === filters.employee.toLowerCase());
      return found?.id || null;
    }
    const num = Number(filters.employee);
    return Number.isNaN(num) ? null : num;
  }, [filters.employee, employees]);

  const filtered = useMemo(() => {
    let data = [...requests];
    if (filters.fromDate) data = data.filter((r) => new Date(r.createdAt) >= new Date(filters.fromDate));
    if (filters.toDate) data = data.filter((r) => new Date(r.createdAt) <= new Date(filters.toDate));
    if (employeeIdFromFilter) data = data.filter((r) => r.employeeId === employeeIdFromFilter);
    if (filters.status !== "") data = data.filter((r) => String(r.status) === String(filters.status));

    const factor = filters.sortOrder === "asc" ? 1 : -1;
    data.sort((a, b) => {
      if (filters.sortBy === "amount") return (a.amount - b.amount) * factor;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
    });
    return data;
  }, [requests, filters, employeeIdFromFilter]);

  const byStatus = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      map[STATUS_LABEL[r.status]] = (map[STATUS_LABEL[r.status]] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      map[r.categoryName] = (map[r.categoryName] || 0) + Number(r.amount || 0);
    });
    return Object.entries(map).map(([name, amount]) => ({ name, amount }));
  }, [filtered]);

  const trend = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      map[day] = (map[day] || 0) + Number(r.amount || 0);
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [filtered]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <AnalyticsFilterPanel filters={filters} setFilters={setFilters} statusLabelMap={STATUS_LABEL} />
      </Grid>

      <Grid size={{ xs: 12, md: 9 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6">Filtered Requests</Typography>
              <RequestTable rows={filtered} />
            </CardContent>
          </Card>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatusPieChartCard data={byStatus} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CategoryBarChartCard data={byCategory} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TrendLineChartCard data={trend} />
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AdminAnalyticsPage;
