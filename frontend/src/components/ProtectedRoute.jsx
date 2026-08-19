import { Navigate, useNavigationType } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

/**
 * ProtectedRoute
 *
 * Guards any route against:
 * 1. Unauthenticated access (no token → redirect to login)
 * 2. Expired/invalid token (verified against backend → redirect to login)
 * 3. Wrong role brute-force (e.g., Driver pasting /admin → redirect to login)
 * 4. Stale forward navigation after logout
 */
export default function ProtectedRoute({ children, role, requiredPermission }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const permissionsStr = localStorage.getItem("permissions");
  const userPermissions = permissionsStr ? JSON.parse(permissionsStr) : [];

  const [tokenValid, setTokenValid] = useState(null); // null=checking, true=valid, false=invalid
  const navType = useNavigationType();

  // Verify token validity against backend (catches expired tokens)
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    api.get("/auth/me")
      .then(() => setTokenValid(true))
      .catch(() => {
        // Token is expired or invalid — clear everything and force re-login
        localStorage.clear();
        sessionStorage.clear();
        setTokenValid(false);
      });
  }, [token]);

  // 1. No token at all → immediate redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Still verifying token — render nothing (brief invisible check)
  if (tokenValid === null) {
    return null;
  }

  // 3. Token is invalid/expired
  if (tokenValid === false) {
    return <Navigate to="/" replace />;
  }

  // 4. Prevent stale dashboard restoration via Forward button after logout
  const currentIdx = window.history.state?.idx ?? 0;
  const lastIdxStr = sessionStorage.getItem("lastIdx");
  const lastIdx = lastIdxStr !== null && !isNaN(lastIdxStr) ? parseInt(lastIdxStr, 10) : currentIdx;

  const isForward = currentIdx > lastIdx;
  const prevPath = sessionStorage.getItem(`historyPath_${lastIdx}`);
  const isPublicPath = prevPath === "/" || prevPath === "/change-password";

  if (navType === "POP" && isForward && isPublicPath) {
    return <Navigate to="/" replace />;
  }

  // 5. Permission-based access check
  if (requiredPermission) {
    const hasPermission = Array.isArray(requiredPermission)
      ? requiredPermission.some(p => userPermissions.includes(p))
      : userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  // 6. Role-based access check (brute-force URL guessing blocked here)
  let hasAccess = false;

  if (!role) {
    hasAccess = true;
  } else if (Array.isArray(role)) {
    hasAccess = role.includes(userRole);
  } else {
    hasAccess = role === userRole;
  }

  // Allow higher-level admins to access SUPER_ADMIN routes
  if (
    !hasAccess &&
    (role === "SUPER_ADMIN" || (Array.isArray(role) && role.includes("SUPER_ADMIN"))) &&
    (userRole === "ADEE" || userRole === "MASTER_ADMIN")
  ) {
    hasAccess = true;
  }

  // Wrong role → back to login (not just "/", explicitly replace so no back-button exploit)
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}