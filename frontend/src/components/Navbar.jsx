import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
  Menu,
  X,
  LogOut,
  ClipboardList,
  Shield,
  AlertTriangle,
  Crown,
  ShieldUser,
  TrainFront,
  FileUp,
  ClipboardCheck,
  Files
} from "lucide-react";


const ALL_NAV_PATHS = [
  "/driver/abnormalities",
  "/driver/daily",
  "/driver/engine",
  "/driver",
  "/manager/engine",
  "/manager",
  "/admin/circular-upload",
  "/admin/circular-status",
  "/admin/report-download",
  "/admin/engine",
  "/admin",
  "/adee/engine",
  "/adee",
  "/master-admin",
  "/circulars"
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role");

  // Determine the most specific matching route for the current location
  const activePath = ALL_NAV_PATHS
    .filter(path => location.pathname === path || location.pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

  useEffect(() => {
    // Prevent horizontal layout shift caused by vertical scrollbars appearing/disappearing
    document.documentElement.style.scrollbarGutter = "stable";
  }, []);

  const logout = async () => {


    if (role === "DRIVER") {
      try {
        const res = await api.get("/driver/active-duty");
        if (res.data.active) {
          await Swal.fire({
            icon: "warning",
            title: "Active Duty In Progress",
            text: "Please complete Sign-Out to logout.",
            confirmButtonColor: "#dc2626"
          });
          navigate("/driver/daily");
          return;
        }
      } catch {
        return;
      }
    }

    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You will be signed out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Logout",
    });

    if (confirm.isConfirmed) {
      localStorage.clear();
      navigate("/");
    }
  };

  const NavButton = ({ to, icon, label }) => {
    const isActive = activePath === to;
    
    return (
      <button
        onClick={() => {
          navigate(to);
          setOpen(false);
        }}
        className={`flex items-center justify-start lg:justify-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors duration-200 w-full lg:w-auto
          ${isActive
            ? "bg-[#0b659a] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-[#0b659a]"
          }`}
      >
        <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
      </button>
    );
  };

  const RoleButtons = () => (
    <>
      {role === "DRIVER" && (
        <>
          <NavButton to="/driver" icon={<ShieldUser size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/driver/engine" icon={<TrainFront size={18} />} label="TW Dashboard" />
          <NavButton to="/driver/daily" icon={<ClipboardList size={18} />} label="Duty Logs" />
          <NavButton to="/driver/abnormalities" icon={<AlertTriangle size={18} />} label="Abnormalities" />
          <NavButton to="/circulars" icon={<Files size={18} />} label="Circulars" />
        </>
      )}

      {role === "DEPOT_MANAGER" && (
        <>
          <NavButton to="/manager" icon={<ShieldUser size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/manager/engine" icon={<TrainFront size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={18} />} label="Circular Status" />
          <NavButton to="/circulars" icon={<Files size={18} />} label="Circulars" />
        </>
      )}

      {role === "SUPER_ADMIN" && (
        <>
          <NavButton to="/admin" icon={<ShieldUser size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/admin/engine" icon={<TrainFront size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-upload" icon={<FileUp size={18} />} label="Upload Circular" />
          <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={18} />} label="Circular Status" />
          <NavButton to="/circulars" icon={<Files size={18} />} label="Circulars" />
          <NavButton to="/admin/report-download" icon={<ClipboardList size={18} />} label="Reports" />
        </>
      )}

      {role === "ADEE" && (
        <>
          <NavButton to="/adee" icon={<ShieldUser size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/adee/engine" icon={<TrainFront size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={18} />} label="Circular Status" />
          <NavButton to="/circulars" icon={<Files size={18} />} label="Circulars" />
        </>
      )}

      {role === "MASTER_ADMIN" && (
        <>
          <NavButton to="/master-admin" icon={<Crown size={18} />} label="Master Admin" />
          <NavButton to="/admin" icon={<Shield size={18} />} label="Super Admin Dashboard" />
          <NavButton to="/admin/engine" icon={<TrainFront size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={18} />} label="Circular Status" />
          <NavButton to="/circulars" icon={<Files size={18} />} label="Circulars" />
          <NavButton to="/admin/report-download" icon={<ClipboardList size={18} />} label="Reports" />
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-md z-20 sticky top-0 w-full">
        <div className="w-full px-2 md:px-4 lg:px-4 xl:px-6">
          <div className="flex items-center justify-between min-h-[4rem] py-2 gap-2 lg:gap-3 xl:gap-4 min-w-0">

            {/* Brand/Logo Zone (Start) */}
            <div className="flex items-center justify-start gap-3 flex-shrink-0">
              <img
                src="/app-logo.png"
                alt="Tower Wagon Train Logo"
                className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
              />
              <span className="font-bold text-sm lg:text-base leading-tight text-gray-900 tracking-tight break-words">
                TOWER WAGON
              </span>
            </div>

            {/* Primary Navigation Zone (Center) */}
            <div className="hidden lg:flex flex-1 items-center justify-center px-1 lg:px-2 min-w-0">
              <div className="flex items-center gap-1.5 xl:gap-2 max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <RoleButtons />
              </div>
            </div>

            {/* Action Zone (End) */}
            <div className="hidden lg:flex flex-shrink-0 justify-end">
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-600 hover:text-white"
              >
                <LogOut size={18} />
                <span className="whitespace-nowrap">Logout</span>
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden flex-shrink-0 p-2 rounded-lg text-gray-700 hover:bg-[#0b659a]/10 hover:text-[#0b659a] transition-colors duration-200"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-lg lg:hidden w-full overflow-y-auto max-h-[calc(100vh-64px)]">
            <div className="flex flex-col space-y-1">
              <RoleButtons />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-600 hover:text-white mt-2"
              >
                <span className="inline-flex shrink-0 items-center justify-center">
                  <LogOut size={18} />
                </span>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
