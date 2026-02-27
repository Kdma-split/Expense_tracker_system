import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 1 }} onClick={() => setSidebarOpen((prev) => !prev)}>
            <MenuIcon />
          </IconButton>
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
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: "width 0.2s ease",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            transition: "transform 0.2s ease"
          }
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
      <Box component="main" sx={{ flexGrow: 1, p: 3, transition: "margin-left 0.2s ease", ml: sidebarOpen ? 0 : -`${drawerWidth}px` }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
