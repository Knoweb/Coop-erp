import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
    Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Switch, FormControlLabel, MenuItem, Snackbar, Alert, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { systemUserService, type SystemUser } from './services/systemUserService';

const SystemUsersPage: React.FC = () => {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // Form state
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN',
        active: true
    });
    const [passwordData, setPasswordData] = useState({ newPassword: '' });

    // Notifications
    const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await systemUserService.getSystemUsers();
            setUsers(data);
        } catch (error) {
            showNotification('Failed to fetch system users', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setNotification({ open: true, message, severity });
    };

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setFormData({
            name: '', username: '', email: '', password: '', confirmPassword: '', role: 'ADMIN', active: true
        });
        setIsUserModalOpen(true);
    };

    const handleOpenEditModal = (user: SystemUser) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '', // Leave blank for edit unless they want to change
            confirmPassword: '',
            role: user.role,
            active: user.active
        });
        setIsUserModalOpen(true);
    };

    const handleOpenPasswordModal = (user: SystemUser) => {
        setEditingUser(user);
        setPasswordData({ newPassword: '' });
        setIsPasswordModalOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            if (!editingUser && formData.password !== formData.confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            if (editingUser) {
                await systemUserService.updateSystemUser(editingUser.id, {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    active: formData.active
                });
                showNotification('User updated successfully', 'success');
            } else {
                await systemUserService.createSystemUser({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    active: formData.active
                });
                showNotification('User created successfully', 'success');
            }
            setIsUserModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            showNotification(error.response?.data || 'Failed to save user', 'error');
        }
    };

    const handleResetPassword = async () => {
        if (!editingUser) return;
        if (!passwordData.newPassword) {
            showNotification('Password cannot be empty', 'error');
            return;
        }
        try {
            await systemUserService.resetSystemUserPassword(editingUser.id, { newPassword: passwordData.newPassword });
            showNotification('Password reset successfully', 'success');
            setIsPasswordModalOpen(false);
        } catch (error: any) {
            showNotification(error.response?.data || 'Failed to reset password', 'error');
        }
    };

    const handleToggleStatus = async (user: SystemUser) => {
        try {
            await systemUserService.updateSystemUserStatus(user.id, !user.active);
            showNotification(`User ${!user.active ? 'activated' : 'deactivated'} successfully`, 'success');
            fetchUsers();
        } catch (error: any) {
            showNotification(error.response?.data || 'Failed to update user status', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                              user.username.toLowerCase().includes(search.toLowerCase()) ||
                              user.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || 
                              (statusFilter === 'ACTIVE' && user.active) || 
                              (statusFilter === 'INACTIVE' && !user.active);
        return matchesSearch && matchesStatus;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1e293b' }}>
                System Users
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                Manage main shop administrative users.
            </Typography>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search by name, username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ width: 300 }}
                        />
                        <TextField
                            select
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ width: 150 }}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers}>
                            Refresh
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
                            Add System User
                        </Button>
                    </Box>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredUsers.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                        No system users found.
                    </Typography>
                ) : (
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={user.active ? 'Active' : 'Inactive'} 
                                            color={user.active ? 'success' : 'default'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(user)} title="Edit User">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="secondary" onClick={() => handleOpenPasswordModal(user)} title="Reset Password">
                                            <VpnKeyIcon fontSize="small" />
                                        </IconButton>
                                        <Switch 
                                            checked={user.active} 
                                            onChange={() => handleToggleStatus(user)}
                                            color="success"
                                            title="Toggle Active Status"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {/* Add / Edit User Modal */}
            <Dialog open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit System User' : 'Add System User'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField fullWidth label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField fullWidth label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </Box>
                        
                        {!editingUser && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <TextField fullWidth label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                <TextField fullWidth label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                            </Box>
                        )}
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField fullWidth select label="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </TextField>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel control={<Switch checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} color="success" />} label="Active Status" />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveUser}>{editingUser ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Modal */}
            <Dialog open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Enter a new password for <strong>{editingUser?.username}</strong>.
                    </Typography>
                    <TextField fullWidth label="New Password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ newPassword: e.target.value })} required />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={handleResetPassword}>Reset Password</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({...notification, open: false})}>
                <Alert severity={notification.severity} onClose={() => setNotification({...notification, open: false})}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SystemUsersPage;
