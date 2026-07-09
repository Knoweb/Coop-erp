import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, Avatar, CircularProgress, Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { shopDashboardService, type ShopDashboardSummary } from '../shop/services/shopDashboardService';

const GroceryShopDashboard: React.FC = () => {
    const [stats, setStats] = useState<ShopDashboardSummary | null>(null);
    const [selectedProductCount, setSelectedProductCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const summary = await shopDashboardService.getSummary();
                setStats(summary);
                
                try {
                    const count = await shopDashboardService.getSelectedProductCount();
                    setSelectedProductCount(count);
                } catch (e) {
                    console.error("Failed to fetch selected product count", e);
                }
                
                setError(null);
            } catch (err) {
                console.error("Failed to fetch shop dashboard data", err);
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
                Shop Dashboard {stats?.shopName ? `- ${stats.shopName}` : ''}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                Real-time overview of this shop’s products, stock, purchases, and sales.
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
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>SHOP CODE</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>{stats?.shopCode || 'N/A'}</Typography>
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
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>USERS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalUsers || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">In this shop</Typography>
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
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>MY SELECTED PRODUCTS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{selectedProductCount}</Typography>
                                <Typography variant="caption" color="text.secondary">Available in this shop</Typography>
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
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Rs. {Number(stats?.todaySalesAmount || 0).toLocaleString()}</Typography>
                                <Typography variant="caption" color="text.secondary">{stats?.todaySalesCount || 0} Transactions</Typography>
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
        </Box>
    );
};

export default GroceryShopDashboard;