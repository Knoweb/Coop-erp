import type { SyntheticEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type {
  AvailabilityRoom,
  BillingSetting,
  BookingFormData,
  MoneyValue,
  Room,
} from "../BookingPage";

type Props = {
  rooms: Room[];
  availabilityRooms: AvailabilityRoom[];
  availabilityChecked: boolean;
  billingSetting: BillingSetting;
  formData: BookingFormData;
  saving: boolean;
  onFormChange: (data: BookingFormData) => void;
  onResetAvailability: () => void;
  onCheckAvailability: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (end <= start) return 0;

  const startDateOnly = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  const differenceMs = endDateOnly.getTime() - startDateOnly.getTime();
  const nights = differenceMs / (1000 * 60 * 60 * 24);

  return nights <= 0 ? 1 : nights;
};

const calculateExtraHours = (
  checkIn: string,
  checkOut: string,
  nights: number
) => {
  if (!checkIn || !checkOut || nights <= 0) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (end <= start) return 0;

  const expectedCheckOut = new Date(start);
  expectedCheckOut.setDate(expectedCheckOut.getDate() + nights);

  if (end <= expectedCheckOut) return 0;

  const extraMinutes =
    (end.getTime() - expectedCheckOut.getTime()) / (1000 * 60);

  return Math.ceil(extraMinutes / 60);
};

function BookingForm({
  rooms,
  availabilityRooms,
  availabilityChecked,
  billingSetting,
  formData,
  saving,
  onFormChange,
  onResetAvailability,
  onCheckAvailability,
  onSubmit,
}: Props) {
  const availableRooms = availabilityRooms.filter((room) => room.available);
  const selectedRoom = rooms.find((room) => room.id === formData.roomId);

  const nights = calculateNights(formData.checkIn, formData.checkOut);

  const extraHours = calculateExtraHours(
    formData.checkIn,
    formData.checkOut,
    nights
  );

  const roomCharge = selectedRoom
    ? Number(selectedRoom.basePrice || 0) * nights
    : 0;

  const extraHourCharge = selectedRoom
    ? Number(selectedRoom.extraHourRate || 0) * extraHours
    : 0;

  const serviceChargeAmount = Number(formData.serviceChargeAmount || 0);

  const subTotal = roomCharge + extraHourCharge;

  const taxableAmount = subTotal + serviceChargeAmount;

  const vatAmount =
    (taxableAmount * Number(billingSetting.vatRate || 0)) / 100;

  const ssclAmount =
    (taxableAmount * Number(billingSetting.ssclRate || 0)) / 100;

  const taxAmount = vatAmount + ssclAmount;

  const totalDue = taxableAmount + taxAmount;

  const balanceAmount = totalDue - Number(formData.advancePayment || 0);

  const totalGuests =
    Number(formData.adults || 0) + Number(formData.children || 0);

  const updateField = (field: keyof BookingFormData, value: string) => {
    if (field === "checkIn" || field === "checkOut") {
      onFormChange({
        ...formData,
        [field]: value,
        roomId: "",
      });

      onResetAvailability();
      return;
    }

    onFormChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Create Booking
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Enter guest details, select dates, check availability, and create the
          booking.
        </Typography>

        <Box component="form" onSubmit={onSubmit}>
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
              label="Guest Name"
              fullWidth
              value={formData.guestName}
              onChange={(e) => updateField("guestName", e.target.value)}
              placeholder="Example: Nimal Perera"
            />

            <TextField
              label="NIC / Passport"
              fullWidth
              value={formData.nicPassport}
              onChange={(e) => updateField("nicPassport", e.target.value)}
              placeholder="Example: 991234567V"
            />

            <TextField
              label="Adults"
              type="number"
              fullWidth
              value={formData.adults}
              onChange={(e) => updateField("adults", e.target.value)}
              slotProps={{
                htmlInput: {
                  min: 1,
                },
              }}
            />

            <TextField
              label="Children"
              type="number"
              fullWidth
              value={formData.children}
              onChange={(e) => updateField("children", e.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <TextField
              label="Check In"
              type="datetime-local"
              fullWidth
              value={formData.checkIn}
              onChange={(e) => updateField("checkIn", e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="Check Out"
              type="datetime-local"
              fullWidth
              value={formData.checkOut}
              onChange={(e) => updateField("checkOut", e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
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
                type="button"
                variant="outlined"
                onClick={onCheckAvailability}
                sx={{
                  color: "#7f1d1d",
                  borderColor: "#7f1d1d",
                  "&:hover": {
                    backgroundColor: "#7f1d1d",
                    color: "white",
                  },
                }}
              >
                Check Availability
              </Button>
            </Box>

            <TextField
              select
              label="Select Available Room"
              fullWidth
              value={formData.roomId}
              onChange={(e) => updateField("roomId", e.target.value)}
              disabled={!availabilityChecked}
              helperText={
                availabilityChecked
                  ? `${availableRooms.length} available room(s) found for selected date range`
                  : "Select dates and click Check Availability first"
              }
            >
              <MenuItem value="" disabled>
                {availabilityChecked
                  ? "Select available room"
                  : "Please check availability first"}
              </MenuItem>

              {availableRooms.map((room) => {
                const fullRoom = rooms.find((item) => item.id === room.roomId);

                return (
                  <MenuItem key={room.roomId} value={room.roomId}>
                    Room {room.roomNumber} - {room.roomType} - Rs.{" "}
                    {formatMoney(fullRoom?.basePrice)} - Extra Hour Rs.{" "}
                    {formatMoney(fullRoom?.extraHourRate)}
                  </MenuItem>
                );
              })}

              {availabilityChecked && availableRooms.length === 0 && (
                <MenuItem value="" disabled>
                  No rooms available for selected date range
                </MenuItem>
              )}
            </TextField>

            <TextField
              label="Service Charge"
              type="number"
              fullWidth
              value={formData.serviceChargeAmount}
              onChange={(e) =>
                updateField("serviceChargeAmount", e.target.value)
              }
              placeholder="Example: 500"
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <TextField
              label="Advance Payment"
              type="number"
              fullWidth
              value={formData.advancePayment}
              onChange={(e) => updateField("advancePayment", e.target.value)}
              placeholder="Example: 5000"
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />
          </Box>

          <Paper
            variant="outlined"
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#fff7ed",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Invoice Preview
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
                mt: 2,
              }}
            >
              <Box>
                <Typography color="text.secondary">No. of Guests</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {totalGuests}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Adults</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {formData.adults || 0}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Children</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {formData.children || 0}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Nights</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{nights}</Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Extra Hours</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {extraHours}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Room Charge</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(roomCharge)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">
                  Extra Hour Charge
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(extraHourCharge)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Sub Total</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(subTotal)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Service Charge</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(serviceChargeAmount)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Taxable Amount</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(taxableAmount)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">
                  Tax ({formatMoney(billingSetting.vatRate)}% VAT +{" "}
                  {formatMoney(billingSetting.ssclRate)}% SSCL)
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(taxAmount)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Total Due</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(totalDue)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Balance</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(balanceAmount)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={
                saving || !availabilityChecked || availableRooms.length === 0
              }
              sx={{
                backgroundColor: "#f97316",
                color: "white",
                "&:hover": {
                  backgroundColor: "#ea580c",
                },
              }}
            >
              {saving ? "Saving..." : "Create Booking"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BookingForm;