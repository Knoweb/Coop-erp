import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    TextField, MenuItem, Grid, Chip 
} from '@mui/material';
import api from '../../api/axiosConfig';

interface AuditLogResponse {
    id: string;
    userId: string;
    serviceName: string;
    action: string;
    description: string;
    createdAt: string;
}

const SystemAuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogResponse[]>([]);
    const [filterService, setFilterService] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/api/v1/admin/logs');
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        }
    };

    // Front-end filtering for speed
    const filteredLogs = logs.filter(log => {
        const matchesService = filterService === 'ALL' || log.serviceName === filterService;
        const matchesDate = filterDate === '' || log.createdAt.startsWith(filterDate);
        return matchesService && matchesDate;
    });

    const getServiceColor = (service: string) => {
        switch (service) {
            case 'AUTH-SERVICE': return 'warning';
            case 'MILK-SHOP-SERVICE': return 'info';
            case 'BEER-GARDEN-SERVICE': return 'success';
            case 'ROOM-SECTION-SERVICE': return 'secondary';
            case 'ADMIN-SERVICE': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1e293b' }}>
                System Audit Ledger
            </Typography>

            {/* Filter Section */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md:4 }}>
                        <TextField 
                            select fullWidth label="Filter by Service" size="small"
                            value={filterService} onChange={(e) => setFilterService(e.target.value)}
                        >
                            <MenuItem value="ALL">All Microservices</MenuItem>
                            <MenuItem value="AUTH-SERVICE">Auth Service</MenuItem>
                            <MenuItem value="ADMIN-SERVICE">Admin Service</MenuItem>
                            <MenuItem value="MILK-SHOP-SERVICE">Milk Shop Service</MenuItem>
                            <MenuItem value="BEER-GARDEN-SERVICE">Beer Garden Service</MenuItem>
                            <MenuItem value="ROOM-SECTION-SERVICE">Room Section Service</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md:4 }}>
                        <TextField 
                            type="date" fullWidth label="Filter by Date" size="small"
                            value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true } // <-- Fixed for MUI v6
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Logs Table */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Service Origin</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Action Performed</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>User ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>
                                        No audit logs match the current filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={log.serviceName} 
                                                color={getServiceColor(log.serviceName) as any} 
                                                size="small" 
                                                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: '500' }}>{log.action}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                                            {log.userId}
                                        </TableCell>
                                        <TableCell>{log.description}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default SystemAuditLogs;