import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function TenantAdminsPage() {
  const { id } = useParams();
  const [admin, setAdmin] = useState({ name: '', username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/v1/platform/tenants/${id}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(admin)
      });
      if (response.ok) {
        navigate('/platform/tenants');
      } else {
        alert("Failed to create admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--text-color)' }}>
        Create Tenant Admin
      </Typography>
      <Paper sx={{ p: 4, backgroundColor: 'var(--card-bg)' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth margin="normal" label="Name" required
            value={admin.name} onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
          />
          <TextField
            fullWidth margin="normal" label="Username" required
            value={admin.username} onChange={(e) => setAdmin({ ...admin, username: e.target.value })}
          />
          <TextField
            fullWidth margin="normal" label="Email" required type="email"
            value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
          />
          <TextField
            fullWidth margin="normal" label="Password" required type="password"
            value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" type="submit">Create Admin</Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/platform/tenants')} sx={{ color: 'var(--text-color)', borderColor: 'var(--text-color)' }}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
