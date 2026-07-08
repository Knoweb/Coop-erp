import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import api from "../../api/axiosConfig";

type ItemProduct = {
  id?: string;
  itemId?: string;
  name: string;
  category: string;
  defaultReorderLevel?: number;
  shopReorderLevel?: number;
  unitPrice: number;
  isActive?: boolean;
  isGlobalActive?: boolean;
  isSelected?: boolean;
  shopItemId?: string;
};

// 1. Updated categories with "Other"
const CATEGORY_OPTIONS = [
  "Milk",
  "Yoghurt",
  "Curd",
  "Butter",
  "Cheese",
  "Ice Cream",
  "Other",
];

const formatMoney = (value: number | string | undefined) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function ItemPage() {
  const [items, setItems] = useState<ItemProduct[]>([]);
  const userRole = localStorage.getItem("user_role");
  const isAdmin = userRole === "ADMIN" || userRole === "ROLE_SUPER_ADMIN" || userRole === "ROLE_ADMIN";

  // States for Create Form
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Milk");
  const [customCategory, setCustomCategory] = useState(""); // State for custom category
  const [reorderLevel, setReorderLevel] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // States for Edit Form
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState("");
  const [editName, setEditName] = useState("");
  const [editSelectedCategory, setEditSelectedCategory] = useState("Milk");
  const [editCustomCategory, setEditCustomCategory] = useState(""); // Custom category for edit
  const [editReorderLevel, setEditReorderLevel] = useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);

      const url = isAdmin ? `/shop/items` : `/shop/shop-items`;
      const response = await api.get(url);
      const data: ItemProduct[] = response.data;

      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setItems(sortedData);
    } catch (err) {
      console.error(err);
      setError("Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // --- Create Item Logic ---
  const handleCreateItem = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Determine the final category
    const finalCategory = selectedCategory === "Other" ? customCategory : selectedCategory;

    if (!name || !finalCategory.trim() || !reorderLevel || !unitPrice) {
      setError("Please fill all item details, including category.");
      return;
    }

    try {
      await api.post(`/shop/items`, {
        name,
        category: finalCategory,
        defaultReorderLevel: Number(reorderLevel),
        unitPrice: Number(unitPrice),
      });

      // Reset form
      setName("");
      setSelectedCategory("Milk");
      setCustomCategory("");
      setReorderLevel("");
      setUnitPrice("");

      await loadItems();

      setMessage("Item created successfully.");
    } catch (err) {
      console.error(err);
      setError("Item create failed. Check backend API.");
    }
  };

  // --- Edit Item Logic ---
  const openEditDialog = (item: ItemProduct) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    
    // Check if the item's category is in our standard list
    const isStandardCategory = CATEGORY_OPTIONS.includes(item.category) && item.category !== "Other";
    
    if (isStandardCategory) {
      setEditSelectedCategory(item.category);
      setEditCustomCategory("");
    } else {
      setEditSelectedCategory("Other");
      setEditCustomCategory(item.category);
    }

    const reorderVal = isAdmin ? item.defaultReorderLevel : item.shopReorderLevel;
    setEditReorderLevel(String(reorderVal || 0));
    setEditUnitPrice(String(item.unitPrice));
    setEditDialogOpen(true);
  };

  const handleToggleShopItem = async (item: ItemProduct) => {
    try {
      if (item.isSelected && item.shopItemId) {
        await api.delete(`/shop/shop-items/${item.shopItemId}`);
        setMessage("Item removed from your shop.");
      } else {
        await api.post(`/shop/shop-items`, { itemId: item.itemId });
        setMessage("Item added to your shop.");
      }
      await loadItems();
    } catch (err) {
      console.error(err);
      setError("Failed to update shop item selection.");
    }
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItemId("");
    setEditName("");
    setEditSelectedCategory("Milk");
    setEditCustomCategory("");
    setEditReorderLevel("");
    setEditUnitPrice("");
  };

  const handleUpdateItem = async () => {
    const finalEditCategory = editSelectedCategory === "Other" ? editCustomCategory : editSelectedCategory;

    if (isAdmin) {
      if (!editingItemId || !editName || !finalEditCategory.trim() || !editReorderLevel || !editUnitPrice) {
        setError("Please fill all item details.");
        return;
      }
    } else {
      if (!editingItemId || editReorderLevel === "" || Number(editReorderLevel) < 0) {
        setError("Reorder level must be a positive number or zero.");
        return;
      }
    }

    try {
      if (isAdmin) {
        await api.put(`/shop/items/${editingItemId}`, {
          name: editName,
          category: finalEditCategory,
          defaultReorderLevel: Number(editReorderLevel),
          unitPrice: Number(editUnitPrice),
        });
      } else {
        // Shop user only updates reorder level
        const item = items.find(i => i.shopItemId === editingItemId);
        if (item) {
          await api.put(`/shop/shop-items/${item.shopItemId}/reorder-level`, {
            reorderLevel: Number(editReorderLevel),
          });
        }
      }

      closeEditDialog();
      await loadItems();

      setMessage("Item updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Item update failed. Check backend API.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Item / Product Management
      </Typography>

      <Typography color="text.secondary">
        {isAdmin 
          ? "Add, view, and update global grocery shop items." 
          : "View global items and select which ones are available in your shop."}
      </Typography>

      {/* --- ADD NEW ITEM CARD (ADMIN ONLY) --- */}
      {isAdmin && (
      <Card
        sx={{
          mt: 3,
          maxWidth: 900,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Add New Item
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Create products before entering GRN or daily sales records.
          </Typography>

          <Box component="form" onSubmit={handleCreateItem}>
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
                label="Item Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Fresh Milk 1L"
              />

              {/* Dynamic Category Dropdown */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value !== "Other") {
                      setCustomCategory("");
                    }
                  }}
                >
                  {CATEGORY_OPTIONS.map((itemCategory) => (
                    <MenuItem key={itemCategory} value={itemCategory}>
                      {itemCategory}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Show custom category text field only if "Other" is selected */}
                {selectedCategory === "Other" && (
                  <TextField
                    label="Enter New Category"
                    fullWidth
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Example: Dairy Drink"
                  />
                )}
              </Box>

              <TextField
                label="Unit Price"
                type="number"
                fullWidth
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="Example: 450"
              />

              <TextField
                label="Reorder Level"
                type="number"
                fullWidth
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="Example: 10"
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
                  Add Item
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
      )}

      {/* --- ITEM LIST PAPER --- */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Item List
        </Typography>

        {loading ? (
          <Typography>Loading items...</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Unit Price</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Reorder Level</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: "bold", color: "#111827" }}>
                      {item.name}
                    </TableCell>
                    
                    <TableCell>{item.category}</TableCell>
                    
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Rs. {formatMoney(item.unitPrice)}
                    </TableCell>
                    
                    <TableCell>{isAdmin ? item.defaultReorderLevel : item.shopReorderLevel}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Chip
                          label={item.isActive === false ? "INACTIVE" : "ACTIVE"}
                          color={item.isActive === false ? "default" : "success"}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      ) : (
                        <Chip
                          label={item.isSelected ? "SELECTED" : "NOT SELECTED"}
                          color={item.isSelected ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                      {isAdmin ? (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openEditDialog(item)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant={item.isSelected ? "outlined" : "contained"}
                            color={item.isSelected ? "error" : "primary"}
                            size="small"
                            onClick={() => handleToggleShopItem(item)}
                          >
                            {item.isSelected ? "Remove" : "Select"}
                          </Button>
                          {item.isSelected && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setEditingItemId(item.shopItemId || "");
                                setEditReorderLevel(String(item.shopReorderLevel));
                                setEditDialogOpen(true);
                              }}
                            >
                              Edit Reorder Lvl
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* --- EDIT DIALOG --- */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Item</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            {isAdmin ? (
              <>
                <TextField
                  label="Item Name"
                  fullWidth
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    select
                    label="Category"
                    fullWidth
                    value={editSelectedCategory}
                    onChange={(e) => {
                      setEditSelectedCategory(e.target.value);
                      if (e.target.value !== "Other") {
                        setEditCustomCategory("");
                      }
                    }}
                  >
                    {CATEGORY_OPTIONS.map((itemCategory) => (
                      <MenuItem key={itemCategory} value={itemCategory}>
                        {itemCategory}
                      </MenuItem>
                    ))}
                  </TextField>

                  {editSelectedCategory === "Other" && (
                    <TextField
                      label="Enter Custom Category"
                      fullWidth
                      value={editCustomCategory}
                      onChange={(e) => setEditCustomCategory(e.target.value)}
                    />
                  )}
                </Box>

                <TextField
                  label="Unit Price"
                  type="number"
                  fullWidth
                  value={editUnitPrice}
                  onChange={(e) => setEditUnitPrice(e.target.value)}
                />
              </>
            ) : (
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                Update the reorder level for your shop.
              </Typography>
            )}

            <TextField
              label="Reorder Level"
              type="number"
              fullWidth
              value={editReorderLevel}
              onChange={(e) => setEditReorderLevel(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateItem}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- SNACKBARS --- */}
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

export default ItemPage;