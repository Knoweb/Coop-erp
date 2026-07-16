import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Grid
} from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import type { ShopTerminal } from '../../services/terminalService';
import { terminalService } from '../../services/terminalService';
import { setTerminalInfo } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useThemeContext, type ThemeMode } from '../../context/ThemeContext';
import { settingsService } from '../admin/services/settingsService';

interface TerminalSelectionModalProps {
  open: boolean;
  onClose?: () => void;
  onTerminalSelected: () => void;
}

const TerminalSelectionModal: React.FC<TerminalSelectionModalProps> = ({ open, onClose, onTerminalSelected }) => {
  const [terminals, setTerminals] = useState<ShopTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setThemeMode } = useThemeContext();

  useEffect(() => {
    if (open) {
      loadTerminals();
    }
  }, [open]);

  const loadTerminals = async () => {
    try {
      setLoading(true);
      const data = await terminalService.getActiveTerminalsForCurrentShop();
      setTerminals(data);
      
      // Auto-select if there is only 1 terminal
      if (data.length === 1) {
        handleSelectTerminal(data[0]);
      }
    } catch (error) {
      console.error('Failed to load terminals:', error);
      setApiError('Failed to communicate with server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTerminal = async (terminal: ShopTerminal) => {
    setTerminalInfo(terminal.id, terminal.terminalCode);
    
    // Load theme for specific terminal
    try {
      const prefs = await settingsService.getShopUserPreferences(terminal.id);
      setThemeMode((prefs.defaultTheme as ThemeMode) || "Light");
    } catch (error) {
      setThemeMode("Light");
    }
    
    onTerminalSelected();
  };

  const handleLogout = () => {
    // If user refuses to select terminal or cancels, logout
    if (onClose) {
        onClose();
    } else {
        localStorage.clear();
        navigate('/login');
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>Select POS Terminal</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please select the physical terminal you are operating from. This ensures accurate tracking of sales and stock.
        </Typography>
        
        {loading ? (
          <Typography>Loading available terminals...</Typography>
        ) : apiError ? (
          <Typography color="error">
            {apiError}
          </Typography>
        ) : terminals.length === 0 ? (
          <Typography color="error">
            No active terminals found for this shop. Please contact the administrator.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {terminals.map((terminal) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={terminal.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderColor: 'primary.main',
                    borderWidth: 2,
                    '&:hover': { backgroundColor: 'primary.50' }
                  }}
                >
                  <CardActionArea onClick={() => handleSelectTerminal(terminal)} sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <PointOfSaleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6">{terminal.terminalCode}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {terminal.terminalName || 'Main POS'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="inherit">
          Cancel / Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TerminalSelectionModal;
