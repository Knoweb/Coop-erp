import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const PlatformExportsPage: React.FC = () => {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async (endpoint: string, filenamePrefix: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/platform/exports/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Extract filename from Content-Disposition header if available
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${filenamePrefix}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err: any) {
            console.error(err);
            setError('Failed to export data. Ensure you have the required permissions.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                Platform Data Exports
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Export global platform metrics and tenant listings. Only Platform Admins have access to these exports.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Export Tenants
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Download a complete list of all registered tenants in the system, including their statuses and domains.
                            </Typography>
                            <Button 
                                variant="contained" 
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                                onClick={() => handleExport('tenants', 'tenants')}
                                disabled={isLoading}
                            >
                                Export Tenants CSV
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Export Tenant Usage Summary
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Download aggregated usage statistics and summary data across all tenants.
                            </Typography>
                            <Button 
                                variant="contained" 
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                                onClick={() => handleExport('tenant-usage-summary', 'tenant-usage')}
                                disabled={isLoading}
                            >
                                Export Usage Summary CSV
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PlatformExportsPage;
