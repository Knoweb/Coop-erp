import { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, MenuItem } from "@mui/material";
import { adminReportService, type GeneralLedgerResponse } from "../../../services/adminReportService";
import { formatCurrency } from "../../../utils/formatCurrency";

function GeneralLedgerPage() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [accountCode, setAccountCode] = useState("");
  const [data, setData] = useState<GeneralLedgerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminReportService.getGeneralLedger(fromDate, toDate, accountCode);
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
    <Box sx={{ maxWidth: 1000, mx: "auto", color: "var(--text-primary)" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        General Ledger
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: "var(--text-secondary)" }}>
        A complete record of all financial transactions over the life of a company.
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
        <TextField
          label="Account"
          select
          value={accountCode}
          onChange={(e) => setAccountCode(e.target.value)}
          size="small"
          sx={{
            minWidth: 150,
            "& .MuiInputBase-input": { color: "var(--text-primary)" },
            "& .MuiInputLabel-root": { color: "var(--text-secondary)" }
          }}
        >
          <MenuItem value="">All Accounts</MenuItem>
          <MenuItem value="1000">1000 - Cash</MenuItem>
          <MenuItem value="4000">4000 - Sales Revenue</MenuItem>
          <MenuItem value="5000">5000 - Purchases / COGS</MenuItem>
        </TextField>
        <Button variant="contained" onClick={fetchReport} disabled={loading} sx={{ backgroundColor: "var(--primary-color)" }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
        </Button>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && (
        <Paper sx={{ p: 0, backgroundColor: "var(--card-bg)" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "var(--table-header-bg)" }}>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Reference</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }}>Account</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Debit</TableCell>
                  <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Credit</TableCell>
                  {accountCode && <TableCell sx={{ color: "var(--table-header-text)", fontWeight: "bold" }} align="right">Balance</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow><TableCell colSpan={accountCode ? 7 : 6} align="center" sx={{ color: "var(--text-secondary)", py: 3 }}>No transactions found</TableCell></TableRow>
                ) : data.rows.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{row.date}</TableCell>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{row.reference}</TableCell>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{row.description}</TableCell>
                    <TableCell sx={{ color: "var(--table-row-text)" }}>{row.accountCode} - {row.accountName}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{row.debit > 0 ? formatCurrency(row.debit) : ""}</TableCell>
                    <TableCell align="right" sx={{ color: "var(--table-row-text)" }}>{row.credit > 0 ? formatCurrency(row.credit) : ""}</TableCell>
                    {accountCode && <TableCell align="right" sx={{ color: "var(--table-row-text)", fontWeight: "bold" }}>{formatCurrency(row.balance)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default GeneralLedgerPage;
