import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../api/axiosConfig";

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
  unitPrice: number;
  isActive?: boolean;
};

type GrnLineItem = {
  itemId: string;
  quantity: string;
  unitPrice: string;
};

type GrnResponseItem = {
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type GrnResponse = {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  remarks: string;
  items: GrnResponseItem[];
};

const formatMoney = (value: number | string | undefined) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// --- New Date Helper Functions for Filtering ---
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

function GrnPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<ItemProduct[]>([]);
  const [grns, setGrns] = useState<GrnResponse[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());
  const [remarks, setRemarks] = useState("");

  const [lineItems, setLineItems] = useState<GrnLineItem[]>([
    {
      itemId: "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const [selectedGrn, setSelectedGrn] = useState<GrnResponse | null>(null);

  // State for month filtering
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSuppliers = async () => {
    const response = await api.get(`/shop/suppliers`);
    const data: Supplier[] = response.data;
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    setSuppliers(sortedData);
  };

  const loadItems = async () => {
    const response = await api.get(`/shop/items`);
    const data: ItemProduct[] = response.data;
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    setItems(sortedData);
  };

  const loadGrns = async () => {
    const response = await api.get(`/shop/grn`);
    const data: GrnResponse[] = response.data;
    
    // Sort GRNs so newest is at the top
    const sortedData = data.sort((a, b) => {
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });

    setGrns(sortedData);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSuppliers(), loadItems(), loadGrns()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load GRN data. Check grocery shop service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleAddLineItem = () => {
    setLineItems((previous) => [
      ...previous,
      {
        itemId: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      setError("At least one item is required.");
      return;
    }
    setLineItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleLineItemChange = (
    index: number,
    field: keyof GrnLineItem,
    value: string
  ) => {
    setLineItems((previous) => {
      const updatedItems = [...previous];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      if (field === "itemId") {
        const selectedItem = items.find((item) => item.id === value);
        if (selectedItem) {
          updatedItems[index].unitPrice = String(selectedItem.unitPrice);
        }
      }

      return updatedItems;
    });
  };

  const calculateLineTotal = (item: GrnLineItem) => {
    return Number(item.quantity || 0) * Number(item.unitPrice || 0);
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((total, item) => {
      return total + calculateLineTotal(item);
    }, 0);
  };

  const resetForm = () => {
    setSupplierId("");
    setInvoiceNumber("");
    setInvoiceDate(getTodayDate());
    setRemarks("");
    setLineItems([
      {
        itemId: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const validateForm = () => {
    if (!supplierId) {
      setError("Please select a supplier.");
      return false;
    }

    if (!invoiceDate) {
      setError("Please select invoice date.");
      return false;
    }

    for (const item of lineItems) {
      if (!item.itemId || !item.quantity || !item.unitPrice) {
        setError("Please fill all item rows.");
        return false;
      }

      if (Number(item.quantity) <= 0) {
        setError("Quantity must be greater than 0.");
        return false;
      }

      if (Number(item.unitPrice) <= 0) {
        setError("Unit price must be greater than 0.");
        return false;
      }
    }

    return true;
  };

  const handleCreateGrn = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await api.post(`/shop/grn`, {
        supplierId,
        invoiceNumber,
        invoiceDate,
        remarks,
        items: lineItems.map((item) => ({
          itemId: item.itemId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });

      resetForm();
      await loadPageData();
      setMessage("GRN saved successfully. Stock updated.");
    } catch (err) {
      console.error(err);
      setError("GRN save failed. Check backend API and selected data.");
    }
  };

  // --- Filtering Logic for GRN History ---
  const selectedMonthPrefix = getMonthPrefix(selectedMonthDate);
  const selectedMonthName = getMonthName(selectedMonthDate);

  const selectedMonthGrns = grns.filter((grn) =>
    grn.invoiceDate?.startsWith(selectedMonthPrefix)
  );

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
        GRN / Purchase Invoice
      </Typography>

      <Typography color="text.secondary">
        Record supplier purchase invoices and automatically increase item stock.
      </Typography>

      <Card
        sx={{
          mt: 3,
          maxWidth: 1050,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Create New GRN
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Select supplier, enter invoice details, and add received items.
          </Typography>

          <Box component="form" onSubmit={handleCreateGrn}>
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
                select
                label="Supplier"
                fullWidth
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Invoice / Delivery Note No"
                fullWidth
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Example: INV-1001"
              />

              <TextField
                label="Invoice Date"
                type="date"
                fullWidth
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                label="Remarks"
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Example: Morning delivery"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Received Items
              </Typography>

              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddLineItem}
              >
                Add Item Row
              </Button>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Line Total</TableCell>
                    <TableCell>Remove</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {lineItems.map((lineItem, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ minWidth: 260 }}>
                        <TextField
                          select
                          fullWidth
                          value={lineItem.itemId}
                          onChange={(e) =>
                            handleLineItemChange(index, "itemId", e.target.value)
                          }
                          size="small"
                        >
                          {items.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name} - {item.category}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>

                      <TableCell sx={{ minWidth: 140 }}>
                        <TextField
                          type="number"
                          fullWidth
                          value={lineItem.quantity}
                          onChange={(e) =>
                            handleLineItemChange(index, "quantity", e.target.value)
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 160 }}>
                        <TextField
                          type="number"
                          fullWidth
                          value={lineItem.unitPrice}
                          onChange={(e) =>
                            handleLineItemChange(index, "unitPrice", e.target.value)
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 150 }}>
                        Rs. {formatMoney(calculateLineTotal(lineItem))}
                      </TableCell>

                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveLineItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Total: Rs. {formatMoney(calculateGrandTotal())}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button type="submit" variant="contained" size="large">
                Save GRN
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 4, p: 2 }}>
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
            GRN History - {selectedMonthName}
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
          <Typography>Loading GRN records...</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Invoice No</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>View</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedMonthGrns.map((grn) => (
                  <TableRow key={grn.id}>
                    <TableCell>{grn.invoiceDate}</TableCell>

                    <TableCell sx={{ fontWeight: "bold", color: "#111827" }}>
                      {grn.supplierName}
                    </TableCell>

                    <TableCell>{grn.invoiceNumber || "-"}</TableCell>

                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Rs. {formatMoney(grn.totalAmount)}
                    </TableCell>

                    <TableCell>{grn.remarks || "-"}</TableCell>
                    
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setSelectedGrn(grn)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {selectedMonthGrns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No GRN records found for {selectedMonthName}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <Dialog
        open={!!selectedGrn}
        onClose={() => setSelectedGrn(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>GRN Details</DialogTitle>

        <DialogContent>
          {selectedGrn && (
            <Box sx={{ mt: 1 }}>
              <Typography>
                <strong>Supplier:</strong> {selectedGrn.supplierName}
              </Typography>

              <Typography>
                <strong>Invoice No:</strong> {selectedGrn.invoiceNumber || "-"}
              </Typography>

              <Typography>
                <strong>Invoice Date:</strong> {selectedGrn.invoiceDate}
              </Typography>

              <Typography>
                <strong>Remarks:</strong> {selectedGrn.remarks || "-"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Line Total</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedGrn.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs. {formatMoney(item.unitPrice)}</TableCell>
                      <TableCell>Rs. {formatMoney(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Total: Rs. {formatMoney(selectedGrn.totalAmount)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedGrn(null)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default GrnPage;