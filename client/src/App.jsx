import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import InventoryHistory from "./pages/InventoryHistory";
import Billing from "./pages/Billing";
import Sales from "./pages/Sales";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Replenishment from "./pages/Replenishment";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory-history" element={<InventoryHistory />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/sales" element={<Sales />} />
          <Route
            path="/suppliers"
            element={<ProtectedRoute roles={["admin"]}><Suppliers /></ProtectedRoute>}
          />
          <Route
            path="/purchases"
            element={<ProtectedRoute roles={["admin"]}><Purchases /></ProtectedRoute>}
          />
          <Route path="/replenishment" element={<Replenishment />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
