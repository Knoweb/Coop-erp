import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, MenuItem, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Alert, Chip, IconButton, Tooltip, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import api from '../../api/axiosConfig';

interface UserResponse {
    id: string;
    name: string;      // Added name to interface
    username: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const UserManagementDashboard: React.FC = () => {
    // User Creation States
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [rawPassword, setRawPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Password Reset Dialog States
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // System States
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const isFormValid = name.trim().length > 1 && username.trim().length > 3 && rawPassword.length >= 6 && role !== '';

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        try {
            await api.post('/admin/users', { name, username, rawPassword, role });
            setMessage({ type: 'success', text: `User '${username}' created successfully.` });
            
            // Clear the form
            setName(''); setUsername(''); setRawPassword(''); setRole('');
            fetchUsers();
        } catch (error: any) {
            // Safely parse the error to prevent React crashes if backend returns a JSON object
            const responseData = error.response?.data;
            const errorMessage = responseData?.message || responseData?.error || (typeof responseData === 'string' ? responseData : 'Failed to create user.');
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'DEACTIVATE' : 'ACTIVATE'} this user?`)) return;
        try {
            await api.patch(`/admin/users/${id}/toggle-status`);
            fetchUsers();
        } catch (error) {
            alert("Failed to update user status.");
        }
    };

    const handleOpenResetDialog = (id: string, username: string) => {
        setSelectedUserId(id);
        setSelectedUserName(username);
        setNewPassword(''); // Clear the field each time it opens
        setResetDialogOpen(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUserId || newPassword.length < 6) return;
        setIsLoading(true);
        try {
            await api.patch(`/admin/users/${selectedUserId}/reset-password`, { 
                newPassword: newPassword 
            });
            alert(`Password for '${selectedUserName}' has been successfully changed!`);
            setResetDialogOpen(false);
        } catch (error) {
            alert("Failed to change password. Please check the network tab.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatRole = (backendRole: string) => {
        switch (backendRole) {
            case 'ADMIN': return 'Main Shop Admin';
            case 'SHOP_ADMIN': return 'Grocery Shop Admin';
            case 'SHOP_USER': return 'Grocery Shop User';
            default: return backendRole;
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1e293b' }}>
                System Access & User Management
            </Typography>

            <Grid container spacing={4}>
                {/* Form Column */}
                <Grid size={{ xs: 12, md:4 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Provision New Account</Typography>
                        {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

                        <form onSubmit={handleCreateUser}>
                            <TextField fullWidth label="Full Name" size="small" sx={{ mb: 2 }}
                                value={name} onChange={(e) => setName(e.target.value)} required />

                            <TextField fullWidth label="Username" size="small" sx={{ mb: 2 }}
                                value={username} onChange={(e) => setUsername(e.target.value)} required />

                            <TextField 
    fullWidth 
    type={showPassword ? 'text' : 'password'} 
    label="New Password" 
    size="small" 
    sx={{ mb: 2 }}
    value={rawPassword} 
    onChange={(e) => setRawPassword(e.target.value)} 
    required
    slotProps={{
        input: {
            endAdornment: (
                <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
            )
        }
    }}
/>

                            <TextField select fullWidth label="System Role" size="small" sx={{ mb: 3 }}
                                value={role} onChange={(e) => setRole(e.target.value)} required>
                                <MenuItem value="ADMIN">Main Shop Admin</MenuItem>
                                <MenuItem value="SHOP_ADMIN">Grocery Shop Admin</MenuItem>
                                <MenuItem value="SHOP_USER">Grocery Shop User</MenuItem>
                            </TextField>

                            <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading || !isFormValid}
                                startIcon={<PersonAddIcon />} sx={{ py: 1.5, fontWeight: 'bold', backgroundColor: '#0f172a' }}>
                                {isLoading ? 'Provisioning...' : 'Create User Account'}
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                {/* Table Column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Full Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Username</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Domain</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Status</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{formatRole(user.role)}</TableCell>
                                            <TableCell><Chip label={user.isActive ? "Active" : "Suspended"} color={user.isActive ? "success" : "error"} size="small" /></TableCell>
                                            <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                {/* Toggle Status Button */}
                                                <Tooltip title={user.isActive ? "Suspend Account" : "Reactivate Account"}>
                                                    <IconButton color={user.isActive ? "error" : "success"} onClick={() => handleToggleStatus(user.id, user.isActive)}>
                                                        {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                
                                                {/* Reset Password Button */}
                                                <Tooltip title="Reset Password">
                                                    <IconButton color="primary" onClick={() => handleOpenResetDialog(user.id, user.username)}>
                                                        <VpnKeyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Direct Password Reset Dialog */}
            <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Change Password for '{selectedUserName}'</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText sx={{ mb: 3 }}>
                        Set a new password for this user. This will be their permanent password until changed again. Minimum 6 characters required.
                    </DialogContentText>
                    <TextField 
                        autoFocus 
                        fullWidth 
                        label="New Password" 
                        type="text" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setResetDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleResetPassword} 
                        variant="contained" 
                        color="primary" 
                        disabled={newPassword.length < 6 || isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default UserManagementDashboard;