import { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from "@mui/material";
import { adminReportService, type CashFlowResponse } from "../../../services/adminReportService";
import { formatCurrency } from "../../../utils/formatCurrency";

function CashFlowPage() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [data, setData] = useState<CashFlowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminReportService.getCashFlow(fromDate, toDate);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", color: "var(--text-primary)" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Cash Flow
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "var(--text-secondary)" }}>
        Shows the cash generated and used during a specific time period.
      </Typography>

      <Paper sx={{ p: 3, mb: 4, display: "flex", gap: 2, alignItems: "center", backgroundColor: "var(--card-bg)" }}>
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          sx={{
            "& .MuiInputBase-input": { color: "var(--text-primary)" },
            "& .MuiInputLabel-root": { color: "var(--text-secondary)" }
          }}
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          sx={{
            "& .MuiInputBase-input": { color: "var(--text-primary)" },
            "& .MuiInputLabel-root": { color: "var(--text-secondary)" }
          }}
        />
        <Button variant="contained" onClick={fetchReport} disabled={loading} sx={{ backgroundColor: "var(--primary-color)" }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
        </Button>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && (
        <Paper sx={{ p: 0, backgroundColor: "var(--card-bg)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "var(--table-header-bg)" }}>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Activity</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Operating Activities
                  </TableCell>
                </TableRow>
                {data.operatingActivities.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.operatingActivities.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: item.amount < 0 ? "error.main" : "var(--table-row-text)" }}>
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Net Operating Cash Flow</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.netOperatingCashFlow)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Investing Activities
                  </TableCell>
                </TableRow>
                {data.investingActivities.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.investingActivities.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: item.amount < 0 ? "error.main" : "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Net Investing Cash Flow</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.netInvestingCashFlow)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Financing Activities
                  </TableCell>
                </TableRow>
                {data.financingActivities.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.financingActivities.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: item.amount < 0 ? "error.main" : "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Net Financing Cash Flow</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.netFinancingCashFlow)}</TableCell>
                </TableRow>

                <TableRow sx={{ backgroundColor: "var(--primary-color)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Net Cash Flow</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "white" }}>{formatCurrency(data.netCashFlow)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default CashFlowPage;
