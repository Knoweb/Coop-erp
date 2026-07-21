import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
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
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  HourglassEmpty as ProcessingIcon
} from '@mui/icons-material';


interface Log {
  id: string;
  createdAt: string;
  sourceModule?: string;
  sourceRefId?: string;
  referenceType?: string;
  referenceId?: string;
  action?: string;
  status: string;
  retryCount: number;
  errorMessage?: string;
}

export default function AccountingIntegrationPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/accounting-integration/outbox`);
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch accounting logs:', err);
      setError('Failed to load accounting integration logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />;
      case 'FAILED':
        return <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />;
      case 'PROCESSING':
        return <Chip icon={<ProcessingIcon />} label="Processing" color="warning" size="small" />;
      case 'PENDING':
      default:
        return <Chip icon={<PendingIcon />} label="Pending" color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Accounting Integration Status</Typography>
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={fetchLogs} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Coop operations are posted to Ginum asynchronously. Failed items can be retried here.
      </Typography>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#ffebee', color: '#c62828' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Ref ID</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Retries</TableCell>
              <TableCell>Error Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No accounting postings yet. Complete a POS sale or GRN to create a posting.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell>{log.referenceType || log.sourceModule}</TableCell>
                <TableCell>{log.referenceId || log.sourceRefId}</TableCell>
                <TableCell>{log.action || 'POST'}</TableCell>
                <TableCell>{getStatusChip(log.status)}</TableCell>
                <TableCell>{log.retryCount}</TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Tooltip title={log.errorMessage || ''}>
                    <span>{log.errorMessage || '-'}</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
