import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";

const AnalyticsFilterPanel = ({ filters, setFilters, statusLabelMap }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">Filters</Typography>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField label="From Date" type="date" InputLabelProps={{ shrink: true }} value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
        <TextField label="To Date" type="date" InputLabelProps={{ shrink: true }} value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
        <TextField label="Employee ID / Email" value={filters.employee} onChange={(e) => setFilters({ ...filters, employee: e.target.value })} />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(statusLabelMap).map(([id, label]) => (
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
);

export default AnalyticsFilterPanel;
