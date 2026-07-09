import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../api/axiosConfig";
import { getAdminStock } from "../../services/adminStockService";
import { getShopStock } from "../../services/shopStockService";

type SaleItemRequest = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
};

type SaleRequest = {
  saleType: "CUSTOMER" | "SHOP";
  targetShopId?: string;
  items: SaleItemRequest[];
};

type SaleResponse = {
  id: string;
  saleNumber: string;
  saleType: string;
  targetShopName?: string;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  notes?: string;
  saleDate: string;
  createdBy: string;
  items: any[];
};

type Shop = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  unitPrice: number;
  currentQty: number; // For Admin stock or Shop stock depending on who is logged in
};

const formatMoney = (value: number | string | undefined) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function SalesPage() {
  const role = localStorage.getItem("user_role");
  const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN";

  const [salesList, setSalesList] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [saleType, setSaleType] = useState<"CUSTOMER" | "SHOP">("CUSTOMER");
  const [targetShopId, setTargetShopId] = useState("");

  const [lineItems, setLineItems] = useState<any[]>([
    { productId: "", quantity: "", unitPrice: "", discountPercentage: "" }
  ]);

  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? "/admin/sales" : "/shop/sales";
      const res = await api.get(url);

      const sortedSales = res.data.sort((a: any, b: any) =>
        new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
      );
      setSalesList(sortedSales);

      if (isAdmin) {
        const shopsRes = await api.get("/admin/shops");
        setShops(shopsRes.data);
      }

      // To get available products with stock:
      const stockRes = isAdmin ? await getAdminStock() : await getShopStock();

      const availableProducts = stockRes.data
        .map((ledger: any) => ({
          id: ledger.itemId || ledger.item?.id || ledger.product?.id || ledger.id,
          name: ledger.productName || ledger.itemName || ledger.name || ledger.item?.name || "-",
          unitPrice: ledger.sellingPrice ?? ledger.unitPrice ?? ledger.item?.unitPrice ?? 0,
          currentQty: ledger.currentQty ?? ledger.currentQuantity ?? 0
        }))
        .filter((prod: any) => prod.id);

      setProducts(availableProducts);

    } catch (err) {
      console.error(err);
      setError("Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSaleType: "CUSTOMER" | "SHOP",
  ) => {
    if (newSaleType !== null) {
      setSaleType(newSaleType);
      if (newSaleType === "CUSTOMER") {
        setTargetShopId("");
      }
    }
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { productId: "", quantity: "", unitPrice: "", discountPercentage: "" }
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length === 0) {
        return [{ productId: "", quantity: "", unitPrice: "", discountPercentage: "" }];
      }
      return filtered;
    });
  };

  const handleLineItemChange = (index: number, field: string, value: string) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "productId") {
        const prod = products.find(p => p.id === value);
        if (prod) {
          updated[index].unitPrice = String(prod.unitPrice);
        }
        if (value && index === prev.length - 1) {
          updated.push({ productId: "", quantity: "", unitPrice: "", discountPercentage: "" });
        }
      }
      return updated;
    });

    if (field === "productId" && value) {
      setTimeout(() => {
        const qtyInput = document.getElementById(`quantity-${index}`);
        if (qtyInput) qtyInput.focus();
      }, 50);
    }
  };

  const calculateLineSubtotal = (item: any) => {
    return Number(item.quantity || 0) * Number(item.unitPrice || 0);
  };

  const calculateLineDiscount = (item: any) => {
    const sub = calculateLineSubtotal(item);
    return sub * (Number(item.discountPercentage || 0) / 100);
  };

  const calculateLineTotal = (item: any) => {
    return calculateLineSubtotal(item) - calculateLineDiscount(item);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + calculateLineSubtotal(item), 0);
  };

  const calculateTotalDiscount = () => {
    return lineItems.reduce((acc, item) => acc + calculateLineDiscount(item), 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount();
  };

  const resetForm = () => {
    setSaleType("CUSTOMER");
    setTargetShopId("");
    setLineItems([{ productId: "", quantity: "", unitPrice: "", discountPercentage: "" }]);
  };

  const getValidItemsForSubmission = () => {
    return lineItems.filter(item => item.productId && Number(item.quantity) > 0);
  };

  const isFormValid = () => {
    if (isAdmin && saleType === "SHOP" && !targetShopId) {
      return false;
    }
    const fullyValidItems = getValidItemsForSubmission();
    if (fullyValidItems.length === 0) return false;

    const partiallyFilledItems = lineItems.filter(item => item.productId || item.quantity || item.unitPrice || item.discountPercentage);

    for (const item of partiallyFilledItems) {
      if (!item.productId || Number(item.quantity) <= 0 || Number(item.unitPrice) < 0) {
        return false;
      }
      const prod = products.find(p => p.id === item.productId);
      if (prod && Number(item.quantity) > prod.currentQty) {
        return false;
      }
    }
    return true;
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please check your inputs (missing shop, missing product, or quantity exceeds stock).");
      return;
    }

    setSubmitting(true);
    const payload: SaleRequest = {
      saleType: isAdmin ? saleType : "CUSTOMER",
      targetShopId: isAdmin && saleType === "SHOP" ? targetShopId : undefined,
      items: getValidItemsForSubmission().map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountPercentage: Number(item.discountPercentage || 0)
      }))
    };

    try {
      const url = isAdmin ? "/admin/sales" : "/shop/sales";
      await api.post(url, payload);
      setMessage("Sale recorded successfully.");
      resetForm();
      loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to record sale. Check stock levels.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto", boxSizing: "border-box", overflowX: "hidden" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" className="page-title" sx={{ fontWeight: "bold" }} gutterBottom>
          Create Sale Order
        </Typography>
        <Typography color="text.secondary">
          Create and issue a new sale from {isAdmin ? "main shop" : "shop"} inventory.
        </Typography>
      </Box>

      {isAdmin && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 3,
            display: "inline-flex",
            borderRadius: 2,
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--card-bg)"
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={saleType}
            exclusive
            onChange={handleSaleTypeChange}
            aria-label="Sale Type"
            size="small"
          >
            <ToggleButton value="CUSTOMER" sx={{ px: 3, fontWeight: "bold", border: 'none', borderRadius: 1 }}>
              Customer Sale
            </ToggleButton>
            <ToggleButton value="SHOP" sx={{ px: 3, fontWeight: "bold", border: 'none', borderRadius: 1 }}>
              Shop Sale
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      )}

      <Box component="form" onSubmit={handleRecordSale}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          width: '100%'
        }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" className="card-title" sx={{ fontWeight: "bold", mb: 3 }}>
                  {saleType === "CUSTOMER" ? "Customer Sale Information" : "Shop Sale Information"}
                </Typography>

                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  {isAdmin && saleType === "SHOP" && (
                    <Box>
                      <Autocomplete
                        options={shops}
                        getOptionLabel={(option) => option.name}
                        value={shops.find(s => s.id === targetShopId) || null}
                        onChange={(_, newValue) => setTargetShopId(newValue ? newValue.id : "")}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search and select target shop"
                            fullWidth
                            required
                          />
                        )}
                        noOptionsText="No shops found"
                      />
                      {targetShopId && (
                        <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                          Goods will be transferred from Main Shop inventory to {shops.find(s => s.id === targetShopId)?.name}.
                        </Typography>
                      )}
                    </Box>
                  )}
                  <TextField
                    label="Sale Date"
                    type="date"
                    fullWidth
                    value={new Date().toISOString().split("T")[0]}
                    disabled
                  />
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
                  <Typography variant="h6" className="card-title" sx={{ fontWeight: "bold" }}>Items</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLineItem} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    Add Item
                  </Button>
                </Box>

                <Box sx={{
                  display: { xs: 'none', lg: 'grid' },
                  gridTemplateColumns: 'minmax(250px, 2.5fr) 1fr 1fr 1fr 1fr 1.5fr auto',
                  gap: 2,
                  mb: 2,
                  px: 1,
                  alignItems: 'center'
                }}>
                  <Typography sx={{ fontWeight: 'bold' }}>Product / Item</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Available Stock</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Quantity</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Unit Price</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Discount %</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Amount</Typography>
                  <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>Action</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, lg: 1 } }}>
                  {lineItems.map((item, index) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <Box key={index} sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'minmax(250px, 2.5fr) 1fr 1fr 1fr 1fr 1.5fr auto' },
                        gap: 2,
                        alignItems: { xs: 'flex-start', lg: 'center' },
                        p: { xs: 2, lg: 1 },
                        border: { xs: '1px solid #e5e7eb', lg: 'none' },
                        borderRadius: 2,
                        bgcolor: { xs: '#f9fafb', lg: 'transparent' },
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, gridColumn: { xs: '1 / -1', sm: '1 / -1', lg: 'auto' } }}>
                          <Typography sx={{ display: { xs: 'block', lg: 'none' }, fontWeight: 'bold', fontSize: '0.875rem' }}>Product / Item</Typography>
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => `${option.name} | Stock: ${option.currentQty} | Rs. ${option.unitPrice}`}
                            value={prod || null}
                            onChange={(_, newValue) => {
                              handleLineItemChange(index, "productId", newValue ? newValue.id : "");
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Search product by name or code"
                                size="small"
                                required={!!item.quantity || !!item.unitPrice}
                                fullWidth
                              />
                            )}
                            noOptionsText="No products found"
                            sx={{ width: '100%' }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, justifyContent: { xs: 'space-between', lg: 'center' }, alignItems: { xs: 'center', lg: 'flex-start' } }}>
                          <Typography sx={{ display: { xs: 'block', lg: 'none' }, fontWeight: 'bold', fontSize: '0.875rem' }}>Available Stock</Typography>
                          {prod ? (
                            <Chip
                              label={prod.currentQty}
                              color={prod.currentQty > 10 ? "success" : "error"}
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          ) : <Typography color="text.secondary">-</Typography>}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography sx={{ display: { xs: 'block', lg: 'none' }, fontWeight: 'bold', fontSize: '0.875rem' }}>Quantity</Typography>
                          <TextField
                            id={`quantity-${index}`}
                            type="number"
                            fullWidth
                            size="small"
                            value={item.quantity === 0 ? "" : item.quantity ?? ""}
                            onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                            slotProps={{ htmlInput: { min: 1 } }}
                            required={!!item.productId}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography sx={{ display: { xs: 'block', lg: 'none' }, fontWeight: 'bold', fontSize: '0.875rem' }}>Unit Price</Typography>
                          <TextField
                            type="number"
                            fullWidth
                            size="small"
                            value={item.unitPrice === 0 ? "" : item.unitPrice ?? ""}
                            onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                            required={!!item.productId}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography sx={{ display: { xs: 'block', lg: 'none' }, fontWeight: 'bold', fontSize: '0.875rem' }}>Discount %</Typography>
                          <TextField
                            type="number"
                            fullWidth
                            size="small"
                            value={item.discountPercentage === 0 ? "" : item.discountPercentage ?? ""}
                            onChange={(e) => handleLineItemChange(index, "discountPercentage", e.target.value)}
                            slotProps={{ htmlInput: { min: 0, max: 100 } }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, justifyContent: { xs: 'space-between', lg: 'center' }, alignItems: { xs: 'center', lg: 'flex-start' }, wordBreak: "break-word" }}>
                          <Typography sx={{ display: { xs: 'block', lg: 'none' }, fontWeight: 'bold', fontSize: '0.875rem' }}>Amount</Typography>
                          <Typography sx={{ fontWeight: 'bold', lineHeight: 1.3, color: "var(--text-color)" }}>
                            Rs. {formatMoney(calculateLineTotal(item))}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', lg: 'center' }, mt: { xs: 2, lg: 0 }, gridColumn: { xs: '1 / -1', sm: '1 / -1', lg: 'auto' } }}>
                          <Button 
                            color="error" 
                            onClick={() => handleRemoveLineItem(index)}
                            variant="outlined"
                            sx={{ display: { xs: 'flex', lg: 'none' }, width: '100%' }}
                            startIcon={<DeleteIcon />}
                          >
                            Remove Item
                          </Button>
                          <IconButton color="error" onClick={() => handleRemoveLineItem(index)} size="small" sx={{ display: { xs: 'none', lg: 'flex' } }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                      </Box>
                    );
                  })}
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ mt: 4, ml: "auto", width: { xs: "100%", md: 360 }, textAlign: "right" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 2 }}>
                    <Typography color="text.secondary">Subtotal:</Typography>
                    <Typography sx={{ fontWeight: "bold", wordBreak: "break-word" }}>Rs. {formatMoney(calculateSubtotal())}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 2 }}>
                    <Typography color="text.secondary">Discount:</Typography>
                    <Typography color="error" sx={{ fontWeight: "bold", wordBreak: "break-word" }}>- Rs. {formatMoney(calculateTotalDiscount())}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2, alignItems: "center" }}>
                    <Typography sx={{ fontWeight: "bold" }}>Total Amount:</Typography>
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#e11d1d", wordBreak: "break-word", overflowWrap: "anywhere", textAlign: "right" }}>
                      Rs. {formatMoney(calculateGrandTotal())}
                    </Typography>
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={!isFormValid() || submitting}
                    sx={{ 
                      py: 1.5, 
                      fontWeight: "bold", 
                      fontSize: "1.1rem", 
                      mt: 2,
                      backgroundColor: "#e11d1d",
                      "&:hover": { backgroundColor: "#b91c1c" }
                    }}
                  >
                    {submitting ? "RECORDING..." : (saleType === "CUSTOMER" ? "RECORD CUSTOMER SALE" : "RECORD SHOP SALE")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
        </Box>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>Sales History</Typography>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "var(--table-header-bg)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Sale Number</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Target Shop</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Created By</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesList.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.saleNumber}</TableCell>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={sale.saleType === "CUSTOMER" ? "Customer Sale" : "Shop Sale"}
                          color={sale.saleType === "SHOP" ? "secondary" : "primary"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{sale.targetShopName || "-"}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Rs. {formatMoney(sale.totalAmount)}</TableCell>
                      <TableCell>{sale.createdBy}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => setSelectedSale(sale)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {salesList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No sales found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={!!selectedSale} onClose={() => setSelectedSale(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Sale Details - {selectedSale?.saleNumber}</DialogTitle>
        <DialogContent dividers>
          {selectedSale && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Sale Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {selectedSale.saleType === "CUSTOMER" ? "Customer Sale" : "Shop Sale"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {new Date(selectedSale.saleDate).toLocaleString()}
                  </Typography>
                </Box>
                {selectedSale.saleType === "SHOP" && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Target Shop</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>{selectedSale.targetShopName}</Typography>
                  </Box>
                )}
              </Box>

              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--table-header-bg)" }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSale.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs. {formatMoney(item.unitPrice)}</TableCell>
                      <TableCell>
                        {item.discountPercentage > 0 ? (
                          <>
                            {item.discountPercentage}% <br />
                            <Typography variant="caption" color="error">(-Rs. {formatMoney(item.discountAmount)})</Typography>
                          </>
                        ) : "-"}
                      </TableCell>
                      <TableCell>Rs. {formatMoney(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                <Typography>Subtotal: Rs. {formatMoney(selectedSale.subtotal)}</Typography>
                <Typography color="error">Total Discount: -Rs. {formatMoney(selectedSale.totalDiscount)}</Typography>
                <Typography variant="h6" className="card-title" sx={{ fontWeight: "bold" }}>Total: Rs. {formatMoney(selectedSale.totalAmount)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSale(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage("")}>
        <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}

export default SalesPage;
