import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  basePrice: number;
  extraHourRate?: number;
  status: string;
};

type Booking = {
  id: string;
  guestName: string;
  nicPassport: string;
  checkIn: string;
  checkOut: string;
  advancePayment: number;
  finalPaymentAmount?: number;
  finalPaymentDate?: string | null;
  paymentStatus?: string;
  subTotal: number;
  taxAmount: number;
  totalDue: number;
  status: string;
  room: Room;
};

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

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function RoomDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayKey = formatDateKey(new Date());

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const roomsResponse = await fetch(API_BASE_URLS.roomSection);

      if (!roomsResponse.ok) {
        throw new Error("Failed to load rooms");
      }

      const roomsData: Room[] = await roomsResponse.json();

      const bookingsResponse = await fetch(
        `${API_BASE_URLS.roomSection}/bookings`
      );

      if (!bookingsResponse.ok) {
        throw new Error("Failed to load bookings");
      }

      const bookingsData: Booking[] = await bookingsResponse.json();

      const remittanceResponse = await fetch(
        `${API_BASE_URLS.roomSection}/remittances`
      );

      if (!remittanceResponse.ok) {
        throw new Error("Failed to load remittances");
      }

      const remittanceData: Remittance[] = await remittanceResponse.json();

      const sortedRooms = roomsData.sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, {
          numeric: true,
        })
      );

      setRooms(sortedRooms);
      setBookings(bookingsData);
      setRemittances(remittanceData);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Check room-section-service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalRooms = rooms.length;

  const availableRooms = rooms.filter(
    (room) => room.status === "AVAILABLE"
  ).length;

  const occupiedRooms = rooms.filter(
    (room) => room.status === "OCCUPIED"
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => room.status === "MAINTENANCE"
  ).length;

  const activeBookings = bookings.filter(
    (booking) => booking.status === "ACTIVE"
  ).length;

  const checkedOutBookings = bookings.filter(
    (booking) => booking.status === "CHECKED_OUT"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;

  const todayBookings = bookings.filter((booking) => {
    return formatDateKey(new Date(booking.checkIn)) === todayKey;
  });

  const todayAdvancePayments = bookings.reduce((total, booking) => {
    const bookingDate = formatDateKey(new Date(booking.checkIn));

    if (bookingDate === todayKey && booking.status !== "CANCELLED") {
      return total + Number(booking.advancePayment || 0);
    }

    return total;
  }, 0);

  const todayFinalPayments = bookings.reduce((total, booking) => {
    if (!booking.finalPaymentDate) return total;

    const finalPaymentDate = formatDateKey(new Date(booking.finalPaymentDate));

    if (
      finalPaymentDate === todayKey &&
      booking.paymentStatus === "PAID" &&
      booking.status !== "CANCELLED"
    ) {
      return total + Number(booking.finalPaymentAmount || 0);
    }

    return total;
  }, 0);

  const todayExpectedCash = todayAdvancePayments + todayFinalPayments;

  const todayRemittance = remittances.find(
    (item) => item.remittanceDate === todayKey
  );

  const recentBookings = [...bookings]
    .sort((a, b) => {
      return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
    })
    .slice(0, 5);

  const getBookingStatusColor = (status: string): ChipColor => {
    if (status === "ACTIVE") return "success";
    if (status === "CHECKED_OUT") return "primary";
    if (status === "CANCELLED") return "default";
    return "warning";
  };

  const getPaymentStatusColor = (status?: string): ChipColor => {
    if (status === "PAID") return "success";
    return "warning";
  };

  const getRemittanceStatusColor = (discrepancy: MoneyValue): ChipColor => {
    const value = Number(discrepancy || 0);

    if (value === 0) return "success";
    if (value < 0) return "error";
    return "warning";
  };

  const getRemittanceStatusLabel = (discrepancy: MoneyValue) => {
    const value = Number(discrepancy || 0);

    if (value === 0) return "Balanced";
    if (value < 0) return "Short";
    return "Extra";
  };

  const summaryCards = [
    {
      title: "Total Rooms",
      value: totalRooms,
      helper: "All rooms in the system",
      borderColor: "#f97316",
    },
    {
      title: "Available Rooms",
      value: availableRooms,
      helper: "Ready for booking",
      borderColor: "#f97316",
    },
    {
      title: "Occupied Rooms",
      value: occupiedRooms,
      helper: "Currently occupied",
      borderColor: "#7f1d1d",
    },
    {
      title: "Maintenance",
      value: maintenanceRooms,
      helper: "Not available",
      borderColor: "#9ca3af",
    },
    {
      title: "Active Bookings",
      value: activeBookings,
      helper: "Current active guests",
      borderColor: "#f97316",
    },
    {
      title: "Today Bookings",
      value: todayBookings.length,
      helper: "Bookings starting today",
      borderColor: "#f97316",
    },
    {
      title: "Checked-out",
      value: checkedOutBookings,
      helper: "Completed bookings",
      borderColor: "#7f1d1d",
    },
    {
      title: "Cancelled",
      value: cancelledBookings,
      helper: "Cancelled records",
      borderColor: "#9ca3af",
    },
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#111827" }}
      >
        Room Section Dashboard
      </Typography>

      <Typography color="text.secondary">
        Quick overview of rooms, bookings, payments, occupancy, and daily
        collection.
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress sx={{ color: "#f97316" }} />

          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Loading Dashboard Data...
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 2.5,
              mt: 4,
            }}
          >
            {summaryCards.map((card) => (
              <Card
                key={card.title}
                sx={{
                  borderRadius: 2,
                  borderTop: `4px solid ${card.borderColor}`,
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                }}
              >
                <CardContent>
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    {card.title}
                  </Typography>

                  <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
                    {card.value}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {card.helper}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
              mt: 4,
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#c2410c", fontWeight: "bold" }}
                >
                  Today Expected Cash
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ fontWeight: "bold", color: "#ea580c", my: 2 }}
                >
                  Rs. {formatMoney(todayExpectedCash)}
                </Typography>

                <Typography color="text.secondary">
                  Advance today: Rs. {formatMoney(todayAdvancePayments)} +
                  Final payments today: Rs. {formatMoney(todayFinalPayments)}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 2,
                backgroundColor: todayRemittance
                  ? Number(todayRemittance.discrepancy) < 0
                    ? "#fef2f2"
                    : "#f0fdf4"
                  : "#f3f4f6",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Today Remittance Status
                </Typography>

                {todayRemittance ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                      Rs. {formatMoney(todayRemittance.totalCollected)}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mt: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography color="text.secondary">
                        Difference:{" "}
                        <strong>
                          Rs. {formatMoney(todayRemittance.discrepancy)}
                        </strong>
                      </Typography>

                      <Chip
                        label={getRemittanceStatusLabel(
                          todayRemittance.discrepancy
                        )}
                        color={getRemittanceStatusColor(
                          todayRemittance.discrepancy
                        )}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#9ca3af", mb: 1 }}
                    >
                      Not Recorded
                    </Typography>

                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                      No remittance entered for today.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Paper
            sx={{
              mt: 4,
              p: 0.5,
              borderRadius: 2,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Recent Bookings
            </Typography>

            <Box sx={{ overflowX: "auto", mt: 2 }}>
              <Table sx={{ minWidth: 950 }}>
                <TableHead sx={{ backgroundColor: "#f9fafb" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Guest</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Due</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.room?.roomNumber}</TableCell>

                      <TableCell>{booking.guestName}</TableCell>

                      <TableCell>{formatDateTime(booking.checkIn)}</TableCell>

                      <TableCell>{formatDateTime(booking.checkOut)}</TableCell>

                      <TableCell sx={{ fontWeight: 500 }}>
                        Rs. {formatMoney(booking.totalDue)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={booking.paymentStatus || "PARTIAL"}
                          color={getPaymentStatusColor(booking.paymentStatus)}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getBookingStatusColor(booking.status)}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {recentBookings.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 3, color: "text.secondary" }}
                      >
                        No recent bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </>
      )}

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

export default RoomDashboardPage;