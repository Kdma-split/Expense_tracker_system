import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, toQueryString } from "../../api/client";
import RequestTable from "../../components/RequestTable";
import { STATUS_LABEL } from "../../components/constants";

const AdminAnalyticsPage = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    employee: "",
    status: "",
    sortBy: "date",
    sortOrder: "asc"
  });

  const load = async () => {
    const [reqRes, empRes] = await Promise.all([
      api.get(`/requests?${toQueryString({ pageNumber: 1, pageSize: 500 })}`),
      api.get("/admin/employees?includeInactive=true")
    ]);
    setRequests(reqRes.data.items || []);
    setEmployees(empRes.data || []);
  };

  useEffect(() => {
    load();
  }, []);

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

    const sortBy = filters.sortBy;
    const factor = filters.sortOrder === "asc" ? 1 : -1;
    data.sort((a, b) => {
      if (sortBy === "amount") return (a.amount - b.amount) * factor;
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
        <Card>
          <CardContent>
            <Typography variant="h6">Filters</Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="From Date" type="date" InputLabelProps={{ shrink: true }} value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
              <TextField label="To Date" type="date" InputLabelProps={{ shrink: true }} value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
              <TextField
                label="Employee ID / Email"
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {Object.entries(STATUS_LABEL).map(([id, label]) => (
                    <MenuItem key={id} value={id}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select label="Sort By" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Sort Order</InputLabel>
                <Select label="Sort Order" value={filters.sortOrder} onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}>
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>
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
              <Card><CardContent><Typography variant="subtitle1">By Status</Typography><Box height={260}><ResponsiveContainer><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={80} /><Tooltip /><Legend /></PieChart></ResponsiveContainer></Box></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card><CardContent><Typography variant="subtitle1">By Category</Typography><Box height={260}><ResponsiveContainer><BarChart data={byCategory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="amount" fill="#0f4c81" /></BarChart></ResponsiveContainer></Box></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card><CardContent><Typography variant="subtitle1">Amount Trend</Typography><Box height={260}><ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="amount" stroke="#2a9d8f" /></LineChart></ResponsiveContainer></Box></CardContent></Card>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AdminAnalyticsPage;
