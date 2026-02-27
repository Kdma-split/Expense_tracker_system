import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button
} from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidth = 250;

const menuByRole = {
  Employee: [
    { label: "Drafts", path: "/employee/drafts" },
    { label: "Submitted Requests", path: "/employee/submitted" },
    { label: "Approved Requests", path: "/employee/approved" }
  ],
  Manager: [
    { label: "Pending Requests", path: "/manager/pending" },
    { label: "Approved Requests", path: "/manager/approved" }
  ],
  Finance: [
    { label: "Pending Requests", path: "/finance/pending" },
    { label: "Approved Requests", path: "/finance/approved" }
  ],
  Admin: [
    { label: "Employees", path: "/admin/employees" },
    { label: "Analytics", path: "/admin/analytics" }
  ]
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const menu = menuByRole[user.role] || [];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }} variant="h6">
            Expense Claim System
          </Typography>
          <Typography sx={{ mr: 2 }} variant="body2">
            {user?.name} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
        }}
      >
        <Toolbar />
        <List>
          {menu.map((item) => (
            <ListItemButton component={NavLink} to={item.path} key={item.path}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
