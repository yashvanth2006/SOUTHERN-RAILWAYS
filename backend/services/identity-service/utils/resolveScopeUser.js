import User from "../models/User.js";

/**
 * Resolves the user object to use for data scoping.
 * 
 * Hierarchy:
 * 1. X-Scope-User (if valid and acting user is MASTER_ADMIN) -> Scopes data to that SUPER_ADMIN
 * 2. Default: Authenticated User (includes any x-district-id overrides applied via auth middleware)
 */
export const resolveScopeUser = async (req) => {
  if (!req.user || !req.user.id) {
    return null;
  }

  const authenticatedUser = await User.findById(req.user.id);
  if (!authenticatedUser) {
    return null;
  }

  const scopeUserId = req.headers["x-scope-user"];

  if (scopeUserId && authenticatedUser.role === "MASTER_ADMIN") {
    try {
      const scopedUser = await User.findById(scopeUserId);
      // Only allow scoping to SUPER_ADMIN to prevent unauthorized scoping
      if (scopedUser && scopedUser.role === "SUPER_ADMIN") {
        return scopedUser;
      }
    } catch (err) {
      console.error("Invalid scope user ID:", err);
    }
  }

  return authenticatedUser;
};
