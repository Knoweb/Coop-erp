import React, { useState } from 'react';
import { 
    Box, Typography, Card, CardContent, TextField, Button, 
    Switch, FormControlLabel, MenuItem, CircularProgress, Alert, Snackbar, Paper
} from '@mui/material';
import { 
    Business as BusinessIcon, 
    Security as SecurityIcon, 
    Person as PersonIcon, 
    SettingsBackupRestore as BackupIcon 
} from '@mui/icons-material';
import { useThemeContext, type ThemeMode } from "../../context/ThemeContext";
import { settingsService, type UserPreferences, type BusinessProfile, type SecuritySettings, type BackupSettings } from './services/settingsService';

type ActiveTab = 'business' | 'security' | 'preferences' | 'backup';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // States for each form
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);

    const { setThemeMode } = useThemeContext();

    const settingCards: { id: ActiveTab, title: string, icon: React.ReactNode, desc: string }[] = [
        { id: 'business', title: 'Business Profile', icon: <BusinessIcon fontSize="large" color="primary" />, desc: 'Manage main shop details, tax information, and receipts.' },
        { id: 'security', title: 'Security Settings', icon: <SecurityIcon fontSize="large" color="primary" />, desc: 'Configure password policies, sessions, and locking.' },
        { id: 'preferences', title: 'User Preferences', icon: <PersonIcon fontSize="large" color="primary" />, desc: 'Personalize dashboard layout and notification settings.' },
        { id: 'backup', title: 'Backup & Maintenance', icon: <BackupIcon fontSize="large" color="primary" />, desc: 'Schedule database backups and system maintenance.' },
    ];

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setNotification({ open: true, message, severity });
    };

    const loadSettings = async (tabId: ActiveTab, forceReload: boolean = false) => {
        setIsLoading(true);
        try {
            switch (tabId) {
                case 'business':
                    if (!businessProfile || forceReload) setBusinessProfile(await settingsService.getBusinessProfile());
                    break;
                case 'security':
                    if (!securitySettings || forceReload) setSecuritySettings(await settingsService.getSecuritySettings());
                    break;
                case 'preferences':
                    if (!userPreferences || forceReload) setUserPreferences(await settingsService.getUserPreferences());
                    break;
                case 'backup':
                    if (!backupSettings || forceReload) setBackupSettings(await settingsService.getBackupSettings());
                    break;
            }
        } catch (error: any) {
            handleApiError(error, 'Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApiError = (error: any, defaultMessage: string) => {
        if (error.response) {
            if (error.response.status === 401) {
                showNotification('Session expired. Please log in again.', 'error');
            } else if (error.response.status === 403) {
                showNotification('Unauthorized to access settings.', 'error');
            } else {
                showNotification(error.response.data?.message || defaultMessage, 'error');
            }
        } else if (error.request) {
            showNotification('Network error. Backend is unavailable.', 'error');
        } else {
            showNotification(defaultMessage, 'error');
        }
    };

    const handleTabClick = (tabId: ActiveTab) => {
        if (activeTab === tabId) {
            setActiveTab(null);
        } else {
            setActiveTab(tabId);
            loadSettings(tabId);
        }
    };

    const handleCancel = (tabId: ActiveTab) => {
        loadSettings(tabId, true);
    };

    const handleSaveBusiness = async () => {
        if (!businessProfile) return;
        
        if (!businessProfile.businessName) {
            showNotification('Business Name is required', 'error');
            return;
        }
        if (!businessProfile.mainShopName) {
            showNotification('Main Shop Name is required', 'error');
            return;
        }
        if (businessProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessProfile.email)) {
            showNotification('Invalid email format', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await settingsService.updateBusinessProfile(businessProfile);
            showNotification('Business Profile saved successfully', 'success');
        } catch (error) {
            handleApiError(error, 'Failed to save Business Profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSecurity = async () => {
        if (!securitySettings) return;

        if (securitySettings.minimumPasswordLength < 6) {
            showNotification('Minimum password length must be at least 6', 'error');
            return;
        }
        if (securitySettings.sessionTimeoutMinutes < 5) {
            showNotification('Session timeout must be at least 5 minutes', 'error');
            return;
        }
        if (securitySettings.maxLoginAttempts < 1) {
            showNotification('Max login attempts must be at least 1', 'error');
            return;
        }
        if (securitySettings.accountLockMinutes < 1) {
            showNotification('Account lock minutes must be at least 1', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await settingsService.updateSecuritySettings(securitySettings);
            showNotification('Security Settings saved successfully', 'success');
        } catch (error) {
            handleApiError(error, 'Failed to save Security Settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        if (!userPreferences) return;
        setIsSaving(true);
        try {
            await settingsService.updateUserPreferences(userPreferences);
            setThemeMode(userPreferences.defaultTheme as ThemeMode);
            showNotification('User Preferences saved successfully', 'success');
        } catch (error) {
            handleApiError(error, 'Failed to save User Preferences');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBackup = async () => {
        if (!backupSettings) return;
        setIsSaving(true);
        try {
            await settingsService.updateBackupSettings(backupSettings);
            showNotification('Backup Settings saved successfully', 'success');
        } catch (error) {
            handleApiError(error, 'Failed to save Backup Settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRunBackupNow = async () => {
        try {
            const result = await settingsService.runManualBackup();
            showNotification(result.message || 'Backup triggered successfully', 'success');
            if (activeTab === 'backup') {
                loadSettings('backup', true);
            }
        } catch (error: any) {
            handleApiError(error, 'Failed to trigger backup');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" className="page-title" sx={{ fontWeight: 'bold' }}>
                    Settings
                </Typography>
                <Typography color="text.secondary">
                    Configure system preferences for the Coop Grocery Management System.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                {settingCards.map((card) => (
                    <Box key={card.id} sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5, boxSizing: 'border-box' }}>
                        <Card 
                            onClick={() => handleTabClick(card.id)}
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: activeTab === card.id ? '2px solid #3b82f6' : '1px solid transparent',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', flexGrow: 1, py: 4 }}>
                                <Box sx={{ mb: 2 }}>{card.icon}</Box>
                                <Typography variant="h6" className="card-title" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {card.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {card.desc}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            {activeTab && (
                <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                    ) : (
                        <>
                            {activeTab === 'business' && businessProfile && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Business Profile</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <TextField fullWidth label="Business Name" value={businessProfile.businessName ?? ""} onChange={e => setBusinessProfile({...businessProfile, businessName: e.target.value})} />
                                        <TextField fullWidth label="Main Shop Name" value={businessProfile.mainShopName ?? ""} onChange={e => setBusinessProfile({...businessProfile, mainShopName: e.target.value})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <TextField fullWidth label="Address" value={businessProfile.address ?? ""} onChange={e => setBusinessProfile({...businessProfile, address: e.target.value})} />
                                        </Box>
                                        <TextField fullWidth label="Phone Number" value={businessProfile.phone ?? ""} onChange={e => setBusinessProfile({...businessProfile, phone: e.target.value})} />
                                        <TextField fullWidth label="Email" type="email" value={businessProfile.email ?? ""} onChange={e => setBusinessProfile({...businessProfile, email: e.target.value})} />
                                        <TextField fullWidth label="Tax Number" value={businessProfile.taxNumber ?? ""} onChange={e => setBusinessProfile({...businessProfile, taxNumber: e.target.value})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <TextField fullWidth label="Receipt Footer Text" multiline rows={2} value={businessProfile.receiptFooter ?? ""} onChange={e => setBusinessProfile({...businessProfile, receiptFooter: e.target.value})} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => handleCancel('business')}>Cancel</Button>
                                        <Button variant="contained" onClick={handleSaveBusiness} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 'security' && securitySettings && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Security Settings</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <TextField fullWidth type="number" label="Minimum Password Length" value={securitySettings.minimumPasswordLength ?? ""} onChange={e => setSecuritySettings({...securitySettings, minimumPasswordLength: parseInt(e.target.value) || 0})} />
                                        <TextField fullWidth type="number" label="Session Timeout (Minutes)" value={securitySettings.sessionTimeoutMinutes ?? ""} onChange={e => setSecuritySettings({...securitySettings, sessionTimeoutMinutes: parseInt(e.target.value) || 0})} />
                                        
                                        <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <FormControlLabel control={<Switch checked={securitySettings.requireUppercase ?? false} onChange={e => setSecuritySettings({...securitySettings, requireUppercase: e.target.checked})} color="primary" />} label="Require Uppercase Letter" />
                                            <FormControlLabel control={<Switch checked={securitySettings.requireNumber ?? false} onChange={e => setSecuritySettings({...securitySettings, requireNumber: e.target.checked})} color="primary" />} label="Require Number" />
                                            <FormControlLabel control={<Switch checked={securitySettings.requireSpecialCharacter ?? false} onChange={e => setSecuritySettings({...securitySettings, requireSpecialCharacter: e.target.checked})} color="primary" />} label="Require Special Character" />
                                        </Box>

                                        <TextField fullWidth type="number" label="Max Login Attempts" value={securitySettings.maxLoginAttempts ?? ""} onChange={e => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 0})} />
                                        <TextField fullWidth type="number" label="Account Lock Minutes" value={securitySettings.accountLockMinutes ?? ""} onChange={e => setSecuritySettings({...securitySettings, accountLockMinutes: parseInt(e.target.value) || 0})} />
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => handleCancel('security')}>Cancel</Button>
                                        <Button variant="contained" onClick={handleSaveSecurity} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 'preferences' && userPreferences && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>User Preferences</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <TextField fullWidth select label="Default Theme" value={userPreferences.defaultTheme ?? "Light"} onChange={e => setUserPreferences({...userPreferences, defaultTheme: e.target.value})}>
                                            <MenuItem value="Light">Light</MenuItem>
                                            <MenuItem value="Dark">Dark</MenuItem>
                                        </TextField>
                                        <TextField fullWidth type="number" label="Dashboard Refresh Interval (s)" value={userPreferences.dashboardRefreshIntervalSeconds ?? ""} onChange={e => setUserPreferences({...userPreferences, dashboardRefreshIntervalSeconds: parseInt(e.target.value) || 0})} />
                                        <TextField fullWidth type="number" label="Items Per Page" value={userPreferences.itemsPerPage ?? ""} onChange={e => setUserPreferences({...userPreferences, itemsPerPage: parseInt(e.target.value) || 0})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={userPreferences.enableSystemNotifications ?? false} onChange={e => setUserPreferences({...userPreferences, enableSystemNotifications: e.target.checked})} color="primary" />} label="Enable System Notifications" />
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => handleCancel('preferences')}>Cancel</Button>
                                        <Button variant="contained" onClick={handleSavePreferences} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 'backup' && backupSettings && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Backup & Maintenance</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={backupSettings.autoBackupEnabled ?? false} onChange={e => setBackupSettings({...backupSettings, autoBackupEnabled: e.target.checked})} color="primary" />} label="Enable Auto Backup" />
                                        </Box>
                                        <TextField fullWidth select label="Backup Frequency" value={backupSettings.backupFrequency ?? "Daily"} onChange={e => setBackupSettings({...backupSettings, backupFrequency: e.target.value})}>
                                            <MenuItem value="Daily">Daily</MenuItem>
                                            <MenuItem value="Weekly">Weekly</MenuItem>
                                            <MenuItem value="Monthly">Monthly</MenuItem>
                                        </TextField>
                                        <TextField fullWidth type="time" label="Backup Time" slotProps={{ inputLabel: { shrink: true } }} value={backupSettings.backupTime ?? ""} onChange={e => setBackupSettings({...backupSettings, backupTime: e.target.value})} />
                                        <TextField fullWidth type="number" label="Retention Days" value={backupSettings.retentionDays ?? ""} onChange={e => setBackupSettings({...backupSettings, retentionDays: parseInt(e.target.value) || 0})} />
                                        
                                        <Box sx={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Last Backup At: {backupSettings.lastBackupAt || 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Last Backup Status: {backupSettings.lastBackupStatus || 'Never Run'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button variant="outlined" color="warning" onClick={handleRunBackupNow}>Run Backup Now</Button>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button variant="outlined" onClick={() => handleCancel('backup')}>Cancel</Button>
                                            <Button variant="contained" onClick={handleSaveBackup} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>
            )}

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({...notification, open: false})}>
                <Alert severity={notification.severity} onClose={() => setNotification({...notification, open: false})}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SettingsPage;
