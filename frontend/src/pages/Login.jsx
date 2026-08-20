import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { Train, Lock, User, Eye, EyeOff } from "lucide-react";
import { useCircularGuard } from "../context/CircularGuard";

export default function Login() {
  const [pfNo, setPfNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshCircularStatus } = useCircularGuard();

  // If the user arrives at the login page (e.g., via the Back button),
  // immediately clear their session. This prevents them from clicking
  // the Forward button to get back into the dashboard.
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  const login = async () => {
    if (!pfNo || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Details",
        text: "Please enter PF Number and Password",
        confirmButtonColor: "#1d4ed8",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", { pfNo, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("passwordChanged", res.data.passwordChanged ? "true" : "false");
      localStorage.setItem("permissions", JSON.stringify(res.data.permissions || []));
      localStorage.setItem("scope", JSON.stringify(res.data.scope || {}));
      
      localStorage.setItem("districtName", res.data.districtName || "");
      localStorage.setItem("depotName", res.data.depotName || "");
      localStorage.setItem(
        "assignedDepots",
        JSON.stringify(res.data.assignedDepots || [])
      );

      // Restore circular acknowledgement state from backend
      if (res.data.lastAcknowledgedCircularId) {
        localStorage.setItem("lastSeenCircularId", res.data.lastAcknowledgedCircularId);
        // Also ensure acknowledgedCirculars has it so the list view shows the checkmark
        const existingAcks = JSON.parse(localStorage.getItem("acknowledgedCirculars") || "[]");
        if (!existingAcks.includes(res.data.lastAcknowledgedCircularId)) {
          existingAcks.push(res.data.lastAcknowledgedCircularId);
          localStorage.setItem("acknowledgedCirculars", JSON.stringify(existingAcks));
        }
      }

      // Clear skip flag so it shows up on new login
      sessionStorage.removeItem("circularSkipped");

      // Check if first login (password not changed)
      if (!res.data.passwordChanged) {
        await Swal.fire({
          icon: "warning",
          title: "Password Change Required",
          text: "For security, you must change your default password before continuing.",
          confirmButtonColor: "#d97706"
        });
        navigate("/change-password");
        return;
      }

      // Trigger circular check after login
      refreshCircularStatus();

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to Railway Management System",
        timer: 1200,
        showConfirmButton: false,
      });

      if (res.data.role === "DRIVER") navigate("/driver");
      if (res.data.role === "DEPOT_MANAGER") navigate("/manager");
      if (res.data.role === "SUPER_ADMIN") navigate("/admin");
      if (res.data.role === "MASTER_ADMIN") navigate("/master-admin");
      if (res.data.role === "ADEE") {
        navigate("/adee");
      }
    } catch (err) {
       console.error("LOGIN ERROR:", err);
       
       let errorMessage = err.response?.data?.msg || "Invalid PF Number or Password";
       
       // Explicitly handle 429 Too Many Requests (Rate Limiting)
       if (err.response?.status === 429) {
         errorMessage = "Too many login attempts. Please wait a few minutes and try again.";
       } else if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
         errorMessage = "Network error. Please check your internet connection.";
       }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">

        {/* TOP STRIP */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-white-100">
              <img 
                src="/app-logo.png" 
                alt="Tower Wagon Train Logo" 
                className="h-16 sm:h-16 w-auto object-contain" 
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tower wagon & Driver Management system
          </h1>
          <p className="text-sm text-black-500 mt-1">
             TRD/SR
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-6">

          {/* PF NUMBER */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              PF Number
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter PF Number"
                value={pfNo}
                onChange={(e) => setPfNo(e.target.value)}
                onKeyUp={handleKeyUp}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleKeyUp}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={login}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-white transition
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800 active:scale-[0.98]"
              }`}
          >
            {loading ? "Signing In..." : "Login Securely"}
          </button>
        </div>
      </div>
    </div>
  );
}
