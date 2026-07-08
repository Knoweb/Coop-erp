import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";

// --- Layouts ---
import AdminLayout from "./layouts/AdminLayout";
import ShopLayout from "./layouts/ShopLayout";

// --- Pages ---
import Login from "./features/auth/Login";
import AdminDashboard from "./features/admin/AdminDashboard";

import ManageShopsPage from "./features/admin/ManageShopsPage";
import ShopUsersPage from "./features/admin/ShopUsersPage";

import SystemUsersPage from "./features/admin/SystemUsersPage";
import SettingsPage from "./features/admin/SettingsPage";

import GroceryShopDashboard from "./features/grocery-shop/GroceryShopDashboard";
import SupplierPage from "./features/grocery-shop/SupplierPage";
import ItemPage from "./features/grocery-shop/ItemPage";
import AdminPurchasesPage from "./features/admin/AdminPurchasesPage";
import StockLedgerPage from "./features/grocery-shop/StockLedgerPage";
import SalesPage from "./features/grocery-shop/SalesPage";

// --- UPGRADED: Role-Based Protected Route ---
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const token = localStorage.getItem('jwt_token');
  const rawRole = localStorage.getItem('user_role');
  const userRole = rawRole ? rawRole.replace(/^ROLE_/, '') : null;
  const normalizedAllowedRoles = allowedRoles.map(r => r.replace(/^ROLE_/, ''));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && !normalizedAllowedRoles.includes(userRole)) {
    console.warn(`Security Event: Role ${rawRole} attempted unauthorized access.`);
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

const RootBoundary = () => {
  const token = localStorage.getItem('jwt_token');
  const rawRole = localStorage.getItem('user_role'); 
  const role = rawRole ? rawRole.replace(/^ROLE_/, '') : null;
  
  if (!token) return <Navigate to="/login" replace />;

  switch (role) {
    case 'ADMIN': 
        return <Navigate to="/admin/dashboard" replace />;
    case 'SHOP_ADMIN':
    case 'SHOP_USER':
        return <Navigate to="/shop/dashboard" replace />;
    default: 
        localStorage.clear();
        return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="shops" element={<ManageShopsPage />} />
            <Route path="shop-users" element={<ShopUsersPage />} />
            <Route path="system-users" element={<SystemUsersPage />} />
            <Route path="products" element={<ItemPage />} />
            <Route path="inventory" element={<StockLedgerPage />} />
            <Route path="purchases" element={<AdminPurchasesPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="suppliers" element={<SupplierPage />} />
            <Route path="customers" element={<div style={{padding: '20px'}}>Customers Module Coming Soon</div>} />
            <Route path="reports" element={<div style={{padding: '20px'}}>Reports Module Coming Soon</div>} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SHOP_ADMIN', 'ROLE_SHOP_USER']} />}>
          <Route path="/shop" element={<ShopLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<GroceryShopDashboard />} />
            <Route path="products" element={<ItemPage />} />
            <Route path="inventory" element={<StockLedgerPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="customers" element={<div style={{padding: '20px'}}>Customers Module Coming Soon</div>} />
            <Route path="users" element={<ShopUsersPage />} />
            <Route path="reports" element={<div style={{padding: '20px'}}>Reports Module Coming Soon</div>} />
          </Route>
        </Route>

        <Route path="/" element={<RootBoundary />} />
        <Route path="*" element={<RootBoundary />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;