/**
 * authorize.js — Module 3
 *
 * Central authorization middleware. Wraps scopeService + permissionService
 * into a single Express middleware that:
 *   1. Resolves the user's scope (what they can see)
 *   2. Checks the required permission for this action
 *   3. Attaches req.scope for use by controllers
 *
 * Usage in routes:
 *   router.get("/users", verifyToken, authorize("USER_VIEW"), getAdminUsers)
 *
 * CONSTRAINTS (per Module 3 spec):
 *   - Does NOT modify any existing route or controller (Module 4/5 does that)
 *   - Fails closed: 401 if user inactive/not found, 403 if permission denied
 *   - req.scope is attached — controllers use this, never req.user directly for filtering
 *
 * During Module 4/5 migration, this runs ALONGSIDE allowRoles() (not replacing it yet).
 * The removal of allowRoles() is Module 5.
 */

import { resolveUserScope } from "../services/authorization/scopeService.js";
import { hasPermission } from "../services/authorization/permissionService.js";
import { resolveScopeUser } from "../utils/resolveScopeUser.js";

/**
 * authorize(action) → Express middleware
 *
 * Must be placed AFTER verifyToken (which sets req.user).
 *
 * @param {string} action - the required permission string (e.g. "USER_VIEW")
 * @returns {Function} Express async middleware
 */
export const authorize = (action) => async (req, res, next) => {
  try {
    const scopeUser = await resolveScopeUser(req);
    
    if (!scopeUser) {
      return res.status(401).json({
        msg: "User not found or inactive",
        action
      });
    }

    const scope = await resolveUserScope(scopeUser._id);

    if (!scope) {
      return res.status(401).json({
        msg: "User not found or inactive",
        action
      });
    }

    if (!hasPermission(scope.role, action)) {
      return res.status(403).json({
        msg: "Access denied",
        action,
        role: scope.role
      });
    }

    // Attach scope so controllers can filter data correctly
    // Controllers should use req.scope.depotIds and req.scope helpers,
    // never read req.user.depotName / districtName directly
    req.scope = scope;
    next();

  } catch (err) {
    console.error("authorize() error:", err);
    res.status(500).json({ msg: "Authorization check failed" });
  }
};
