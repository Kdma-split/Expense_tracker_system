import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";

const EmployeeFilterPanel = ({ filters, setFilters }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">Filters</Typography>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="From Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.fromDate}
          onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
        />
        <TextField
          label="To Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.toDate}
          onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
        />
        <TextField
          label="Department"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <TextField
          label="Manager ID"
          value={filters.managerId}
          onChange={(e) => setFilters({ ...filters, managerId: e.target.value })}
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="Director">Director</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Active</InputLabel>
          <Select
            label="Active"
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </CardContent>
  </Card>
);

export default EmployeeFilterPanel;
