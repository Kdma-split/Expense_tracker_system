import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { queryClient } from "./api/queryClient";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0f4c81" },
    secondary: { main: "#2a9d8f" },
    background: { default: "#f4f7fb" }
  },
  typography: {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
