import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { Booking, MoneyValue } from "../BookingPage";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type Props = {
  bookings: Booking[];
  loading: boolean;
  onInvoice: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  onCheckout: (bookingId: string) => void;
  onFullPaymentReceived: (booking: Booking) => void;
};

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date
    .toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getStatusColor = (status: string): ChipColor => {
  if (status === "ACTIVE") return "success";
  if (status === "CANCELLED") return "default";
  if (status === "CHECKED_OUT") return "primary";

  return "warning";
};

function BookingList({
  bookings,
  loading,
  onInvoice,
  onCancel,
  onCheckout,
  onFullPaymentReceived,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
  const [guestSearch, setGuestSearch] = useState("");

  const filteredBookings = bookings.filter((booking) => {
    const monthMatched =
      !selectedMonth || booking.checkIn.startsWith(selectedMonth);

    const guestMatched =
      !guestSearch ||
      booking.guestName.toLowerCase().includes(guestSearch.toLowerCase());

    return monthMatched && guestMatched;
  });

  return (
    <Box
      sx={{
        mt: 3,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
      }}
    >
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Booking List
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
              Showing bookings for selected check-in month. You can also search
              by guest name.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Search Guest Name"
                size="small"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Example: Nimal"
              />

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
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>
            <Typography>Loading bookings...</Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              width: "100%",
              maxHeight: 500,
              overflowX: "auto",
            }}
          >
            <Table stickyHeader sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Room
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Guest
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Check In
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Check Out
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Total Due
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Advance
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Payment
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f3f4f6" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredBookings.map((booking) => {
                  const balanceAmount =
                    Number(booking.totalDue || 0) -
                    Number(booking.advancePayment || 0) -
                    Number(booking.finalPaymentAmount || 0);

                  return (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        Room {booking.room?.roomNumber} -{" "}
                        {booking.room?.roomType}
                      </TableCell>

                      <TableCell>{booking.guestName}</TableCell>

                      <TableCell>{formatDateTime(booking.checkIn)}</TableCell>

                      <TableCell>{formatDateTime(booking.checkOut)}</TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        Rs. {formatMoney(booking.totalDue)}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold", color: "info.main" }}>
                        Rs. {formatMoney(booking.advancePayment)}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color:
                            balanceAmount > 0
                              ? "warning.main"
                              : "success.main",
                        }}
                      >
                        Rs. {formatMoney(balanceAmount)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={booking.paymentStatus || "PARTIAL"}
                          color={
                            booking.paymentStatus === "PAID"
                              ? "success"
                              : "warning"
                          }
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "nowrap",
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onInvoice(booking)}
                            sx={{
                              fontWeight: "bold",
                              color: "#7f1d1d",
                              borderColor: "#7f1d1d",
                              "&:hover": {
                                backgroundColor: "#fef2f2",
                                borderColor: "#991b1b",
                              },
                            }}
                          >
                            Invoice
                          </Button>

                          {booking.status !== "CANCELLED" &&
                            booking.paymentStatus !== "PAID" && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => onFullPaymentReceived(booking)}
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  minWidth: "115px",
                                  backgroundColor: "#16a34a",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "#15803d",
                                  },
                                }}
                              >
                                Full Payment
                              </Button>
                            )}

                          {booking.status === "ACTIVE" && (
                            <>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => onCancel(booking.id)}
                                sx={{
                                  fontWeight: "bold",
                                  color: "#f51818",
                                  borderColor: "#7f1d1d",
                                  "&:hover": {
                                    backgroundColor: "#fef2f2",
                                    borderColor: "#991b1b",
                                  },
                                }}
                              >
                                Cancel
                              </Button>

                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  if (booking.paymentStatus !== "PAID") {
                                    window.alert(
                                      `Cannot check-out this booking.\n\nFull payment is not received yet.\nBalance amount: Rs. ${formatMoney(
                                        balanceAmount
                                      )}`
                                    );

                                    return;
                                  }

                                  onCheckout(booking.id);
                                }}
                                sx={{
                                  fontWeight: "bold",
                                  minWidth: "100px",
                                  backgroundColor: "#f97316",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "#ea580c",
                                  },
                                }}
                              >
                                Check-out
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No bookings found for selected month or guest name
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default BookingList;