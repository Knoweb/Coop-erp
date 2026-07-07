import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
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

type MoneyValue = number | string | undefined | null;

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type Booking = {
  id: string;
  checkIn: string;
  checkOut: string;
  totalDue: MoneyValue;
  advancePayment: MoneyValue;
  finalPaymentAmount: MoneyValue;
  finalPaymentDate?: string | null;
  paymentStatus: string;
  status: string;
};

type Remittance = {
  id: string;
  remittanceId?: string;
  remittanceDate: string;
  expectedInvoiceTotal: MoneyValue;
  totalCollected: MoneyValue;
  discrepancy: MoneyValue;
  message: string;
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getToday = () => {
  return new Date().toISOString().substring(0, 10);
};

const getMonthStart = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
};

const getDateOnly = (value?: string | null) => {
  if (!value) return "";
  return value.substring(0, 10);
};

const isDateInRange = (
  value: string | null | undefined,
  fromDate: string,
  toDate: string
) => {
  if (!value || !fromDate || !toDate) return false;

  const date = getDateOnly(value);

  return date >= fromDate && date <= toDate;
};

function RoomReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [remittances, setRemittances] = useState<Remittance[]>([]);

  const [fromDate, setFromDate] = useState(getMonthStart());
  const [toDate, setToDate] = useState(getToday());

  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [bookingResponse, remittanceResponse] = await Promise.all([
        fetch(`${API_BASE_URLS.roomSection}/bookings`),
        fetch(`${API_BASE_URLS.roomSection}/remittances`),
      ]);

      if (!bookingResponse.ok) {
        throw new Error("Failed to load bookings");
      }

      if (!remittanceResponse.ok) {
        throw new Error("Failed to load remittances");
      }

      const bookingData: Booking[] = await bookingResponse.json();
      const remittanceData: Remittance[] = await remittanceResponse.json();

      setBookings(bookingData);
      setRemittances(remittanceData);
    } catch (err) {
      console.error(err);
      setError("Failed to load report data. Check room-section-service.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const report = useMemo(() => {
    const filteredBookings = bookings.filter((booking) =>
      isDateInRange(booking.checkIn, fromDate, toDate)
    );

    const validBookings = filteredBookings.filter(
      (booking) => booking.status !== "CANCELLED"
    );

    const filteredRemittances = remittances.filter((remittance) =>
      isDateInRange(remittance.remittanceDate, fromDate, toDate)
    );

    const totalBookings = filteredBookings.length;

    const activeBookings = filteredBookings.filter(
      (booking) => booking.status === "ACTIVE"
    ).length;

    const checkedOutBookings = filteredBookings.filter(
      (booking) => booking.status === "CHECKED_OUT"
    ).length;

    const cancelledBookings = filteredBookings.filter(
      (booking) => booking.status === "CANCELLED"
    ).length;

    const totalInvoiceAmount = validBookings.reduce(
      (total, booking) => total + Number(booking.totalDue || 0),
      0
    );

    const advanceReceived = validBookings.reduce(
      (total, booking) => total + Number(booking.advancePayment || 0),
      0
    );

    const finalPaymentsReceived = bookings.reduce((total, booking) => {
      if (booking.status === "CANCELLED") {
        return total;
      }

      if (
        booking.paymentStatus === "PAID" &&
        isDateInRange(booking.finalPaymentDate, fromDate, toDate)
      ) {
        return total + Number(booking.finalPaymentAmount || 0);
      }

      return total;
    }, 0);

    const expectedCashTotal = advanceReceived + finalPaymentsReceived;

    const actualCashSubmitted = filteredRemittances.reduce(
      (total, item) => total + Number(item.totalCollected || 0),
      0
    );

    const cashDifference = actualCashSubmitted - expectedCashTotal;

    return {
      filteredRemittances,
      totalBookings,
      activeBookings,
      checkedOutBookings,
      cancelledBookings,
      totalInvoiceAmount,
      advanceReceived,
      finalPaymentsReceived,
      expectedCashTotal,
      actualCashSubmitted,
      cashDifference,
    };
  }, [bookings, remittances, fromDate, toDate]);

  const getDifferenceStatus = (difference: number) => {
    if (difference === 0) return "Balanced";
    if (difference < 0) return "Short";

    return "Extra";
  };

  const getDifferenceColor = (difference: number): ChipColor => {
    if (difference === 0) return "success";
    if (difference < 0) return "error";

    return "warning";
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Room Reports
      </Typography>

      <Typography color="text.secondary">
        View Room Section occupancy, revenue, and daily remittance summary.
      </Typography>

      <Paper sx={{ mt: 3, p: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Report Date Range
        </Typography>

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
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
        Room Occupancy Summary
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Total Bookings</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {report.totalBookings}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Active Bookings</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {report.activeBookings}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Checked-out Bookings</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {report.checkedOutBookings}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Cancelled Bookings</Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {report.cancelledBookings}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
        Cash Summary
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Expected Cash Total</Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Rs. {formatMoney(report.expectedCashTotal)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advance payments + final payments
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Actual Cash Submitted</Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "success.main" }}
            >
              Rs. {formatMoney(report.actualCashSubmitted)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amount entered in daily remittance
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Cash Difference</Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color:
                  report.cashDifference === 0
                    ? "success.main"
                    : report.cashDifference < 0
                    ? "error.main"
                    : "warning.main",
              }}
            >
              Rs. {formatMoney(report.cashDifference)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Actual cash submitted - expected cash
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">Total Invoice Amount</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Rs. {formatMoney(report.totalInvoiceAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total value of valid booking invoices
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ mt: 3, p: 2, borderRadius: 3, backgroundColor: "#fff7ed" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Cash Breakdown
        </Typography>

        <Typography>
          Advance Received: <b>Rs. {formatMoney(report.advanceReceived)}</b>
        </Typography>

        <Typography>
          Final Payments Received:{" "}
          <b>Rs. {formatMoney(report.finalPaymentsReceived)}</b>
        </Typography>

        <Typography>
          Expected Cash Total:{" "}
          <b>Rs. {formatMoney(report.expectedCashTotal)}</b>
        </Typography>
      </Paper>

      <Paper sx={{ mt: 3, p: 2, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Daily Remittance Report
        </Typography>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
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
              </TableRow>
            </TableHead>

            <TableBody>
              {report.filteredRemittances.map((item) => {
                const difference = Number(item.discrepancy || 0);

                return (
                  <TableRow key={item.id || item.remittanceId}>
                    <TableCell>{item.remittanceDate}</TableCell>

                    <TableCell>
                      Rs. {formatMoney(item.expectedInvoiceTotal)}
                    </TableCell>

                    <TableCell>Rs. {formatMoney(item.totalCollected)}</TableCell>

                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color:
                          difference === 0
                            ? "success.main"
                            : difference < 0
                            ? "error.main"
                            : "warning.main",
                      }}
                    >
                      Rs. {formatMoney(difference)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getDifferenceStatus(difference)}
                        color={getDifferenceColor(difference)}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {report.filteredRemittances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No remittance records found for selected date range
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

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

export default RoomReportsPage;