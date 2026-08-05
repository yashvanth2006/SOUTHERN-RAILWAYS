import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
  Menu,
  X,
  LogOut,
  Train,
  User,
  ClipboardList,
  Shield,
  Users,
  FileText,
  CheckSquare,
  AlertTriangle
} from "lucide-react";

import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFJS_WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function Navbar() {
  const navigate = useNavigate();
  const WAIT_TIME = 60;

const [secondsLeft, setSecondsLeft] = useState(WAIT_TIME);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const role = localStorage.getItem("role");

  const [viewCircular, setViewCircular] = useState(null);
  const [ackLoading, setAckLoading] = useState(false);
  useEffect(() => {
  if (!viewCircular) return;

  setSecondsLeft(WAIT_TIME);

  const timer = setInterval(() => {
    setSecondsLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [viewCircular]);

  useEffect(() => {
    if (role === "SUPER_ADMIN") return;

    const checkNewCircular = async () => {
      try {
        const res = await api.get("/admin/circulars");
        if (!res.data.length) return;

        const latest = res.data[0];
        const lastSeen = localStorage.getItem("lastSeenCircularId");
        if (lastSeen === latest._id) return;

        const result = await Swal.fire({
          icon: "info",
          title: "New Circular Published",
          html: `
            <p class="mb-2"><strong>${latest.title}</strong></p>
            <p>Please view and acknowledge the circular.</p>
          `,
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "View",
          denyButtonText: "Download",
          cancelButtonText: "Later",
          confirmButtonColor: "#4f46e5",
          denyButtonColor: "#059669",
          cancelButtonColor: "#6b7280"
        });

        if (result.isConfirmed) {
  setViewCircular(latest);
}
        else if (result.isDenied) {
          const link = document.createElement("a");
          link.href = latest.pdfUrl;
          link.download = latest.originalFilename || "circular.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error("Circular check failed", err);
      }
    };

    checkNewCircular();
  }, [role]);

  const acknowledgeCircular = async () => {
  try {
    if (!viewCircular?._id) return;

    setAckLoading(true);

    await api.post(
      `/admin/circulars/${viewCircular._id}/acknowledge`
    );

    localStorage.setItem(
      "lastSeenCircularId",
      viewCircular._id
    );

    setViewCircular(null);

    Swal.fire({
      icon: "success",
      title: "Acknowledged",
      text: "Circular marked as read",
      timer: 1200,
      showConfirmButton: false
    });

  } catch (err) {
    console.error("Acknowledgement failed", err);

    Swal.fire({
      icon: "error",
      title: "Failed",
      text: "Unable to acknowledge circular"
    });

  } finally {
    setAckLoading(false);
  }
};

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

  const NavButton = ({ to, icon, label }) => (
    <button
      onClick={() => {
        navigate(to);
        setOpen(false);
      }}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 mx-1 text-sm font-semibold transition md:w-auto
        ${
          location.pathname === to
            ? "bg-[#0b659a] text-white"
            : "text-gray-700 hover:bg-[#0b659a] hover:text-white"
        }`}
    >
      <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const RoleButtons = () => (
    <>
      {role === "DRIVER" && (
        <>
          <NavButton to="/driver" icon={<User size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/driver/engine" icon={<Train size={18} />} label="TW Dashboard" />
          <NavButton to="/driver/daily" icon={<ClipboardList size={18} />} label="Duty Logs" />
          <NavButton to="/driver/abnormalities" icon={<AlertTriangle size={18} />} label="Abnormalities" />
          <NavButton to="/circulars" icon={<FileText size={18} />} label="Circulars" />
        </>
      )}

      {role === "DEPOT_MANAGER" && (
        <>
          <NavButton to="/manager" icon={<Users size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/manager/engine" icon={<Train size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-status" icon={<CheckSquare size={18} />} label="Circular Status" />
          <NavButton to="/circulars" icon={<FileText size={18} />} label="Circulars" />
        </>
      )}

      {role === "SUPER_ADMIN" && (
        <>
          <NavButton to="/admin" icon={<Shield size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/admin/engine" icon={<Train size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-upload" icon={<FileText size={18} />} label="Upload Circular" />
          <NavButton to="/admin/circular-status" icon={<CheckSquare size={18} />} label="Circular Status" />
          <NavButton to="/admin/report-download" icon={<ClipboardList size={18} />} label="Reports" />
        </>
      )}

      {role === "ADEE" && (
        <>
          <NavButton to="/adee" icon={<Shield size={18} />} label="TW Driver Dashboard" />
          <NavButton to="/adee/engine" icon={<Train size={18} />} label="TW Dashboard" />
          <NavButton to="/admin/circular-status" icon={<CheckSquare size={18} />} label="Circular Status" />
          <NavButton to="/circulars" icon={<FileText size={18} />} label="Circulars" />
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-md z-20 sticky py-2 top-0 ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-2">
              <Train className="text-[#0b659a]" />
              <span className="font-bold text-sm md:text-lg text-gray-800">
                Tower Wagon Driver Management system
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-1">
                <RoleButtons />
              </div>
            </div>

            {/* Desktop Logout */}
            <div className="hidden md:block">
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#C8102E] transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-[#0b659a] hover:text-white transition"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 shadow-lg md:hidden">
            <div className="space-y-1">
              <RoleButtons />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#C8102E] transition hover:bg-red-50"
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

      {/* PDF VIEW MODAL */}
      {viewCircular && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-2">
          <div className="bg-white w-full mx-6 max-w-5xl h-[80vh] rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 md:p-4 border-b">
              <p className="font-medium text-sm md:text-base truncate">
                {viewCircular.title}
              </p>
              <button onClick={() => setViewCircular(null)}>
                <X />
              </button>
            </div>

            <div className="h-[calc(100%-120px)]">
  <Worker workerUrl={PDFJS_WORKER_URL}>
    <Viewer
      fileUrl={viewCircular.pdfUrl}
      defaultScale={SpecialZoomLevel.PageFit}
    />
  </Worker>
</div>

<div className="border-t p-4 flex justify-end bg-white">
  <button
  onClick={acknowledgeCircular}
  disabled={ackLoading || secondsLeft > 0}
  className={`px-5 py-2 rounded-lg font-medium text-white transition
    ${
      ackLoading || secondsLeft > 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-emerald-600 hover:bg-emerald-700"
    }`}
>
  {ackLoading
    ? "Processing..."
    : secondsLeft > 0
    ? `Wait ${secondsLeft}s`
    : "I Acknowledge"}
</button>
</div>
          </div>
        </div>
      )}
    </>
  );
}
