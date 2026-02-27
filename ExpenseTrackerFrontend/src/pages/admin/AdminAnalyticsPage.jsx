import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  Typography
} from "@mui/material";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS, STATUS_LABEL } from "../../components/constants";
import { useEmployeesQuery } from "../../api/hooks/employees";
import { useRequestsQuery } from "../../api/hooks/requests";
import { useCategoriesQuery } from "../../api/hooks/categories";
import { useAppMutation } from "../../api/hooks/mutations";
import { api } from "../../api/client";
import AnalyticsFilterPanel from "./components/AnalyticsFilterPanel";
import StatusPieChartCard from "./components/StatusPieChartCard";
import CategoryBarChartCard from "./components/CategoryBarChartCard";
import TrendLineChartCard from "./components/TrendLineChartCard";
import AssignCategoryDialog from "./components/AssignCategoryDialog";

const defaultFilters = {
  fromDate: "",
  toDate: "",
  employee: "",
  status: "",
  sortBy: "date",
  sortOrder: "asc",
  highAmountOnly: false
};

const AdminAnalyticsPage = () => {
  const { data: requestData } = useRequestsQuery({ pageNumber: 1, pageSize: 500 });
  const { data: employees = [] } = useEmployeesQuery(true);
  const { data: categories = [] } = useCategoriesQuery(false);
  const assignCategoryMutation = useAppMutation(({ requestId, payload }) =>
    api.patch(`/requests/${requestId}/category`, payload)
  );

  const requests = requestData?.items || [];
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    if (filters.highAmountOnly) data = data.filter((r) => Number(r.amount || 0) >= 1000);

    const factor = filters.sortOrder === "asc" ? 1 : -1;
    data.sort((a, b) => {
      if (filters.sortBy === "amount") return (a.amount - b.amount) * factor;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
    });
    return data;
  }, [requests, filters, employeeIdFromFilter]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, rowsPerPage, page]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

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
      const category = r.categoryName || "Uncategorized";
      map[category] = (map[category] || 0) + Number(r.amount || 0);
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

  const totals = useMemo(() => {
    const totalAmount = filtered.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const pendingCount = filtered.filter((r) => r.status === REQUEST_STATUS.Submitted).length;
    const avg = filtered.length ? totalAmount / filtered.length : 0;
    return { totalAmount, pendingCount, avg, count: filtered.length };
  }, [filtered]);

  const quickApply = (patch) => {
    const next = { ...filters, ...patch };
    setDraftFilters(next);
    setFilters(next);
    setPage(0);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setPage(0);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
    setPage(0);
  };

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.fromDate) chips.push({ key: "fromDate", label: `From: ${filters.fromDate}` });
    if (filters.toDate) chips.push({ key: "toDate", label: `To: ${filters.toDate}` });
    if (filters.employee) chips.push({ key: "employee", label: `Employee: ${filters.employee}` });
    if (filters.status !== "") chips.push({ key: "status", label: `Status: ${STATUS_LABEL[filters.status]}` });
    if (filters.highAmountOnly) chips.push({ key: "highAmountOnly", label: "High Amount (>= 1000)" });
    chips.push({ key: "sort", label: `Sort: ${filters.sortBy} ${filters.sortOrder}` });
    return chips;
  }, [filters]);

  const clearOneFilter = (key) => {
    const next = { ...filters };
    if (key === "sort") {
      next.sortBy = defaultFilters.sortBy;
      next.sortOrder = defaultFilters.sortOrder;
    } else if (key === "highAmountOnly") {
      next.highAmountOnly = false;
    } else {
      next[key] = defaultFilters[key];
    }
    setDraftFilters(next);
    setFilters(next);
    setPage(0);
  };

  const exportFilteredToCsv = () => {
    const rows = filtered.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      subject: r.subject,
      description: r.description,
      categoryName: r.categoryName || "Uncategorized",
      amount: r.amount,
      dateOfExpense: r.dateOfExpense,
      createdAt: r.createdAt,
      status: STATUS_LABEL[r.status] || r.status
    }));

    const headers = [
      "id",
      "employeeId",
      "subject",
      "description",
      "categoryName",
      "amount",
      "dateOfExpense",
      "createdAt",
      "status"
    ];

    const escapeCsv = (value) => {
      const raw = value == null ? "" : String(value);
      return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, "\"\"")}"` : raw;
    };

    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "filtered-requests.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Filters</Typography>
            <Button size="small" onClick={() => setFiltersOpen((prev) => !prev)}>
              {filtersOpen ? "Hide" : "Show"}
            </Button>
          </Stack>
          <Collapse in={filtersOpen}>
            <Stack spacing={1}>
              <AnalyticsFilterPanel filters={draftFilters} setFilters={setDraftFilters} statusLabelMap={STATUS_LABEL} />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={applyFilters} fullWidth>
                  Apply
                </Button>
                <Button variant="outlined" onClick={resetFilters} fullWidth>
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Collapse>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 9 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
            <Box>
              <Typography variant="h5">Analytics</Typography>
              <Typography variant="body2">{filtered.length} results</Typography>
            </Box>
            <Button variant="contained" onClick={exportFilteredToCsv}>
              Export CSV
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label="Paid" onClick={() => quickApply({ status: String(REQUEST_STATUS.Paid) })} />
            <Chip label="Rejected" onClick={() => quickApply({ status: String(REQUEST_STATUS.Rejected) })} />
            <Chip
              label="This Month"
              onClick={() => {
                const now = new Date();
                const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
                quickApply({ fromDate: from, toDate: to });
              }}
            />
            <Chip
              label="High Amount"
              onClick={() => quickApply({ highAmountOnly: !filters.highAmountOnly })}
              color={filters.highAmountOnly ? "primary" : "default"}
            />
          </Stack>

          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Overview" value="overview" />
            <Tab label="Requests" value="requests" />
          </Tabs>

          {activeTab === "overview" ? (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card><CardContent><Typography variant="caption">Total Amount</Typography><Typography variant="h6">{totals.totalAmount.toFixed(2)}</Typography></CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card><CardContent><Typography variant="caption">Request Count</Typography><Typography variant="h6">{totals.count}</Typography></CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card><CardContent><Typography variant="caption">Average Claim</Typography><Typography variant="h6">{totals.avg.toFixed(2)}</Typography></CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card><CardContent><Typography variant="caption">Pending Count</Typography><Typography variant="h6">{totals.pendingCount}</Typography></CardContent></Card>
                </Grid>
              </Grid>

              <StatusPieChartCard data={byStatus} title="Status Distribution" height={460} outerRadius={165} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CategoryBarChartCard data={byCategory} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TrendLineChartCard data={trend} />
                </Grid>
              </Grid>
            </Stack>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6">Filtered Requests</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Sort: {filters.sortBy} ({filters.sortOrder})
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  {activeFilterChips.map((chip) => (
                    <Chip key={chip.key} label={chip.label} onDelete={() => clearOneFilter(chip.key)} />
                  ))}
                </Stack>
                <Divider sx={{ mb: 2 }} />

                {filtered.length === 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">No data for current filters</Typography>
                      <Typography variant="body2">Try removing one or more filters or click Reset in the filter panel.</Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <RequestTable
                      rows={pagedRows}
                      actions={(row) =>
                        row.status === REQUEST_STATUS.Paid ? (
                          <Button size="small" variant="outlined" onClick={() => setSelectedRequest(row)}>
                            Set Category
                          </Button>
                        ) : null
                      }
                    />
                    <TablePagination
                      component="div"
                      count={filtered.length}
                      page={page}
                      onPageChange={(_, nextPage) => setPage(nextPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(0);
                      }}
                      rowsPerPageOptions={[10, 20, 50]}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>

      <AssignCategoryDialog
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        categories={categories}
        pending={assignCategoryMutation.isPending}
        onSubmit={(payload) => {
          if (!selectedRequest) return;
          assignCategoryMutation.mutate(
            { requestId: selectedRequest.id, payload },
            { onSuccess: () => setSelectedRequest(null) }
          );
        }}
      />
    </Grid>
  );
};

export default AdminAnalyticsPage;
