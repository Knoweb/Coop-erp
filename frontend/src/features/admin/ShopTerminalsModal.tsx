import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, TextField, IconButton, Chip, Box, Switch, FormControlLabel,
    Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, PowerSettingsNew as PowerIcon } from '@mui/icons-material';
import type { ShopTerminal } from '../../services/terminalService';
import { terminalService } from '../../services/terminalService';

interface ShopTerminalsModalProps {
    open: boolean;
    shopId: string;
    shopName: string;
    onClose: () => void;
}

const ShopTerminalsModal: React.FC<ShopTerminalsModalProps> = ({ open, shopId, shopName, onClose }) => {
    const [terminals, setTerminals] = useState<ShopTerminal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // New Terminal state
    const [isAdding, setIsAdding] = useState(false);
    const [newTerminal, setNewTerminal] = useState<Partial<ShopTerminal>>({ terminalCode: '', terminalName: '', deviceIdentifier: '', isActive: true });

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<ShopTerminal>>({});

    useEffect(() => {
        if (open && shopId) {
            fetchTerminals();
        }
    }, [open, shopId]);

    const fetchTerminals = async () => {
        setLoading(true);
        try {
            const data = await terminalService.getShopTerminals(shopId);
            setTerminals(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch terminals');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await terminalService.createShopTerminal(shopId, newTerminal);
            setIsAdding(false);
            setNewTerminal({ terminalCode: '', terminalName: '', deviceIdentifier: '', isActive: true });
            fetchTerminals();
        } catch (err) {
            setError('Failed to create terminal. Code might be duplicate.');
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        try {
            await terminalService.updateShopTerminal(shopId, editingId, editData);
            setEditingId(null);
            fetchTerminals();
        } catch (err) {
            setError('Failed to update terminal.');
        }
    };

    const handleToggleStatus = async (terminalId: string, currentStatus: boolean) => {
        try {
            await terminalService.updateTerminalStatus(shopId, terminalId, !currentStatus);
            fetchTerminals();
        } catch (err) {
            setError('Failed to toggle status');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Manage Terminals - {shopName}</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        color="primary"
                        onClick={() => setIsAdding(true)}
                        disabled={isAdding}
                    >
                        Add Terminal
                    </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                            <TableRow>
                                <TableCell><b>Terminal Code</b></TableCell>
                                <TableCell><b>Name/Desc</b></TableCell>
                                <TableCell><b>Device ID</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell align="right"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isAdding && (
                                <TableRow>
                                    <TableCell>
                                        <TextField size="small" value={newTerminal.terminalCode} onChange={(e) => setNewTerminal({...newTerminal, terminalCode: e.target.value})} placeholder="POS-01" autoFocus />
                                    </TableCell>
                                    <TableCell>
                                        <TextField size="small" value={newTerminal.terminalName} onChange={(e) => setNewTerminal({...newTerminal, terminalName: e.target.value})} placeholder="Main Counter" />
                                    </TableCell>
                                    <TableCell>
                                        <TextField size="small" value={newTerminal.deviceIdentifier} onChange={(e) => setNewTerminal({...newTerminal, deviceIdentifier: e.target.value})} placeholder="Optional MAC/IP" />
                                    </TableCell>
                                    <TableCell>
                                        <FormControlLabel control={<Switch size="small" checked={newTerminal.isActive} onChange={(e) => setNewTerminal({...newTerminal, isActive: e.target.checked})} />} label="" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={handleCreate} disabled={!newTerminal.terminalCode}><SaveIcon /></IconButton>
                                        <IconButton color="default" onClick={() => setIsAdding(false)}><CancelIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )}
                            
                            {loading && !isAdding && (
                                <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
                            )}

                            {!loading && terminals.length === 0 && !isAdding && (
                                <TableRow><TableCell colSpan={5} align="center">No terminals configured.</TableCell></TableRow>
                            )}

                            {terminals.map(terminal => {
                                const isEditing = editingId === terminal.id;
                                return (
                                    <TableRow key={terminal.id}>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField size="small" value={editData.terminalCode} onChange={(e) => setEditData({...editData, terminalCode: e.target.value})} />
                                            ) : terminal.terminalCode}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField size="small" value={editData.terminalName} onChange={(e) => setEditData({...editData, terminalName: e.target.value})} />
                                            ) : terminal.terminalName}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField size="small" value={editData.deviceIdentifier} onChange={(e) => setEditData({...editData, deviceIdentifier: e.target.value})} />
                                            ) : terminal.deviceIdentifier}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={terminal.isActive ? 'Active' : 'Inactive'} color={terminal.isActive ? 'success' : 'default'} size="small" />
                                        </TableCell>
                                        <TableCell align="right">
                                            {isEditing ? (
                                                <>
                                                    <IconButton color="primary" onClick={handleUpdate}><SaveIcon /></IconButton>
                                                    <IconButton color="default" onClick={() => setEditingId(null)}><CancelIcon /></IconButton>
                                                </>
                                            ) : (
                                                <>
                                                    <IconButton color="primary" onClick={() => { setEditingId(terminal.id); setEditData(terminal); }}><EditIcon /></IconButton>
                                                    <IconButton color={terminal.isActive ? 'error' : 'success'} onClick={() => handleToggleStatus(terminal.id, terminal.isActive)}><PowerIcon /></IconButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShopTerminalsModal;
