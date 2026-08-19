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
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import CircularPopup from "../components/CircularPopup";
import Swal from "sweetalert2";

const CircularGuardContext = createContext(null);

export function CircularGuardProvider({ children }) {
  const [pendingCircular, setPendingCircular] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();

  // Show popup when pending circular is detected (but not on login or change-password)
  useEffect(() => {
    const skipPaths = ["/", "/change-password"];
    if (pendingCircular && !skipPaths.includes(location.pathname)) {
      const timer = setTimeout(() => setShowPopup(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [pendingCircular, location.pathname]);

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

    // Super Admin and Master Admin don't need to acknowledge circulars
    if (role === "SUPER_ADMIN" || role === "MASTER_ADMIN") {
      setPendingCircular(null);
      setIsChecking(false);
      return;
    }

    if (sessionStorage.getItem("circularSkipped") === "true") {
      setPendingCircular(null);
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const res = await api.get("/admin/circulars");

      if (res.data && res.data.length > 0) {
        const latest = res.data[0];
        const lastSeen = localStorage.getItem("lastSeenCircularId");
        
        if (lastSeen !== latest._id) {
          setPendingCircular(latest);
        } else {
          setPendingCircular(null);
        }
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
      await api.post(`/admin/circulars/${pendingCircular._id}/acknowledge`);

      setPendingCircular(null);

      // Store acknowledgement in session for quick reference
      localStorage.setItem("lastSeenCircularId", pendingCircular._id);
      sessionStorage.setItem("circularAcknowledged", pendingCircular._id);

      // Show success tick animation
      await Swal.fire({
        icon: "success",
        title: "Acknowledged!",
        text: "Circular marked as read.",
        timer: 1500,
        showConfirmButton: false,
      });



    } catch (err) {
      console.error("Acknowledgement failed:", err);
      alert("Failed to acknowledge circular. Please try again.");
      throw err; // Re-throw so caller knows it failed
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

  const handleClose = useCallback(() => {
    sessionStorage.setItem("circularSkipped", "true");
    setPendingCircular(null);
  }, []);

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
      {showPopup && pendingCircular && (
        <CircularPopup
          circular={pendingCircular}
          onAcknowledge={acknowledgeCircular}
          onClose={handleClose}
          loading={isAcknowledging}
        />
      )}
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

