import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  InputAdornment,
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
import SearchIcon from "@mui/icons-material/Search";
import { getAdminStock } from "../../services/adminStockService";
import { getShopStock } from "../../services/shopStockService";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type StockFilter = "ALL" | "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

type ItemProduct = {
  id: string;
  name: string;
  category: string;
  reorderLevel: number;
  unitPrice: number;
};

type StockLedger = {
  id: string;
  item: ItemProduct;
  currentQty: number;
  lastUpdated: string;
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

function StockLedgerPage() {
  const role = localStorage.getItem("user_role");
  const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";
  const [stockLedgers, setStockLedgers] = useState<StockLedger[]>([]);
  const [activeFilter, setActiveFilter] = useState<StockFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStockLedgers = async () => {
    try {
      setLoading(true);

      const response = isAdmin ? await getAdminStock() : await getShopStock();
      const data: StockLedger[] = response.data;

      const sortedData = data.sort((a, b) =>
        a.item.name.localeCompare(b.item.name)
      );

      setStockLedgers(sortedData);
    } catch (err) {
      console.error(err);
      setError("Failed to load stock ledger. Check grocery shop service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockLedgers();
  }, []);

  const getStockStatus = (ledger: StockLedger) => {
    if (ledger.currentQty === 0) {
      return "OUT OF STOCK";
    }

    if (ledger.currentQty <= ledger.item.reorderLevel) {
      return "LOW STOCK";
    }

    return "AVAILABLE";
  };

  const getStockStatusColor = (ledger: StockLedger): ChipColor => {
    if (ledger.currentQty === 0) {
      return "error";
    }

    if (ledger.currentQty <= ledger.item.reorderLevel) {
      return "warning";
    }

    return "success";
  };

  const totalItems = stockLedgers.length;

  const availableItems = stockLedgers.filter(
    (ledger) => ledger.currentQty > ledger.item.reorderLevel
  );

  const lowStockItems = stockLedgers.filter(
    (ledger) =>
      ledger.currentQty > 0 && ledger.currentQty <= ledger.item.reorderLevel
  );

  const outOfStockItems = stockLedgers.filter(
    (ledger) => ledger.currentQty === 0
  );

  const filteredStockLedgers = stockLedgers.filter((ledger) => {
    const matchesSearch = ledger.item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "ALL") {
      return true;
    }
    if (activeFilter === "AVAILABLE") {
      return ledger.currentQty > ledger.item.reorderLevel;
    }
    if (activeFilter === "LOW_STOCK") {
      return (
        ledger.currentQty > 0 &&
        ledger.currentQty <= ledger.item.reorderLevel
      );
    }
    if (activeFilter === "OUT_OF_STOCK") {
      return ledger.currentQty === 0;
    }

    return true;
  });

  const getTableTitle = () => {
    if (activeFilter === "ALL") return "Current Stock List";
    if (activeFilter === "AVAILABLE") return "Available Stock Items";
    if (activeFilter === "LOW_STOCK") return "Low Stock Items";
    return "Out of Stock Items";
  };

  const summaryCards = [
    {
      title: "Total Items",
      value: totalItems,
      filter: "ALL" as StockFilter,
      helper: "Click to show all items",
    },
    {
      title: "Available Items",
      value: availableItems.length,
      filter: "AVAILABLE" as StockFilter,
      helper: "Click to show available items",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      filter: "LOW_STOCK" as StockFilter,
      helper: "Click to show low-stock items",
    },
    {
      title: "Out of Stock Items",
      value: outOfStockItems.length,
      filter: "OUT_OF_STOCK" as StockFilter,
      helper: "Click to show out-of-stock items",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Stock Ledger
      </Typography>

      <Typography color="text.secondary">
        View current stock levels, low-stock items, and out-of-stock items.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mt: 3,
        }}
      >
        {summaryCards.map((card) => (
          <Card
            key={card.filter}
            onClick={() => setActiveFilter(card.filter)}
            sx={{
              borderRadius: 3,
              cursor: "pointer",
              border:
                activeFilter === card.filter
                  ? "2px solid #f97316"
                  : "2px solid transparent",
              boxShadow: activeFilter === card.filter ? 4 : 1,
              "&:hover": {
                boxShadow: 5,
                transform: "translateY(-2px)",
              },
              transition: "0.2s",
            }}
          >
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {getTableTitle()}
            </Typography>

            <Chip
              label={`${filteredStockLedgers.length} item(s)`}
              color="primary"
              size="small"
            />
          </Box>

          <TextField
            size="small"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 280 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {loading ? (
          <Typography>Loading stock ledger...</Typography>
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
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Product Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Current Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Reorder Level</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Unit Cost</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Selling Price</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Last Purchase Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredStockLedgers.map((ledger) => (
                  <TableRow key={ledger.id}>
                    <TableCell>{ledger.item.category}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#111827" }}>{ledger.item.name}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1.05rem" }}>{ledger.currentQty}</TableCell>
                    <TableCell>{ledger.item.reorderLevel}</TableCell>
                    <TableCell>Rs. {ledger.item.unitPrice}</TableCell>
                    <TableCell>Rs. {ledger.item.unitPrice}</TableCell>
                    <TableCell>{formatDateTime(ledger.lastUpdated)}</TableCell>
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

                {filteredStockLedgers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No items found matching your search or filter
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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

export default StockLedgerPage;