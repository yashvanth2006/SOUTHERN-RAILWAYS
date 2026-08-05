/**
 * ChangePassword Page Component
 *
 * Displayed on first login when user's password is still the default (PF Number).
 * Forces user to change password before accessing the system.
 *
 * Security Requirements:
 * - Minimum 6 characters
 * - Cannot be same as current password
 * - Must confirm new password
 *
 * @module pages/ChangePassword
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { Lock, KeyRound, ShieldCheck, AlertTriangle } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");

  const handleSubmit = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all password fields",
        confirmButtonColor: "#dc2626"
      });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "New password must be at least 6 characters",
        confirmButtonColor: "#dc2626"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New password and confirm password do not match",
        confirmButtonColor: "#dc2626"
      });
      return;
    }

    if (currentPassword === newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Same Password",
        text: "New password must be different from current password",
        confirmButtonColor: "#dc2626"
      });
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });

      await Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: "Your password has been updated successfully. Please use your new password for future logins.",
        confirmButtonColor: "#16a34a"
      });

      // Update localStorage to indicate password has been changed
      localStorage.setItem("passwordChanged", "true");

      // Redirect based on role
      if (role === "DRIVER") navigate("/driver");
      else if (role === "DEPOT_MANAGER") navigate("/manager");
      else if (role === "SUPER_ADMIN") navigate("/admin");
      else navigate("/");

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Password Change Failed",
        text: err.response?.data?.msg || "Unable to change password. Please try again.",
        confirmButtonColor: "#dc2626"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">

        {/* Warning Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-amber-100">
              <AlertTriangle className="text-amber-600" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Password Change Required
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            For security, you must change your default password before accessing the system.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-amber-600 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Security Notice</p>
              <p className="text-amber-700">
                Your current password is your PF Number. Please create a new secure password.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Password (PF Number)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Enter your PF Number"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm
                           focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                           focus:outline-none transition"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm
                           focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                           focus:outline-none transition"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm
                           focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                           focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-500 bg-slate-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Minimum 6 characters</li>
              <li>Must be different from current password</li>
              <li>Avoid using PF Number or simple patterns</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl
                        font-semibold text-white transition shadow-lg
                        ${loading
                          ? "bg-amber-400 cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-700 active:scale-[0.98]"
                        }`}
          >
            {loading ? (
              "Changing Password..."
            ) : (
              <>
                <ShieldCheck size={18} />
                Change Password & Continue
              </>
            )}
          </button>

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400">
          Tower Wagon Driver Management System<br />
          Indian Railways - TRD/SA Division
        </div>
      </div>
    </div>
  );
}

