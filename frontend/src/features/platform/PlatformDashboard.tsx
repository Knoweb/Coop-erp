import { Box, Typography, Paper, Grid } from "@mui/material";

function PlatformDashboard() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "var(--text-color)" }}>
        Platform Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "var(--card-bg)", color: "var(--text-color)", borderRadius: 2 }}>
            <Typography variant="h6" color="textSecondary">Active Tenants</Typography>
            <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "var(--primary-color)" }}>
              -
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "var(--card-bg)", color: "var(--text-color)", borderRadius: 2 }}>
            <Typography variant="h6" color="textSecondary">Total System Users</Typography>
            <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "var(--secondary-color)" }}>
              -
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "var(--card-bg)", color: "var(--text-color)", borderRadius: 2 }}>
            <Typography variant="h6" color="textSecondary">System Health</Typography>
            <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold", color: "#10b981" }}>
              OK
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlatformDashboard;
