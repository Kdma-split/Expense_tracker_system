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
  Button,
  Collapse
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidth = 250;

const menuByRole = {
  Employee: [
    { label: "Drafts", path: "/employee/drafts" },
    { label: "Submitted Requests", path: "/employee/submitted" },
    { label: "Approved Requests", path: "/employee/approved" },
    { label: "Rejected Requests", path: "/employee/rejected" }
  ],
  Manager: {
    "My Requests": [
      { label: "Drafts", path: "/employee/drafts" },
      { label: "Submitted", path: "/employee/submitted" },
      { label: "Approved", path: "/employee/approved" },
      { label: "Rejected", path: "/employee/rejected" }
    ],
    "Team Requests": [
      { label: "Pending", path: "/manager/pending" },
      { label: "Approved", path: "/manager/approved" },
      { label: "Rejected", path: "/manager/rejected" }
    ]
  },
  Director: [
    { label: "My Drafts", path: "/employee/drafts" },
    { label: "My Submitted", path: "/employee/submitted" },
    { label: "My Approved", path: "/employee/approved" },
    { label: "My Rejected", path: "/employee/rejected" },
    { label: "Team Pending", path: "/manager/pending" },
    { label: "Team Approved", path: "/manager/approved" },
    { label: "Team Rejected", path: "/manager/rejected" }
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
  const [expandedSections, setExpandedSections] = useState({});

  // Check if user is Manager
  const isManager = user.role === "Manager";
  
  // Get menu items - handle both array (for non-manager roles) and object (for Manager)
  const isNestedMenu = isManager && typeof menu === "object" && !Array.isArray(menu);
  
  const handleSectionClick = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
          {isNestedMenu ? (
            // Manager nested menu
            Object.keys(menu).map((section) => (
              <Box key={section}>
                <ListItemButton 
                  onClick={() => handleSectionClick(section)}
                  sx={{ 
                    bgcolor: expandedSections[section] ? "action.selected" : "transparent"
                  }}
                >
                  <ListItemText 
                    primary={section} 
                    primaryTypographyProps={{
                      fontWeight: expandedSections[section] ? 700 : 400
                    }}
                  />
                  {expandedSections[section] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedSections[section]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {menu[section].map((item) => (
                      <ListItemButton 
                        component={NavLink} 
                        to={item.path} 
                        key={item.path}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))
          ) : (
            // Regular flat menu for other roles
            menu.map((item) => (
              <ListItemButton component={NavLink} to={item.path} key={item.path}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))
          )}
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
