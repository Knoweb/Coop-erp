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
import { API_BASE_URLS } from "../../api/apiConfig";

type ItemProduct = {
  id: string;
  name: string;
  category: string;
  reorderLevel: number;
  unitPrice: number;
  isActive?: boolean;
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

      const response = await fetch(`${API_BASE_URLS.milkShop}/items`);

      if (!response.ok) {
        throw new Error("Failed to load items");
      }

      const data: ItemProduct[] = await response.json();

      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setItems(sortedData);
    } catch (err) {
      console.error(err);
      setError("Failed to load items. Check milk-shop-service on port 8080.");
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
      const response = await fetch(`${API_BASE_URLS.milkShop}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category: finalCategory, // Sending the final category
          reorderLevel: Number(reorderLevel),
          unitPrice: Number(unitPrice),
        }),
      });

      if (!response.ok) {
        throw new Error("Item create failed");
      }

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

    setEditReorderLevel(String(item.reorderLevel));
    setEditUnitPrice(String(item.unitPrice));
    setEditDialogOpen(true);
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

    if (!editingItemId || !editName || !finalEditCategory.trim() || !editReorderLevel || !editUnitPrice) {
      setError("Please fill all item details.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URLS.milkShop}/items/${editingItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            category: finalEditCategory, // Sending the updated category
            reorderLevel: Number(editReorderLevel),
            unitPrice: Number(editUnitPrice),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Item update failed");
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
        Add, view, and update Milk Shop items. Stock quantity will be updated later through GRN and sales.
      </Typography>

      {/* --- ADD NEW ITEM CARD --- */}
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
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Edit</TableCell>
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
                    
                    <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isActive === false ? "INACTIVE" : "ACTIVE"}
                        color={item.isActive === false ? "default" : "success"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => openEditDialog(item)}
                      >
                        Edit
                      </Button>
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