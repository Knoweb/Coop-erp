import { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip } from "@mui/material";
import { adminReportService, type TrialBalanceResponse } from "../../../services/adminReportService";
import { formatCurrency } from "../../../utils/formatCurrency";

function TrialBalancePage() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [data, setData] = useState<TrialBalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminReportService.getTrialBalance(fromDate, toDate);
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
        Trial Balance
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "var(--text-secondary)" }}>
        A list of all the general ledger accounts contained in the ledger of a business.
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
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
            <Chip 
              label={data.balanced ? "Balanced" : "Not Balanced"} 
              color={data.balanced ? "success" : "error"} 
              variant="filled" 
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "var(--table-header-bg)" }}>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Account Code</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Account Name</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Debit</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ color: "var(--text-secondary)" }}>No data</TableCell></TableRow>
                ) : data.rows.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.accountCode}</TableCell>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{item.accountName}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{item.debit > 0 ? formatCurrency(item.debit) : "-"}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{item.credit > 0 ? formatCurrency(item.credit) : "-"}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>Totals</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalDebit)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "var(--text-primary)" }}>{formatCurrency(data.totalCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default TrialBalancePage;
