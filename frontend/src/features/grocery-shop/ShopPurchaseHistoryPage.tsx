import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search as SearchIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import {
  getShopPurchaseHistory,
  type PurchaseHistoryResponse,
} from "./services/shopPurchaseHistoryService";

function ShopPurchaseHistoryPage() {
  const [history, setHistory] = useState<PurchaseHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<PurchaseHistoryResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getShopPurchaseHistory({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        search: searchTerm || undefined,
      });
      setHistory(data);
    } catch (err) {
      console.error("Failed to load purchase history", err);
      setError("Failed to load purchase history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => {
    fetchHistory();
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    // We need to fetch without filters immediately. 
    // State updates are async, so pass empty strings directly.
    setIsLoading(true);
    getShopPurchaseHistory({})
      .then((data) => setHistory(data))
      .catch(() => setError("Failed to load purchase history."))
      .finally(() => setIsLoading(false));
  };

  const openDetailsModal = (order: PurchaseHistoryResponse) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const totalOrders = history.length;
  const totalQuantity = history.reduce((sum, order) => sum + (order.totalQuantity || 0), 0);
  const totalValue = history.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1e293b", mb: 1 }}>
            Purchase History
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b" }}>
            View goods received from the Main Shop.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#166534", fontWeight: "bold", mb: 1 }}>
                Total Received Orders
              </Typography>
              <Typography variant="h4" sx={{ color: "#15803d", fontWeight: "bold" }}>
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#1e40af", fontWeight: "bold", mb: 1 }}>
                Total Received Quantity
              </Typography>
              <Typography variant="h4" sx={{ color: "#1d4ed8", fontWeight: "bold" }}>
                {totalQuantity}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: "#fdf4ff", border: "1px solid #fbcfe8" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#86198f", fontWeight: "bold", mb: 1 }}>
                Total Received Value
              </Typography>
              <Typography variant="h4" sx={{ color: "#a21caf", fontWeight: "bold" }}>
                Rs. {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <TextField
            placeholder="Search reference..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ minWidth: 250 }}
          />
          <Button variant="contained" color="primary" onClick={handleApplyFilter}>
            Apply Filter
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClearFilter}>
            Clear Filter
          </Button>
        </Box>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Received Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Reference Number</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Source</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Items Count</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Quantity</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No purchase history found for the selected date range.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{new Date(order.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{order.saleNumber}</TableCell>
                  <TableCell>{order.sourceName}</TableCell>
                  <TableCell>{order.itemsCount}</TableCell>
                  <TableCell>{order.totalQuantity}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Rs. {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: "#dcfce7",
                        color: "#166534",
                        display: "inline-block",
                        fontSize: "0.875rem",
                        fontWeight: "bold",
                      }}
                    >
                      {order.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => openDetailsModal(order)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onClose={closeDetailsModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          Received Order Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedOrder && (
            <>
              {/* Header Info Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Reference Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {selectedOrder.saleNumber}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Received Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {new Date(selectedOrder.saleDate).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Source
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {selectedOrder.sourceName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: "#dcfce7",
                      color: "#166534",
                      display: "inline-block",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      mt: 0.5
                    }}
                  >
                    {selectedOrder.status}
                  </Box>
                </Grid>
              </Grid>

              {/* Items Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Product Code</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Quantity Received</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Line Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            Rs. {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            Rs. {item.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
          {selectedOrder && (
            <Box sx={{ display: "flex", gap: 4, ml: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{selectedOrder.totalQuantity}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Rs. {selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          )}
          <Button onClick={closeDetailsModal} variant="contained" color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ShopPurchaseHistoryPage;
