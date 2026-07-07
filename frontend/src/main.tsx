import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./index.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#e01e10",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);