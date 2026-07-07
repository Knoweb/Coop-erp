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
import api from "../../api/axiosConfig";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type MoneyValue = number | string | undefined;

type DailySales = {
  id: string;
  salesDate: string;
  totalSalesValue: MoneyValue;
  cashHandedOver: MoneyValue;
  discrepancy: MoneyValue;
  operatorId: string;
  receivedBy?: string;
  remarks?: string;
  status: string;
  message: string;
};

const TEMP_OPERATOR_ID = "00000000-0000-0000-0000-000000000001";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthPrefix = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const getMonthName = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function DailySalesPage() {
  const [dailySalesList, setDailySalesList] = useState<DailySales[]>([]);

  const [salesDate, setSalesDate] = useState(getTodayDate());
  const [totalSalesValue, setTotalSalesValue] = useState("");
  const [cashHandedOver, setCashHandedOver] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [remarks, setRemarks] = useState("");

  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDailySales = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/shop/sales`);
      const data: DailySales[] = response.data;

      const sortedData = data.sort((a, b) => {
        return new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime();
      });

      setDailySalesList(sortedData);
    } catch (err) {
      console.error(err);
      setError("Failed to load daily sales. Check grocery shop service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailySales();
  }, []);

  const calculateDiscrepancy = () => {
    return Number(cashHandedOver || 0) - Number(totalSalesValue || 0);
  };

  const getDiscrepancyStatus = (value: MoneyValue) => {
    const amount = Number(value || 0);

    if (amount === 0) return "BALANCED";
    if (amount < 0) return "SHORT";
    return "EXTRA";
  };

  const getDiscrepancyColor = (value: MoneyValue): ChipColor => {
    const amount = Number(value || 0);

    if (amount === 0) return "success";
    if (amount < 0) return "error";
    return "warning";
  };

  const resetForm = () => {
    setSalesDate(getTodayDate());
    setTotalSalesValue("");
    setCashHandedOver("");
    setReceivedBy("");
    setRemarks("");
  };

  const handleCreateDailySales = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!salesDate || !totalSalesValue || !cashHandedOver) {
      setError(
        "Please enter sales date, total sales value, and cash handed over."
      );
      return;
    }

    try {
      const response = await api.post(`/shop/sales/daily-summary`, {
        salesDate,
        totalSalesValue: Number(totalSalesValue),
        cashHandedOver: Number(cashHandedOver),
        operatorId: TEMP_OPERATOR_ID,
        receivedBy,
        remarks,
      });

      const savedData: DailySales = response.data;

      resetForm();
      await loadDailySales();

      setMessage(savedData.message || "Daily sales saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Daily sales save failed. Maybe this date is already recorded.");
    }
  };

  const selectedMonthPrefix = getMonthPrefix(selectedMonthDate);

  const selectedMonthSalesList = dailySalesList.filter((item) =>
    item.salesDate?.startsWith(selectedMonthPrefix)
  );

  const totalRecordedSales = selectedMonthSalesList.reduce((total, item) => {
    return total + Number(item.totalSalesValue || 0);
  }, 0);

  const totalCashHandedOver = selectedMonthSalesList.reduce((total, item) => {
    return total + Number(item.cashHandedOver || 0);
  }, 0);

  const totalDiscrepancy = selectedMonthSalesList.reduce((total, item) => {
    return total + Number(item.discrepancy || 0);
  }, 0);

  const selectedMonthName = getMonthName(selectedMonthDate);

  const handlePreviousMonth = () => {
    setSelectedMonthDate((previousDate) => {
      return new Date(
        previousDate.getFullYear(),
        previousDate.getMonth() - 1,
        1
      );
    });
  };

  const handleThisMonth = () => {
    setSelectedMonthDate(new Date());
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Daily Sales / Cash Handover
      </Typography>

      <Typography color="text.secondary">
        Record daily Grocery Shop sales, cash handed over, and discrepancy.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mt: 3,
        }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              {selectedMonthName} Recorded Sales
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
              Rs. {formatMoney(totalRecordedSales)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              {selectedMonthName} Cash Handed Over
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
              Rs. {formatMoney(totalCashHandedOver)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="text.secondary">
              {selectedMonthName} Difference
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mt: 1,
                color:
                  totalDiscrepancy < 0
                    ? "error.main"
                    : totalDiscrepancy > 0
                    ? "warning.main"
                    : "success.main",
              }}
            >
              Rs. {formatMoney(totalDiscrepancy)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card
        sx={{
          mt: 3,
          maxWidth: 850,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Add Daily Sales Summary
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Enter the daily sales total and actual cash handed over.
          </Typography>

          <Box component="form" onSubmit={handleCreateDailySales}>
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
                label="Sales Date"
                type="date"
                fullWidth
                value={salesDate}
                onChange={(e) => setSalesDate(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                label="Received By"
                fullWidth
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Example: Co-op Manager"
              />

              <TextField
                label="Total Sales Value"
                type="number"
                fullWidth
                value={totalSalesValue}
                onChange={(e) => setTotalSalesValue(e.target.value)}
                placeholder="Example: 28500"
              />

              <TextField
                label="Cash Handed Over"
                type="number"
                fullWidth
                value={cashHandedOver}
                onChange={(e) => setCashHandedOver(e.target.value)}
                placeholder="Example: 28000"
              />

              <TextField
                label="Difference"
                fullWidth
                value={`Rs. ${formatMoney(calculateDiscrepancy())}`}
                disabled
                helperText="Cash handed over - Total sales value"
              />

              <TextField
                label="Remarks"
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Example: Cash short due to return"
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
                <Button type="submit" variant="contained" size="large">
                  Save Daily Sales
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Daily Sales History - {selectedMonthName}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={handlePreviousMonth}>
              Previous Month
            </Button>

            <Button variant="contained" onClick={handleThisMonth}>
              This Month
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Typography>Loading daily sales records...</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f3f4f6",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Total Sales
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Cash Handed Over
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Difference
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Received By
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                    Remarks
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedMonthSalesList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: "bold", color: "#111827" }}>
                      {item.salesDate}
                    </TableCell>

                    <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                      Rs. {formatMoney(item.totalSalesValue)}
                    </TableCell>

                    <TableCell>
                      Rs. {formatMoney(item.cashHandedOver)}
                    </TableCell>

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
                        label={
                          item.status ||
                          getDiscrepancyStatus(item.discrepancy)
                        }
                        color={getDiscrepancyColor(item.discrepancy)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>{item.receivedBy || "-"}</TableCell>

                    <TableCell>{item.remarks || "-"}</TableCell>
                  </TableRow>
                ))}

                {selectedMonthSalesList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      No daily sales records found for {selectedMonthName}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
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

export default DailySalesPage;