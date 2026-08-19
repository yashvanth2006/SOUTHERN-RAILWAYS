/**
 * permissionService.js — Module 3
 *
 * Single source of truth for role-based permissions.
 * Every action here was derived by reading EVERY allowRoles() call in every
 * existing route file before writing this list — not guessed.
 *
 * Files cross-referenced (all active, not commented-out routes):
 *   adminRoutes.js, driverRoutes.js, engineRoutes.js, abnormalityRoutes.js,
 *   depotRoutes.js, adminCircularRoutes.js, issueRoutes.js
 *   (circularRoutes.js is entirely commented out — excluded)
 *
 * Role name mapping in use (DB strings, not new names — Module 5 renames them):
 *   MASTER_ADMIN  = new SUPER_ADMIN (division-wide)
 *   SUPER_ADMIN   = new DISTRICT_ADMIN (district-scoped)
 *   ADEE          = new MINI_ADMIN
 *   DEPOT_MANAGER = new MANAGER
 *   DRIVER        = DRIVER
 *
 * Additions to the Module 3 spec draft — found by cross-referencing real routes:
 *   ENGINE_DELETE          — engineRoutes.js: DELETE /:id → allowRoles("SUPER_ADMIN")
 *   ABNORMALITY_RESOLVE    — abnormalityRoutes.js: PUT /:id/resolve → allowRoles("DEPOT_MANAGER")
 *   ISSUE_RESOLVE          — issueRoutes.js: PUT /:id/resolve → allowRoles("DEPOT_MANAGER")
 *   SUPER_ADMIN_VIEW       — adminRoutes.js: GET /super-admins → allowRoles("MASTER_ADMIN")
 *   SUPER_ADMIN_UPDATE     — adminRoutes.js: PUT /super-admins/profile → allowRoles("MASTER_ADMIN", "SUPER_ADMIN")
 *   DISTRICT_VIEW          — adminRoutes.js: GET /districts → allowRoles("MASTER_ADMIN", "SUPER_ADMIN")
 *   USER_DELETE            — adminRoutes.js: DELETE /users/:userId → allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN")
 *   DRIVER_PROFILE_VIEW    — driverRoutes.js: GET /profile → allowRoles("DRIVER")
 *   DRIVER_PROFILE_UPDATE  — driverRoutes.js: PUT /profile/* → allowRoles("DRIVER")
 *   DUTY_SIGN_IN           — driverRoutes.js: POST /signin → allowRoles("DRIVER")
 *   DUTY_SIGN_OUT          — driverRoutes.js: POST /signout → allowRoles("DRIVER")
 *   DRIVER_ALERTS          — driverRoutes.js: GET /alerts → allowRoles("DRIVER")
 *   TCARD_CREATE           — driverRoutes.js: POST /tcard → allowRoles("DRIVER")
 *   REPORT_VIEW_OVERDUE    — adminRoutes.js: GET /overdue-records → allowRoles("SUPER_ADMIN","ADEE","DEPOT_MANAGER","MASTER_ADMIN")
 */

const PERMISSIONS = {
  // ===================================================================
  // MASTER_ADMIN → new SUPER_ADMIN: wildcard — can do everything
  // ===================================================================
  SUPER_ADMIN: ["*"],

  // ===================================================================
  // SUPER_ADMIN → new DISTRICT_ADMIN: district-level scope
  // Source: adminRoutes.js (SUPER_ADMIN appears in every allowRoles()),
  //         adminCircularRoutes.js (upload/delete circulars),
  //         engineRoutes.js (DELETE /:id)
  // ===================================================================
  DISTRICT_ADMIN: [
    // User management
    "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
    "USER_RESET_PASSWORD",
    // Reports
    "REPORT_VIEW", "REPORT_EXPORT", "REPORT_VIEW_OVERDUE",
    // Circulars
    "CIRCULAR_VIEW", "CIRCULAR_CREATE", "CIRCULAR_DELETE", "CIRCULAR_ACKNOWLEDGE",
    // Depots & Districts
    "DEPOT_VIEW",
    "DISTRICT_VIEW",
    // Super admin management (self-update only for this role, MASTER_ADMIN handles others)
    "SUPER_ADMIN_UPDATE",
    // Engine (SUPER_ADMIN can delete engines — engineRoutes.js)
    "ENGINE_VIEW", "ENGINE_UPDATE", "ENGINE_DELETE",
    // Drivers (district admin can see drivers)
    "DRIVER_VIEW",
    // Issues & Abnormalities (district-level visibility)
    "ISSUE_VIEW", "ABNORMALITY_VIEW",
    // TCards
    "TCARD_VIEW",
  ],

  // ===================================================================
  // ADEE → new MINI_ADMIN: multi-depot scope, no circular management
  // Source: adminRoutes.js (ADEE in most allowRoles()),
  //         abnormalityRoutes.js, issueRoutes.js, engineRoutes.js
  // ===================================================================
  MINI_ADMIN: [
    // User management (within assigned depots)
    "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
    "USER_RESET_PASSWORD",
    // Reports
    "REPORT_VIEW", "REPORT_EXPORT", "REPORT_VIEW_OVERDUE",
    // Circulars (view and acknowledge — ADEE cannot create/delete circulars)
    "CIRCULAR_VIEW", "CIRCULAR_ACKNOWLEDGE",
    // Depots
    "DEPOT_VIEW",
    // Drivers, Issues, Abnormalities
    "DRIVER_VIEW",
    "ISSUE_VIEW",
    "ABNORMALITY_VIEW",
    // Engines (ADEE can view engines — engineRoutes.js GET endpoints)
    "ENGINE_VIEW",
    // TCards
    "TCARD_VIEW",
  ],

  // ===================================================================
  // DEPOT_MANAGER → new MANAGER: single depot scope
  // Source: depotRoutes.js, abnormalityRoutes.js, issueRoutes.js,
  //         engineRoutes.js, adminRoutes.js (overdue-records)
  // ===================================================================
  MANAGER: [
    // Driver management within their depot
    "DRIVER_VIEW", "DRIVER_UPDATE",
    // Duty logs
    "DUTY_VIEW", "DUTY_CREATE", "DUTY_UPDATE",
    // TCards
    "TCARD_VIEW", "TCARD_UPDATE",
    // Issues
    "ISSUE_VIEW", "ISSUE_CREATE", "ISSUE_RESOLVE",
    // Abnormalities (view and resolve — but not create; drivers create)
    "ABNORMALITY_VIEW", "ABNORMALITY_RESOLVE",
    // Engines (create/update own depot; view all)
    "ENGINE_VIEW", "ENGINE_CREATE", "ENGINE_UPDATE",
    // Circulars (view and acknowledge)
    "CIRCULAR_VIEW", "CIRCULAR_ACKNOWLEDGE",
    // Reports (overdue only — adminRoutes.js overdue-records)
    "REPORT_VIEW_OVERDUE",
  ],

  // ===================================================================
  // DRIVER: self-only scope
  // Source: driverRoutes.js, abnormalityRoutes.js
  // ===================================================================
  DRIVER: [
    // Own profile (GET + update bio/training/LR)
    "DRIVER_PROFILE_VIEW", "DRIVER_PROFILE_UPDATE",
    // Duty sign-in/out
    "DUTY_SIGN_IN", "DUTY_SIGN_OUT",
    "DUTY_VIEW", "DUTY_CREATE",
    // Alerts
    "DRIVER_ALERTS",
    // TCards (view + create/submit)
    "TCARD_VIEW", "TCARD_CREATE",
    // Abnormalities (create and view own)
    "ABNORMALITY_VIEW", "ABNORMALITY_CREATE",
    // Circulars (view and acknowledge — all active users must read circulars)
    "CIRCULAR_VIEW", "CIRCULAR_ACKNOWLEDGE",
    // Engine (view only — driverRoutes allows GET on engine endpoints)
    "ENGINE_VIEW",
    // LR depots lookup
    "DRIVER_LR_DEPOTS",
  ],
};

/**
 * Returns true if the role has permission to perform the given action.
 * MASTER_ADMIN has wildcard access ("*") and can do anything.
 * All other roles must have the action explicitly in their list.
 *
 * @param {string} role - the user's role (DB string, e.g. "MASTER_ADMIN")
 * @param {string} action - the action string (e.g. "USER_VIEW")
 * @returns {boolean}
 */
export const hasPermission = (role, action) => {
  const allowed = PERMISSIONS[role] || [];
  return allowed.includes("*") || allowed.includes(action);
};

/**
 * Returns the full permission list for a role.
 * Returns empty array for unknown roles (fail closed).
 *
 * @param {string} role
 * @returns {string[]}
 */
export const permissionsForRole = (role) => PERMISSIONS[role] || [];

export default PERMISSIONS;
