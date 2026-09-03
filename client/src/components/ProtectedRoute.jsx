import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a route: requires login, and optionally a specific role.
// Usage: <ProtectedRoute roles={["admin"]}><AdminOnlyPage /></ProtectedRoute>
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
