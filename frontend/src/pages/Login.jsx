import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { Train, Lock, User } from "lucide-react";
import { useCircularGuard } from "../context/CircularGuard";

export default function Login() {
  const [pfNo, setPfNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshCircularStatus } = useCircularGuard();

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
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("passwordChanged", res.data.passwordChanged ? "true" : "false");
      localStorage.setItem("depotName", res.data.depotName || "");
      localStorage.setItem(
  "assignedDepots",
  JSON.stringify(res.data.assignedDepots || [])
);

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
      if (res.data.role === "ADEE") {
  navigate("/adee");
}
    } catch (err) {
       console.error("LOGIN ERROR:", err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.msg || "Invalid PF Number or Password",
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
            <div className="p-3 rounded-full bg-blue-100">
              <Train className="text-blue-700" size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tower Wagon Driver Management system
          </h1>
          <p className="text-sm text-gray-500 mt-1">
             TRD/SA Division
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
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
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
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              />
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

        {/* FOOTER */}
        <div className="text-center mt-8 text-xs text-gray-400">
          © {new Date().getFullYear()} Indian Railways <br />
          Authorized Personnel Only
        </div>
      </div>
    </div>
  );
}
