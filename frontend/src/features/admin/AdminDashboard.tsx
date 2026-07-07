import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Paper, Card, CardContent, Divider, Avatar, CircularProgress 
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DnsIcon from '@mui/icons-material/Dns';
import api from '../../api/axiosConfig';

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalLogs: number;
    totalUtilityBills: number;
    recentLogs: any[];
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data concurrently for maximum speed
                const [usersRes, logsRes, utilitiesRes] = await Promise.all([
                    api.get('/api/v1/admin/users'),
                    api.get('/api/v1/admin/logs'),
                    api.get('/api/v1/admin/utilities')
                ]);

                const users = usersRes.data;
                const logs = logsRes.data;
                const utilities = utilitiesRes.data;

                setStats({
                    totalUsers: users.length,
                    activeUsers: users.filter((u: any) => u.isActive).length,
                    totalLogs: logs.length,
                    totalUtilityBills: utilities.length,
                    recentLogs: logs.slice(0, 5) // Grab only the 5 most recent logs
                });
            } catch (error) {
                console.error("Failed to fetch global dashboard data", error);
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
                Global Command Center
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                System overview and real-time operational metrics.
            </Typography>

            {/* TOP ROW: KPI CARDS */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm:6,md:3 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 56, height: 56, mr: 2 }}>
                                <PeopleIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>TOTAL USERS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalUsers || 0}</Typography>
                                <Typography variant="caption" color="success.main">{stats?.activeUsers || 0} Active</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* <Grid size={{ xs: 12, sm:6,md:3 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#fef2f2', color: '#ef4444', width: 56, height: 56, mr: 2 }}>
                                <SecurityIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>SECURITY EVENTS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalLogs || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Logged Actions</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid> */}

                <Grid size={{ xs: 12, sm:6,md:3 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e', width: 56, height: 56, mr: 2 }}>
                                <ReceiptIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>UTILITY BILLS</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats?.totalUtilityBills || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Recorded Months</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm:6,md:3 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: '#f8fafc', color: '#0f172a', width: 56, height: 56, mr: 2 }}>
                                <DnsIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>MICROSERVICES</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>5</Typography>
                                <Typography variant="caption" color="success.main">All Systems Online</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* BOTTOM ROW: RECENT ACTIVITY & SYSTEM INFO */}
            <Grid container spacing={3}>
                {/* <Grid size={{ xs: 12, md:8 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Security Logs</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List>
                            {stats?.recentLogs.length === 0 ? (
                                <Typography color="text.secondary">No recent activity detected.</Typography>
                            ) : (
                                stats?.recentLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: '#1e293b', width: 32, height: 32 }}>
                                                    <SecurityIcon fontSize="small" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography sx={{ fontWeight: 'bold' }}>{log.action}</Typography>}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography component="span" variant="body2" color="text.primary">
                                                            {log.serviceName}
                                                        </Typography>
                                                        {" — " + log.description + " (" + new Date(log.createdAt).toLocaleString() + ")"}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid> */}

                <Grid size={{ xs: 12, md:4 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%', bgcolor: '#0f172a', color: 'white' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>System Information</Typography>
                        <Divider sx={{ mb: 2, borderColor: '#334155' }} />
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>API GATEWAY STATUS</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4ade80' }}>Connected & Routing (Port 8080)</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>SERVICE REGISTRY</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4ade80' }}>Eureka Server Online (Port 8761)</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>DATABASE CLUSTER</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4ade80' }}>PostgreSQL 16 via Docker</Typography>
                        </Box>
                        <Box sx={{ mt: 4, p: 2, bgcolor: '#1e293b', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                Welcome to the Hikkaduwa Co-op Global Administration Panel. Use the sidebar to provision new users, allocate utility ratios, or audit system activity.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;