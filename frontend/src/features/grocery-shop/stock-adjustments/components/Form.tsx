import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../../../api/axiosConfig";

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

type AdjustmentRow = {
  adjustmentType: string;
  quantity: string;
};

type Props = {
  stockLedgers: StockLedger[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  reloadData: () => Promise<void>;
};

const adjustmentTypes = [
  "Daily Sales Reduction",
  "Opening Stock",
  "Stock Count Correction",
];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createDefaultRow = (): AdjustmentRow => {
  return {
    adjustmentType: "Daily Sales Reduction",
    quantity: "",
  };
};

function Form({ stockLedgers, onSuccess, onError, reloadData }: Props) {
  const [adjustmentDate, setAdjustmentDate] = useState(getTodayDate());
  const [reason, setReason] = useState("Daily manager stock count");
  const [remarks, setRemarks] = useState("");
  const [rows, setRows] = useState<Record<string, AdjustmentRow>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRows((previousRows) => {
      const nextRows: Record<string, AdjustmentRow> = {};

      stockLedgers.forEach((ledger) => {
        nextRows[ledger.item.id] =
          previousRows[ledger.item.id] || createDefaultRow();
      });

      return nextRows;
    });
  }, [stockLedgers]);

  const updateRow = (
    itemId: string,
    field: keyof AdjustmentRow,
    value: string
  ) => {
    setRows((previousRows) => ({
      ...previousRows,
      [itemId]: {
        ...(previousRows[itemId] || createDefaultRow()),
        [field]: value,
      },
    }));
  };

  const getNewQtyPreview = (ledger: StockLedger) => {
    const row = rows[ledger.item.id] || createDefaultRow();

    if (row.quantity === "") {
      return ledger.currentQty;
    }

    const quantity = Number(row.quantity || 0);

    if (
      row.adjustmentType === "Opening Stock" ||
      row.adjustmentType === "Stock Count Correction"
    ) {
      return quantity;
    }

    return ledger.currentQty - quantity;
  };

  const getChangePreview = (ledger: StockLedger) => {
    const row = rows[ledger.item.id] || createDefaultRow();

    if (row.quantity === "") {
      return 0;
    }

    const quantity = Number(row.quantity || 0);

    if (
      row.adjustmentType === "Opening Stock" ||
      row.adjustmentType === "Stock Count Correction"
    ) {
      return quantity - ledger.currentQty;
    }

    return -quantity;
  };

  const getFilledRows = () => {
    return stockLedgers.filter((ledger) => {
      const row = rows[ledger.item.id];
      return row && row.quantity !== "";
    });
  };

  const validateRows = () => {
    const filledRows = getFilledRows();

    if (filledRows.length === 0) {
      onError("Please enter quantity for at least one item.");
      return false;
    }

    for (const ledger of filledRows) {
      const row = rows[ledger.item.id];

      if (!row) {
        onError("Invalid row data.");
        return false;
      }

      const quantity = Number(row.quantity);

      if (Number.isNaN(quantity) || quantity < 0) {
        onError(`Please enter a valid quantity for ${ledger.item.name}.`);
        return false;
      }

      if (
        row.adjustmentType !== "Opening Stock" &&
        row.adjustmentType !== "Stock Count Correction" &&
        quantity > ledger.currentQty
      ) {
        onError(`${ledger.item.name}: Cannot reduce more than available stock.`);
        return false;
      }
    }

    return true;
  };

  const resetRows = () => {
    const nextRows: Record<string, AdjustmentRow> = {};

    stockLedgers.forEach((ledger) => {
      nextRows[ledger.item.id] = createDefaultRow();
    });

    setRows(nextRows);
    setAdjustmentDate(getTodayDate());
    setReason("Daily manager stock count");
    setRemarks("");
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateRows()) {
      return;
    }

    const filledRows = getFilledRows();

    try {
      setSaving(true);

      await Promise.all(
        filledRows.map((ledger) => {
          const row = rows[ledger.item.id];

          return api.post(`/shop/stock-adjustments`, {
            itemId: ledger.item.id,
            adjustmentType: row.adjustmentType,
            quantity: Number(row.quantity),
            reason,
            remarks,
            adjustmentDate,
          }).then((response) => {
            return response.data;
          }).catch(() => {
            throw new Error(`Failed to save ${ledger.item.name}`);
          });
        })
      );

      resetRows();
      await reloadData();

      onSuccess("Stock adjustments saved successfully.");
    } catch (err) {
      console.error(err);
      onError("Stock adjustment save failed. Check backend API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ mt: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Daily Stock Count / Adjustment
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          All items are shown here. Enter quantity only for changed items. Empty
          rows will not be saved.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="Adjustment Date"
              type="date"
              value={adjustmentDate}
              onChange={(e) => setAdjustmentDate(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: Daily manager stock count"
            />

            <TextField
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks"
              sx={{
                gridColumn: {
                  xs: "span 1",
                  md: "span 2",
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 2,
            }}
          >
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save Adjustments"}
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f3f4f6",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Current Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Adjustment Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Change</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>New Qty</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {stockLedgers.map((ledger) => {
                  const row = rows[ledger.item.id] || createDefaultRow();
                  const changePreview = getChangePreview(ledger);
                  const newQtyPreview = getNewQtyPreview(ledger);

                  return (
                    <TableRow key={ledger.id}>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 170 }}>
                        {ledger.item.name}
                      </TableCell>

                      <TableCell>{ledger.item.category}</TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {ledger.currentQty}
                      </TableCell>

                      <TableCell sx={{ minWidth: 210 }}>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={row.adjustmentType}
                          onChange={(e) =>
                            updateRow(
                              ledger.item.id,
                              "adjustmentType",
                              e.target.value
                            )
                          }
                        >
                          {adjustmentTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>

                      <TableCell sx={{ minWidth: 130 }}>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(
                              ledger.item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder={
                            row.adjustmentType === "Opening Stock" ||
                            row.adjustmentType === "Stock Count Correction"
                              ? "Actual"
                              : "Reduce"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            changePreview > 0
                              ? `+${changePreview}`
                              : changePreview
                          }
                          color={
                            changePreview < 0
                              ? "error"
                              : changePreview > 0
                              ? "success"
                              : "default"
                          }
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {newQtyPreview}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {stockLedgers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No stock items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography color="text.secondary" sx={{ mt: 2 }}>
            For first time stock, choose <strong>Opening Stock</strong>. For
            daily manager checking, choose{" "}
            <strong>Daily Sales Reduction</strong> or{" "}
            <strong>Stock Count Correction</strong>.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Form;