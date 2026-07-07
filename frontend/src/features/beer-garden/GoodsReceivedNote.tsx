import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Grid, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api/axiosConfig';

interface Supplier {
    id: string;
    supplierName: string;
}

interface BeerItem {
    id: string;
    beerName: string;
    skuCode: string;
}

interface GrnItemRequest {
    beerItemId: string;
    quantity: number | '';
    unitCost: number | '';
}

const GoodsReceivedNote: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [beerCatalog, setBeerCatalog] = useState<BeerItem[]>([]);
    const [supplierId, setSupplierId] = useState('');
    const [invoiceReference, setInvoiceReference] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CREDIT');
    const [items, setItems] = useState<GrnItemRequest[]>([{ beerItemId: '', quantity: '', unitCost: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
    try {
        const [supplierRes, catalogRes] = await Promise.all([
            api.get('/api/v1/beer-garden/suppliers'),
            api.get('/api/v1/beer-garden/items')
        ]);
        setSuppliers(supplierRes.data);

        const sortedCatalog = catalogRes.data.sort((a: BeerItem, b: BeerItem) => 
            a.beerName.localeCompare(b.beerName)
        );
        
        setBeerCatalog(sortedCatalog);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};
        fetchData();
    }, []);

    const handleItemChange = (index: number, field: keyof GrnItemRequest, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItemRow = () => setItems([...items, { beerItemId: '', quantity: '', unitCost: '' }]);
    const removeItemRow = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + ((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)), 0);
    };

    const handleSubmit = async () => {
        if (!supplierId || !invoiceReference || items.some(i => !i.beerItemId || !i.quantity || !i.unitCost)) {
            return alert("All fields and catalog selections are required.");
        }

        setIsSubmitting(true);
        try {
            await api.post('/api/v1/beer-garden/grn', { 
                supplierId, 
                invoiceReference, 
                paymentMethod, 
                items 
            });
            alert(`GRN processed successfully! Payment: ${paymentMethod}`);
            
            setSupplierId('');
            setInvoiceReference('');
            setPaymentMethod('CREDIT');
            setItems([{ beerItemId: '', quantity: '', unitCost: '' }]);
        } catch (error) {
            console.error("Failed to submit GRN:", error);
            alert("Failed to process GRN. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Purchase Procurement (GRN)</Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                     <Grid size={{ xs: 12, md:4 }}>
                        <TextField select fullWidth label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                            {suppliers.map(sup => <MenuItem key={sup.id} value={sup.id}>{sup.supplierName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md:4 }}>
                        <TextField fullWidth label="Invoice Reference" value={invoiceReference} onChange={(e) => setInvoiceReference(e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, md:4 }}>
                        <TextField select fullWidth label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <MenuItem value="CREDIT">Credit (Add to Supplier Debt)</MenuItem>
                            <MenuItem value="CASH">Cash (Paid Instantly)</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Procurement Items</Typography>
                {items.map((item, index) => (
                    <Grid container spacing={2} key={index} sx={{ alignItems: 'center', mb: 2 }}>
                        <Grid size={{ xs: 4 }}>
                            <TextField select fullWidth label="Select Catalog Item" size="small" value={item.beerItemId} onChange={(e) => handleItemChange(index, 'beerItemId', e.target.value)}>
                                {beerCatalog.length === 0 ? <MenuItem disabled value="">No items found</MenuItem> : null}
                                {beerCatalog.map(beer => (
                                    <MenuItem key={beer.id} value={beer.id}>{beer.beerName}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                            <TextField fullWidth type="number" label="Quantity" size="small" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                            <TextField fullWidth type="number" label="Unit Cost" size="small" value={item.unitCost} onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 2 }} sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 'bold', display: 'inline', mr: 2 }}>
                                Rs. {((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)).toLocaleString()}
                            </Typography>
                            <IconButton color="error" onClick={() => removeItemRow(index)}><DeleteIcon /></IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button onClick={addItemRow} sx={{ mt: 1, fontWeight: 'bold' }}>+ Add Another Item</Button>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1e293b', color: 'white', p: 3, borderRadius: 2 }}>
                <Typography variant="h5">Grand Total: Rs. {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                <Button variant="contained" color="success" size="large" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Confirm & Save Purchase'}
                </Button>
            </Box>
        </Box>
    );
};

export default GoodsReceivedNote;