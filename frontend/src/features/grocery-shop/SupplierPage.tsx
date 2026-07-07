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

type Supplier = {
  id: string;
  name: string;
  contactNumber: string;
  address: string;
};

function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [supplierName, setSupplierName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState("");
  const [editSupplierName, setEditSupplierName] = useState("");
  const [editContactNumber, setEditContactNumber] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/shop/suppliers`);
      const data: Supplier[] = response.data;

      const sortedData = data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setSuppliers(sortedData);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers. Check grocery shop service on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleCreateSupplier = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!supplierName || !contactNumber) {
      setError("Please enter supplier name and contact number.");
      return;
    }

    try {
      await api.post(`/shop/suppliers`, {
        name: supplierName,
        contactNumber,
        address,
      });

      setSupplierName("");
      setContactNumber("");
      setAddress("");

      await loadSuppliers();

      setMessage("Supplier created successfully.");
    } catch (err) {
      console.error(err);
      setError("Supplier create failed. Check backend API.");
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplierId(supplier.id);
    setEditSupplierName(supplier.name);
    setEditContactNumber(supplier.contactNumber);
    setEditAddress(supplier.address || "");
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingSupplierId("");
    setEditSupplierName("");
    setEditContactNumber("");
    setEditAddress("");
  };

  const handleUpdateSupplier = async () => {
    if (!editingSupplierId || !editSupplierName || !editContactNumber) {
      setError("Please fill supplier name and contact number.");
      return;
    }

    try {
      await api.put(`/shop/suppliers/${editingSupplierId}`, {
        name: editSupplierName,
        contactNumber: editContactNumber,
        address: editAddress,
      });

      closeEditDialog();
      await loadSuppliers();

      setMessage("Supplier updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Supplier update failed. Check backend API.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Supplier Management
      </Typography>

      <Typography color="text.secondary">
        Add, view, and update Grocery Shop suppliers.
      </Typography>

      <Card
        sx={{
          mt: 3,
          maxWidth: 850,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Add New Supplier
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Enter supplier details before creating GRN records.
          </Typography>

          <Box component="form" onSubmit={handleCreateSupplier}>
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
                label="Supplier Name"
                fullWidth
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Example: Highland Dairy Products"
              />

              <TextField
                label="Contact Number"
                fullWidth
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Example: 0771234567"
              />

              <TextField
                label="Address"
                fullWidth
                multiline
                minRows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Example: No. 25, Galle Road, Colombo"
                sx={{
                  gridColumn: {
                    xs: "span 1",
                    md: "span 2",
                  },
                }}
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
                  Add Supplier
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}gutterBottom>
          Supplier List
        </Typography>

        {loading ? (
          <Typography>Loading suppliers...</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Supplier Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Contact Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#374151" }}>Edit</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    
                    {/* Supplier Name: Bold and Dark to anchor the row */}
                    <TableCell sx={{ fontWeight: "bold", color: "#111827" }}>
                      {supplier.name}
                    </TableCell>
                    
                    <TableCell>{supplier.contactNumber}</TableCell>
                    <TableCell>{supplier.address || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => openEditDialog(supplier)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Supplier</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Supplier Name"
              fullWidth
              value={editSupplierName}
              onChange={(e) => setEditSupplierName(e.target.value)}
            />

            <TextField
              label="Contact Number"
              fullWidth
              value={editContactNumber}
              onChange={(e) => setEditContactNumber(e.target.value)}
            />

            <TextField
              label="Address"
              fullWidth
              multiline
              minRows={2}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>

          <Button variant="contained" onClick={handleUpdateSupplier}>
            Save Changes
          </Button>
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

export default SupplierPage;