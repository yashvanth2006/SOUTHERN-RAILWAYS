/**
 * Application Constants
 *
 * Centralized configuration values for the Tower Wagon Driver Management System.
 * This file eliminates magic values scattered throughout the codebase.
 *
 * @module constants
 */

// User roles
export const ROLES = {
  DRIVER: 'DRIVER',
  DEPOT_MANAGER: 'DEPOT_MANAGER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADEE: 'ADEE' // 🔥 NEW ROLE
};

// Training types
export const TRAINING_TYPES = {
  PME: 'PME',
  GRS_RC: 'GRS_RC',
  TR4: 'TR4',
  OC: 'OC'
};

// Training schedules (in months for due date calculation)
export const TRAINING_SCHEDULES = {
  PME: 48,      // 4 years
  GRS_RC: 36,   // 3 years
  TR4: 36,      // 3 years
  OC: 6         // 6 months
};

// LR (Road Learning) schedule in months
export const LR_SCHEDULE_MONTHS = 3;

// Mileage calculation: hours * MILEAGE_FACTOR + km
export const MILEAGE_FACTOR = 20;

// Password requirements
export const PASSWORD_MIN_LENGTH = 6;
export const BCRYPT_ROUNDS = 10;

// JWT expiration
export const JWT_EXPIRY = '1d';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// T-Card Checklist Items (standard 12 items)
export const TCARD_CHECKLIST_ITEMS = [
  'Check Diesel level',
  'Drain water sediments fuel filter',
  'Check engine oil level and top up if necessary',
  'Check fuel, oil, water and exhaust leak',
  'Check air cleaner oil level',
  'Check air line leak',
  'Fill radiator tank with treated water if necessary',
  'Clean compressor breather',
  'Drain air receiver tank and close drain cock',
  'Clean crank case breather',
  'Start engine and note oil pressure',
  'Record oil pressure and brake pressure'
];

// File upload limits
export const MAX_PDF_SIZE_MB = 10;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

// Cloudinary folder
export const CLOUDINARY_FOLDER = 'railway_circulars';

// API response messages
export const MESSAGES = {
  AUTH: {
    NO_TOKEN: 'No token',
    INVALID_TOKEN: 'Invalid token',
    ACCESS_DENIED: 'Access denied',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    PASSWORD_CHANGED: 'Password changed successfully',
    LOGIN_FAILED: 'Login failed'
  },
  VALIDATION: {
    MISSING_FIELDS: 'Missing required fields',
    INVALID_ROLE: 'Invalid role selection',
    USER_EXISTS: 'User with this PF No already exists',
    PASSWORD_TOO_SHORT: 'New password must be at least 6 characters',
    SAME_PASSWORD: 'New password must be different from current password'
  },
  CIRCULAR: {
    REQUIRED: 'Circular acknowledgement required',
    NOT_FOUND: 'Circular not found',
    ACKNOWLEDGED: 'Circular acknowledged successfully',
    PDF_REQUIRED: 'PDF file is required'
  },
  DRIVER: {
    ALREADY_SIGNED_IN: 'Already signed in',
    NO_ACTIVE_DUTY: 'No active duty found',
    SIGN_IN_SUCCESS: 'Signed in successfully',
    SIGN_OUT_SUCCESS: 'Signed out successfully',
    CHECKLIST_SAVED: 'Daily T-Card checklist saved',
    CHECKLIST_EXISTS: "Today's checklist already submitted"
  }
};

export default {
  ROLES,
  TRAINING_TYPES,
  TRAINING_SCHEDULES,
  LR_SCHEDULE_MONTHS,
  MILEAGE_FACTOR,
  PASSWORD_MIN_LENGTH,
  BCRYPT_ROUNDS,
  JWT_EXPIRY,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TCARD_CHECKLIST_ITEMS,
  MAX_PDF_SIZE_MB,
  MAX_PDF_SIZE_BYTES,
  CLOUDINARY_FOLDER,
  MESSAGES
};

