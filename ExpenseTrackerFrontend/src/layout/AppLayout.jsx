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
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidth = 250;

const menuByRole = {
  Employee: [
    {
      section: "Requests",
      items: [
        { label: "Drafts", path: "/employee/drafts" },
        { label: "Submitted", path: "/employee/submitted" },
        { label: "Approved", path: "/employee/approved" },
        { label: "Rejected", path: "/employee/rejected" }
      ]
    }
  ],
  Manager: [
    {
      section: "Requests",
      items: [
        { label: "Drafts", path: "/employee/drafts" },
        { label: "Submitted", path: "/employee/submitted" },
        { label: "Approved", path: "/employee/approved" },
        { label: "Rejected", path: "/employee/rejected" }
      ]
    },
    {
      section: "Team Requests",
      items: [
        { label: "Pending", path: "/manager/pending" },
        { label: "Approved", path: "/manager/approved" },
        { label: "Rejected", path: "/manager/rejected" }
      ]
    }
  ],
  Director: [
    {
      section: "Requests",
      items: [
        { label: "Drafts", path: "/employee/drafts" },
        { label: "Submitted", path: "/employee/submitted" },
        { label: "Approved", path: "/employee/approved" },
        { label: "Rejected", path: "/employee/rejected" }
      ]
    },
    {
      section: "Team Requests",
      items: [
        { label: "Pending", path: "/manager/pending" },
        { label: "Approved", path: "/manager/approved" },
        { label: "Rejected", path: "/manager/rejected" }
      ]
    }
  ],
  Finance: [
    {
      section: "Requests",
      collapsible: true,
      items: [
        { label: "Pending", path: "/finance/pending" },
        { label: "On Hold", path: "/finance/on-hold" },
        { label: "Rejected", path: "/finance/rejected" },
        { label: "Approved", path: "/finance/approved" }
      ]
    },
    {
      section: "",
      items: [{ label: "Analytics", path: "/admin/analytics", bold: true }]
    }
  ],
  Admin: [
    {
      section: "",
      items: [
        { label: "Employees", path: "/admin/employees" },
        { label: "Analytics", path: "/admin/analytics" }
      ]
    }
  ]
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const menu = menuByRole[user.role] || [];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const initial = {};
    menu.forEach((section) => {
      if (section.section && section.collapsible !== false) {
        initial[section.section] = true;
      }
    });
    setExpandedSections(initial);
  }, [menu]);

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
          {menu.map((section) => (
            <Box key={section.section}>
              {section.section ? (
                <>
                  {section.collapsible === false ? (
                    <>
                      <ListItemButton disabled>
                        <ListItemText
                          primary={section.section}
                          primaryTypographyProps={{ fontWeight: 700 }}
                        />
                      </ListItemButton>
                      {section.items.map((item) => (
                        <ListItemButton component={NavLink} to={item.path} key={item.path}>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      ))}
                    </>
                  ) : (
                    <>
                      <ListItemButton
                        onClick={() => handleSectionClick(section.section)}
                        sx={{ bgcolor: expandedSections[section.section] ? "action.selected" : "transparent" }}
                      >
                        <ListItemText
                          primary={section.section}
                          primaryTypographyProps={{ fontWeight: 700 }}
                        />
                        {expandedSections[section.section] ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                      <Collapse in={expandedSections[section.section]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {section.items.map((item) => (
                            <ListItemButton component={NavLink} to={item.path} key={item.path} sx={{ pl: 4 }}>
                              <ListItemText primary={item.label} />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  )}
                </>
              ) : (
                section.items.map((item) => (
                  <ListItemButton component={NavLink} to={item.path} key={item.path}>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: item.bold ? 700 : 400 }} />
                  </ListItemButton>
                ))
              )}
            </Box>
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
