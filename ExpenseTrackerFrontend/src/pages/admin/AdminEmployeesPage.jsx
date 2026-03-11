import { useMemo, useState } from "react";
import { Box, Button, Drawer, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useEmployeesQuery } from "../../api/hooks/employees";
import EmployeeCreateDialog from "./components/EmployeeCreateDialog";
import EmployeeUpdateDialog from "./components/EmployeeUpdateDialog";
import EmployeeDeactivateDialog from "./components/EmployeeDeactivateDialog";
import EmployeeFilterPanel from "./components/EmployeeFilterPanel";
import EmployeesTable from "./components/EmployeesTable";

const defaultFilters = {
  fromDate: "",
  toDate: "",
  role: "",
  department: "",
  managerId: "",
  isActive: ""
};

const AdminEmployeesPage = () => {
  const { data: employees = [] } = useEmployeesQuery(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const manageableEmployees = useMemo(
    () =>
      employees.filter((e) => {
        const role = String(e.role || "").toLowerCase();
        return role === "employee" || role === "manager" || role === "director";
      }),
    [employees]
  );

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filteredRows = manageableEmployees.filter((e) => {
      const date = new Date(e.createdDate);
      const fromOk = filters.fromDate ? date >= new Date(filters.fromDate) : true;
      const toOk = filters.toDate ? date <= new Date(filters.toDate) : true;
      const roleOk = filters.role ? String(e.role || "").toLowerCase() === filters.role.toLowerCase() : true;
      const deptOk = filters.department ? String(e.department || "").toLowerCase().includes(filters.department.toLowerCase()) : true;
      const managerOk = filters.managerId ? String(e.managerId || "").includes(filters.managerId) : true;
      const activeOk = filters.isActive !== ""
        ? String(Boolean(e.isActive)) === String(filters.isActive === "true")
        : true;

      const termOk = term
        ? String(e.id).toLowerCase().includes(term)
          || String(e.name || "").toLowerCase().includes(term)
          || String(e.email || "").toLowerCase().includes(term)
        : true;

      return fromOk && toOk && roleOk && deptOk && managerOk && activeOk && termOk;
    });

    const sorted = [...filteredRows];
    const factor = sortOrder === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      const getVal = (row) => {
        switch (sortBy) {
          case "id":
            return Number(row.id);
          case "name":
            return String(row.name || "");
          case "email":
            return String(row.email || "");
          case "role":
            return String(row.role || "");
          case "department":
            return String(row.department || "");
          case "managerId":
            return Number(row.managerId || 0);
          case "isActive":
            return row.isActive ? 1 : 0;
          case "createdDate":
            return new Date(row.createdDate).getTime();
          default:
            return String(row[sortBy] || "");
        }
      };

      const av = getVal(a);
      const bv = getVal(b);

      if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });

    return sorted;
  }, [manageableEmployees, searchTerm, filters, sortBy, sortOrder]);

  const handleSortRequest = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const applyFilters = () => {
    setFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  return (
    <Stack spacing={2} sx={{ height: "calc(100vh - 112px)", minHeight: 0 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
        <Typography variant="h5">Employee Management</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            label="Search employee"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Tooltip title="Filters">
            <IconButton onClick={() => setFiltersOpen(true)} color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Create Employee</Button>
        <Button variant="outlined" onClick={() => setUpdateOpen(true)}>Update Employee</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Deactivate Employee</Button>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <EmployeesTable
          employees={filtered}
          orderBy={sortBy}
          order={sortOrder}
          onRequestSort={handleSortRequest}
        />
      </Box>

      <EmployeeCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EmployeeUpdateDialog open={updateOpen} onClose={() => setUpdateOpen(false)} />
      <EmployeeDeactivateDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} employees={manageableEmployees} />

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
          <EmployeeFilterPanel filters={draftFilters} setFilters={setDraftFilters} />
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
    </Stack>
  );
};

export default AdminEmployeesPage;
