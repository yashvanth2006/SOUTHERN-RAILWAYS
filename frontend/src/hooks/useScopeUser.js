import { useLocation, useParams } from "react-router-dom";

export default function useScopeUser() {
  const { scopeUserId } = useParams();
  const location = useLocation();

  // Determine if we are currently in a scoped view path
  const isScopedView = location.pathname.startsWith("/master-admin/scope/") && !!scopeUserId;

  return {
    scopeUserId: isScopedView ? scopeUserId : null,
    isScopedView,
  };
}
