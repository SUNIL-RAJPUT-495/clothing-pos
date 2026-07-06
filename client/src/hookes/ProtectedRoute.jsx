import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
  const token = localStorage.getItem("accessToken");

  return isLoggedIn && token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;