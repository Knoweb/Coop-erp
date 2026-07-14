import { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from "@mui/material";
import { adminReportService, type BalanceSheetResponse } from "../../../services/adminReportService";
import { formatCurrency } from "../../../utils/formatCurrency";

function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [data, setData] = useState<BalanceSheetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminReportService.getBalanceSheet(asOfDate);
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
        Balance Sheet
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ color: "var(--text-secondary)" }}>
        Financial position of the business at a specific point in time.
      </Typography>

      <Paper sx={{ p: 3, mb: 4, display: "flex", gap: 2, alignItems: "center", backgroundColor: "var(--card-bg)", color: "var(--text-primary)" }}>
        <TextField
          label="As Of Date"
          type="date"
          value={asOfDate}
          onChange={(e) => setAsOfDate(e.target.value)}
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
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Account</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Assets
                  </TableCell>
                </TableRow>
                {data.assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell>
                  </TableRow>
                ) : data.assets.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Assets</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalAssets)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Liabilities
                  </TableCell>
                </TableRow>
                {data.liabilities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell>
                  </TableRow>
                ) : data.liabilities.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Liabilities</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalLiabilities)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Equity
                  </TableCell>
                </TableRow>
                {data.equity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell>
                  </TableRow>
                ) : data.equity.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Equity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalEquity)}</TableCell>
                </TableRow>

                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Liabilities & Equity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.liabilitiesAndEquity)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default BalanceSheetPage;
