import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";

// --- Layouts ---
import AdminLayout from "./layouts/AdminLayout";
import RoomLayout from "./layouts/RoomLayout";
import MilkShopLayout from "./layouts/MilkShopLayout";
import BeerGardenLayout from "./layouts/BeerGardenLayout";

// --- Pages ---
import Login from "./features/auth/Login";
import AdminDashboard from "./features/admin/AdminDashboard";
import UtilityBillDashboard from "./features/admin/UtilityBillDashboard";
import UserManagementDashboard from "./features/admin/UserManagementDashboard";
import SystemAuditLogs from "./features/admin/SystemAuditLogs";

import RoomDashboardPage from "./features/room-section/RoomDashboardPage";
import RoomPage from "./features/room-section/RoomPage";
import BookingPage from "./features/room-section/BookingPage";
import OccupancyMatrixPage from "./features/room-section/OccupancyMatrixPage";
import RemittancePage from "./features/room-section/RemittancePage";

import MilkShopDashboard from "./features/milk-shop/MilkShopDashboard";
import SupplierPage from "./features/milk-shop/SupplierPage";
import ItemPage from "./features/milk-shop/ItemPage";
import GrnPage from "./features/milk-shop/GrnPage";
import StockLedgerPage from "./features/milk-shop/StockLedgerPage";
import DailySalesPage from "./features/milk-shop/DailySalesPage";
import StockAdjustmentPage from "./features/milk-shop/stock-adjustments/StockAdjustmentPage";

import BeerGardenDashboard from "./features/beer-garden/BeerGardenDashboard";
import PriceMatrix from "./features/beer-garden/PriceMatrix";
import LiquorIssuance from "./features/beer-garden/LiquorIssuance";
import Commissions from "./features/beer-garden/Commissions";
import GoodsReceivedNote from "./features/beer-garden/GoodsReceivedNote";
import SupplierManagement from "./features/beer-garden/SupplierManagement";
import Receivables from "./features/beer-garden/ReceivablesDashboard";
import ReportsDashboard from "./features/beer-garden/ReportsDashboard";
import PurchaseHistory from "./features/beer-garden/PurchaseHistory";

// --- UPGRADED: Role-Based Protected Route ---
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const token = localStorage.getItem('jwt_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    console.warn(`Security Event: Role ${userRole} attempted unauthorized access.`);
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

const RootBoundary = () => {
  const token = localStorage.getItem('jwt_token');
  const role = localStorage.getItem('user_role'); 
  
  if (!token) return <Navigate to="/login" replace />;

  switch (role) {
    case 'ROLE_ADMIN': 
        return <Navigate to="/admin/dashboard" replace />;
    case 'ROLE_MILK_SHOP': 
        return <Navigate to="/milk-shop/dashboard" replace />;
    case 'ROLE_BEER_GARDEN': 
        return <Navigate to="/beer-garden/dashboard" replace />;
    case 'ROLE_ROOM_BOOKING': 
        return <Navigate to="/rooms/dashboard" replace />;
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
            <Route path="utilities" element={<UtilityBillDashboard />} />
            <Route path="users" element={<UserManagementDashboard />} /> 
            <Route path="logs" element={<SystemAuditLogs />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ROOM_BOOKING']} />}>
          <Route path="/rooms" element={<RoomLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoomDashboardPage />} />
            <Route path="management" element={<RoomPage />} />
            <Route path="bookings" element={<BookingPage />} />
            <Route path="occupancy" element={<OccupancyMatrixPage />} />
            <Route path="remittance" element={<RemittancePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MILK_SHOP']} />}>
          <Route path="/milk-shop" element={<MilkShopLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MilkShopDashboard />} />
            <Route path="suppliers" element={<SupplierPage />} />
            <Route path="items" element={<ItemPage />} />
            <Route path="stock" element={<StockLedgerPage />} />
            <Route path="grn" element={<GrnPage />} />
            <Route path="daily-sales" element={<DailySalesPage />} />
            <Route path="stock-adjustments" element={<StockAdjustmentPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_BEER_GARDEN']} />}>
          <Route path="/beer-garden" element={<BeerGardenLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BeerGardenDashboard />} />
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="grn" element={<GoodsReceivedNote />} />
            <Route path="issuance" element={<LiquorIssuance />} />
            <Route path="prices" element={<PriceMatrix />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="receivables" element={<Receivables />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
          </Route>
        </Route>

        <Route path="/" element={<RootBoundary />} />
        <Route path="*" element={<RootBoundary />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;