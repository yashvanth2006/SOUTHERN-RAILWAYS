import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import {
  User,
  HeartPulse,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  ScrollText,
  Train,
  ShieldCheck,
  BellRing
} from "lucide-react";
import Swal from "sweetalert2";
import Footer from "../components/Footer";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  const openTCardPopup = async () => {
    const checklistTemplate = [
      "Check Diesel level",
      "Drain water sediments fuel filter",
      "Check engine oil level and top up if necessary",
      "Check fuel, oil, water and exhaust leak",
      "Check air cleaner oil level",
      "Check air line leak",
      "Fill radiator tank with treated water if necessary",
      "Clean compressor breather",
      "Drain air receiver tank and close drain cock",
      "Clean crank case breather",
      "Start engine and note oil pressure",
      "Record oil pressure and brake pressure"
    ];

    const towerCars = ["RU 927/017", "SR 220035", "SR 210018", "SR 960025", "SR 23025", "SR 240063", "RU 06878", "SR 230022", "SR 210067", "RU 01896", "RU 176019", "SR 230059", "RU 9516", "RU 9514", "RU 9496", "RU 950021", "LR", "TRAINING"];

    const items = checklistTemplate.map(d => ({
      description: d,
      checked: false,
      remarks: "",
      priority: "",
      dieselLevel: null
    }));

    const { value } = await Swal.fire({
      title: "Daily Tower Car Checklist",
      width: window.innerWidth < 640 ? "95%" : 900,
      showCancelButton: true,
      confirmButtonText: "Submit Checklist",
      html: `
<div style="text-align:left;">

  <div style="
    background:#F8FAFC;
    border:1px solid #E2E8F0;
    border-radius:14px;
    padding:18px;
    margin-bottom:18px;
  ">

    <label style="
      display:block;
      font-size:14px;
      font-weight:700;
      color:#334155;
      margin-bottom:8px;
    ">
      Tower Car
    </label>

    <select
      id="tcar"
      class="swal2-input"
      style="
        width:100%;
        margin:0;
        border-radius:10px;
        border:1px solid #CBD5E1;
        background:white;
      "
    >
      <option value="">Select Tower Car</option>
      ${towerCars
        .map(
          t => `<option value="${t}">${t}</option>`
        )
        .join("")}
    </select>

  </div>

  <div style="
      max-height:420px;
      overflow-y:auto;
      padding-right:6px;
  ">

    ${items
      .map(
        (i, idx) => `

      <div style="
        border:1px solid #E2E8F0;
        border-radius:14px;
        background:#FFFFFF;
        padding:16px;
        margin-bottom:14px;
        box-shadow:0 1px 3px rgba(0,0,0,.05);
      ">

        <label style="
          display:flex;
          align-items:flex-start;
          gap:10px;
          cursor:pointer;
        ">

          <input
            type="checkbox"
            id="chk${idx}"
            style="
              margin-top:4px;
              width:18px;
              height:18px;
            "
          />

          <span style="
            font-size:14px;
            font-weight:600;
            color:#1E293B;
            line-height:1.5;
          ">
            ${i.description}
          </span>

        </label>

        ${
          i.description === "Check Diesel level"
            ? `
        <div style="margin-top:12px;">

          <input
            type="number"
            id="diesel${idx}"
            class="swal2-input"
            placeholder="Enter Diesel Level (Litres)"
            min="0"
            style="
              width:100%;
              margin:0;
              border-radius:10px;
    font-size:13px;
              border:1px solid #CBD5E1;
            "
          />

        </div>
        `
            : ""
        }

        <div style="margin-top:12px;">

          <input
  id="rem${idx}"
  class="swal2-input"
  placeholder="Remarks (optional)"
  style="
    width:100%;
    margin:0;
    border-radius:10px;
    border:1px solid #CBD5E1;
    font-size:13px;
  "

  oninput="
    const val=this.value.trim();
    const priorityDiv=document.getElementById('priorityDiv${idx}');

    if(val){
      priorityDiv.style.display='block';
    }else{
      priorityDiv.style.display='none';
    }
  "
/>

        </div>

        <div
          id="priorityDiv${idx}"
          style="
            display:none;
            margin-top:12px;
          "
        >

          <label style="
            display:block;
            margin-bottom:6px;
            font-size:13px;
            font-weight:600;
            color:#475569;
          ">
            Priority
          </label>

          <select
            id="priority${idx}"
            class="swal2-input"
            style="
              width:100%;
              margin:0;
              border-radius:10px;
              border:1px solid #CBD5E1;
            "
          >
            <option value="">Select Priority</option>
            <option value="HIGH">
              🔴 High Priority
            </option>
            <option value="LOW">
              🟡 Less Priority
            </option>
          </select>

        </div>

      </div>

    `
      )
      .join("")}

  </div>

</div>
`,
      preConfirm: () => {
        const tCarNo = document.getElementById("tcar").value;
        if (!tCarNo) {
          Swal.showValidationMessage("T Car No is required");
          return;
        }

        const collected = items.map((i, idx) => {
          const remarks = document.getElementById(`rem${idx}`).value.trim();
          const priority = document.getElementById(`priority${idx}`)?.value || "";
          const dieselInput = document.getElementById(`diesel${idx}`);

          let dieselLevel = null;

          if (dieselInput) {
            dieselLevel = dieselInput.value ? Number(dieselInput.value) : null;
            if (dieselLevel === null) {
              Swal.showValidationMessage("Diesel Level is required");
              return false;
            }
          }

          if (remarks && !priority) {
            Swal.showValidationMessage("Select priority for all remarks");
            return false;
          }

          return {
            description: i.description,
            checked: document.getElementById(`chk${idx}`).checked,
            remarks,
            priority: remarks ? priority : null,
            dieselLevel
          };
        });

        if (collected.includes(false)) return;

        return { tCarNo, items: collected };
      }
    });

    if (!value) return;

    try {
      await api.post("/driver/tcard", value);

      await Swal.fire({
        icon: "success",
        title: "Checklist Saved",
        text: "Daily T-Card checklist submitted successfully",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.msg || "Unable to save checklist."
      });
    }
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
    { title: "TW Dashboard", description: "View tower wagon operational status", icon: <Train size={20} />, onClick: () => navigate("/driver/engine") },
    { title: "Abnormalities", description: "Report and track operational issues", icon: <AlertTriangle size={20} />, onClick: () => navigate("/driver/abnormalities") }
  ];

  return (
    <>
      <Navbar />
      <div className="rail-page">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-2">
            <div>
              <h2 className="rail-page-title">Driver Dashboard</h2>
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
      <Footer />
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
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#D6DEE8] bg-white p-4 text-center transition duration-200 hover:border-[#2563EB] hover:shadow-lg md:gap-3 md:p-5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F1F8] text-[#0B3C5D] transition group-hover:bg-[#0B3C5D] group-hover:text-white md:h-14 md:w-14">
        {icon}
      </div>
      <h3 className="text-xs font-semibold text-[#1F2937] md:text-sm">{title}</h3>
      <p className="hidden text-xs text-[#64748B] md:block md:text-sm">{description}</p>
    </button>
  );
}
