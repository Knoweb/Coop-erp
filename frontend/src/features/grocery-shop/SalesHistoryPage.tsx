import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import api from '../../api/axiosConfig';
import { getTerminalInfo } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

type FilterType = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';

export default function SalesHistoryPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('TODAY');

  const { terminalId, terminalCode } = getTerminalInfo();

  useEffect(() => {
    applyFilterType('TODAY');
  }, []);

  const applyFilterType = (type: FilterType) => {
    setFilterType(type);

    if (type === 'CUSTOM') {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    let end = new Date(today);
    end.setHours(23, 59, 59, 999);

    if (type === 'YESTERDAY') {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (type === 'THIS_WEEK') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start.setDate(diff);
    } else if (type === 'THIS_MONTH') {
      start.setDate(1);
    }

    setFromDate(formatDateForInput(start));
    setToDate(formatDateForInput(end));

    // Slight delay to ensure state updates before fetch
    setTimeout(() => {
      fetchSales(formatDateForInput(start), formatDateForInput(end));
    }, 0);
  };

  const formatDateForInput = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const fetchSales = async (start = fromDate, end = toDate) => {
    try {
      const params: any = {};
      if (start) params.fromDate = start + 'T00:00:00';
      if (end) params.toDate = end + 'T23:59:59';
      if (terminalId) params.terminalId = terminalId;
      if (paymentMethod) params.paymentMethod = paymentMethod;

      const response = await api.get('/shop/sales/history', { params });
      setSales(response.data);
    } catch (err) {
      console.error('Failed to load sales history');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sales History</Typography>
        {terminalCode && (
          <Chip
            label={`Terminal: ${terminalCode}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label="Today"
            onClick={() => applyFilterType('TODAY')}
            color={filterType === 'TODAY' ? 'primary' : 'default'}
            variant={filterType === 'TODAY' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Yesterday"
            onClick={() => applyFilterType('YESTERDAY')}
            color={filterType === 'YESTERDAY' ? 'primary' : 'default'}
            variant={filterType === 'YESTERDAY' ? 'filled' : 'outlined'}
          />
          <Chip
            label="This Week"
            onClick={() => applyFilterType('THIS_WEEK')}
            color={filterType === 'THIS_WEEK' ? 'primary' : 'default'}
            variant={filterType === 'THIS_WEEK' ? 'filled' : 'outlined'}
          />
          <Chip
            label="This Month"
            onClick={() => applyFilterType('THIS_MONTH')}
            color={filterType === 'THIS_MONTH' ? 'primary' : 'default'}
            variant={filterType === 'THIS_MONTH' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Custom"
            onClick={() => applyFilterType('CUSTOM')}
            color={filterType === 'CUSTOM' ? 'primary' : 'default'}
            variant={filterType === 'CUSTOM' ? 'filled' : 'outlined'}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
          <Box>
            <TextField
              label="From Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setFilterType('CUSTOM');
              }}
              disabled={filterType !== 'CUSTOM'}
            />
          </Box>
          <Box>
            <TextField
              label="To Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setFilterType('CUSTOM');
              }}
              disabled={filterType !== 'CUSTOM'}
            />
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e: any) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value=""><em>All Methods</em></MenuItem>
                <MenuItem value="CASH">CASH</MenuItem>
                <MenuItem value="CARD">CARD</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Button variant="contained" fullWidth onClick={() => fetchSales()} sx={{ py: 1.5 }}>Filter</Button>
          </Box>
        </Box>
      </Paper>

      {sales.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Use the Print Invoice action beside a sale to generate the printable invoice.
        </Typography>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Sale Number</TableCell>
              <TableCell>Terminal</TableCell>
              <TableCell>Cashier</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{new Date(sale.saleDate).toLocaleString()}</TableCell>
                <TableCell>{sale.saleNumber}</TableCell>
                <TableCell>{sale.terminalCode || 'N/A'}</TableCell>
                <TableCell>{sale.cashierUsername}</TableCell>
                <TableCell>{sale.paymentMethod || 'N/A'}</TableCell>
                <TableCell align="right">Rs. {sale.totalAmount.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate(`/shop/documents/sales/${sale.id}/invoice`)}
                  >
                    Print Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No sales found. Create a sale from Sales (POS) first, then come back here to print the invoice.
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/shop/sales')} sx={{ mt: 2 }}>
                    Go to POS
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
