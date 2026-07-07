import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import type { Booking, MoneyValue } from "../BookingPage";

type Props = {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function BookingInvoiceDialog({ open, booking, onClose }: Props) {
  if (!booking) return null;

  const roomType = booking.room?.roomType || "";
  const normalizedRoomType = roomType.toUpperCase();

  const isNonAcRoom =
    normalizedRoomType.includes("NON") || normalizedRoomType.includes("N.A/C");

  const isAcRoom =
    normalizedRoomType.includes("AC") ||
    normalizedRoomType.includes("A/C") ||
    normalizedRoomType.includes("A C");

  const extraHourCharge = Number(booking.extraHourCharge || 0);
  const subTotal = Number(booking.subTotal || 0);
  const roomCharge = subTotal - extraHourCharge;
  const serviceChargeAmount = Number(booking.serviceChargeAmount || 0);
  const taxableAmount = subTotal + serviceChargeAmount;

  const vatRate = Number(booking.vatRate || 0);
  const ssclRate = Number(booking.ssclRate || 0);

  const vatAmount = (taxableAmount * vatRate) / 100;
  const ssclAmount = (taxableAmount * ssclRate) / 100;

  const grandTotal = Number(booking.totalDue || 0);
  const lessAdvance = Number(booking.advancePayment || 0);
  const finalPayment = Number(booking.finalPaymentAmount || 0);

  const paidAmount = lessAdvance + finalPayment;
  const balance = grandTotal - paidAmount > 0 ? grandTotal - paidAmount : 0;

  const invoiceNo = booking.id ? booking.id.slice(0, 8).toUpperCase() : "-";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="no-print">Booking Invoice / Receipt</DialogTitle>

      <DialogContent>
        <style>
        {`
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          @media print {
            #root {
              display: none !important;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            #booking-invoice-print,
            #booking-invoice-print * {
              visibility: visible !important;
            }

            #booking-invoice-print {
              position: absolute !important; 
              top: 20px !important; 
              left: 0 !important;
              right: 0 !important;
              margin: 0 auto !important;

              width: 100% !important;
              max-width: 800px !important;

              padding: 15px !important;
              box-sizing: border-box !important;

              transform: none !important;
              zoom: 0.98;

              background: white !important;
              border: 1px solid #444 !important;

              page-break-before: avoid !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            #booking-invoice-print table td {
              font-size: 10px !important;
              padding-top: 2px !important;
              padding-bottom: 2px !important;
            }

            #booking-invoice-print p,
            #booking-invoice-print span {
              font-size: 10px !important;
            }

            .MuiDialog-root,
            .MuiDialog-container,
            .MuiDialogContent-root,
            .MuiPaper-root {
              position: static !important;
              transform: none !important;
              box-shadow: none !important;
              overflow: visible !important;
              max-height: none !important;
              height: auto !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

        <Box
          id="booking-invoice-print"
          sx={{
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            my: 0,
            backgroundColor: "white",
            color: "black",
            p: 1,
            border: "1px solid #444",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: "bold",
                letterSpacing: 0.5,
              }}
            >
              HIKKADUWA MULTY PURPOSE CO-OPERATIVE SOCIETY LTD
            </Typography>

            <Typography sx={{ fontSize: 13, fontWeight: "bold" }}>
              GALLE ROAD, HIKKADUWA
            </Typography>

            <Typography sx={{ fontSize: 11 }}>
              TEL - 0912276765, 0912277335, 0706413599
            </Typography>

            <Typography sx={{ fontSize: 14, fontWeight: "bold", mt: 1 }}>
              ROOMS SECTION
            </Typography>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: "bold",
                letterSpacing: 3,
              }}
            >
              INVOICE
            </Typography>
          </Box>

          {/* Date and invoice number */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", border: "1px solid #555", height: 30 }}>
              <Box
                sx={{
                  width: 90,
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                DATE
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                {formatDate(new Date().toISOString())}
              </Box>
            </Box>

            <Box sx={{ display: "flex", border: "1px solid #555", height: 30 }}>
              <Box
                sx={{
                  width: 110,
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                INVOICE NO
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                {invoiceNo}
              </Box>
            </Box>
          </Box>

          {/* Guest name */}
          <Box
            sx={{
              border: "1px solid #555",
              height: 30,
              display: "flex",
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 150,
                px: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              NAME OF THE GUEST
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              {booking.guestName}
            </Box>
          </Box>

          {/* Room number */}
          <Box
            sx={{
              border: "1px solid #555",
              height: 30,
              display: "flex",
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 150,
                px: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              ROOM NO/S
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              Room {booking.room?.roomNumber} - {booking.room?.roomType}
            </Box>
          </Box>

          {/* Arrival and departure */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", border: "1px solid #555", height: 30 }}>
              <Box
                sx={{
                  width: 130,
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                DATE OF ARRIVAL
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                {formatDateTime(booking.checkIn)}
              </Box>
            </Box>

            <Box sx={{ display: "flex", border: "1px solid #555", height: 30 }}>
              <Box
                sx={{
                  width: 150,
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                DATE OF DEPARTURE
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                {formatDateTime(booking.checkOut)}
              </Box>
            </Box>
          </Box>

          {/* Guest count */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                border: "1px solid #555",
                height: 30,
                px: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              NO OF GUESTS - {Number(booking.adults || 0) + Number(booking.children || 0)}
            </Box>

            <Box
              sx={{
                border: "1px solid #555",
                height: 30,
                px: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              ADULTS - {booking.adults || 0}
            </Box>

            <Box
              sx={{
                border: "1px solid #555",
                height: 30,
                px: 1,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              CHILDRENS - {booking.children || 0}
            </Box>
          </Box>

          {/* Main invoice table */}
          <Table
            size="small"
            sx={{
              border: "1px solid #444",
              "& td": {
                border: "1px solid #555",
                fontSize: 12,
                py: 0.6,
              },
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                  NO OF ROOMS
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "25%" }}>
                  DESCRIPTION
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                  NO OF DAYS
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                  RATE
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                  VALUE
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{isAcRoom && !isNonAcRoom ? "1" : ""}</TableCell>
                <TableCell>A/C ROOM</TableCell>
                <TableCell>
                  {isAcRoom && !isNonAcRoom ? booking.noOfDays || 1 : ""}
                </TableCell>
                <TableCell>
                  {isAcRoom && !isNonAcRoom
                    ? `Rs. ${formatMoney(booking.room?.basePrice)}`
                    : ""}
                </TableCell>
                <TableCell>
                  {isAcRoom && !isNonAcRoom
                    ? `Rs. ${formatMoney(roomCharge)}`
                    : ""}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{isNonAcRoom ? "1" : ""}</TableCell>
                <TableCell>N.A/C ROOM</TableCell>
                <TableCell>{isNonAcRoom ? booking.noOfDays || 1 : ""}</TableCell>
                <TableCell>
                  {isNonAcRoom
                    ? `Rs. ${formatMoney(booking.room?.basePrice)}`
                    : ""}
                </TableCell>
                <TableCell>
                  {isNonAcRoom ? `Rs. ${formatMoney(roomCharge)}` : ""}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell></TableCell>
                <TableCell>OTHER / EXTRA HOURS</TableCell>
                <TableCell>
                  {booking.extraHours ? `${booking.extraHours} hours` : ""}
                </TableCell>
                <TableCell>
                  {booking.extraHours
                    ? `Rs. ${formatMoney(booking.room?.extraHourRate)}`
                    : ""}
                </TableCell>
                <TableCell>
                  {extraHourCharge > 0
                    ? `Rs. ${formatMoney(extraHourCharge)}`
                    : ""}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4} sx={{ fontWeight: "bold" }}>
                  SUB TOTAL
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(subTotal)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4}>SERVICE CHARGES</TableCell>
                <TableCell>Rs. {formatMoney(serviceChargeAmount)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4}>VAT ({formatMoney(vatRate)}%)</TableCell>
                <TableCell>Rs. {formatMoney(vatAmount)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4}>
                  SSCL ({formatMoney(ssclRate)}%)
                </TableCell>
                <TableCell>Rs. {formatMoney(ssclAmount)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4} sx={{ fontWeight: "bold" }}>
                  GRAND TOTAL
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(grandTotal)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4}>LESS ADVANCE</TableCell>
                <TableCell>Rs. {formatMoney(lessAdvance)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4}>FINAL PAYMENT</TableCell>
                <TableCell>Rs. {formatMoney(finalPayment)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={4} sx={{ fontWeight: "bold" }}>
                  BALANCE
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(balance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Payment section */}
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: "bold", mb: 0.5 }}>
              MODE OF PAYMENT
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              <Table
                size="small"
                sx={{
                  border: "1px solid #555",
                  "& td": {
                    border: "1px solid #555",
                    fontSize: 12,
                    py: 0.5,
                  },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell>CASH</TableCell>
                    <TableCell>Rs. {formatMoney(paidAmount)}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>CREDIT/DEBIT CARD</TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>BANK</TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>TOTAL</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Rs. {formatMoney(paidAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Table
                size="small"
                sx={{
                  border: "1px solid #555",
                  "& td": {
                    border: "1px solid #555",
                    fontSize: 12,
                    py: 0.5,
                  },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell>CARD NO.</TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>B.COM.NO</TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>TRAVEL AGENTS</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          {/* Signature section */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              mt: 4,
            }}
          >
            <Box>
              <Divider sx={{ borderColor: "#555", mb: 1 }} />
              <Typography sx={{ fontSize: 12 }}>PREPARED BY</Typography>
            </Box>

            <Box>
              <Divider sx={{ borderColor: "#555", mb: 1 }} />
              <Typography sx={{ fontSize: 12, textAlign: "center" }}>
                GUEST'S SIGNATURE
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 3,
              backgroundColor: "#4b5563",
              color: "white",
              textAlign: "center",
              py: 1,
              fontWeight: "bold",
              letterSpacing: 1,
              fontSize: 13,
            }}
          >
            THANK YOU FOR BEING WITH US AND WE HOPE TO SEE YOU AGAIN
          </Box>
        </Box>

        <Box
          className="no-print"
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>

          <Button variant="contained" onClick={handlePrint}>
            Print Invoice
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default BookingInvoiceDialog;