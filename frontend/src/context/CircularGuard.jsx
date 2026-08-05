/**
 * CircularGuard Context
 *
 * Provides circular acknowledgement state and enforcement across the app.
 * Wraps the entire application to check for unacknowledged circulars.
 *
 * Features:
 * - Checks for unacknowledged circulars on mount and after login
 * - Shows CircularPopup when acknowledgement is required
 * - Blocks app access until acknowledged
 * - Persists acknowledgement in backend
 * - SKIPS Super Admin (they manage, not consume circulars)
 *
 * @module context/CircularGuard
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import CircularPopup from "../components/CircularPopup";

const CircularGuardContext = createContext(null);

export function CircularGuardProvider({ children }) {
  const [pendingCircular, setPendingCircular] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  /**
   * Check for unacknowledged circulars
   * Skips check for SUPER_ADMIN role
   */
  const checkCircular = useCallback(async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Not logged in - no check needed
    if (!token) {
      setPendingCircular(null);
      setIsChecking(false);
      return;
    }

    // Super Admin doesn't need to acknowledge circulars
    if (role === "SUPER_ADMIN") {
      setPendingCircular(null);
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const res = await api.get("/admin/circulars");

      if (res.data.hasUnacknowledged && res.data.circular) {
        setPendingCircular(res.data.circular);
      } else {
        setPendingCircular(null);
      }
    } catch (err) {
      console.error("Circular check failed:", err);
      // On error, don't block - allow access
      setPendingCircular(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Acknowledge the current circular
   */
  const acknowledgeCircular = async () => {
    if (!pendingCircular) return;

    try {
      setIsAcknowledging(true);
      await api.post("/admin/circulars/acknowledge", {
        circularId: pendingCircular._id
      });

      setPendingCircular(null);

      // Store acknowledgement in session for quick reference
      sessionStorage.setItem("circularAcknowledged", pendingCircular._id);

    } catch (err) {
      console.error("Acknowledgement failed:", err);
      alert("Failed to acknowledge circular. Please try again.");
    } finally {
      setIsAcknowledging(false);
    }
  };

  /**
   * Force re-check (called after login)
   */
  const refreshCircularStatus = useCallback(() => {
    checkCircular();
  }, [checkCircular]);

  // Check on mount
  useEffect(() => {
    checkCircular();
  }, [checkCircular]);

  // Listen for storage changes (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        checkCircular();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkCircular]);

  const value = {
    hasPendingCircular: !!pendingCircular,
    pendingCircular,
    isChecking,
    refreshCircularStatus,
    acknowledgeCircular
  };

  return (
    <CircularGuardContext.Provider value={value}>
      {/* Show popup if circular acknowledgement is pending */}
      {pendingCircular && (
        <CircularPopup
          circular={pendingCircular}
          onAcknowledge={acknowledgeCircular}
          loading={isAcknowledging}
        />
      )}

      {/* Render children (but popup blocks interaction) */}
      {children}
    </CircularGuardContext.Provider>
  );
}

/**
 * Hook to access circular guard context
 */
export function useCircularGuard() {
  const context = useContext(CircularGuardContext);
  if (!context) {
    throw new Error("useCircularGuard must be used within CircularGuardProvider");
  }
  return context;
}

export default CircularGuardProvider;

