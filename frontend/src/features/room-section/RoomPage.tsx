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

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  basePrice: number;
  extraHourRate: number;
  status: string;
};

type BillingSetting = {
  id: number;
  vatRate: number;
  ssclRate: number;
};

const formatMoney = (value: number | string | undefined) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function RoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const [vatRate, setVatRate] = useState("18");
  const [ssclRate, setSsclRate] = useState("2.5");

  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("AC");
  const [basePrice, setBasePrice] = useState("");
  const [extraHourRate, setExtraHourRate] = useState("");
  const [status, setStatus] = useState("AVAILABLE");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState("");
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editRoomType, setEditRoomType] = useState("AC");
  const [editBasePrice, setEditBasePrice] = useState("");
  const [editExtraHourRate, setEditExtraHourRate] = useState("");
  const [editStatus, setEditStatus] = useState("AVAILABLE");

  const [loading, setLoading] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRooms = async () => {
    const response = await fetch(API_BASE_URLS.roomSection);

    if (!response.ok) {
      throw new Error("Failed to load rooms");
    }

    const data: Room[] = await response.json();

    const sortedRooms = data.sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
      })
    );

    setRooms(sortedRooms);
  };

  const loadBillingSettings = async () => {
    const response = await fetch(`${API_BASE_URLS.roomSection}/billing-settings`);

    if (!response.ok) {
      throw new Error("Failed to load billing settings");
    }

    const data: BillingSetting = await response.json();

    setVatRate(String(data.vatRate));
    setSsclRate(String(data.ssclRate));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRooms(), loadBillingSettings()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load room data. Check room-section-service on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBillingSettings = async () => {
    if (Number(vatRate) < 0 || Number(ssclRate) < 0) {
      setError("VAT and SSCL rates cannot be negative.");
      return;
    }

    try {
      setSavingBilling(true);

      const response = await fetch(`${API_BASE_URLS.roomSection}/billing-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vatRate: Number(vatRate || 0),
          ssclRate: Number(ssclRate || 0),
        }),
      });

      if (!response.ok) {
        throw new Error("Billing settings update failed");
      }

      await loadBillingSettings();
      setMessage("Billing settings updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Billing settings update failed.");
    } finally {
      setSavingBilling(false);
    }
  };

  const handleCreateRoom = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!roomNumber || !basePrice) {
      setError("Please enter room number and base price.");
      return;
    }

    if (Number(basePrice) <= 0) {
      setError("Base price must be greater than 0.");
      return;
    }

    if (Number(extraHourRate || 0) < 0) {
      setError("Extra hour rate cannot be negative.");
      return;
    }

    if (rooms.length >= 10) {
      setError("Cannot add more than 10 rooms.");
      return;
    }

    try {
      const response = await fetch(API_BASE_URLS.roomSection, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber,
          roomType,
          basePrice: Number(basePrice),
          extraHourRate: Number(extraHourRate || 0),
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Room create failed");
      }

      setRoomNumber("");
      setRoomType("AC");
      setBasePrice("");
      setExtraHourRate("");
      setStatus("AVAILABLE");

      await loadRooms();
      setMessage("Room created successfully.");
    } catch (err) {
      console.error(err);
      setError("Room create failed. Maybe room number already exists.");
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoomId(room.id);
    setEditRoomNumber(room.roomNumber);
    setEditRoomType(room.roomType);
    setEditBasePrice(String(room.basePrice));
    setEditExtraHourRate(String(room.extraHourRate || 0));
    setEditStatus(room.status);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingRoomId("");
    setEditRoomNumber("");
    setEditRoomType("AC");
    setEditBasePrice("");
    setEditExtraHourRate("");
    setEditStatus("AVAILABLE");
  };

  const handleUpdateRoom = async () => {
    if (!editingRoomId || !editRoomNumber || !editBasePrice) {
      setError("Please fill all room details.");
      return;
    }

    if (Number(editBasePrice) <= 0) {
      setError("Base price must be greater than 0.");
      return;
    }

    if (Number(editExtraHourRate || 0) < 0) {
      setError("Extra hour rate cannot be negative.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URLS.roomSection}/${editingRoomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: editRoomNumber,
          roomType: editRoomType,
          basePrice: Number(editBasePrice),
          extraHourRate: Number(editExtraHourRate || 0),
          status: editStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Room update failed");
      }

      closeEditDialog();
      await loadRooms();
      setMessage("Room details updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Room update failed. Maybe room number already exists.");
    }
  };

  const getStatusColor = (roomStatus: string): ChipColor => {
    if (roomStatus === "AVAILABLE") return "success";
    if (roomStatus === "OCCUPIED") return "error";
    if (roomStatus === "MAINTENANCE") return "warning";

    return "default";
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
        Room Management
      </Typography>

      <Typography color="text.secondary">
        Add rooms, edit room details, update billing settings, and manage room
        status.
      </Typography>

      <Card
        sx={{
          mt: 3,
          maxWidth: 950,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Billing Settings
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            VAT and SSCL rates are common for all rooms. These rates will be used
            for new bookings.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="VAT Rate %"
              type="number"
              fullWidth
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              placeholder="Example: 18"
            />

            <TextField
              label="SSCL Rate %"
              type="number"
              fullWidth
              value={ssclRate}
              onChange={(e) => setSsclRate(e.target.value)}
              placeholder="Example: 2.5"
            />

            <Button
              variant="contained"
              onClick={handleUpdateBillingSettings}
              disabled={savingBilling}
              sx={{
                height: "56px",
                backgroundColor: "#7f1d1d",
                color: "white",
                "&:hover": {
                  backgroundColor: "#991b1b",
                },
              }}
            >
              {savingBilling ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mt: 3,
          maxWidth: 950,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}gutterBottom>
            Add New Room
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Enter room details and save the room into the Room Section module.
            Maximum 10 rooms can be added.
          </Typography>

          <Box component="form" onSubmit={handleCreateRoom}>
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
                label="Room Number"
                fullWidth
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Example: 101"
              />

              <TextField
                select
                label="Room Type"
                fullWidth
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <MenuItem value="AC">AC</MenuItem>
                <MenuItem value="NON_AC">NON AC</MenuItem>
              </TextField>

              <TextField
                label="Base Price"
                type="number"
                fullWidth
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="Example: 9000"
              />

              <TextField
                label="Extra Hour Rate"
                type="number"
                fullWidth
                value={extraHourRate}
                onChange={(e) => setExtraHourRate(e.target.value)}
                placeholder="Example: 500"
              />

              <TextField
                select
                label="Status"
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
              </TextField>

              <Box
                sx={{
                  gridColumn: {
                    xs: "span 1",
                    md: "span 2",
                  },
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography color="text.secondary">
                  Rooms added: {rooms.length}/10
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={rooms.length >= 10}
                  sx={{
                    backgroundColor: "#f97316",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#ea580c",
                    },
                  }}
                >
                  Add Room
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3, p: 2, width: "100%", overflow: "hidden" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}gutterBottom>
          Room List
        </Typography>

        {loading ? (
          <Typography>Loading rooms...</Typography>
        ) : (
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table stickyHeader sx={{ minWidth: 850 }}>
              <TableHead
              sx={{
                backgroundColor: "#f3f4f6",
                borderBottom: "2px solid #e5e7eb",
              }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Room No</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Base Price</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Extra Hour Rate</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Current Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Edit</TableCell>
              </TableRow>
            </TableHead>

              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell sx={{ fontWeight: "bold" }}>{room.roomNumber}</TableCell>

                    <TableCell>{room.roomType}</TableCell>

                    <TableCell>Rs. {formatMoney(room.basePrice)}</TableCell>

                    <TableCell>
                      Rs. {formatMoney(room.extraHourRate)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={room.status}
                        color={getStatusColor(room.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => openEditDialog(room)}
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#de6f40",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#ea580c",
                          },
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {rooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>No rooms found</TableCell>
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
        <DialogTitle>Edit Room Details</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Room Number"
              fullWidth
              value={editRoomNumber}
              onChange={(e) => setEditRoomNumber(e.target.value)}
            />

            <TextField
              select
              label="Room Type"
              fullWidth
              value={editRoomType}
              onChange={(e) => setEditRoomType(e.target.value)}
            >
              <MenuItem value="AC">AC</MenuItem>
              <MenuItem value="NON_AC">NON AC</MenuItem>
            </TextField>

            <TextField
              label="Base Price"
              type="number"
              fullWidth
              value={editBasePrice}
              onChange={(e) => setEditBasePrice(e.target.value)}
            />

            <TextField
              label="Extra Hour Rate"
              type="number"
              fullWidth
              value={editExtraHourRate}
              onChange={(e) => setEditExtraHourRate(e.target.value)}
            />

            <TextField
              select
              label="Status"
              fullWidth
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
              <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
              <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>

          <Button variant="contained" onClick={handleUpdateRoom}>
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

export default RoomPage;