import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Alert,
  TextField,
  Button
} from '@mui/material';
import { cashSessionService, type CashSession } from '../../services/cashSessionService';
import { getTerminalInfo } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function CashClosingPage() {
  const terminal = getTerminalInfo();
  const shopId = localStorage.getItem('shopId');
  const navigate = useNavigate();
  const [session, setSession] = useState<CashSession | null>(null);
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [actualCash, setActualCash] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (terminal) {
      loadSession();
      const interval = setInterval(loadSession, 5000); // Poll for live totals
      return () => clearInterval(interval);
    }
  }, [terminal]);

  const loadSession = async () => {
    if (!terminal || !terminal.terminalId) return;
    try {
      const current = await cashSessionService.getCurrentOpenSession(terminal.terminalId);
      setSession(current);
      if (current) {
        // If session is open and actualCash hasn't been modified heavily, preset it
        setActualCash(prev => prev === 0 ? current.expectedCash : prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenShift = async () => {
    if (!terminal || !terminal.terminalId || !shopId) return;
    try {
      setError('');
      await cashSessionService.openSession(shopId, terminal.terminalId, openingCash);
      loadSession();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to open session');
    }
  };

  const handleCloseShift = async () => {
    if (!session) return;
    try {
      setError('');
      await cashSessionService.closeSession(session.id, actualCash, notes);
      
      const closedSessionId = session.id;
      
      loadSession();
      setActualCash(0);
      setNotes('');
      
      // Redirect to print closing sheet
      navigate(`/shop/documents/cash-sessions/${closedSessionId}/closing-sheet`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close session');
    }
  };

  if (!terminal || !terminal.terminalId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please select a terminal to manage cash sessions.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Cash Management - Terminal: {terminal.terminalCode}</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!session ? (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Open New Shift</Typography>
            <TextField
              label="Opening Cash (Drawer Amount)"
              type="number"
              fullWidth
              value={openingCash}
              onChange={(e) => setOpeningCash(Number(e.target.value))}
              sx={{ mb: 3 }}
            />
            <Button variant="contained" fullWidth size="large" onClick={handleOpenShift}>
              Open Shift
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Current Session Totals</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Opened At:</Typography>
                  <Typography>{new Date(session.openedAt).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Opening Cash:</Typography>
                  <Typography>Rs. {session.openingCash.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Cash Sales:</Typography>
                  <Typography sx={{ color: 'success.main' }}>Rs. {session.cashSalesTotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Card Sales:</Typography>
                  <Typography sx={{ color: 'primary.main' }}>Rs. {session.cardSalesTotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Credit Sales:</Typography>
                  <Typography sx={{ color: 'error.main' }}>Rs. {session.creditSalesTotal.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Expected Cash in Drawer:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Rs. {session.expectedCash.toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Close Shift</Typography>
                <TextField
                  label="Actual Cash Counted"
                  type="number"
                  fullWidth
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography>Difference (Short/Over):</Typography>
                  <Typography sx={{ color: (actualCash - session.expectedCash) < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                    Rs. {(actualCash - session.expectedCash).toFixed(2)}
                  </Typography>
                </Box>

                <TextField
                  label="Notes / Explanation"
                  multiline
                  rows={3}
                  fullWidth
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button variant="contained" color="error" fullWidth size="large" onClick={handleCloseShift}>
                  Close Shift & Reconcile
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}
