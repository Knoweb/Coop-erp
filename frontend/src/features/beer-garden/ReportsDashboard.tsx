import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button, TextField
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import api from '../../api/axiosConfig';

interface Invoice {
    invoiceNumber: string;
    operatorName: string;
    issuedDate: string;
    grandTotal: number;
    totalCommission: number;
}

interface Payment {
    invoiceNumber: string;
    operatorName: string;
    amountPaid: number;
    paymentMethod: string;
    chequeRef: string;
    paymentDate: string;
}

// NEW: GRN Interface
interface GRN {
    grnNumber: string;
    supplierName: string;
    receivedDate: string;
    totalAmount: number;
    status: string;
}

const ReportsDashboard: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [grns, setGrns] = useState<GRN[]>([]); 
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

   const fetchData = async () => {
    try {
        const results = await Promise.allSettled([
            api.get('/api/v1/beer-garden/invoices'),
            api.get('/api/v1/beer-garden/payments'),
            api.get('/api/v1/beer-garden/grn-history')
        ]);

        // Process Invoices
        if (results[0].status === 'fulfilled') {
            const filteredInvoices = results[0].value.data.filter((i: any) => {
                const date = i.issuedDate.split('T')[0];
                return date >= startDate && date <= endDate;
            });
            setInvoices(filteredInvoices);
        } else {
            console.error("Invoices failed:", results[0].reason);
        }

        // Process Payments
        if (results[1].status === 'fulfilled') {
            const filteredPayments = results[1].value.data.filter((p: any) => {
                const date = p.paymentDate.split('T')[0];
                return date >= startDate && date <= endDate;
            });
            setPayments(filteredPayments);
        } else {
            console.error("Payments failed (likely 403):", results[1].reason);
        }

        // Process GRNs
        if (results[2].status === 'fulfilled') {
            const filteredGrns = results[2].value.data.filter((g: any) => {
                const date = g.receivedDate.split('T')[0];
                return date >= startDate && date <= endDate;
            });
            setGrns(filteredGrns);
        } else {
            console.error("GRNs failed:", results[2].reason);
        }

    } catch (error) {
        console.error("Unexpected error in layout pipeline", error);
    }
};

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    return (
        <Box sx={{ p: 3 }}>
            <Box className="no-print" sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#451a03' }}>
                    Reports & Analytics
                </Typography>

                <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Filter Period:</Typography>
                    <TextField 
                        variant="outlined"
                        type="date" 
                        label="Start Date" 
                        size="small" 
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                    />
                    <Typography>to</Typography>
                    <TextField 
                        variant="outlined"
                        type="date" 
                        label="End Date" 
                        size="small" 
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                    />
                    <Button variant="outlined" onClick={fetchData}>Apply Filter</Button>
                    
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<PrintIcon />} 
                        onClick={() => window.print()}
                        sx={{ ml: 'auto' }}
                    >
                        Print Current Report
                    </Button>
                </Paper>

                <Tabs value={tabIndex} onChange={(_e, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
                    <Tab label="Beer Issuance & Commission" />
                    <Tab label="Payment History" />
                    <Tab label="Beer Purchase Account (GRN)" /> 
                </Tabs>
            </Box>

{tabIndex === 0 && (
    <Paper sx={{ p: 3 }} className="print-section">
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Beer Issuance & Commission Report
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
            Period: {startDate} to {endDate}
        </Typography>
        
        <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                        <TableCell><b>Date</b></TableCell>
                        <TableCell><b>Invoice No</b></TableCell>
                        <TableCell><b>Operator</b></TableCell>
                        <TableCell align="right"><b>Liquor Value (Rs.)</b></TableCell>
                        <TableCell align="right"><b>Commission (Rs.)</b></TableCell> 
                        <TableCell align="right"><b>Grand Total (Rs.)</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoices.map((inv, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{new Date(inv.issuedDate).toLocaleDateString()}</TableCell>
                            <TableCell>{inv.invoiceNumber}</TableCell>
                            <TableCell>{inv.operatorName}</TableCell>
                            <TableCell align="right">{inv.grandTotal ? (inv.grandTotal - (inv.totalCommission || 0)).toLocaleString() : "0"}</TableCell>
                            <TableCell align="right" sx={{ color: '#166534' }}>{inv.totalCommission?.toLocaleString()}</TableCell>
                            <TableCell align="right">{inv.grandTotal?.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell colSpan={4} align="right"><b>TOTAL FOR PERIOD:</b></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#166534' }}>
                            Rs. {invoices.reduce((sum, inv) => sum + (inv.totalCommission || 0), 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#166534' }}>
                            Rs. {invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0).toLocaleString()}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
)}

            {tabIndex === 1 && (
                <Paper sx={{ p: 3 }} className="print-section">
                    <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Payment Collection History
                    </Typography>
                    <Typography variant="subtitle1" align="center" gutterBottom>
                        Period: {startDate} to {endDate}
                    </Typography>
                    
                    <TableContainer sx={{ mt: 3 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell><b>Payment Date</b></TableCell>
                                    <TableCell><b>Invoice No</b></TableCell>
                                    <TableCell><b>Operator</b></TableCell>
                                    <TableCell><b>Method</b></TableCell>
                                    <TableCell><b>Reference</b></TableCell>
                                    <TableCell align="right"><b>Amount Collected (Rs.)</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments.map((pay, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{new Date(pay.paymentDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{pay.invoiceNumber}</TableCell>
                                        <TableCell>{pay.operatorName}</TableCell>
                                        <TableCell>{pay.paymentMethod}</TableCell>
                                        <TableCell>{pay.chequeRef || '-'}</TableCell>
                                        <TableCell align="right">{pay.amountPaid?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    <TableCell colSpan={5} align="right"><b>TOTAL COLLECTED:</b></TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                                        Rs. {payments.reduce((sum, pay) => sum + (pay.amountPaid || 0), 0).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {tabIndex === 2 && (
                <Paper sx={{ p: 3 }} className="print-section">
                    <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Beer Purchase Account (Stock Inward)
                    </Typography>
                    <Typography variant="subtitle1" align="center" gutterBottom>
                        Period: {startDate} to {endDate}
                    </Typography>
                    
                    <TableContainer sx={{ mt: 3 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell><b>Date Received</b></TableCell>
                                    <TableCell><b>GRN No</b></TableCell>
                                    <TableCell><b>Supplier</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                    <TableCell align="right"><b>Invoice Value (Rs.)</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {grns.map((grn, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{new Date(grn.receivedDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{grn.grnNumber}</TableCell>
                                        <TableCell>{grn.supplierName}</TableCell>
                                        <TableCell>{grn.status}</TableCell>
                                        <TableCell align="right">{grn.totalAmount?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    <TableCell colSpan={4} align="right"><b>TOTAL PURCHASES:</b></TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#991b1b' }}>
                                        Rs. {grns.reduce((sum, grn) => sum + (grn.totalAmount || 0), 0).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default ReportsDashboard;