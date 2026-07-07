import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { API_BASE_URLS } from "../../api/apiConfig";

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
  noOfDays?: number;
  extraHours?: number;
  totalDue?: number;
  advancePayment?: number;
  finalPaymentAmount?: number;
  paymentStatus?: string;
  status: string;
  room: Room;
};

type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
};

const formatCustomDateTime = (dateString: string) => {
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

function OccupancyMatrixPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
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

      const sortedRooms = roomsData.sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, {
          numeric: true,
        })
      );

      const sortedBookings = bookingsData.sort(
        (a, b) =>
          new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
      );

      setRooms(sortedRooms);
      setBookings(sortedBookings);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Check room-section-service on port 8080.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return formatDateKey(date1) === formatDateKey(date2);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo<DayCell[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: DayCell[] = [];

    for (let i = startDay; i > 0; i--) {
      const date = new Date(year, month, 1 - i);

      days.push({
        date,
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(year, month, day);

      days.push({
        date,
        isCurrentMonth: true,
      });
    }

    while (days.length % 7 !== 0) {
      const nextDate = new Date(year, month, days.length - startDay + 1);

      days.push({
        date: nextDate,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  const isBookingOnDate = (booking: Booking, date: Date) => {
    if (!booking.checkIn || !booking.checkOut) return false;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookingStart = new Date(booking.checkIn);
    const bookingEnd = new Date(booking.checkOut);

    return bookingStart < dayEnd && bookingEnd > dayStart;
  };

  const isBookingCurrentlyOccupied = (booking: Booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    return booking.status === "ACTIVE" && checkIn <= now && checkOut > now;
  };

  const getBookingsForDate = (date: Date) => {
    return bookings
      .filter((booking) => {
        return (
          booking.status === "ACTIVE" &&
          booking.room &&
          isBookingOnDate(booking, date)
        );
      })
      .sort((a, b) =>
        a.room.roomNumber.localeCompare(b.room.roomNumber, undefined, {
          numeric: true,
        })
      );
  };

  const getDaySummary = (date: Date) => {
    let available = 0;
    let booked = 0;
    let occupied = 0;
    let maintenance = 0;

    rooms.forEach((room) => {
      if (room.status === "MAINTENANCE") {
        maintenance++;
        return;
      }

      const bookingForRoom = bookings.find((booking) => {
        return (
          booking.status === "ACTIVE" &&
          booking.room?.id === room.id &&
          isBookingOnDate(booking, date)
        );
      });

      if (!bookingForRoom) {
        available++;
        return;
      }

      if (isToday(date) && isBookingCurrentlyOccupied(bookingForRoom)) {
        occupied++;
      } else {
        booked++;
      }
    });

    return {
      available,
      booked,
      occupied,
      maintenance,
    };
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
            Room Occupancy Calendar
          </Typography>

          <Typography color="text.secondary">
            Monthly view of room bookings, occupancy, and availability.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small" onClick={goToPreviousMonth}>
            Previous
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={goToToday}
            sx={{
              backgroundColor: "#f97316",
              color: "white",
              "&:hover": {
                backgroundColor: "#ea580c",
              },
            }}
          >
            Today
          </Button>

          <Button variant="outlined" size="small" onClick={goToNextMonth}>
            Next
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h5">{monthLabel}</Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label="A - Available" color="success" size="small" />
            <Chip label="B - Booked" color="primary" size="small" />
            <Chip label="O - Occupied Today" color="error" size="small" />
            <Chip label="M - Maintenance" color="default" size="small" />
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 1.5, overflowX: "auto" }}>
        <Box
          sx={{
            minWidth: 850,
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Box
              key={day}
              sx={{
                py: 1,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 13,
                borderRadius: 1,
                backgroundColor: "#1f2937",
                color: "white",
              }}
            >
              {day}
            </Box>
          ))}

          {calendarDays.map((dayCell) => {
            const summary = getDaySummary(dayCell.date);
            const dayBookings = getBookingsForDate(dayCell.date);
            const selected = isSameDay(dayCell.date, selectedDate);

            return (
              <Card
                key={formatDateKey(dayCell.date)}
                onClick={() => setSelectedDate(dayCell.date)}
                sx={{
                  height: 112,
                  cursor: "pointer",
                  border: selected
                    ? "2px solid #f97316"
                    : "1px solid #e5e7eb",
                  backgroundColor: dayCell.isCurrentMonth ? "white" : "#f3f4f6",
                  opacity: dayCell.isCurrentMonth ? 1 : 0.45,
                  boxShadow: selected ? 3 : 0,
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 1, height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: 15,
                        color: isToday(dayCell.date) ? "#f97316" : "inherit",
                      }}
                    >
                      {dayCell.date.getDate()}
                    </Typography>

                    {isToday(dayCell.date) && (
                      <Chip
                        label="Today"
                        size="small"
                        sx={{
                          backgroundColor: "#f97316",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: 11,
                        color: "#2e7d32",
                        fontWeight: "bold",
                      }}
                    >
                      A: {summary.available}
                    </Box>

                    <Box
                      sx={{
                        fontSize: 11,
                        color: "#1976d2",
                        fontWeight: "bold",
                      }}
                    >
                      B: {summary.booked}
                    </Box>

                    <Box
                      sx={{
                        fontSize: 11,
                        color: "#d32f2f",
                        fontWeight: "bold",
                      }}
                    >
                      O: {summary.occupied}
                    </Box>

                    <Box
                      sx={{
                        fontSize: 11,
                        color: "#616161",
                        fontWeight: "bold",
                      }}
                    >
                      M: {summary.maintenance}
                    </Box>
                  </Box>

                  {dayBookings.length > 0 && (
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 0.7,
                        py: 0.3,
                        borderRadius: 1,
                        backgroundColor: isToday(dayCell.date)
                          ? "#ffebee"
                          : "#e3f2fd",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {dayBookings.length} booking
                      {dayBookings.length > 1 ? "s" : ""}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Selected Date Details
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {selectedDate.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {selectedDateBookings.length === 0 ? (
          <Typography color="text.secondary">
            No active bookings for this date.
          </Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {selectedDateBookings.map((booking) => (
              <Paper
                key={booking.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderLeft:
                    isToday(selectedDate) &&
                    isBookingCurrentlyOccupied(booking)
                      ? "5px solid #d32f2f"
                      : "5px solid #1976d2",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Room {booking.room?.roomNumber} - {booking.room?.roomType}
                    </Typography>

                    <Typography color="text.secondary">
                      Guest: {booking.guestName}
                    </Typography>

                    <Typography color="text.secondary">
                      NIC/Passport: {booking.nicPassport}
                    </Typography>

                    <Typography color="text.secondary">
                      Booking Status: {booking.status}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography color="text.secondary">
                      Check In: {formatCustomDateTime(booking.checkIn)}
                    </Typography>

                    <Typography color="text.secondary">
                      Check Out: {formatCustomDateTime(booking.checkOut)}
                    </Typography>

                    <Typography color="text.secondary">
                      Payment: {booking.paymentStatus || "PARTIAL"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
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

export default OccupancyMatrixPage;