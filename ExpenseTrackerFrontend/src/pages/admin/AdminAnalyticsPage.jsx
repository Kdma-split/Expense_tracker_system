import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  Tooltip,
  Typography
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import InsightsIcon from "@mui/icons-material/Insights";
import RequestTable from "../../components/RequestTable";
import { REQUEST_STATUS, STATUS_LABEL, STATUS_COLOR } from "../../components/constants";
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

const pickVariant = (variants, seed) => variants[Math.abs(seed) % variants.length];

const buildAiInsights = ({ filtered, totals, byCategory, byStatus, trend, styleSeed = 0 }) => {
  if (!filtered.length) {
    return [
      "No requests match the current filters, so there is not enough data for summarization.",
      "Try widening the date range or clearing employee/status filters to generate insights."
    ];
  }

  const submittedCount = byStatus.find((x) => x.name === "Submitted")?.value || 0;
  const paidCount = byStatus.find((x) => x.name === "Paid")?.value || 0;
  const topCategory = [...byCategory].sort((a, b) => b.amount - a.amount)[0];
  const trendPoints = [...trend].sort((a, b) => a.date.localeCompare(b.date));
  const firstTrend = trendPoints[0];
  const lastTrend = trendPoints[trendPoints.length - 1];
  const trendDelta = firstTrend ? lastTrend.amount - firstTrend.amount : 0;
  const trendDirection = trendDelta >= 0 ? "upward" : "downward";
  const paidRate = totals.count ? Math.round((paidCount / totals.count) * 100) : 0;
  const seed = totals.count + Math.round(totals.avg) + submittedCount + paidCount + styleSeed;

  const summaryLine = pickVariant(
    [
      `${totals.count} requests are in scope, with ${totals.totalAmount.toFixed(2)} total spend and an average claim of ${totals.avg.toFixed(2)}.`,
      `Filtered activity includes ${totals.count} requests totaling ${totals.totalAmount.toFixed(2)}, at ${totals.avg.toFixed(2)} per request on average.`,
      `You are currently tracking ${totals.count} requests worth ${totals.totalAmount.toFixed(2)} in total, with a ${totals.avg.toFixed(2)} average claim.`
    ],
    seed
  );

  const categoryLine = topCategory
    ? pickVariant(
        [
          `${topCategory.name} currently leads category spend at ${topCategory.amount.toFixed(2)}.`,
          `Highest category allocation is in ${topCategory.name}, contributing ${topCategory.amount.toFixed(2)}.`,
          `${topCategory.name} is the primary cost driver in this view with ${topCategory.amount.toFixed(2)}.`
        ],
        seed + 1
      )
    : "Category distribution is currently too sparse to identify a clear leader.";

  const workflowLine = pickVariant(
    [
      `${submittedCount} requests are waiting in submitted status, with a paid conversion rate of ${paidRate}%.`,
      `Current workflow shows ${submittedCount} pending submissions, while ${paidRate}% of filtered requests are already paid.`,
      `Queue health: ${submittedCount} submissions are pending and paid completion is tracking at ${paidRate}%.`
    ],
    seed + 2
  );

  const trendLine = firstTrend && lastTrend
    ? pickVariant(
        [
          `Daily claim value moved ${trendDirection} by ${Math.abs(trendDelta).toFixed(2)} between ${firstTrend.date} and ${lastTrend.date}.`,
          `From ${firstTrend.date} to ${lastTrend.date}, daily spend shifted ${trendDirection} by ${Math.abs(trendDelta).toFixed(2)}.`,
          `Comparing ${firstTrend.date} with ${lastTrend.date}, daily expense volume changed ${trendDirection} by ${Math.abs(trendDelta).toFixed(2)}.`
        ],
        seed + 3
      )
    : "Trend signal is limited because there is only one day of data in the filtered view.";

  return [summaryLine, categoryLine, workflowLine, trendLine];
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [briefRunId, setBriefRunId] = useState(0);

  const employeeIdFromFilter = useMemo(() => {
    if (!filters.employee) return null;
    if (filters.employee.includes("@")) {
      const found = employees.find((e) => e.email.toLowerCase() === filters.employee.toLowerCase());
      return found ? found.id : -1;
    }
    const num = Number(filters.employee);
    return Number.isNaN(num) ? -1 : num;
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

  const aiInsights = useMemo(
    () => buildAiInsights({ filtered, totals, byCategory, byStatus, trend, styleSeed: briefRunId }),
    [filtered, totals, byCategory, byStatus, trend, briefRunId]
  );

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
    <Grid container spacing={1.5} sx={{ overflowX: "hidden" }}>
      <Grid size={{ xs: 12 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
            <Box>
              <Typography variant="h5">Analytics</Typography>
              <Typography variant="body2">{filtered.length} results</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Insights">
                <IconButton
                  onClick={() => {
                    setBriefRunId((prev) => prev + 1);
                    setInsightsOpen(true);
                  }}
                  color="primary"
                >
                  <InsightsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filters">
                <IconButton onClick={() => setFiltersOpen(true)} color="primary">
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Button variant="contained" onClick={exportFilteredToCsv}>
                Export CSV
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label="Paid" onClick={() => quickApply({ status: String(REQUEST_STATUS.Paid) })} color={STATUS_COLOR[REQUEST_STATUS.Paid]} />
            <Chip label="Rejected" onClick={() => quickApply({ status: String(REQUEST_STATUS.Rejected) })} color={STATUS_COLOR[REQUEST_STATUS.Rejected]} />
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
            <Stack spacing={1.5}>
              <Grid container spacing={1.5}>
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

              <StatusPieChartCard data={byStatus} title="Status Distribution" height={300} outerRadius={105} />

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CategoryBarChartCard data={byCategory} height={220} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TrendLineChartCard data={trend} height={220} />
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

      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 360 } } }}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Filters</Typography>
            <Button size="small" onClick={() => setFiltersOpen(false)}>
              Close
            </Button>
          </Stack>
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
      </Drawer>

      <Dialog open={insightsOpen} onClose={() => setInsightsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 0.5 }}>
          <Typography variant="overline" sx={{ letterSpacing: 1.1, color: "text.secondary", fontWeight: 700 }}>
            Analytics
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            AI Insights
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              overflow: "hidden",
              borderColor: "rgba(30,64,175,0.22)",
              boxShadow: "0 6px 20px rgba(15,23,42,0.08)"
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                color: "text.primary",
                backgroundColor: "#f1f5f9",
                borderBottom: "1px solid",
                borderColor: "rgba(15,23,42,0.14)"
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Insight Summary
                </Typography>
                <Chip size="small" label="Insight Ready" sx={{ fontWeight: 700, color: "#0f172a", bgcolor: "#e2e8f0" }} />
              </Stack>
            </Box>
            <CardContent sx={{ p: 0 }}>
              <Stack divider={<Divider sx={{ borderColor: "rgba(15,23,42,0.12)" }} />}>
                {aiInsights.map((line, index) => (
                  <Stack key={line} direction="row" spacing={1.5} sx={{ px: 2, py: 1.5 }} alignItems="flex-start">
                    <Box
                      sx={{
                        minWidth: 26,
                        height: 26,
                        borderRadius: "50%",
                        bgcolor: "#dbeafe",
                        color: "#1e3a8a",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        fontWeight: 700
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.65, color: "#0f172a", fontWeight: 500 }}>
                      {line}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

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
