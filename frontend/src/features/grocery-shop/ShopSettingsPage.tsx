import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Snackbar,
    Alert
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { settingsService, type UserPreferences } from '../admin/services/settingsService';
import { useThemeContext, type ThemeMode } from '../../context/ThemeContext';

const ShopSettingsPage: React.FC = () => {
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    
    const { setThemeMode } = useThemeContext();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const prefs = await settingsService.getShopUserPreferences();
            setUserPreferences(prefs);
        } catch (error) {
            console.error('Failed to load user preferences', error);
        }
    };

    const handleSave = async () => {
        if (!userPreferences) return;
        setIsSaving(true);
        try {
            await settingsService.updateShopUserPreferences(userPreferences);
            setThemeMode(userPreferences.defaultTheme as ThemeMode);
            setNotification({ open: true, message: 'User Preferences saved successfully', severity: 'success' });
        } catch (error) {
            console.error('Failed to save User Preferences', error);
            setNotification({ open: true, message: 'Failed to save User Preferences', severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        loadSettings();
    };

    if (!userPreferences) return <Typography>Loading settings...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'var(--primary-color)' }} />
                <Box>
                    <Typography variant="h4" className="page-title" sx={{ fontWeight: 'bold' }}>
                        Shop Settings
                    </Typography>
                    <Typography variant="body1" className="page-subtitle">
                        Manage your shop dashboard preferences.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ maxWidth: 'md' }}>
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" className="card-title" sx={{ fontWeight: 'bold', mb: 3 }}>
                                User Preferences
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Default Theme</InputLabel>
                                        <Select
                                            value={userPreferences.defaultTheme}
                                            onChange={(e) => setUserPreferences({ ...userPreferences, defaultTheme: e.target.value as string })}
                                            label="Default Theme"
                                        >
                                            <MenuItem value="Light">Light</MenuItem>
                                            <MenuItem value="Dark">Dark</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Dashboard Refresh Interval (Seconds)"
                                        type="number"
                                        value={userPreferences.dashboardRefreshIntervalSeconds}
                                        onChange={(e) => setUserPreferences({ ...userPreferences, dashboardRefreshIntervalSeconds: parseInt(e.target.value) || 60 })}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Items Per Page"
                                        type="number"
                                        value={userPreferences.itemsPerPage}
                                        onChange={(e) => setUserPreferences({ ...userPreferences, itemsPerPage: parseInt(e.target.value) || 10 })}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={userPreferences.enableSystemNotifications}
                                                onChange={(e) => setUserPreferences({ ...userPreferences, enableSystemNotifications: e.target.checked })}
                                                color="primary"
                                            />
                                        }
                                        label="Enable System Notifications"
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                                <Button variant="contained" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ShopSettingsPage;
