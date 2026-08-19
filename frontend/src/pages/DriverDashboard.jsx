import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getDistrictAbbreviation } from "../utils/districtMapping";
import {
  User,
  HeartPulse,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  ScrollText,
  TrainFront,
  ShieldCheck,
  BellRing,
  Wrench
} from "lucide-react";
import Swal from "sweetalert2";

import TCardModal from "../components/TCardModal";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [towerCars, setTowerCars] = useState([]);

  useEffect(() => {
    api.get("/engine/tower-cars/list").then(res => setTowerCars(res.data || []));
  }, []);

  const [showTCardModal, setShowTCardModal] = useState(false);

  const openTCardPopup = () => {
    setShowTCardModal(true);
  };

  useEffect(() => {
    api.get("/driver/alerts").then(res => setAlerts(res.data));
  }, []);

  useEffect(() => {
    api.get("/driver/duty-status").then(res => {
      if (res.data.status === "INCOMPLETE") {
        Swal.fire({
          icon: "warning",
          title: "Previous Duty Not Completed",
          text: "Please complete sign-out or contact supervisor.",
          confirmButtonColor: "#C8102E"
        });
      }

      if (res.data.status === "COMPLETED") {
        Swal.fire({
          icon: "success",
          title: "Duty Completed",
          text: "Yesterday’s duty was completed successfully.",
          timer: 1400,
          showConfirmButton: false
        });
      }
    });
  }, []);

  const hasTrainingAlert = alerts.some(a => a.type === "TRAINING");
  const hasLRAlert = alerts.some(a => a.type === "LR");

  const featureCards = [
    { title: "Bio Data", description: "Review profile details and personal records", icon: <User size={20} />, onClick: () => navigate("/driver/profile") },
    { title: "Health / Training", description: "Check medical and training compliance", icon: <HeartPulse size={20} />, onClick: () => navigate("/driver/health") },
    { title: "LR Details", description: "Monitor route learning record history", icon: <FileText size={20} />, onClick: () => navigate("/driver/lr") },
    { title: "Duty Logs", description: "Access duty and mileage records", icon: <ClipboardList size={20} />, onClick: () => navigate("/driver/daily") },
    { title: "Daily Tower Car Checklist", description: "Submit the daily operating checklist", icon: <CheckSquare size={20} />, onClick: openTCardPopup },
    { title: "Circulars", description: "Open official circulars and notices", icon: <ScrollText size={20} />, onClick: () => navigate("/circulars") },
    { title: "TW Dashboard", description: "View tower wagon operational status", icon: <TrainFront size={20} />, onClick: () => navigate("/driver/engine") },
    { title: "Abnormalities", description: "Report and track operational issues", icon: <Wrench size={20} />, onClick: () => navigate("/driver/abnormalities") }
  ];

  return (
    <>
      <div className="rail-page">
        <div>
          <div className="mb-8 flex flex-col gap-2">
            <div>
              <p className="text-lg font-medium text-slate-600 mb-1">Hi, {localStorage.getItem("userName") || "User"}!</p>
              <h2 className="rail-page-title">
                {`Driver/TRD/${localStorage.getItem("depotName")} Dashboard`}
              </h2>
              <p className="rail-page-subtitle">Compliance, duty records and operational access</p>
            </div>
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-3">
            <StatusCard title="Training" status={hasTrainingAlert ? "Overdue" : "Valid"} tone={hasTrainingAlert ? "danger" : "valid"} icon={<ShieldCheck size={18} />} />
            <StatusCard title="LR" status={hasLRAlert ? "Overdue" : "Valid"} tone={hasLRAlert ? "danger" : "valid"} icon={<FileText size={18} />} />
            <StatusCard title="Alerts" status={alerts.length ? `${alerts.length} Active` : "No Active Alerts"} tone={alerts.length ? "warning" : "info"} icon={<BellRing size={18} />} />
          </div>

          <div className="grid gap-3 grid-cols-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map(card => (
              <Card key={card.title} title={card.title} description={card.description} icon={card.icon} onClick={card.onClick} />
            ))}
          </div>
        </div>
      </div>
      
      <TCardModal isOpen={showTCardModal} onClose={() => setShowTCardModal(false)} towerCars={towerCars} />
    </>
  );
}

function StatusCard({ title, status, tone, icon }) {
  const toneClasses = {
    valid: "rail-status-valid",
    warning: "rail-status-warning",
    danger: "rail-status-danger",
    info: "rail-status-info"
  };

  return (
    <div className={`rail-status-widget ${tone}`}>
      <div className={`rail-status-icon ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[#64748B]">{title}</p>
        <p className="mt-1 font-semibold text-[#1F2937]">{status}</p>
      </div>
      <span className={`rail-badge ${toneClasses[tone]}`}>{tone === "danger" ? "Needs attention" : tone === "warning" ? "Monitor" : "Ready"}</span>
    </div>
  );
}

function Card({ title, description, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 p-4 text-center transition-all duration-300 md:gap-3 md:p-5 focus:outline-none"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1F8] text-[#0B3C5D] transition-colors duration-300 group-hover:bg-[#0B3C5D] group-hover:text-white md:h-14 md:w-14">
        {icon}
      </div>
      <h3 className="text-xs font-semibold text-[#1F2937] transition-colors duration-300 md:text-sm">{title}</h3>
      <p className="hidden text-xs text-[#64748B] transition-colors duration-300 md:block md:text-sm">{description}</p>
    </button>
  );
}
