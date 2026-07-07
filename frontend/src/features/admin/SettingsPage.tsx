import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { 
    Business as BusinessIcon, 
    Security as SecurityIcon, 
    Person as PersonIcon, 
    SettingsBackupRestore as BackupIcon 
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
    const settingCards = [
        { title: 'Business Profile', icon: <BusinessIcon fontSize="large" color="primary" />, desc: 'Manage main shop details, tax information, and receipts.' },
        { title: 'Security Settings', icon: <SecurityIcon fontSize="large" color="primary" />, desc: 'Configure password policies, sessions, and MFA.' },
        { title: 'User Preferences', icon: <PersonIcon fontSize="large" color="primary" />, desc: 'Personalize dashboard layout and notification settings.' },
        { title: 'Backup & Maintenance', icon: <BackupIcon fontSize="large" color="primary" />, desc: 'Schedule database backups and system maintenance.' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Settings
                </Typography>
                <Typography color="text.secondary">
                    Configure system preferences for the Coop Grocery Management System.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                {settingCards.map((card, index) => (
                    <Box key={index} sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5, boxSizing: 'border-box' }}>
                        <Card sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                        }}>
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
        </Box>
    );
};

export default SettingsPage;
