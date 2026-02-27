import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect } from "react";

const routeByRole = {
  Employee: "/employee/drafts",
  Manager: "/manager/pending",
  Finance: "/finance/pending",
  Admin: "/admin/employees"
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(routeByRole[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      navigate(routeByRole[result.role] || "/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-shell">
      <Card className="login-card">
        <CardContent>
          <Typography className="login-title" variant="h4" gutterBottom>
            Expense Claim Hub
          </Typography>
          <Typography className="login-subtitle" variant="body2" sx={{ mb: 3 }}>
            Track claims, approvals, and payouts from one place.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={loading} size="large">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </form>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" sx={{ display: "block", mb: 1.2, opacity: 0.75 }}>
            Demo accounts
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Admin"
              onClick={() => {
                setEmail("admin@company.com");
                setPassword("Admin123!");
              }}
              clickable
            />
            <Chip
              label="Finance"
              onClick={() => {
                setEmail("finance@company.com");
                setPassword("Finance123!");
              }}
              clickable
            />
            <Chip
              label="Manager"
              onClick={() => {
                setEmail("manager@company.com");
                setPassword("Manager123!");
              }}
              clickable
            />
            <Chip
              label="Employee"
              onClick={() => {
                setEmail("employee@company.com");
                setPassword("Employee123!");
              }}
              clickable
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
