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
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../api/axiosConfig";
import { getAdminSuppliers } from "../../services/adminSupplierService";
import { getAdminItems } from "../../services/adminItemService";

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

function AdminPurchasesPage() {
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
    const response = await getAdminSuppliers();
    const data: Supplier[] = response.data;
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    setSuppliers(sortedData);
  };

  const loadItems = async () => {
    const response = await getAdminItems();
    const data: ItemProduct[] = response.data;
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    setItems(sortedData);
  };

  const loadGrns = async () => {
    const response = await api.get(`/admin/purchases`);
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
      setError("Failed to load GRN data. Check API.");
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
      await api.post(`/admin/purchases`, {
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
      setMessage("Purchase saved successfully. Main shop stock updated.");
    } catch (err) {
      console.error(err);
      setError("Purchase save failed. Check backend API and selected data.");
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
      <Typography variant="h4" className="page-title" sx={{ fontWeight: "bold" }} gutterBottom>
        Purchases / GRN
      </Typography>

      <Typography color="text.secondary">
        Record and review goods received into the main shop inventory.
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
            Create Purchase / GRN
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Select supplier, enter purchase details, and add received items.
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
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => `${option.name}${option.contactNumber ? ` - ${option.contactNumber}` : ''}`}
                value={suppliers.find((s) => s.id === supplierId) || null}
                onChange={(_, newValue) => setSupplierId(newValue?.id || "")}
                noOptionsText="No matching supplier found"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Supplier"
                    placeholder="Search supplier..."
                    fullWidth
                  />
                )}
              />

              <TextField
                label="GRN/Purchase Number"
                fullWidth
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Example: GRN-1001"
              />

              <TextField
                label="Purchase Date"
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
                label="Notes"
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
              <Typography variant="h6" className="card-title" sx={{ fontWeight: "bold" }}>
                Received Items
              </Typography>

              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddLineItem}
              >
                Add Item
              </Button>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Cost</TableCell>
                    <TableCell>Line Total</TableCell>
                    <TableCell>Remove</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {lineItems.map((lineItem, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Autocomplete
                          options={items}
                          getOptionLabel={(option) => `${option.name} - ${option.category}`}
                          value={items.find((i) => i.id === lineItem.itemId) || null}
                          onChange={(_, newValue) =>
                            handleLineItemChange(index, "itemId", newValue?.id || "")
                          }
                          size="small"
                          noOptionsText="No matching product found"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Search product..."
                              fullWidth
                            />
                          )}
                        />
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
                Total Amount: Rs. {formatMoney(calculateGrandTotal())}
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
                Record Purchase
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
            Purchase History - {selectedMonthName}
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
          <Typography>Loading Purchase records...</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "var(--table-header-bg)", borderBottom: "2px solid var(--border-color)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>GRN Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>Items Count</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>Total Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>View Details</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedMonthGrns.map((grn) => {
                  const itemsCount = grn.items.length;
                  const totalQty = grn.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <TableRow key={grn.id}>
                      <TableCell>{grn.invoiceNumber || "-"}</TableCell>
                      <TableCell>{grn.invoiceDate}</TableCell>

                      <TableCell sx={{ fontWeight: "bold", color: "var(--text-color)" }}>
                        {grn.supplierName}
                      </TableCell>

                      <TableCell>{itemsCount}</TableCell>
                      <TableCell>{totalQty}</TableCell>

                      <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        Rs. {formatMoney(grn.totalAmount)}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelectedGrn(grn)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {selectedMonthGrns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No Purchase records found for {selectedMonthName}
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
        <DialogTitle sx={{ fontWeight: "bold" }}>Purchase Details</DialogTitle>

        <DialogContent>
          {selectedGrn && (
            <Box sx={{ mt: 1 }}>
              <Typography>
                <strong>GRN Number:</strong> {selectedGrn.invoiceNumber || "-"}
              </Typography>
              <Typography>
                <strong>Supplier:</strong> {selectedGrn.supplierName}
              </Typography>

              <Typography>
                <strong>Date:</strong> {selectedGrn.invoiceDate}
              </Typography>

              <Typography>
                <strong>Notes:</strong> {selectedGrn.remarks || "-"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Cost</TableCell>
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
                <Typography variant="h6" className="card-title" sx={{ fontWeight: "bold" }}>
                  Total Amount: Rs. {formatMoney(selectedGrn.totalAmount)}
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

export default AdminPurchasesPage;
