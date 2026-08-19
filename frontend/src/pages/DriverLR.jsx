import { useEffect, useState } from "react";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";
import { Calendar, Layers, Route } from "lucide-react";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomSelect from "../components/CustomSelect";
const calculateSchedule = (start, end) => {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate <= startDate) {
    return "";
  }

  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (endDate.getDate() < startDate.getDate()) {
    months--;
  }

  if (months < 1) return "1 Month";
  if (months === 12) return "1 Year";
  if (months === 24) return "2 Years";
  if (months % 12 === 0) return `${months / 12} Years`;

  return `${months} Months`;
};

export default function DriverLR() {
  const [lrList, setLrList] = useState([]);
  const [depots, setDepots] = useState([]);

  const [lr, setLr] = useState({
    startDepot: "",
    endDepot: "",
    doneDate: "",
    dueDate: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLR = async () => {
      try {
        const res = await api.get("/driver/profile");
        const lrData = res.data.profile?.lrDetails || [];
        setLrList(lrData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = [];
        const warning = [];

        lrData.forEach(item => {
          if (!item.dueDate) return;
          const due = new Date(item.dueDate);
          due.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            overdue.push({ ...item, days: Math.abs(diffDays) });
          } else if (diffDays <= 3) {
            warning.push({ ...item, days: diffDays });
          }
        });

        if (overdue.length > 0) {
          Swal.fire({
            icon: "error",
            title: "LR Overdue",
            html: overdue.map(lr => `<div><b>${lr.section}</b><br/>Overdue by <b>${lr.days} day(s)</b><br/>Due Date: ${lr.dueDate.substring(0, 10)}</div>`).join("<hr/>"),
            confirmButtonColor: "#C8102E"
          });
        } else if (warning.length > 0) {
          Swal.fire({
            icon: "warning",
            title: "LR Expiring Soon",
            html: warning.map(lr => `<div><b>${lr.section}</b><br/>Expires in <b>${lr.days} day(s)</b><br/>Due Date: ${lr.dueDate.substring(0, 10)}</div>`).join("<hr/>"),
            confirmButtonColor: "#F9A825"
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    const loadDepots = async () => {
      try {
        const res = await api.get("/driver/lr-depots");
        setDepots(res.data || []);
      } catch (err) {
        console.error("Failed to load depots", err);
      }
    };

    loadLR();
    loadDepots();
  }, []);

  const save = async () => {
    if (!lr.startDepot || !lr.endDepot || !lr.doneDate || !lr.dueDate) {
      Swal.fire("Missing Info", "Section, Done & Due Date required", "warning");
      return;
    }

    if (lr.startDepot === lr.endDepot) {
      Swal.fire("Invalid Route", "Select a different depot.", "warning");
      return;
    }

    const schedule = calculateSchedule(lr.doneDate, lr.dueDate);

    if (!schedule) {
      Swal.fire("Invalid Dates", "Due Date must be after Done Date", "warning");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        section: `${lr.startDepot}-${lr.endDepot}`,
        doneDate: lr.doneDate,
        dueDate: lr.dueDate,
        schedule
      };

      const res = await api.put("/driver/profile/lr", { lrDetails: payload });
      setLrList(res.data.lrDetails);
      setLr({ startDepot: "", endDepot: "", doneDate: "", dueDate: "" });
      Swal.fire("Saved", "LR entry added successfully", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rail-page">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BackButton />
                <div>
                  <h2 className="rail-page-title">LR (Road Learning) Details</h2>
                  <p className="rail-page-subtitle">Track route learning records and expiries</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#E8EEF5] px-4 py-3 text-sm text-[#0B3C5D]">
              <p className="font-semibold">Learning history</p>
              <p className="text-[#1F6F8B]">Maintain route compliance</p>
            </div>
          </div>

          <div className="rail-panel p-4 sm:p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#F9FBFC] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EEF5] text-[#0B3C5D]">
                <Route size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2937]">LR Record Book</h3>
                <p className="text-sm text-[#6B7280]">Review route history and add a new learning entry.</p>
              </div>
            </div>

            <div className="space-y-4">
              {lrList.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#F9FBFC] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#1F2937]">
                    <Layers size={16} className="text-[#1F6F8B]" />
                    <p className="font-semibold">{item.section}</p>
                  </div>
                  <p className="text-sm text-[#6B7280]">Done: {item.doneDate?.substring(0, 10)} | Due: {item.dueDate?.substring(0, 10)}</p>
                  <p className="mt-1 text-sm text-[#1F6F8B]">Schedule: 3 months</p>
                  <p className="mt-1 text-sm text-[#1F6F8B]">Schedule: {item.schedule}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-white p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1F2937]">Start station</label>
                    <CustomSelect
                      value={lr.startDepot}
                      onChange={v => setLr(prev => ({ ...prev, startDepot: v }))}
                      options={depots}
                      placeholder="Select Start station"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1F2937]">End Station</label>
                    <CustomSelect
                      value={lr.endDepot}
                      onChange={v => setLr(prev => ({ ...prev, endDepot: v }))}
                      options={depots}
                      placeholder="Select End Station"
                    />
                  </div>
              </div>

              <DateField label="Done Date" value={lr.doneDate} onChange={v => setLr(prev => ({ ...prev, doneDate: v }))} />
              <DateField label="Due Date" value={lr.dueDate} onChange={v => setLr(prev => ({ ...prev, dueDate: v }))} />

              <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-[#0B3C5D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#072d46] disabled:cursor-not-allowed disabled:opacity-70">
                {saving ? "Saving..." : "Add LR Entry"}
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
        <Calendar size={14} /> {label}
      </label>
      <div className="w-full">
        <CustomDatePicker
          value={value}
          onChange={onChange}
          className="rail-input w-full"
          placeholderText="DD/MM/YYYY"
        />
      </div>
    </div>
  );
}
