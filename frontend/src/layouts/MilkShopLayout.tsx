import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  Typography,
  Button,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService"; 

const drawerWidth = 240;

function MilkShopLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/milk-shop/dashboard",
    },
    {
      label: "Suppliers",
      path: "/milk-shop/suppliers",
    },
    {
      label: "Items / Products",
      path: "/milk-shop/items",
    },
    {
      label: "GRN / Purchase Entry",
      path: "/milk-shop/grn",
    },
    {
      label: "Stock Ledger",
      path: "/milk-shop/stock",
    },
    {
      label: "Stock Adjustments",
      path: "/milk-shop/stock-adjustments",
    },
    {
      label: "Daily Sales / Cash Handover",
      path: "/milk-shop/daily-sales",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
        logoutUser();
        navigate('/login');
    }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#fff7ed",
      }}
    >
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
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Coop System
          </Typography>

          <Typography variant="body2" sx={{ color: "#fed7aa", mt: 0.5 }}>
            Milk Shop Section
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#b91c1c" }} />

        <List sx={{ px: 1, mt: 1 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);

            return (
              <ListItemButton
                key={item.path}
                selected={active}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: "white",
                  "&.Mui-selected": {
                    backgroundColor: "#f97316",
                    color: "white",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#ea580c",
                  },
                  "&:hover": {
                    backgroundColor: "#991b1b",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: active ? "bold" : "normal",
                  }}
                >
                  {item.label}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ borderColor: "#b91c1c", mb: 2 }} />

          <Typography variant="caption" sx={{ color: "#fed7aa" }}>
            Milk Shop Panel
          </Typography>

            <Button 
              variant="outlined" 
              size="small" 
              color="inherit" 
              fullWidth 
              onClick={handleLogout}
              sx={{ borderColor: '#b91c1c', mt: 1,'&:hover': { backgroundColor: '#b91c1c' } }}
              >
                Logout
            </Button>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MilkShopLayout;