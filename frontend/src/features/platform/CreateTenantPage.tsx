import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateTenantPage() {
  const [tenant, setTenant] = useState({ tenantCode: '', tenantName: '', tenantType: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/v1/platform/tenants", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(tenant)
      });
      if (response.ok) {
        navigate('/platform/tenants');
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--text-color)' }}>
        Create Tenant
      </Typography>
      <Paper sx={{ p: 4, backgroundColor: 'var(--card-bg)' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth margin="normal" label="Tenant Code" required
            value={tenant.tenantCode} onChange={(e) => setTenant({ ...tenant, tenantCode: e.target.value })}
          />
          <TextField
            fullWidth margin="normal" label="Tenant Name" required
            value={tenant.tenantName} onChange={(e) => setTenant({ ...tenant, tenantName: e.target.value })}
          />
          <TextField
            fullWidth margin="normal" label="Tenant Type" required
            value={tenant.tenantType} onChange={(e) => setTenant({ ...tenant, tenantType: e.target.value })}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" type="submit">Create</Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/platform/tenants')} sx={{ color: 'var(--text-color)', borderColor: 'var(--text-color)' }}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
