import { Box, Divider, Drawer, List, ListItemButton, Typography, Button } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService"; // Ensure this path matches your folder structure

const drawerWidth = 240;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = localStorage.getItem("user_role");

  const mainShopItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Products", path: "/admin/products" },
    { label: "Inventory / Stock", path: "/admin/inventory" },
    { label: "Purchases / GRN", path: "/admin/purchases" },
    { label: "Sales", path: "/admin/sales" },
    { label: "Suppliers", path: "/admin/suppliers" },
    { label: "Reports", path: "/admin/reports" },
  ];

  const adminManagementItems = [
    { label: "Manage Shops", path: "/admin/shops" },
    { label: "Shop Users", path: "/admin/shop-users" },
    { label: "System Users", path: "/admin/system-users" },
    { label: "Settings", path: "/admin/settings" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
      logoutUser();
      navigate('/login');
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff7ed" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#7f1d1d",
            color: "white",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ px: 2, py: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Coop Grocery</Typography>
          <Typography variant="body2" sx={{ color: "#fed7aa", mt: 0.5 }}>Main Shop & Admin Control</Typography>
        </Box>
        <Divider sx={{ borderColor: "#b91c1c" }} />
        <List sx={{ px: 1, mt: 1 }}>
          <Typography variant="overline" sx={{ px: 2, color: "#fed7aa", fontWeight: "bold" }}>
            Main Shop Operations
          </Typography>
          {mainShopItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2, mb: 0.5, color: "white",
                "&.Mui-selected": { backgroundColor: "#f97316", color: "white" },
                "&.Mui-selected:hover": { backgroundColor: "#ea580c" },
                "&:hover": { backgroundColor: "#991b1b" },
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: isActive(item.path) ? "bold" : "normal" }}>
                {item.label}
              </Typography>
            </ListItemButton>
          ))}
          
          <Divider sx={{ borderColor: "#b91c1c", my: 2 }} />
          
          <Typography variant="overline" sx={{ px: 2, color: "#fed7aa", fontWeight: "bold" }}>
            Admin Management
          </Typography>
          {adminManagementItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2, mb: 0.5, color: "white",
                "&.Mui-selected": { backgroundColor: "#f97316", color: "white" },
                "&.Mui-selected:hover": { backgroundColor: "#ea580c" },
                "&:hover": { backgroundColor: "#991b1b" },
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
          
          <Typography variant="caption" sx={{ color: "#fed7aa", display: "block", mb: 1 }}>
            {userRole === 'ROLE_ADMIN' || userRole === 'ADMIN' ? 'Main Shop Admin Panel' : 'Main Shop & Admin Control'}
          </Typography>

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

export default AdminLayout;