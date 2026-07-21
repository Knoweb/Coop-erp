import { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Button } from "@mui/material";

export default function PlatformAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [tenantId, setTenantId] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [username, setUsername] = useState("");

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: rowsPerPage.toString(),
      });
      if (tenantId) queryParams.append("tenantId", tenantId);
      if (action) queryParams.append("action", action);
      if (entityType) queryParams.append("entityType", entityType);
      if (username) queryParams.append("username", username);

      const response = await fetch(`http://localhost:8080/api/v1/platform/audit-logs?${queryParams.toString()}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.content);
        setTotalElements(data.totalElements);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const handleFilter = () => {
    setPage(0);
    fetchLogs();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
          Platform Audit Logs
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', backgroundColor: 'var(--card-bg)' }}>
        <TextField 
          label="Tenant ID" 
          variant="outlined" 
          size="small" 
          value={tenantId} 
          onChange={(e) => setTenantId(e.target.value)} 
        />
        <TextField 
          label="Action" 
          variant="outlined" 
          size="small" 
          value={action} 
          onChange={(e) => setAction(e.target.value)} 
        />
        <TextField 
          label="Entity Type" 
          variant="outlined" 
          size="small" 
          value={entityType} 
          onChange={(e) => setEntityType(e.target.value)} 
        />
        <TextField 
          label="Username" 
          variant="outlined" 
          size="small" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </Paper>

      <TableContainer component={Paper} sx={{ backgroundColor: 'var(--card-bg)' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Tenant</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Entity Type</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Entity ID</TableCell>
              <TableCell sx={{ color: 'var(--text-color)', fontWeight: 'bold' }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell sx={{ color: 'var(--text-color)' }}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{log.tenant ? log.tenant.tenantName : "Platform"}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{log.username || "System"}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{log.action}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{log.entityType}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{log.entityId}</TableCell>
                <TableCell sx={{ color: 'var(--text-color)' }}>{log.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ color: 'var(--text-color)' }}
        />
      </TableContainer>
    </Box>
  );
}
