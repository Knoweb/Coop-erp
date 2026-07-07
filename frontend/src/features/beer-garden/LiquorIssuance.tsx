import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Grid, Paper, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import api from '../../api/axiosConfig';

interface BeerItem {
    id: string;
    itemCode: string;
    beerName: string;
    unitPrice: number;
    currentStock: number;
}

const LiquorIssuance: React.FC = () => {
    const [catalog, setCatalog] = useState<BeerItem[]>([]);
    
    const [operatorName, setOperatorName] = useState('');
    const [globalCommission, setGlobalCommission] = useState<number | string>(''); 
    
    const [items, setItems] = useState([{ beerItemId: '', quantity: '', unitPrice: 0 }]);
    const [invoiceGenerated, setInvoiceGenerated] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await api.get('/api/v1/beer-garden/items');
                setCatalog(res.data.filter((b: BeerItem) => b.currentStock > 0));
            } catch (error) {
                console.error("Failed to fetch catalog", error);
            }
        };
        fetchCatalog();
    }, []);

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        if (field === 'beerItemId') {
            const selectedBeer = catalog.find(b => b.id === value);
            newItems[index] = { ...newItems[index], beerItemId: value, unitPrice: selectedBeer?.unitPrice || 0 };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const addItemRow = () => setItems([...items, { beerItemId: '', quantity: '', unitPrice: 0 }]);
    const removeItemRow = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        let stockVal = 0;
        let commVal = 0;
        const safeCommission = Number(globalCommission) || 0; 

        items.forEach(item => {
            const qty = Number(item.quantity) || 0;
            stockVal += qty * item.unitPrice;
            commVal += qty * safeCommission;
        });
        return { stockVal, commVal, grandTotal: stockVal + commVal };
    };

    const handleIssue = async () => {
        if (!operatorName.trim() || globalCommission === '' || items.some(i => !i.beerItemId || !i.quantity)) {
            return alert("Please fill all fields correctly, including Operator Name and Commission.");
        }
        
        setIsSubmitting(true);
        
        try {
            const safeCommission = Number(globalCommission) || 0;
            const payload = {
                restaurantOperatorName: operatorName, 
                totalLiquorValue: stockVal,           
                commissionPerUnit: safeCommission,  
                items: items.map(i => ({
                    beerItemId: i.beerItemId,
                    quantity: Number(i.quantity)
                }))
            };
            
            const userRole = localStorage.getItem('user_role');
            const res = await api.post('/api/v1/beer-garden/issuances', payload, { headers: { 'X-User-Role': userRole } });
            setInvoiceGenerated(res.data);
            alert("Issuance Successful! Ready to print.");
        } catch (error: any) {
            alert("Failed to issue stock. Check console. " + (error.response?.data || ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    const { stockVal, commVal, grandTotal } = calculateTotals();

    return (
        <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            
            <Box className="no-print">
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Restaurant Issuance</Typography>
                
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 8 }}>
                            <TextField 
                                fullWidth 
                                label="Restaurant Operator Name" 
                                value={operatorName} 
                                onChange={(e) => setOperatorName(e.target.value)} 
                                placeholder="Enter operator name" 
                            />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <TextField 
                                fullWidth 
                                type="number" 
                                label="Commission per Bottle (Rs.)" 
                                value={globalCommission} 
                                onChange={(e) => setGlobalCommission(e.target.value)} 
                                placeholder="e.g. 50"
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Issued Items</Typography>
                    {items.map((item, index) => (
                        <Grid container spacing={2} key={index} sx={{ alignItems: 'center', mb: 2 }}>
                            <Grid size={{ xs: 5 }}>
                                <TextField select fullWidth label="Select Beer" size="small" value={item.beerItemId} onChange={(e) => handleItemChange(index, 'beerItemId', e.target.value)}>
                                    {catalog.map(beer => (
                                        <MenuItem key={beer.id} value={beer.id}>{beer.beerName} (Stock: {beer.currentStock})</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <TextField fullWidth type="number" label="Quantity" size="small" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Typography variant="body2">Price: Rs. {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                                <Typography variant="caption" color="textSecondary">+ Rs.{Number(globalCommission) || 0} Comm.</Typography>
                            </Grid>
                            <Grid size={{ xs: 1 }}>
                                <IconButton color="error" onClick={() => removeItemRow(index)}><DeleteIcon /></IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button onClick={addItemRow} sx={{ mt: 1, fontWeight: 'bold' }}>+ Add Another Item</Button>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1e293b', color: 'white', p: 3, borderRadius: 2 }}>
                    <Box>
                        <Typography variant="subtitle1">Stock Value: Rs. {stockVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        <Typography variant="subtitle1">Commission: Rs. {commVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        <Typography variant="h5" sx={{ mt: 1, color: '#facc15' }}>Grand Total: Rs. {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box>
                        {invoiceGenerated ? (
                            <Button variant="contained" color="info" size="large" startIcon={<PrintIcon />} onClick={() => window.print()}>
                                Print Invoice
                            </Button>
                        ) : (
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large" 
                                onClick={handleIssue}
                                disabled={isSubmitting} 
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm & Generate Invoice'}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
            {invoiceGenerated && (
                <Box className="print-only" sx={{ display: 'none' }}>
                    <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>HIKKADUWA CO-OP BEER GARDEN</Typography>
                    <Typography variant="h6" align="center" sx={{ mb: 4 }}>ISSUANCE INVOICE</Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography><strong>Invoice No:</strong> {invoiceGenerated.invoiceNumber}</Typography>
                        <Typography><strong>Date:</strong> {new Date(invoiceGenerated.issuedDate).toLocaleDateString()}</Typography>
                    </Box>
                    <Typography sx={{ mb: 3 }}><strong>Operator:</strong> {invoiceGenerated.operatorName}</Typography>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
                                <th>Item ID</th>
                                <th>Quantity</th>
                                <th>Unit Price (Rs)</th>
                                <th>Commission (Rs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => {
                                const b = catalog.find(x => x.id === it.beerItemId);
                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                                        <td style={{ padding: '8px 0' }}>{b?.beerName}</td>
                                        <td>{it.quantity}</td>
                                        <td>{it.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{(Number(it.quantity) * (Number(globalCommission) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <Box sx={{ width: '50%', marginLeft: 'auto', mb: 8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Total Stock Value:</Typography>
                            <Typography>Rs. {invoiceGenerated.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Total Commission:</Typography>
                            <Typography>Rs. {invoiceGenerated.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        <Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: 'black' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>GRAND TOTAL:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Rs. {invoiceGenerated.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                        </Box>
                        <Divider sx={{ my: 1, borderBottomWidth: 4, borderColor: 'black' }} />
                    </Box>

                    {/* Signatures */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 10 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography>_________________________</Typography>
                            <Typography variant="caption">Bar Keeper</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography>_________________________</Typography>
                            <Typography variant="caption">Authorised Officer</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography>_________________________</Typography>
                            <Typography variant="caption">Manager Beer Garden</Typography>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default LiquorIssuance;