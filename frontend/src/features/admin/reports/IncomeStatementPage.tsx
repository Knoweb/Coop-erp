import { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from "@mui/material";
import { adminReportService, type IncomeStatementResponse } from "../../../services/adminReportService";
import { formatCurrency } from "../../../utils/formatCurrency";

function IncomeStatementPage() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [data, setData] = useState<IncomeStatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminReportService.getIncomeStatement(fromDate, toDate);
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
        Income Statement
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "var(--text-secondary)" }}>
        Shows the company’s revenues and expenses during a particular period.
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
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Account</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Revenue
                  </TableCell>
                </TableRow>
                {data.revenue.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.revenue.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalRevenue)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Cost of Goods Sold (Purchases)
                  </TableCell>
                </TableRow>
                {data.costOfGoods.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.costOfGoods.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Cost of Goods</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalCostOfGoods)}</TableCell>
                </TableRow>

                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Gross Profit</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.grossProfit)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--text-primary)" }}>
                    Expenses
                  </TableCell>
                </TableRow>
                {data.expenses.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.expenses.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.name}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Total Expenses</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalExpenses)}</TableCell>
                </TableRow>

                <TableRow sx={{ backgroundColor: "var(--primary-color)" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>Net Income</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "white" }}>{formatCurrency(data.netIncome)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default IncomeStatementPage;
