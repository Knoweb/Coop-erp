import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';

const SystemUsersPage: React.FC = () => {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    System Users
                </Typography>
                <Typography color="text.secondary">
                    Manage main shop administrative users.
                </Typography>
            </Box>

            <Card sx={{ 
                textAlign: 'center', 
                py: 10, 
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                boxShadow: 'none'
            }}>
                <CardContent>
                    <BuildIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#475569', mb: 1 }}>
                        Coming Soon
                    </Typography>
                    <Typography color="text.secondary">
                        The interface to manage internal main shop and global administrators is currently under development.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SystemUsersPage;
