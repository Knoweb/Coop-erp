import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type MoneyValue = number | string | undefined;

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

type Props = {
  adjustments: StockAdjustment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onToday: () => void;
  loading: boolean;
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getAdjustmentColor = (quantityChanged: number): ChipColor => {
  if (quantityChanged < 0) return "error";
  if (quantityChanged > 0) return "success";
  return "default";
};

function HistooryTable({
  adjustments,
  selectedDate,
  onDateChange,
  onToday,
  loading,
}: Props) {
  return (
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
          Stock Adjustment History - {selectedDate}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField
            label="Select Date"
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <Button variant="contained" onClick={onToday}>
            Today
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading stock adjustment records...</Typography>
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
                  Item
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                  Type
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                  Previous Qty
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                  Change
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                  New Qty
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                  Unit Price
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>
                  Total Amount
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {adjustments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontWeight: "bold", color: "#111827" }}>
                    {item.adjustmentDate}
                  </TableCell>

                  <TableCell>{item.itemName}</TableCell>

                  <TableCell>{item.adjustmentType}</TableCell>

                  <TableCell>{item.previousQty}</TableCell>

                  <TableCell>
                    <Chip
                      label={
                        item.quantityChanged > 0
                          ? `+${item.quantityChanged}`
                          : item.quantityChanged
                      }
                      color={getAdjustmentColor(item.quantityChanged)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>

                  <TableCell sx={{ fontWeight: "bold" }}>
                    {item.newQty}
                  </TableCell>

                  <TableCell>Rs. {formatMoney(item.unitPrice)}</TableCell>

                  <TableCell sx={{ fontWeight: "bold" }}>
                    Rs. {formatMoney(item.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}

              {adjustments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    No stock adjustment records found for {selectedDate}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}

export default HistooryTable;