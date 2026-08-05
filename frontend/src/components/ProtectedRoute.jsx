import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // 🔥 Allow ADEE to access SUPER_ADMIN routes
  if (
    role &&
    role !== userRole &&
    !(role === "SUPER_ADMIN" && userRole === "ADEE")
  ) {
    return <Navigate to="/" />;
  }

  return children;
}