import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent,  Chip, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment,
    CircularProgress // <-- Added this import
} from '@mui/material'; 
import SearchIcon from '@mui/icons-material/Search';
import api from '../../api/axiosConfig';

interface IssuanceInvoice {
    id: string;
    invoiceNumber: string;
    operatorName: string;
    issuedDate: string;
    grandTotal: number;
    totalCommission: number;
    totalLiquorValue: number;
    status: string;
    daysOutstanding: number;
    overdue: boolean;
}

const BeerGardenDashboard: React.FC = () => {
    const [invoices, setInvoices] = useState<IssuanceInvoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReceivables = async () => {
            try {
                const response = await api.get('/api/v1/beer-garden/receivables');
                setInvoices(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to connect to the Beer Garden Service.');
            } finally {
                setLoading(false);
            }
        };
        fetchReceivables();
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => 
            inv.operatorName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [invoices, searchTerm]);

    const totalExposure = invoices.reduce((sum, inv) => sum + (inv.status !== 'PAID' ? inv.grandTotal : 0), 0);
    const totalOverdue = invoices.filter(inv => inv.overdue).length;

    // <-- Added this block to use the 'loading' variable -->
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#451a03', mb: 4 }}>
                Logistics & Receivables Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md:4 }}>
                    <Card sx={{ borderLeft: '6px solid #ef4444' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">TOTAL CREDIT EXPOSURE</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#b91c1c' }}>
                                Rs. {totalExposure.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md:4 }}>
                    <Card sx={{ borderLeft: '6px solid #f59e0b' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">CRITICAL OVERDUE INVOICES</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                                {totalOverdue}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {error && <Box sx={{ color: 'red', mb: 2 }}>{error}</Box>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Active Receivables Ledger</Typography>
                <TextField 
                    placeholder="Search by operator..." 
                    size="small"
                    variant="outlined"
                    slotProps={{ 
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'gray' }} />
                                </InputAdornment>
                            )
                        }
                    }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>
            
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell><b>Operator</b></TableCell>
                            <TableCell><b>Issued Date</b></TableCell>
                            <TableCell align="right"><b>Grand Total</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Aging</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInvoices.map((inv) => (
                            <TableRow key={inv.id} hover>
                                <TableCell>{inv.operatorName}</TableCell>
                                <TableCell>{new Date(inv.issuedDate).toLocaleDateString()}</TableCell>
                                <TableCell align="right">Rs. {inv.grandTotal.toLocaleString()}</TableCell>
                                <TableCell align="center">
                                    <Chip label={inv.status} color={inv.status === 'PAID' ? 'success' : 'error'} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    {inv.daysOutstanding} days
                                    {inv.overdue && <Chip label="OVERDUE" color="error" size="small" sx={{ ml: 1 }} />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BeerGardenDashboard;