import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Dialog, DialogActions, DialogContent, DialogTitle, TextField, DialogContentText, Grid } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../api/axiosConfig';

interface BeerItem {
    id: string;
    itemCode: string;
    beerName: string;
    category: string;
    currentStock: number;
    unitPrice: number;
}

const PriceMatrix: React.FC = () => {
    const [prices, setPrices] = useState<BeerItem[]>([]);
    
    // Edit Price State
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedBeer, setSelectedBeer] = useState('');
    const [newPrice, setNewPrice] = useState<number | string>('');
    const [selectedBeerId, setSelectedBeerId] = useState('');
    
    // Add Item State
    const [openAdd, setOpenAdd] = useState(false);
    const [newItem, setNewItem] = useState({ beerName: '', category: '', unitPrice: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchText, setSearchText] = useState('');

    const fetchPrices = async () => {
        try {
            const response = await api.get<BeerItem[]>('/api/v1/beer-garden/items');
            setPrices(response.data);
        } catch (error) {
            console.error("Failed to load prices:", error);
        }
    };

    useEffect(() => { fetchPrices(); }, []);

    const userRole = localStorage.getItem('user_role');

    const columns: GridColDef[] = [
        { field: 'itemCode', headerName: 'SKU Code', flex: 1, sortable: true },
        { field: 'beerName', headerName: 'Beer Name', flex: 2, sortable: true },
        { field: 'category', headerName: 'Category', flex: 1, sortable: true },
        { field: 'currentStock', headerName: 'Current Stock', flex: 1, type: 'number' },
        { 
            field: 'unitPrice', 
            headerName: 'Selling Price (Rs.)', 
            flex: 1, 
            type: 'number',
            sortable: true,
            valueFormatter: (value) => value ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                userRole === 'ROLE_ADMIN' ? (
                    <Button variant="outlined" color="warning" size="small" onClick={() => { 
                        setSelectedBeerId(params.row.id);
                        setSelectedBeer(params.row.beerName); 
                        setNewPrice(params.row.unitPrice); 
                        setOpenEdit(true); 
                    }}>
                        Revise
                    </Button>
                ) : <Typography variant="caption">View Only</Typography>
            )
        }
    ];

    const filteredPrices = prices.filter((beer) => 
        beer.beerName.toLowerCase().includes(searchText.toLowerCase()) || 
        (beer.itemCode && beer.itemCode.toLowerCase().includes(searchText.toLowerCase()))
    );

    const handleUpdatePrice = async () => {
        if (!newPrice) return;
        try {
            await api.put(`/api/v1/beer-garden/items/${selectedBeerId}/price`, 
                { newPrice: Number(newPrice) },
                { headers: { 'X-User-Role': userRole } } 
            );
            alert("Price successfully revised and logged to history!");
            setOpenEdit(false);
            fetchPrices(); 
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update. Are you an Admin?");
        }
    };

    const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

    const handleAddItem = async () => {
        if (!newItem.beerName || !newItem.unitPrice) return alert("Beer Name and Unit Price are required!");
        setIsSubmitting(true);
        try {
            await api.post('/api/v1/beer-garden/items', {
                beerName: newItem.beerName,
                category: newItem.category,
                unitPrice: Number(newItem.unitPrice),
                currentStock: 0 
            }, { headers: { 'X-User-Role': userRole } });
            
            alert("New item added to Master Catalog!");
            setOpenAdd(false);
            setNewItem({ beerName: '', category: '', unitPrice: '' });
            fetchPrices(); 
        } catch (error) {
            console.error("Add failed", error);
            alert("Failed to add new item. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ padding: 3, height: 650, width: '100%' }}>
            <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#451a03' }}>Master Price Matrix</Typography>
                
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search Name or SKU..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ width: '250px', backgroundColor: 'white', borderRadius: 1 }}
                    />
                    {userRole === 'ROLE_ADMIN' && (
                        <Button variant="contained" color="success" onClick={() => setOpenAdd(true)}>
                            + Add New Beer
                        </Button>
                    )}
                </Stack>
            </Stack>
            
            <DataGrid 
                rows={filteredPrices} 
                columns={columns} 
                slots={{ toolbar: GridToolbar }} 
                initialState={{ sorting: { sortModel: [{ field: 'beerName', sort: 'asc' }] } }}
            />

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Revise Selling Price</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2, mt: 1 }}>Update the current selling price for this item.</DialogContentText>
                    <TextField fullWidth label="Beer Name" value={selectedBeer} disabled sx={{ mb: 2 }} />
                    <TextField fullWidth type="number" label="New Unit Price (Rs.)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleUpdatePrice} variant="contained" color="warning">Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Beer to Catalog</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Beer Name (Required)" name="beerName" value={newItem.beerName} onChange={handleNewItemChange} required />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField fullWidth label="Category" name="category" value={newItem.category} onChange={handleNewItemChange} placeholder="e.g. Lager, Stout" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth type="number" label="Initial Selling Price (Rs.)" name="unitPrice" value={newItem.unitPrice} onChange={handleNewItemChange} required />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleAddItem} variant="contained" color="success" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PriceMatrix;