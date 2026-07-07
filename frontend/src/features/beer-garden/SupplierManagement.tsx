import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, DialogContentText, Grid, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../api/axiosConfig';

interface Supplier {
    id: string;
    supplierName: string;
    licenseNumber: string;
    territory: string;
    contactDetails: string;
    creditTerms: string;
    outstandingBalance: number;
}

interface UnpaidGrn {
    id: string;
    grnNumber: string;
    totalAmount: number;
    amountPaid: number;
}

const SupplierManagement: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        supplierName: '', licenseNumber: '', territory: '', contactDetails: '', creditTerms: ''
    });

    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [unpaidBills, setUnpaidBills] = useState<UnpaidGrn[]>([]);
    const [selectedBillId, setSelectedBillId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentRef, setPaymentRef] = useState('');

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/api/v1/beer-garden/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    useEffect(() => { fetchSuppliers(); }, []);

    const totalDebt = suppliers.reduce((sum, supplier) => sum + (Number(supplier.outstandingBalance) || 0), 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async () => {
        if (!formData.supplierName) return alert("Supplier Name is required");
        setIsSubmitting(true);
        try {
            await api.post('/api/v1/beer-garden/suppliers', formData);
            setOpenAddDialog(false);
            setFormData({ supplierName: '', licenseNumber: '', territory: '', contactDetails: '', creditTerms: '' });
            fetchSuppliers(); 
        } catch (error) {
            console.error("Failed to add supplier:", error);
            alert("Error adding supplier. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleOpenPayment = async (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setPaymentAmount('');
        setPaymentRef('');
        setSelectedBillId('');
        setUnpaidBills([]); 
        
        setOpenPaymentDialog(true); 
        
        try {
            const response = await api.get(`/api/v1/beer-garden/suppliers/${supplier.id}/unpaid-grns`);
            
            if (response.data.length === 0) {
                alert(`No pending bills found for ${supplier.supplierName}. Please add a new GRN first.`);
            }
            setUnpaidBills(response.data);
            
        } catch (error) {
            console.error("Error fetching unpaid bills:", error);
            alert("Backend Error: Could not fetch bills. Please ensure the endpoint exists in the Controller and is permitted in SecurityConfig.");
        }
    };

    const handleProcessPayment = async () => {
        if (!selectedSupplier || !paymentAmount || Number(paymentAmount) <= 0 || !selectedBillId) {
            return alert("Please enter a valid amount and select a bill.");
        }

        try {
            await api.post('/api/v1/beer-garden/supplier-payments', {
                supplierId: selectedSupplier.id,
                grnId: selectedBillId, 
                amount: Number(paymentAmount),
                paymentReference: paymentRef
            });
            alert("Payment recorded successfully!");
            setOpenPaymentDialog(false);
            fetchSuppliers(); 
        } catch (error) {
            console.error("Payment failed", error);
            alert("Failed to process payment.");
        }
    };

    const columns: GridColDef[] = [
        { field: 'supplierName', headerName: 'Supplier Name', flex: 1.5, sortable: true },
        { field: 'contactDetails', headerName: 'Contact', flex: 1 },
        { field: 'creditTerms', headerName: 'Credit Terms', flex: 1 },
        { 
            field: 'outstandingBalance', 
            headerName: 'Outstanding Debt (Rs.)', 
            flex: 1, 
            type: 'number',
            valueFormatter: (value) => value ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"
        },
        {
            field: 'action',
            headerName: 'Accounting',
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Button 
                    variant="contained" 
                    color="success" 
                    size="small" 
                    disabled={params.row.outstandingBalance <= 0}
                    onClick={() => handleOpenPayment(params.row as Supplier)}
                >
                    Settle Payment
                </Button>
            )
        }
    ];

    return (
        <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#451a03' }}>Supplier Ledger</Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                    Add Supplier
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%', mb: 2 }}>
                <DataGrid 
                    rows={suppliers} 
                    columns={columns} 
                    slots={{ toolbar: GridToolbar }} 
                    initialState={{ sorting: { sortModel: [{ field: 'outstandingBalance', sort: 'desc' }] } }}
                />
            </Box>

            <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff1f2', border: '1px solid #fecaca', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9f1239' }}>
                    Total Accounts Payable (Supplier Debt):
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e11d48' }}>
                    Rs. {totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
            </Paper>

            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
              
               <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Supplier</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField fullWidth label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField fullWidth label="Territory" name="territory" value={formData.territory} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Contact Details" name="contactDetails" value={formData.contactDetails} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Credit Terms" name="creditTerms" value={formData.creditTerms} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleAddSubmit} variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Supplier'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Settle Supplier Debt</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3, mt: 1 }}>
                        Record a payment to <strong>{selectedSupplier?.supplierName}</strong>.
                    </DialogContentText>
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select Bill / Invoice Ref to Pay</InputLabel>
                        <Select
                            value={selectedBillId}
                            label="Select Bill / Invoice Ref to Pay"
                            onChange={(e) => setSelectedBillId(e.target.value as string)}
                        >
                            {unpaidBills.length > 0 ? (
                                unpaidBills.map((bill) => {
                                    const pending = bill.totalAmount - (bill.amountPaid || 0);
                                    return (
                                        <MenuItem key={bill.id} value={bill.id}>
                                            {bill.grnNumber} - Pending: Rs. {pending.toLocaleString()}
                                        </MenuItem>
                                    )
                                })
                            ) : (
                                <MenuItem disabled value="">No pending bills found for this supplier</MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    <TextField fullWidth type="number" label="Payment Amount (Rs.)" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Reference (e.g., Cheque No / Bank Transfer ID)" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
                    <Button onClick={handleProcessPayment} variant="contained" color="success">Process Payment</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupplierManagement;