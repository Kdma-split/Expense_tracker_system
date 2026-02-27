import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
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
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
