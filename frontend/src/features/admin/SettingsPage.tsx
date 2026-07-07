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
import { 
    settingsService, 
    type BusinessProfile, 
    type SecuritySettings, 
    type UserPreferences, 
    type BackupSettings 
} from './services/settingsService';

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

    const settingCards: { id: ActiveTab, title: string, icon: React.ReactNode, desc: string }[] = [
        { id: 'business', title: 'Business Profile', icon: <BusinessIcon fontSize="large" color="primary" />, desc: 'Manage main shop details, tax information, and receipts.' },
        { id: 'security', title: 'Security Settings', icon: <SecurityIcon fontSize="large" color="primary" />, desc: 'Configure password policies, sessions, and locking.' },
        { id: 'preferences', title: 'User Preferences', icon: <PersonIcon fontSize="large" color="primary" />, desc: 'Personalize dashboard layout and notification settings.' },
        { id: 'backup', title: 'Backup & Maintenance', icon: <BackupIcon fontSize="large" color="primary" />, desc: 'Schedule database backups and system maintenance.' },
    ];

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setNotification({ open: true, message, severity });
    };

    const loadSettings = async (tabId: ActiveTab) => {
        setIsLoading(true);
        try {
            switch (tabId) {
                case 'business':
                    if (!businessProfile) setBusinessProfile(await settingsService.getBusinessProfile());
                    break;
                case 'security':
                    if (!securitySettings) setSecuritySettings(await settingsService.getSecuritySettings());
                    break;
                case 'preferences':
                    if (!userPreferences) setUserPreferences(await settingsService.getUserPreferences());
                    break;
                case 'backup':
                    if (!backupSettings) setBackupSettings(await settingsService.getBackupSettings());
                    break;
            }
        } catch (error) {
            showNotification('Failed to load settings', 'error');
        } finally {
            setIsLoading(false);
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

    const handleSaveBusiness = async () => {
        if (!businessProfile) return;
        setIsSaving(true);
        try {
            await settingsService.updateBusinessProfile(businessProfile);
            showNotification('Business Profile saved successfully', 'success');
        } catch (error) {
            showNotification('Failed to save Business Profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSecurity = async () => {
        if (!securitySettings) return;
        setIsSaving(true);
        try {
            await settingsService.updateSecuritySettings(securitySettings);
            showNotification('Security Settings saved successfully', 'success');
        } catch (error) {
            showNotification('Failed to save Security Settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        if (!userPreferences) return;
        setIsSaving(true);
        try {
            await settingsService.updateUserPreferences(userPreferences);
            showNotification('User Preferences saved successfully', 'success');
        } catch (error) {
            showNotification('Failed to save User Preferences', 'error');
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
            showNotification('Failed to save Backup Settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRunBackupNow = async () => {
        try {
            const result = await settingsService.runManualBackup();
            showNotification(result, 'success');
        } catch (error: any) {
            showNotification(error.response?.data || 'Failed to trigger backup', 'error');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
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
                                        <TextField fullWidth label="Business Name" value={businessProfile.businessName} onChange={e => setBusinessProfile({...businessProfile, businessName: e.target.value})} />
                                        <TextField fullWidth label="Registration Number" value={businessProfile.registrationNumber} onChange={e => setBusinessProfile({...businessProfile, registrationNumber: e.target.value})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <TextField fullWidth label="Address" value={businessProfile.address} onChange={e => setBusinessProfile({...businessProfile, address: e.target.value})} />
                                        </Box>
                                        <TextField fullWidth label="Contact Number" value={businessProfile.contactNumber} onChange={e => setBusinessProfile({...businessProfile, contactNumber: e.target.value})} />
                                        <TextField fullWidth label="Email" type="email" value={businessProfile.email} onChange={e => setBusinessProfile({...businessProfile, email: e.target.value})} />
                                        <TextField fullWidth label="Tax Number" value={businessProfile.taxNumber} onChange={e => setBusinessProfile({...businessProfile, taxNumber: e.target.value})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <TextField fullWidth label="Receipt Footer Text" multiline rows={2} value={businessProfile.receiptFooterText} onChange={e => setBusinessProfile({...businessProfile, receiptFooterText: e.target.value})} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => setActiveTab(null)}>Cancel</Button>
                                        <Button variant="contained" onClick={handleSaveBusiness} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 'security' && securitySettings && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Security Settings</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <TextField fullWidth type="number" label="Minimum Password Length" value={securitySettings.minimumPasswordLength} onChange={e => setSecuritySettings({...securitySettings, minimumPasswordLength: parseInt(e.target.value) || 0})} />
                                        <TextField fullWidth type="number" label="Session Timeout (Minutes)" value={securitySettings.sessionTimeoutMinutes} onChange={e => setSecuritySettings({...securitySettings, sessionTimeoutMinutes: parseInt(e.target.value) || 0})} />
                                        <TextField fullWidth type="number" label="Max Failed Login Attempts" value={securitySettings.maxFailedLoginAttempts} onChange={e => setSecuritySettings({...securitySettings, maxFailedLoginAttempts: parseInt(e.target.value) || 0})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={securitySettings.requireStrongPassword} onChange={e => setSecuritySettings({...securitySettings, requireStrongPassword: e.target.checked})} color="primary" />} label="Require Strong Password (numbers, symbols, uppercase)" />
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={securitySettings.enableAccountLocking} onChange={e => setSecuritySettings({...securitySettings, enableAccountLocking: e.target.checked})} color="primary" />} label="Enable Account Locking after Max Failed Attempts" />
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => setActiveTab(null)}>Cancel</Button>
                                        <Button variant="contained" onClick={handleSaveSecurity} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 'preferences' && userPreferences && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>User Preferences</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <TextField fullWidth select label="Default Theme" value={userPreferences.defaultTheme} onChange={e => setUserPreferences({...userPreferences, defaultTheme: e.target.value})}>
                                            <MenuItem value="LIGHT">Light</MenuItem>
                                            <MenuItem value="DARK">Dark</MenuItem>
                                            <MenuItem value="SYSTEM">System</MenuItem>
                                        </TextField>
                                        <TextField fullWidth type="number" label="Dashboard Refresh Interval (s)" value={userPreferences.dashboardRefreshIntervalSeconds} onChange={e => setUserPreferences({...userPreferences, dashboardRefreshIntervalSeconds: parseInt(e.target.value) || 0})} />
                                        <TextField fullWidth type="number" label="Items Per Page" value={userPreferences.itemsPerPage} onChange={e => setUserPreferences({...userPreferences, itemsPerPage: parseInt(e.target.value) || 0})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={userPreferences.enableNotifications} onChange={e => setUserPreferences({...userPreferences, enableNotifications: e.target.checked})} color="primary" />} label="Enable System Notifications" />
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => setActiveTab(null)}>Cancel</Button>
                                        <Button variant="contained" onClick={handleSavePreferences} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                                    </Box>
                                </Box>
                            )}

                            {activeTab === 'backup' && backupSettings && (
                                <Box>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Backup & Maintenance</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        <TextField fullWidth select label="Backup Frequency" value={backupSettings.backupFrequency} onChange={e => setBackupSettings({...backupSettings, backupFrequency: e.target.value})}>
                                            <MenuItem value="DAILY">Daily</MenuItem>
                                            <MenuItem value="WEEKLY">Weekly</MenuItem>
                                            <MenuItem value="MONTHLY">Monthly</MenuItem>
                                        </TextField>
                                        <TextField fullWidth type="time" label="Backup Time" slotProps={{ inputLabel: { shrink: true } }} value={backupSettings.backupTime} onChange={e => setBackupSettings({...backupSettings, backupTime: e.target.value})} />
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={backupSettings.enableAutomaticBackup} onChange={e => setBackupSettings({...backupSettings, enableAutomaticBackup: e.target.checked})} color="primary" />} label="Enable Automatic Backup" />
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <FormControlLabel control={<Switch checked={backupSettings.maintenanceMode} onChange={e => setBackupSettings({...backupSettings, maintenanceMode: e.target.checked})} color="error" />} label="Enable Maintenance Mode (Shops will be locked out)" />
                                        </Box>
                                        {backupSettings.lastBackupTime && (
                                            <Box sx={{ gridColumn: '1 / -1' }}>
                                                <Typography variant="body2" color="text.secondary">Last Backup: {backupSettings.lastBackupTime}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button variant="outlined" color="warning" onClick={handleRunBackupNow}>Run Backup Now</Button>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button variant="outlined" onClick={() => setActiveTab(null)}>Cancel</Button>
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
