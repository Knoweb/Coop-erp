import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid'; 
import api from '../../api/axiosConfig';

interface PurchaseRecord {
    id: string;
    grnNumber: string;
    receivedDate: string;
    supplierName: string;
    beerName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    amountPaid: number;
    balanceDue: number;
}

const PurchaseHistory: React.FC = () => {
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await api.get('/api/v1/beer-garden/purchase-history');
                setPurchases(response.data);
            } catch (error) {
                console.error("Error fetching purchase history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
    }, []);

    const columns: GridColDef[] = [
        { field: 'receivedDate', headerName: 'Date', flex: 1, valueFormatter: (val) => new Date(val).toLocaleDateString() },
        { field: 'grnNumber', headerName: 'Invoice/GRN', flex: 1 },
        { field: 'supplierName', headerName: 'Supplier', flex: 1.5 },
        { field: 'beerName', headerName: 'Beer Type', flex: 1.5 },
        { field: 'quantity', headerName: 'Bottles', type: 'number', flex: 0.8 },
        { field: 'unitPrice', headerName: 'Unit Price', type: 'number', flex: 1, valueFormatter: (val) => `Rs. ${Number(val).toLocaleString()}` },
        { field: 'totalPrice', headerName: 'Total Price', type: 'number', flex: 1, valueFormatter: (val) => `Rs. ${Number(val).toLocaleString()}` },
        { 
            field: 'amountPaid', 
            headerName: 'Paid', 
            type: 'number', 
            flex: 1, 
            renderCell: (params) => (
                <Typography sx={{ color: '#166534', fontWeight: 'bold', fontSize: '0.875rem', mt: 1.5 }}>
                    Rs. {Number(params.value).toLocaleString()}
                </Typography>
            )
        },
        { 
            field: 'balanceDue', 
            headerName: 'Pending', 
            type: 'number', 
            flex: 1,
            renderCell: (params) => (
                <Chip 
                    label={`Rs. ${Number(params.value).toLocaleString()}`} 
                    color={params.value > 0 ? "error" : "success"}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            )
        }
    ];

    return (
        <Box sx={{ padding: 3, height: '80vh', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#451a03', mb: 3 }}>
                Itemized Purchase Ledger
            </Typography>
            <Paper elevation={3} sx={{ height: '100%', width: '100%' }}>
                <DataGrid 
                    rows={purchases} 
                    columns={columns} 
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    initialState={{
                        sorting: { sortModel: [{ field: 'receivedDate', sort: 'desc' }] },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default PurchaseHistory;