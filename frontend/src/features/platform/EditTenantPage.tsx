import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function EditTenantPage() {
  const { id } = useParams();
  const [tenant, setTenant] = useState({ tenantCode: '', tenantName: '', tenantType: '', isActive: true });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/platform/tenants/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('jwt_token')}`
          }
        });
        if (response.ok) {
          setTenant(await response.json());
        }
      } catch (error) {
        console.error("Error fetching tenant:", error);
      }
    };
    fetchTenant();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/v1/platform/tenants/${id}`, {
        method: 'PUT',
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
      console.error("Error updating tenant:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--text-color)' }}>
        Edit Tenant
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
            <Button variant="contained" color="primary" type="submit">Update</Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/platform/tenants')} sx={{ color: 'var(--text-color)', borderColor: 'var(--text-color)' }}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
