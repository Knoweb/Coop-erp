import { useEffect, useState } from "react";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import api from "../../../api/axiosConfig";

import SummaryCards from "./components/SummaryCards";
import Form from "./components/Form";
import HistooryTable from "./components/HistooryTable";

type MoneyValue = number | string | undefined;

type ItemProduct = {
  id: string;
  name: string;
  category: string;
  reorderLevel: number;
  unitPrice: MoneyValue;
};

type StockLedger = {
  id: string;
  item: ItemProduct;
  currentQty: number;
  lastUpdated: string;
};

type StockAdjustment = {
  id: string;
  itemName: string;
  category: string;
  adjustmentType: string;
  previousQty: number;
  quantityChanged: number;
  newQty: number;
  unitPrice: MoneyValue;
  totalAmount: MoneyValue;
  reason?: string;
  remarks?: string;
  adjustmentDate: string;
  createdAt: string;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function StockAdjustmentPage() {
  const [stockLedgers, setStockLedgers] = useState<StockLedger[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const stockResponse = await api.get(`/shop/stock`);
      const stockData: StockLedger[] = stockResponse.data;

      const sortedStock = stockData.sort((a, b) =>
        a.item.name.localeCompare(b.item.name)
      );

      const adjustmentResponse = await api.get(`/shop/stock-adjustments`);
      const adjustmentData: StockAdjustment[] = adjustmentResponse.data;

      setStockLedgers(sortedStock);
      setAdjustments(adjustmentData);
    } catch (err) {
      console.error(err);
      setError("Failed to load stock adjustment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDateAdjustments = adjustments.filter(
    (item) => item.adjustmentDate === selectedDate
  );

  const handleToday = () => {
    setSelectedDate(getTodayDate());
  };

  return (
    <Box>
      <Typography variant="h4" className="page-title" sx={{ fontWeight: "bold" }} gutterBottom>
        Stock Count / Adjustments
      </Typography>

      <Typography color="text.secondary">
        Add opening stock, record daily manager stock reductions, and view daily
        stock adjustment history.
      </Typography>

      <SummaryCards
        adjustments={selectedDateAdjustments}
        selectedDate={selectedDate}
      />

      <Form
        stockLedgers={stockLedgers}
        onSuccess={setMessage}
        onError={setError}
        reloadData={loadData}
      />

      <HistooryTable
        adjustments={selectedDateAdjustments}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onToday={handleToday}
        loading={loading}
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

export default StockAdjustmentPage;
