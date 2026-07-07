import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Paper, Card, CardContent, Divider, Avatar, CircularProgress, Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { adminDashboardService, type DashboardSummary } from './services/adminDashboardService';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const summary = await adminDashboardService.getSummary();
                setStats(summary);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} sx={{ color: '#0f172a' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1e293b' }}>
                Main Shop Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                Real-time overview of shops, inventory, sales, and users.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm:6, md:4 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 56, height: 56, mr: 2 }}>
                                <StorefrontIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>TOTAL SHOPS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalShops || 0}</Typography>
                                <Typography variant="caption" color="success.main">{stats?.activeShops || 0} Active</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm:6, md:4 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e', width: 56, height: 56, mr: 2 }}>
                                <PeopleIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>TOTAL USERS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalUsers || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">System-wide Users</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm:6, md:4 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#fff7ed', color: '#f97316', width: 56, height: 56, mr: 2 }}>
                                <InventoryIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>PRODUCTS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalProducts || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Main Shop Catalog</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm:6, md:4 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#fef2f2', color: '#ef4444', width: 56, height: 56, mr: 2 }}>
                                <WarningIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>LOW STOCK ITEMS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.lowStockItems || 0}</Typography>
                                <Typography variant="caption" color="error.main">Needs Restock</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm:6, md:4 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e', width: 56, height: 56, mr: 2 }}>
                                <AttachMoneyIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>TODAY'S SALES</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>${stats?.todayRevenue || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">{stats?.todaySales || 0} Transactions</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm:6, md:4 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#f8fafc', color: '#475569', width: 56, height: 56, mr: 2 }}>
                                <ShoppingCartIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>PENDING PURCHASES</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.pendingPurchases || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Purchase Orders</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md:6 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>System Notices</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            Welcome to the Coop Grocery Main Administration Panel.
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Reminder: Perform end-of-day stock validation by 10:00 PM.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;