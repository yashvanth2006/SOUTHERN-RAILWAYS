// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
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

export default function Sidebar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const activePath = ALL_NAV_PATHS
    .filter(path => location.pathname === path || location.pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

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
          if(setSidebarOpen) setSidebarOpen(false);
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
          if (setSidebarOpen) setSidebarOpen(false);
        }}
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 w-full overflow-hidden
          ${isActive
            ? "bg-[#0b659a] text-white shadow-md shadow-[#0b659a]/20"
            : "text-slate-500 hover:bg-slate-50 hover:text-[#0b659a]"
          }`}
      >
        <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>
        <span className="flex-1 truncate text-left">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white lg:border-r border-slate-200 shadow-2xl lg:shadow-sm w-full rounded-3xl lg:rounded-none overflow-hidden">
      {/* Brand Zone */}
        <div className="flex items-center justify-start gap-3 h-20 border-b border-slate-100 shrink-0 px-4">
          <img
            src="/app-logo.png"
            alt="Tower Wagon Train Logo"
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
          />
          <span className="font-bold text-sm leading-tight text-slate-800 break-words text-left">
            Tower wagon & Driver Management system
          </span>
        </div>

      {/* Navigation Zone */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {role === "DRIVER" && (
          <>
            <NavButton to="/driver" icon={<ShieldUser size={20} />} label="TW Driver Dashboard" />
            <NavButton to="/driver/engine" icon={<TrainFront size={20} />} label="TW Dashboard" />
            <NavButton to="/driver/daily" icon={<ClipboardList size={20} />} label="Duty Logs" />
            <NavButton to="/driver/abnormalities" icon={<AlertTriangle size={20} />} label="Abnormalities" />
            <NavButton to="/circulars" icon={<Files size={20} />} label="Circulars" />
          </>
        )}

        {role === "DEPOT_MANAGER" && (
          <>
            <NavButton to="/manager" icon={<ShieldUser size={20} />} label="TW Driver Dashboard" />
            <NavButton to="/manager/engine" icon={<TrainFront size={20} />} label="TW Dashboard" />
            <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={20} />} label="Circular Status" />
            <NavButton to="/circulars" icon={<Files size={20} />} label="Circulars" />
          </>
        )}

        {role === "SUPER_ADMIN" && (
          <>
            <NavButton to="/admin" icon={<ShieldUser size={20} />} label="TW Driver Dashboard" />
            <NavButton to="/admin/engine" icon={<TrainFront size={20} />} label="TW Dashboard" />
            <NavButton to="/admin/circular-upload" icon={<FileUp size={20} />} label="Upload Circular" />
            <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={20} />} label="Circular Status" />
            <NavButton to="/circulars" icon={<Files size={20} />} label="Circulars" />
            <NavButton to="/admin/report-download" icon={<ClipboardList size={20} />} label="Reports" />
          </>
        )}

        {role === "ADEE" && (
          <>
            <NavButton to="/adee" icon={<ShieldUser size={20} />} label="TW Driver Dashboard" />
            <NavButton to="/adee/engine" icon={<TrainFront size={20} />} label="TW Dashboard" />
            <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={20} />} label="Circular Status" />
            <NavButton to="/circulars" icon={<Files size={20} />} label="Circulars" />
          </>
        )}

        {role === "MASTER_ADMIN" && (
          <>
            <NavButton to="/master-admin" icon={<Crown size={20} />} label="Master Admin" />
            <NavButton to="/admin" icon={<Shield size={20} />} label="Super Admin Dashboard" />
            <NavButton to="/admin/engine" icon={<TrainFront size={20} />} label="TW Dashboard" />
            <NavButton to="/admin/circular-status" icon={<ClipboardCheck size={20} />} label="Circular Status" />
            <NavButton to="/circulars" icon={<Files size={20} />} label="Circulars" />
            <NavButton to="/admin/report-download" icon={<ClipboardList size={20} />} label="Reports" />
          </>
        )}
      </div>

      {/* Action Zone (Logout) */}
      <div className="px-3 py-4 shrink-0 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 w-full overflow-hidden"
        >
          <span className="inline-flex shrink-0 items-center justify-center"><LogOut size={20} /></span>
          <span className="flex-1 truncate text-left">Logout</span>
        </button>
      </div>
    </div>
  );
}
