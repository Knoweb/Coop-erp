import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../../api/axiosConfig';

interface Issuance {
    id: string;
    operatorName: string; 
    totalStockValue: number; 
    totalCommission: number; 
    grandTotal: number;
    status: string;
}

const Commissions: React.FC = () => {
    const [data, setData] = useState<Issuance[]>([]);

    useEffect(() => {
        const fetchReceivables = async () => {
            try {
                const response = await api.get('/api/v1/beer-garden/invoices');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchReceivables();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'success'; 
            case 'PARTIALLY_PAID': return 'info'; 
            default: return 'warning'; 
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#451a03' }}>Commission Receivables</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                            <TableCell><b>Operator</b></TableCell>
                            <TableCell align="right"><b>Liquor Value</b></TableCell>
                            <TableCell align="right"><b>Commission</b></TableCell>
                            <TableCell align="right"><b>Grand Total</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.operatorName}</TableCell>
                                <TableCell align="right">Rs. {row.totalStockValue?.toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ color: '#166534', fontWeight: 'bold' }}>
                                    Rs. {row.totalCommission?.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">Rs. {row.grandTotal?.toLocaleString()}</TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={row.status.replace('_', ' ')} 
                                        color={getStatusColor(row.status) as any} 
                                        size="small" 
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'gray' }}>
                                    No commissions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Commissions;