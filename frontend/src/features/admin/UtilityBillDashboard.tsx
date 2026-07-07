import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, MenuItem, Grid, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert 
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../../api/axiosConfig'; // Adjust path if necessary

interface UtilityBillResponse {
    id: string;
    utilityType: string;
    billingMonth: string;
    totalAmount: number;
    milkShopRatio: number;
    roomSectionRatio: number;
    milkShopAllocatedAmount: number;
    roomSectionAllocatedAmount: number;
    createdAt: string;
}

const UtilityBillDashboard: React.FC = () => {
    // Form State
    const [utilityType, setUtilityType] = useState('ELECTRICITY');
    const [billingMonth, setBillingMonth] = useState('');
    const [totalAmount, setTotalAmount] = useState<number | string>('');
    const [milkShopRatio, setMilkShopRatio] = useState<number | string>('0.40');
    const [roomSectionRatio, setRoomSectionRatio] = useState<number | string>('0.60');
    
    // UI State
    const [bills, setBills] = useState<UtilityBillResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch existing bills on load
    const fetchBills = async () => {
        try {
            // Note: Update this endpoint if your API Gateway routing is different
            const response = await api.get('/api/v1/admin/utilities');
            setBills(response.data);
        } catch (error) {
            console.error("Failed to fetch utility bills", error);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    // Strict UI Validation
    const mathSum = (Number(milkShopRatio) || 0) + (Number(roomSectionRatio) || 0);
    const isRatioValid = Math.abs(mathSum - 1.0) < 0.001; // Protect against JS floating point quirks
    const isFormValid = billingMonth && Number(totalAmount) > 0 && isRatioValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!isRatioValid) {
            setMessage({ type: 'error', text: 'Critical: Ratios must sum exactly to 1.00' });
            return;
        }

        setIsLoading(true);

        // Standardize payload for Spring Boot validation
        const payload = {
            utilityType,
            billingMonth,
            totalAmount: Number(totalAmount),
            milkShopRatio: Number(milkShopRatio),
            roomSectionRatio: Number(roomSectionRatio),
            // Provide a dummy UUID if auth is not fully decoded yet, or pull from your JWT
            recordedBy: "123e4567-e89b-12d3-a456-426614174000" 
        };

        try {
            await api.post('/api/v1/admin/utilities', payload);
            setMessage({ type: 'success', text: 'Utility bill successfully allocated and recorded.' });
            
            // Reset form
            setTotalAmount('');
            setBillingMonth('');
            fetchBills(); // Refresh table
        } catch (error: any) {
            const errorData = error.response?.data;
            let errorMessage = 'Failed to record bill. Check server connection.';
            
            // Safely extract a string from the Spring Boot error payload
            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData && typeof errorData === 'object') {
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
            }

            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1e293b' }}>
                Central Utility Allocations
            </Typography>

            <Grid container spacing={4}>
                {/* LEFT COLUMN: Entry Form */}
                <Grid size={{ xs: 12, md:4 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Record New Bill</Typography>
                        
                        {message && (
                            <Alert severity={message.type} sx={{ mb: 3 }}>
                                {message.text}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField 
                                select fullWidth label="Utility Type" size="small" sx={{ mb: 2 }}
                                value={utilityType} onChange={(e) => setUtilityType(e.target.value)}
                            >
                                <MenuItem value="ELECTRICITY">Electricity</MenuItem>
                                <MenuItem value="WATER">Water</MenuItem>
                            </TextField>

                            <TextField 
                                fullWidth label="Billing Month (YYYY-MM)" size="small" sx={{ mb: 2 }}
                                placeholder="e.g., 2026-04" value={billingMonth} 
                                onChange={(e) => setBillingMonth(e.target.value)}
                                required
                            />

                            <TextField 
                                fullWidth type="number" label="Total Bill Amount (Rs.)" size="small" sx={{ mb: 3 }}
                                value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
                                required
                            />

                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1, mb: 3, border: isRatioValid ? '1px solid #cbd5e1' : '1px solid #ef4444' }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569' }}>Allocation Ratios</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField 
                                            fullWidth 
                                            type="number" 
                                            slotProps={{
                                                htmlInput: { step: "0.01", min: "0", max: "1" }
                                            }}
                                            label="Milk Shop" 
                                            size="small"
                                            value={milkShopRatio} 
                                            onChange={(e) => setMilkShopRatio(e.target.value)}
                                        />
                                    </Grid>
                                   <Grid size={{ xs: 6 }}>
                                        <TextField 
                                            fullWidth 
                                            type="number" 
                                            slotProps={{
                                                htmlInput: { step: "0.01", min: "0", max: "1" }
                                            }}
                                            label="Room Section" 
                                            size="small"
                                            value={roomSectionRatio} 
                                            onChange={(e) => setRoomSectionRatio(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                                {!isRatioValid && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        Current Sum: {mathSum.toFixed(2)} (Must equal 1.00)
                                    </Typography>
                                )}
                            </Box>

                            <Button 
                                type="submit" variant="contained" color="primary" fullWidth size="large"
                                disabled={isLoading || !isFormValid}
                                startIcon={<ReceiptIcon />}
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                {isLoading ? 'Processing...' : 'Allocate & Save'}
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                {/* RIGHT COLUMN: Historical Ledger */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Period</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Type</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Total (Rs.)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9', color: '#0ea5e9' }}>Milk Shop Split</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9', color: '#8b5cf6' }}>Room Sec Split</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bills.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>
                                                No utility bills recorded yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bills.map((bill) => (
                                            <TableRow key={bill.id} hover>
                                                <TableCell>{bill.billingMonth}</TableCell>
                                                <TableCell>
                                                    <Box component="span" sx={{ 
                                                        px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold',
                                                        bgcolor: bill.utilityType === 'ELECTRICITY' ? '#fef08a' : '#bae6fd',
                                                        color: bill.utilityType === 'ELECTRICITY' ? '#854d0e' : '#0369a1'
                                                    }}>
                                                        {bill.utilityType}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                    {bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: '#0ea5e9' }}>
                                                    {bill.milkShopAllocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br/>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>({bill.milkShopRatio * 100}%)</Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: '#8b5cf6' }}>
                                                    {bill.roomSectionAllocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br/>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>({bill.roomSectionRatio * 100}%)</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UtilityBillDashboard;