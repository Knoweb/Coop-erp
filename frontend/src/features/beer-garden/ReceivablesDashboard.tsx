import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Button, Chip, Modal, 
    TextField, MenuItem, Stack, Alert, Menu
} from '@mui/material';
import api from '../../api/axiosConfig';

// Types
interface IssuanceInvoice {
    id: string;
    invoiceNumber: string;
    operatorName: string;
    issuedDate: string;
    grandTotal: number;
    status: string | null;
    priorityLevel: string | null;
    balanceDue: number; 
    daysOutstanding: number; 
    overdue: boolean;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
};

const ReceivablesDashboard: React.FC = () => {
    const [invoices, setInvoices] = useState<IssuanceInvoice[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<IssuanceInvoice | null>(null);
    
    const [amount, setAmount] = useState<number | string>('');
    const [method, setMethod] = useState<string>('CASH');
    const [reference, setReference] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [priorityInvoice, setPriorityInvoice] = useState<IssuanceInvoice | null>(null);

    const fetchInvoices = async () => {
        try {
            const response = await api.get<IssuanceInvoice[]>('/api/v1/beer-garden/invoices');
            const sortedData = response.data.sort((a, b) => {
                const priorityWeight: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                const weightA = priorityWeight[a.priorityLevel || 'LOW'] || 0;
                const weightB = priorityWeight[b.priorityLevel || 'LOW'] || 0;
                
                if (weightA !== weightB) {
                    return weightB - weightA; 
                }
                const dateA = a.issuedDate ? new Date(a.issuedDate).getTime() : 0;
                const dateB = b.issuedDate ? new Date(b.issuedDate).getTime() : 0;
                return dateB - dateA;
            });
            setInvoices(sortedData);
        } catch (err) {
            console.error("Failed to load invoices", err);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const openModal = (invoice: IssuanceInvoice) => {
        setSelectedInvoice(invoice);
        setAmount(invoice.balanceDue || invoice.grandTotal);
        setMethod('CASH');
        setReference('');
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedInvoice) return;
        const paymentAmount = Number(amount);
        
        if (paymentAmount <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }
        if (paymentAmount > (selectedInvoice.balanceDue || selectedInvoice.grandTotal)) {
            setError("Payment cannot exceed the balance due.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.post(`/api/v1/beer-garden/invoices/${selectedInvoice.id}/payments`, {
                amount: paymentAmount,
                method: method,
                reference: reference
            });
            alert("Payment successfully processed.");
            closeModal();
            fetchInvoices();
        } catch (err: any) {
            setError(err.response?.data?.message || "Payment processing failed. Check the console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePriorityClick = (event: React.MouseEvent<HTMLElement>, invoice: IssuanceInvoice) => {
        setAnchorEl(event.currentTarget);
        setPriorityInvoice(invoice);
    };

    const handlePriorityClose = () => {
        setAnchorEl(null);
        setPriorityInvoice(null);
    };

    const handlePriorityChange = async (newPriority: string) => {
        if (!priorityInvoice) return;
        
        try {
            await api.put(`/api/v1/beer-garden/invoices/${priorityInvoice.id}/priority`, {
                priorityLevel: newPriority
            });
            fetchInvoices(); 
        } catch (err) {
            console.error("Failed to update priority", err);
            alert("Failed to update priority.");
        } finally {
            handlePriorityClose();
        }
    };

    const getStatusColor = (status: string | null | undefined) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PARTIALLY_PAID': return 'warning';
            default: return 'error';
        }
    };

    const getPriorityColor = (priority: string | null | undefined) => {
        switch (priority) {
            case 'HIGH': return 'error';
            case 'MEDIUM': return 'info';
            case 'LOW': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#451a03' }}>
              
            {invoices.filter(inv => inv.overdue).length > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid #f87171' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        ⚠️ Attention Required: There are {invoices.filter(inv => inv.overdue).length} overdue accounts!
                    </Typography>
                    <Typography variant="body2">
                        These invoices have been outstanding for more than 30 days. Please take immediate action to collect these dues.
                    </Typography>
                </Alert>
            )}
                Accounts Receivable Dashboard
            </Typography>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell><b>Date</b></TableCell>
                            <TableCell><b>Invoice No</b></TableCell>
                            <TableCell><b>Operator</b></TableCell>
                            <TableCell align="center"><b>Priority</b></TableCell>
                            <TableCell align="right"><b>Grand Total</b></TableCell>
                            <TableCell align="right"><b>Balance Due</b></TableCell>
                            <TableCell align="center"><b>Status</b></TableCell>
                            <TableCell align="center"><b>Action</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice) => {
                            const safeStatus = invoice.status || 'UNPAID';
                            const safePriority = invoice.priorityLevel || 'MEDIUM';
                            const safeDate = invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : 'N/A';

                            return (
                                <TableRow key={invoice.id} hover>
                                    <TableCell>{safeDate}</TableCell>
                                    <TableCell>{invoice.invoiceNumber || 'N/A'}</TableCell>
                                    <TableCell>{invoice.operatorName || 'Unknown'}</TableCell>
                                    <TableCell align="center">
    <Chip 
        label={safePriority} 
        size="small" 
        color={getPriorityColor(safePriority)} 
        onClick={(e) => {
            console.log("Priority Chip Clicked!", invoice.id);
            handlePriorityClick(e, invoice);
        }}
        sx={{ cursor: 'pointer', fontWeight: 'bold' }}
        clickable 
    />
</TableCell>
 
                                    <TableCell align="right">Rs. {(invoice.grandTotal || 0).toLocaleString()}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#b91c1c' }}>
                                        Rs. {(invoice.balanceDue ?? invoice.grandTotal ?? 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={safeStatus.replace('_', ' ')} size="small" color={getStatusColor(safeStatus)} />
                                        
                                        {invoice.overdue && (
                                            <Typography variant="caption" sx={{ display: 'block', color: 'error.main', mt: 0.5, fontWeight: 'bold' }}>
                                                {invoice.daysOutstanding} Days Overdue!
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            color="primary"
                                            disabled={safeStatus === 'PAID'}
                                            onClick={() => openModal(invoice)}
                                        >
                                            Settle
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    No outstanding invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

<Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handlePriorityClose}
    disableScrollLock={true} 
>
    <MenuItem onClick={() => handlePriorityChange('HIGH')}>
        <Typography color="error" sx={{ fontWeight: 'bold', width: '100px', textAlign: 'center' }}>HIGH</Typography>
    </MenuItem>
    <MenuItem onClick={() => handlePriorityChange('MEDIUM')}>
        <Typography color="info.main" sx={{ fontWeight: 'bold', width: '100px', textAlign: 'center' }}>MEDIUM</Typography>
    </MenuItem>
    <MenuItem onClick={() => handlePriorityChange('LOW')}>
        <Typography color="text.secondary" sx={{ fontWeight: 'bold', width: '100px', textAlign: 'center' }}>LOW</Typography>
    </MenuItem>
</Menu>

            <Modal open={isModalOpen} onClose={closeModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Settle Invoice: {selectedInvoice?.invoiceNumber}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Balance Due: <b>Rs. {(selectedInvoice?.balanceDue ?? selectedInvoice?.grandTotal)?.toLocaleString()}</b>
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Payment Amount (Rs.)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Payment Method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            disabled={isSubmitting}
                        >
                            <MenuItem value="CASH">CASH</MenuItem>
                            <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Reference No (Receipt/Cheque)"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <Button 
                            variant="contained" 
                            color="success" 
                            size="large"
                            onClick={handlePaymentSubmit}
                            disabled={isSubmitting || !amount}
                        >
                            {isSubmitting ? 'Processing...' : 'CONFIRM PAYMENT'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </Box>
    );
};

export default ReceivablesDashboard;