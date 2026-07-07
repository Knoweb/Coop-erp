import { useEffect, useState } from "react";
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

type Supplier = {
  id: string;
  name: string;
  contactNumber: string;
  address?: string;
};

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

type GrnResponse = {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: MoneyValue;
  remarks?: string;
};

type DailySales = {
  id: string;
  salesDate: string;
  totalSalesValue: MoneyValue;
  cashHandedOver: MoneyValue;
  discrepancy: MoneyValue;
  receivedBy?: string;
  remarks?: string;
  status: string;
  message: string;
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

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function MilkShopDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<ItemProduct[]>([]);
  const [stockLedgers, setStockLedgers] = useState<StockLedger[]>([]);
  const [grns, setGrns] = useState<GrnResponse[]>([]);
  const [dailySalesList, setDailySalesList] = useState<DailySales[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(
    []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const todayDate = getTodayDate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        suppliersResponse,
        itemsResponse,
        stockResponse,
        grnResponse,
        salesResponse,
        adjustmentResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URLS.milkShop}/suppliers`),
        fetch(`${API_BASE_URLS.milkShop}/items`),
        fetch(`${API_BASE_URLS.milkShop}/stock`),
        fetch(`${API_BASE_URLS.milkShop}/grn`),
        fetch(`${API_BASE_URLS.milkShop}/sales`),
        fetch(`${API_BASE_URLS.milkShop}/stock-adjustments`),
      ]);

      if (!suppliersResponse.ok) throw new Error("Failed to load suppliers");
      if (!itemsResponse.ok) throw new Error("Failed to load items");
      if (!stockResponse.ok) throw new Error("Failed to load stock");
      if (!grnResponse.ok) throw new Error("Failed to load GRN records");
      if (!salesResponse.ok) throw new Error("Failed to load daily sales");
      if (!adjustmentResponse.ok)
        throw new Error("Failed to load stock adjustments");

      const suppliersData: Supplier[] = await suppliersResponse.json();
      const itemsData: ItemProduct[] = await itemsResponse.json();
      const stockData: StockLedger[] = await stockResponse.json();
      const grnData: GrnResponse[] = await grnResponse.json();
      const salesData: DailySales[] = await salesResponse.json();
      const adjustmentData: StockAdjustment[] =
        await adjustmentResponse.json();

      setSuppliers(suppliersData);
      setItems(itemsData);
      setStockLedgers(stockData);
      setGrns(grnData);
      setDailySalesList(salesData);
      setStockAdjustments(adjustmentData);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Check milk-shop-service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const lowStockItems = stockLedgers.filter(
    (ledger) =>
      ledger.currentQty > 0 && ledger.currentQty <= ledger.item.reorderLevel
  );

  const outOfStockItems = stockLedgers.filter(
    (ledger) => ledger.currentQty === 0
  );

  const stockAlertItems = [...outOfStockItems, ...lowStockItems];

  const todaySales = dailySalesList.find(
    (sales) => sales.salesDate === todayDate
  );

  const todayAdjustments = stockAdjustments.filter(
    (item) => item.adjustmentDate === todayDate
  );

  const todayReducedAdjustments = todayAdjustments.filter(
    (item) => item.quantityChanged < 0
  );

  const todayReducedQty = todayReducedAdjustments.reduce((total, item) => {
    return total + Math.abs(Number(item.quantityChanged || 0));
  }, 0);

  const todayReducedAmount = todayReducedAdjustments.reduce((total, item) => {
    return total + Number(item.totalAmount || 0);
  }, 0);

  const recentGrns = [...grns]
    .sort((a, b) => {
      return (
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
    })
    .slice(0, 5);

  const recentTodayAdjustments = [...todayAdjustments]
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const getStockStatus = (ledger: StockLedger) => {
    if (ledger.currentQty === 0) return "OUT OF STOCK";
    if (ledger.currentQty <= ledger.item.reorderLevel) return "LOW STOCK";
    return "AVAILABLE";
  };

  const getStockStatusColor = (ledger: StockLedger): ChipColor => {
    if (ledger.currentQty === 0) return "error";
    if (ledger.currentQty <= ledger.item.reorderLevel) return "warning";
    return "success";
  };

  const getSalesStatusColor = (value: MoneyValue): ChipColor => {
    const amount = Number(value || 0);

    if (amount === 0) return "success";
    if (amount < 0) return "error";
    return "warning";
  };

  const summaryCards = [
    {
      title: "Suppliers",
      value: suppliers.length,
      helper: "Registered active suppliers",
    },
    {
      title: "Items / Products",
      value: items.length,
      helper: "Milk shop products",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      helper: "Items at or below reorder level",
    },
    {
      title: "Out of Stock Items",
      value: outOfStockItems.length,
      helper: "Items with zero quantity",
    },
    {
      title: "Today Stock Reduced Qty",
      value: todayReducedQty,
      helper: "From stock adjustments today",
    },
    {
      title: "Today Income",
      value: `Rs. ${formatMoney(todayReducedAmount)}`,
      helper: "Reduced quantity × unit price",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Milk Shop Dashboard
      </Typography>

      <Typography color="text.secondary">
        Quick overview of stock, daily sales, stock reductions, and recent GRNs.
      </Typography>

      {loading && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading dashboard data...
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mt: 3,
        }}
      >
        {summaryCards.map((card) => (
          <Card key={card.title} sx={{ borderRadius: 3 }}>
            <CardContent
              sx={{
                minHeight: 140,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography color="text.secondary">{card.title}</Typography>

              <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                {card.value}
              </Typography>

              <Box sx={{ mt: "auto", pt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  {card.helper}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Today Cash Handover
          </Typography>

          {todaySales ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography color="text.secondary">Sales</Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(todaySales.totalSalesValue)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Cash Handed Over</Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Rs. {formatMoney(todaySales.cashHandedOver)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary">Difference</Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color:
                      Number(todaySales.discrepancy || 0) < 0
                        ? "error.main"
                        : Number(todaySales.discrepancy || 0) > 0
                        ? "warning.main"
                        : "success.main",
                  }}
                >
                  Rs. {formatMoney(todaySales.discrepancy)}
                </Typography>
              </Box>

              <Box>
                <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                  Status
                </Typography>
                <Chip
                  label={todaySales.status}
                  color={getSalesStatusColor(todaySales.discrepancy)}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">
              No daily sales record found for today.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
          mt: 3,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Stock Alerts
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f3f4f6",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Current Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Reorder</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {stockAlertItems.slice(0, 6).map((ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {ledger.item.name}
                    </TableCell>
                    <TableCell>{ledger.currentQty}</TableCell>
                    <TableCell>{ledger.item.reorderLevel}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStockStatus(ledger)}
                        color={getStockStatusColor(ledger)}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {stockAlertItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>No stock alerts</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Today Stock Adjustments
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f3f4f6",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Change</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentTodayAdjustments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {item.itemName}
                    </TableCell>
                    <TableCell>{item.adjustmentType}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          item.quantityChanged > 0
                            ? `+${item.quantityChanged}`
                            : item.quantityChanged
                        }
                        color={
                          item.quantityChanged < 0
                            ? "error"
                            : item.quantityChanged > 0
                            ? "success"
                            : "default"
                        }
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>Rs. {formatMoney(item.totalAmount)}</TableCell>
                  </TableRow>
                ))}

                {recentTodayAdjustments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      No stock adjustments found for today
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Recent GRNs
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead
              sx={{
                backgroundColor: "#f3f4f6",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Invoice No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentGrns.map((grn) => (
                <TableRow key={grn.id}>
                  <TableCell>{grn.invoiceDate}</TableCell>
                  <TableCell>{grn.supplierName}</TableCell>
                  <TableCell>{grn.invoiceNumber || "-"}</TableCell>
                  <TableCell>Rs. {formatMoney(grn.totalAmount)}</TableCell>
                </TableRow>
              ))}

              {recentGrns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>No GRN records found</TableCell>
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

export default MilkShopDashboard;