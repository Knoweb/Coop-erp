import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { API_BASE_URLS } from "../../api/apiConfig";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type MoneyValue = number | string | undefined;

type Remittance = {
  id: string;
  remittanceId?: string;
  remittanceDate: string;
  totalCollected: MoneyValue;
  expectedInvoiceTotal: MoneyValue;
  discrepancy: MoneyValue;
  receptionistId: string;
  message: string;
};

type Booking = {
  id: string;
  checkIn: string;
  checkOut: string;
  advancePayment: MoneyValue;
  finalPaymentAmount: MoneyValue;
  finalPaymentDate?: string | null;
  paymentStatus: string;
  status: string;
};

const TEMP_RECEPTIONIST_ID = "00000000-0000-0000-0000-000000000001";

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const isSameDate = (dateTimeValue: string | null | undefined, date: string) => {
  if (!dateTimeValue || !date) return false;

  return dateTimeValue.startsWith(date);
};

function RemittancePage() {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [remittanceDate, setRemittanceDate] = useState("");
  const [totalCollected, setTotalCollected] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRemittances = async () => {
    try {
      const response = await fetch(`${API_BASE_URLS.roomSection}/remittances`);

      if (!response.ok) {
        throw new Error("Failed to load remittances");
      }

      const data: Remittance[] = await response.json();

      const sortedData = data.sort((a, b) => {
        return (
          new Date(b.remittanceDate).getTime() -
          new Date(a.remittanceDate).getTime()
        );
      });

      setRemittances(sortedData);
    } catch (err) {
      console.error(err);
      setError("Failed to load remittances. Check room-section-service.");
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URLS.roomSection}/bookings`);

      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const data: Booking[] = await response.json();

      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings. Check room-section-service.");
    }
  };

  useEffect(() => {
    loadRemittances();
    loadBookings();
  }, []);

  const calculateExpectedCashTotal = (date: string) => {
    if (!date) return 0;

    return bookings.reduce((total, booking) => {
      if (booking.status === "CANCELLED") {
        return total;
      }

      const advanceToday = isSameDate(booking.checkIn, date)
        ? Number(booking.advancePayment || 0)
        : 0;

      const finalPaymentToday =
        booking.paymentStatus === "PAID" &&
        isSameDate(booking.finalPaymentDate, date)
          ? Number(booking.finalPaymentAmount || 0)
          : 0;

      return total + advanceToday + finalPaymentToday;
    }, 0);
  };

  const expectedCashTotal = calculateExpectedCashTotal(remittanceDate);

  const filteredRemittances = remittances.filter((item) => {
    if (!selectedMonth) return true;

    return item.remittanceDate.startsWith(selectedMonth);
  });

  const handleCreateRemittance = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!remittanceDate || !totalCollected) {
      setError("Please enter remittance date and total collected amount.");
      return;
    }

    if (Number(totalCollected) < 0) {
      setError("Total collected amount cannot be negative.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URLS.roomSection}/remittances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remittanceDate,
          totalCollected: Number(totalCollected),
          receptionistId: TEMP_RECEPTIONIST_ID,
        }),
      });

      if (!response.ok) {
        throw new Error("Remittance create failed");
      }

      const savedData: Remittance = await response.json();

      setRemittanceDate("");
      setTotalCollected("");

      await loadRemittances();
      await loadBookings();

      setMessage(savedData.message || "Daily remittance recorded successfully.");
    } catch (err) {
      console.error(err);
      setError("Remittance create failed. Maybe this date is already recorded.");
    }
  };

  const getDiscrepancyColor = (discrepancy: MoneyValue): ChipColor => {
    const value = Number(discrepancy || 0);

    if (value === 0) {
      return "success";
    }

    if (value < 0) {
      return "error";
    }

    return "warning";
  };

  const getDiscrepancyLabel = (discrepancy: MoneyValue) => {
    const value = Number(discrepancy || 0);

    if (value === 0) {
      return "Balanced";
    }

    if (value < 0) {
      return "Short";
    }

    return "Extra";
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Daily Remittance
      </Typography>

      <Typography color="text.secondary">
        Record daily room cash collections and compare the actual collected
        amount with the system expected cash total.
      </Typography>

      <Card
        sx={{
          mt: 3,
          maxWidth: 750,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Add Daily Remittance
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Select the date and enter the actual cash amount collected by the
            room section. The system expected amount is calculated using advance
            payments and final payments received on that date.
          </Typography>

          <Box component="form" onSubmit={handleCreateRemittance}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Remittance Date"
                type="date"
                fullWidth
                value={remittanceDate}
                onChange={(e) => setRemittanceDate(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                label="Expected Cash Total"
                fullWidth
                value={`Rs. ${formatMoney(expectedCashTotal)}`}
                disabled
                helperText="Advance payments + final payments received on selected date"
              />

              <TextField
                label="Actual Total Collected"
                type="number"
                fullWidth
                value={totalCollected}
                onChange={(e) => setTotalCollected(e.target.value)}
                placeholder="Example: 25000"
              />

              <TextField
                label="Difference"
                fullWidth
                value={
                  remittanceDate && totalCollected
                    ? `Rs. ${formatMoney(
                        Number(totalCollected || 0) - expectedCashTotal
                      )}`
                    : "Rs. 0.00"
                }
                disabled
                helperText="Actual Total Collected - Expected Cash Total"
              />

              <Box
                sx={{
                  gridColumn: {
                    xs: "span 1",
                    md: "span 2",
                  },
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "#f97316",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#ea580c",
                    },
                  }}
                >
                  Save Remittance
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper
        sx={{
          mt: 3,
          p: 2,
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Remittance History
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography color="text.secondary">
            Showing records for selected month.
          </Typography>

          <TextField
            label="Filter by Month"
            type="month"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 850 }}>
            <TableHead
              sx={{
                backgroundColor: "#f3f4f6",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Expected Cash Total
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Actual Total Collected
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Difference</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Message</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRemittances.map((item) => (
                <TableRow key={item.id || item.remittanceId}>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {item.remittanceDate}
                  </TableCell>

                  <TableCell>
                    Rs. {formatMoney(item.expectedInvoiceTotal)}
                  </TableCell>

                  <TableCell>Rs. {formatMoney(item.totalCollected)}</TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color:
                        Number(item.discrepancy || 0) < 0
                          ? "error.main"
                          : Number(item.discrepancy || 0) > 0
                          ? "warning.main"
                          : "success.main",
                    }}
                  >
                    Rs. {formatMoney(item.discrepancy)}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getDiscrepancyLabel(item.discrepancy)}
                      color={getDiscrepancyColor(item.discrepancy)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>

                  <TableCell>{item.message}</TableCell>
                </TableRow>
              ))}

              {filteredRemittances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No remittance records found for selected month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
      >
        <Alert severity="success" onClose={() => setMessage("")}>
          {message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RemittancePage;