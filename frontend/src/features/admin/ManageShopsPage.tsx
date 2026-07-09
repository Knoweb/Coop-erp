import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, 
    FormControlLabel, Switch, Chip, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Refresh as RefreshIcon, PowerSettingsNew as PowerIcon } from '@mui/icons-material';
import { shopAdminService } from './services/shopAdminService';
import type { Shop } from './services/shopAdminService';

const ManageShopsPage: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Dialog state
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Shop>>({
        code: '',
        name: '',
        address: '',
        contactNumber: '',
        active: true
    });

    const fetchShops = async () => {
        setLoading(true);
        try {
            const data = await shopAdminService.getAllShops();
            setShops(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch shops');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const handleOpen = (shop?: Shop) => {
        if (shop) {
            setEditingId(shop.id);
            setFormData({
                code: shop.code,
                name: shop.name,
                address: shop.address,
                contactNumber: shop.contactNumber,
                active: shop.active
            });
        } else {
            setEditingId(null);
            setFormData({
                code: '',
                name: '',
                address: '',
                contactNumber: '',
                active: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await shopAdminService.updateShop(editingId, formData);
            } else {
                await shopAdminService.createShop(formData);
            }
            handleClose();
            fetchShops();
        } catch (err) {
            console.error(err);
            alert('Failed to save shop. Code might be duplicate.');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await shopAdminService.toggleShopStatus(id);
            fetchShops();
        } catch (err) {
            console.error(err);
            alert('Failed to toggle shop status');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h4" className="page-title" sx={{ fontWeight: 'bold' }}>
                        Manage Shops
                    </Typography>
                    <Typography color="text.secondary">
                        Create and manage grocery shops under the main shop.
                    </Typography>
                </Box>
                <Box>
                    <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />} 
                        onClick={fetchShops}
                        sx={{ mr: 2 }}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpen()}
                        sx={{ backgroundColor: '#FF5A00', '&:hover': { backgroundColor: '#e04e00' } }}
                    >
                        Add New Shop
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell><b>Code</b></TableCell>
                            <TableCell><b>Shop Name</b></TableCell>
                            <TableCell><b>Address</b></TableCell>
                            <TableCell><b>Contact Number</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : shops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No shops found.</TableCell>
                            </TableRow>
                        ) : (
                            shops.map((shop) => (
                                <TableRow key={shop.id}>
                                    <TableCell>{shop.code}</TableCell>
                                    <TableCell>{shop.name}</TableCell>
                                    <TableCell>{shop.address}</TableCell>
                                    <TableCell>{shop.contactNumber}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={shop.active ? 'Active' : 'Inactive'} 
                                            color={shop.active ? 'success' : 'default'} 
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpen(shop)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            color={shop.active ? 'error' : 'success'} 
                                            onClick={() => handleToggleStatus(shop.id)}
                                            title={shop.active ? 'Deactivate' : 'Activate'}
                                        >
                                            <PowerIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingId ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="code"
                        label="Shop Code"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="name"
                        label="Shop Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="address"
                        label="Address"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.address || ''}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="contactNumber"
                        label="Contact Number"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.contactNumber || ''}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={formData.active} 
                                onChange={handleChange} 
                                name="active" 
                                color="primary"
                            />
                        }
                        label="Active Status"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={!formData.code || !formData.name}
                        sx={{ backgroundColor: '#FF5A00', '&:hover': { backgroundColor: '#e04e00' } }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageShopsPage;
