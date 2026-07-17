import { useEffect, useState } from "react";
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/platform/tenants", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:8080/api/v1/platform/tenants/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchTenants();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
          Tenants
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/platform/tenants/create')}>
          + New Tenant
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: 'var(--card-bg)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell sx={{ color: 'var(--text-color)' }}>{tenant.tenantCode}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{tenant.tenantName}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{tenant.tenantType}</TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.isActive ? "Active" : "Inactive"} 
                    color={tenant.isActive ? "success" : "error"} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/platform/tenants/${tenant.id}/edit`)}>Edit</Button>
                  <Button size="small" color={tenant.isActive ? "error" : "success"} onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}>
                    {tenant.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="small" color="secondary" onClick={() => navigate(`/platform/tenants/${tenant.id}/admins`)}>Admins</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
