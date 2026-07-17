import { Box, Divider, Drawer, List, ListItemButton, Typography, Button } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

const drawerWidth = 240;

function PlatformLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const platformItems = [
    { label: "Platform Dashboard", path: "/platform/dashboard" },
    { label: "Tenants", path: "/platform/tenants" },
    { label: "Audit Logs", path: "/platform/audit-logs" },
    { label: "Platform Exports", path: "/platform/exports" },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
      logoutUser();
      navigate('/login');
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "var(--sidebar-bg)",
            color: "var(--sidebar-text)",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ px: 2, py: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Coop Grocery</Typography>
          <Typography variant="body2" sx={{ color: "#fed7aa", mt: 0.5 }}>Platform Administration</Typography>
        </Box>
        <Divider sx={{ borderColor: "#b91c1c" }} />
        <List sx={{ px: 1, mt: 1 }}>
          <Typography variant="overline" sx={{ px: 2, color: "#fed7aa", fontWeight: "bold" }}>
            Platform Management
          </Typography>
          {platformItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2, mb: 0.5, color: "inherit",
                "&.Mui-selected": { backgroundColor: "var(--primary-color)", color: "white" },
                "&.Mui-selected:hover": { backgroundColor: "var(--secondary-color)" },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: isActive(item.path) ? "bold" : "normal" }}>
                {item.label}
              </Typography>
            </ListItemButton>
          ))}
        </List>
        
        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ borderColor: "#b91c1c", mb: 2 }} />
          <Button 
            variant="outlined" 
            size="small" 
            color="inherit" 
            fullWidth 
            onClick={handleLogout}
            sx={{ borderColor: '#b91c1c', '&:hover': { backgroundColor: '#b91c1c' } }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default PlatformLayout;
