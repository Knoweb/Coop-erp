import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { API_BASE_URLS } from "../../api/apiConfig";

import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import BookingInvoiceDialog from "./components/BookingInvoiceDialog";

export type MoneyValue = number | string | undefined;

export type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  basePrice: MoneyValue;
  extraHourRate: MoneyValue;
  status: string;
};

export type Booking = {
  id: string;
  guestName: string;
  nicPassport: string;
  checkIn: string;
  checkOut: string;

  adults: number;
  children: number;

  noOfDays?: number;
  extraHours?: number;
  extraHourCharge?: MoneyValue;
  serviceChargeAmount: MoneyValue;

  vatRate?: MoneyValue;
  ssclRate?: MoneyValue;

  advancePayment: MoneyValue;
  finalPaymentAmount?: MoneyValue;
  finalPaymentDate?: string | null;
  paymentStatus?: string;

  subTotal: MoneyValue;
  taxAmount: MoneyValue;
  totalDue: MoneyValue;
  status: string;
  room: Room;
};

export type AvailabilityRoom = {
  roomId: string;
  roomNumber: string;
  roomType: string;
  status: string;
  available: boolean;
};

export type BillingSetting = {
  id: number;
  vatRate: number;
  ssclRate: number;
};

export type BookingFormData = {
  roomId: string;
  guestName: string;
  nicPassport: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  serviceChargeAmount: string;
  advancePayment: string;
};

const getTodayDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilityRooms, setAvailabilityRooms] = useState<
    AvailabilityRoom[]
  >([]);

  const [billingSetting, setBillingSetting] = useState<BillingSetting>({
    id: 1,
    vatRate: 18,
    ssclRate: 2.5,
  });

  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    roomId: "",
    guestName: "",
    nicPassport: "",
    checkIn: getTodayDateTime(),
    checkOut: "",
    advancePayment: "0",
    adults: "1",
    children: "0",
    serviceChargeAmount: "0",
  });

  const [selectedInvoiceBooking, setSelectedInvoiceBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRooms = async () => {
    const response = await fetch(API_BASE_URLS.roomSection);

    if (!response.ok) {
      throw new Error("Failed to load rooms");
    }

    const data: Room[] = await response.json();

    const sortedRooms = data.sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
      })
    );

    setRooms(sortedRooms);
  };

  const loadBookings = async () => {
    const response = await fetch(`${API_BASE_URLS.roomSection}/bookings`);

    if (!response.ok) {
      throw new Error("Failed to load bookings");
    }

    const data: Booking[] = await response.json();

    const sortedBookings = data.sort(
      (a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
    );

    setBookings(sortedBookings);
  };

  const loadBillingSettings = async () => {
    const response = await fetch(
      `${API_BASE_URLS.roomSection}/billing-settings`
    );

    if (!response.ok) {
      throw new Error("Failed to load billing settings");
    }

    const data: BillingSetting = await response.json();
    setBillingSetting(data);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRooms(), loadBookings(), loadBillingSettings()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load booking data. Check room-section-service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetAvailability = () => {
    setAvailabilityRooms([]);
    setAvailabilityChecked(false);
  };

  const handleCheckAvailability = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      setError("Please select check-in and check-out date/time.");
      return;
    }

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setError("Check-out date/time must be after check-in date/time.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URLS.roomSection}/availability?startDate=${encodeURIComponent(
          formData.checkIn
        )}&endDate=${encodeURIComponent(formData.checkOut)}`
      );

      if (!response.ok) {
        throw new Error("Availability check failed");
      }

      const data: AvailabilityRoom[] = await response.json();

      const sortedData = data.sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, {
          numeric: true,
        })
      );

      setAvailabilityRooms(sortedData);
      setAvailabilityChecked(true);

      setFormData((previous) => ({
        ...previous,
        roomId: "",
      }));

      const availableCount = sortedData.filter((room) => room.available).length;

      if (availableCount === 0) {
        setMessage("No rooms available for selected date range.");
      } else {
        setMessage(`${availableCount} room(s) available for selected date range.`);
      }
    } catch (err) {
      console.error(err);
      setError("Availability check failed.");
    }
  };

  const handleCreateBooking = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !formData.roomId ||
      !formData.guestName ||
      !formData.nicPassport ||
      !formData.checkIn ||
      !formData.checkOut
    ) {
      setError("Please fill all required booking details.");
      return;
    }

    if (!availabilityChecked) {
      setError("Please check room availability before creating booking.");
      return;
    }

    const selectedAvailability = availabilityRooms.find(
      (room) => room.roomId === formData.roomId && room.available
    );

    if (!selectedAvailability) {
      setError("Selected room is not available for this date range.");
      return;
    }

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setError("Check-out date/time must be after check-in date/time.");
      return;
    }

    if (Number(formData.advancePayment || 0) < 0) {
      setError("Advance payment cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URLS.roomSection}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: formData.roomId,
          guestName: formData.guestName,
          nicPassport: formData.nicPassport,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          adults: Number(formData.adults || 1),
          children: Number(formData.children || 0),
          serviceChargeAmount: Number(formData.serviceChargeAmount || 0),
          advancePayment: Number(formData.advancePayment || 0),
        }),
      });

      if (!response.ok) {
        throw new Error("Booking create failed");
      }

      setFormData({
        roomId: "",
        guestName: "",
        nicPassport: "",
        checkIn: getTodayDateTime(),
        checkOut: "",
        advancePayment: "0",
        adults: "1",
        children: "0",
        serviceChargeAmount: "0",
      });

      resetAvailability();

      await loadData();

      setMessage("Booking created successfully.");
    } catch (err) {
      console.error(err);
      setError("Booking failed. Room may already be booked or unavailable.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `${API_BASE_URLS.roomSection}/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Cancel failed");
      }

      await loadData();
      resetAvailability();

      setMessage("Booking cancelled successfully.");
    } catch (err) {
      console.error(err);
      setError("Cancel booking failed. Only ACTIVE bookings can be cancelled.");
    }
  };

  const handleFullPaymentReceived = async (booking: Booking) => {
    const balance =
      Number(booking.totalDue || 0) -
      Number(booking.advancePayment || 0) -
      Number(booking.finalPaymentAmount || 0);

    const confirmPayment = window.confirm(
      `Balance amount is Rs. ${balance.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}.\n\nDo you want to mark this balance payment as received?`
    );

    if (!confirmPayment) return;

    try {
      const response = await fetch(
        `${API_BASE_URLS.roomSection}/bookings/${booking.id}/full-payment`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Full payment update failed");
      }

      await loadData();
      resetAvailability();

      setMessage("Full payment received successfully.");
    } catch (err) {
      console.error(err);
      setError("Full payment update failed. Payment may already be completed.");
    }
  };

  const handleCheckoutBooking = async (bookingId: string) => {
    const confirmCheckout = window.confirm(
      "Are you sure you want to check-out this booking?"
    );

    if (!confirmCheckout) return;

    try {
      const response = await fetch(
        `${API_BASE_URLS.roomSection}/bookings/${bookingId}/checkout`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Check-out failed");
      }

      await loadData();
      resetAvailability();

      setMessage("Booking checked out successfully.");
    } catch (err) {
      console.error(err);
      setError("Check-out failed. Only ACTIVE bookings can be checked out.");
    }
  };

  const openInvoiceDialog = (booking: Booking) => {
    setSelectedInvoiceBooking(booking);
  };

  const closeInvoiceDialog = () => {
    setSelectedInvoiceBooking(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Room Booking
      </Typography>

      <Typography color="text.secondary">
        Create guest bookings, check room availability by date range, receive
        final payments, and print invoices.
      </Typography>

      <BookingForm
        rooms={rooms}
        availabilityRooms={availabilityRooms}
        availabilityChecked={availabilityChecked}
        billingSetting={billingSetting}
        formData={formData}
        saving={saving}
        onFormChange={setFormData}
        onResetAvailability={resetAvailability}
        onCheckAvailability={handleCheckAvailability}
        onSubmit={handleCreateBooking}
      />

      <BookingList
        bookings={bookings}
        loading={loading}
        onInvoice={openInvoiceDialog}
        onCancel={handleCancelBooking}
        onCheckout={handleCheckoutBooking}
        onFullPaymentReceived={handleFullPaymentReceived}
      />

      <BookingInvoiceDialog
        open={!!selectedInvoiceBooking}
        booking={selectedInvoiceBooking}
        onClose={closeInvoiceDialog}
      />

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

export default BookingPage;