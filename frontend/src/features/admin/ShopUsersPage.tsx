import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, 
    FormControl, InputLabel, Select, MenuItem, Chip, Alert
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, PowerSettingsNew as PowerIcon } from '@mui/icons-material';
import { shopAdminService } from './services/shopAdminService';
import type { Shop, UserResponse } from './services/shopAdminService';

const ShopUsersPage: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShopId, setSelectedShopId] = useState<string>('');
    const userRole = localStorage.getItem('user_role')?.replace(/^ROLE_/, '') || '';
    const isAdmin = userRole === 'ADMIN';
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Dialog state
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        shopId: '',
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'SHOP_USER'
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const shopsData = await shopAdminService.getAllShops();
                setShops(shopsData);
            }
            
            // If there's a shop, maybe default select it, or just fetch all users
            const usersData = await shopAdminService.getAllUsers();
            setUsers(usersData);
            setError('');
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (shopId: string) => {
        setLoading(true);
        try {
            const data = await shopAdminService.getAllUsers(shopId);
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleShopSelect = (e: any) => {
        const val = e.target.value;
        setSelectedShopId(val);
        fetchUsers(val);
    };

    const handleOpen = () => {
        setFormData({
            shopId: selectedShopId || (shops.length > 0 ? shops[0].id : ''),
            name: '',
            username: '',
            email: '',
            password: '',
            role: 'SHOP_USER'
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            await shopAdminService.createUser(formData);
            handleClose();
            fetchUsers(selectedShopId);
        } catch (err) {
            console.error(err);
            alert('Failed to create user. Username might be duplicate.');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await shopAdminService.toggleUserStatus(id);
            fetchUsers(selectedShopId);
        } catch (err) {
            console.error(err);
            alert('Failed to toggle user status');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Shop Users
                    </Typography>
                    <Typography color="text.secondary">
                        Create and manage users for grocery shops.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {isAdmin && (
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Filter by Shop</InputLabel>
                            <Select
                                value={selectedShopId}
                                label="Filter by Shop"
                                onChange={handleShopSelect}
                            >
                                <MenuItem value=""><em>All Shops</em></MenuItem>
                                {shops.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />} 
                        onClick={() => fetchUsers(selectedShopId)}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={handleOpen}
                        sx={{ backgroundColor: '#FF5A00', '&:hover': { backgroundColor: '#e04e00' } }}
                    >
                        Add Shop User
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Username</b></TableCell>
                            <TableCell><b>Shop</b></TableCell>
                            <TableCell><b>Role</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No users found.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.username}</TableCell>
                                    <TableCell>{u.shopName || 'Main Admin / Unassigned'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={u.role} 
                                            color={u.role === 'ADMIN' ? 'error' : u.role === 'SHOP_ADMIN' ? 'primary' : 'default'} 
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={u.isActive ? 'Active' : 'Inactive'} 
                                            color={u.isActive ? 'success' : 'default'} 
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {/* Edit logic omitted as backend PUT /admin/users/{id} isn't fully set up yet. Status toggle only. */}
                                        {u.role !== 'ADMIN' && (
                                            <IconButton 
                                                color={u.isActive ? 'error' : 'success'} 
                                                onClick={() => handleToggleStatus(u.id)}
                                                title={u.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <PowerIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Form */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Shop User</DialogTitle>
                <DialogContent dividers>
                    {isAdmin && (
                        <FormControl fullWidth sx={{ mb: 2 }} margin="dense">
                            <InputLabel>Shop Assignment</InputLabel>
                            <Select
                                name="shopId"
                                value={formData.shopId}
                                label="Shop Assignment"
                                onChange={handleChange}
                                required
                            >
                                {shops.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        margin="dense"
                        name="name"
                        label="Full Name"
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
                        name="username"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth margin="dense">
                        <InputLabel>User Role</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            label="User Role"
                            onChange={handleChange}
                        >
                            <MenuItem value="SHOP_ADMIN">Shop Admin</MenuItem>
                            <MenuItem value="SHOP_USER">Shop User</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={(isAdmin && !formData.shopId) || !formData.username || !formData.password}
                        sx={{ backgroundColor: '#FF5A00', '&:hover': { backgroundColor: '#e04e00' } }}
                    >
                        Create User
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShopUsersPage;
