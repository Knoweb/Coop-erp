import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';

const PlatformExportsPage: React.FC = () => {
    const token = localStorage.getItem('jwt_token');
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
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }} color="primary">
                Platform Data Exports
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Export global platform metrics and tenant listings. Only Platform Admins have access to these exports.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Export Tenants
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                </Box>
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Export Tenant Usage Summary
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                </Box>
            </Box>
        </Box>
    );
};

export default PlatformExportsPage;
