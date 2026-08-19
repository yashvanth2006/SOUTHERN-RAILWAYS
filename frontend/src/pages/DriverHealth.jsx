import { useEffect, useState } from "react";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";
import { HeartPulse, Calendar, ClipboardCheck } from "lucide-react";
import CustomDatePicker from "../components/CustomDatePicker";
const TRAINING_KEYS = ["PME", "GRS_RC", "TR4", "OC"];

const calculateSchedule = (start, end) => {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (months === 12) return "1 Year";
  if (months === 24) return "2 Years";
  if (months % 12 === 0) return `${months / 12} Years`;

  return `${months} Months`;
};

export default function DriverHealth() {
  const [trainings, setTrainings] = useState({
    PME: { doneDate: "", dueDate: "", schedule: "" },
    GRS_RC: { doneDate: "", dueDate: "", schedule: "" },
    TR4: { doneDate: "", dueDate: "", schedule: "" },
    OC: { doneDate: "", dueDate: "", schedule: "" }
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/driver/profile")
      .then(res => {
        const existing = res.data?.profile?.trainings;

        if (existing) {
          const formatted = {};
          TRAINING_KEYS.forEach(key => {
            formatted[key] = {
              doneDate: existing[key]?.doneDate ? existing[key].doneDate.substring(0, 10) : "",
              dueDate: existing[key]?.dueDate ? existing[key].dueDate.substring(0, 10) : "",
              schedule: existing[key]?.schedule || ""
            };
          });

          setTrainings(formatted);
          checkTrainingAlerts(formatted);
        }
      })
      .catch(() => {
        Swal.fire("Error", "Unable to load training data", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const checkTrainingAlerts = (data) => {
    const today = new Date();

    let overdueList = [];
    let expiringList = [];

    TRAINING_KEYS.forEach(key => {
      const dueDate = data[key]?.dueDate;
      if (!dueDate) return;

      const diffMs = new Date(dueDate) - today;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        overdueList.push(`${key} overdue by ${Math.abs(daysLeft)} days`);
      } else if (daysLeft <= 30) {
        expiringList.push(`${key} expiring in ${daysLeft} days`);
      }
    });

    if (overdueList.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Training Overdue",
        html: overdueList.map(i => `<div>${i}</div>`).join(""),
        confirmButtonColor: "#C8102E"
      });
    } else if (expiringList.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Training Expiring Soon",
        html: expiringList.map(i => `<div>${i}</div>`).join(""),
        confirmButtonColor: "#F9A825"
      });
    }
  };

  const save = async () => {
    for (const key of TRAINING_KEYS) {
      const t = trainings[key];
      if ((t.doneDate || t.dueDate || t.schedule) && (!t.doneDate || !t.dueDate)) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Details",
          text: `${key} training requires Done Date & Due Date`
        });
        return;
      }
    }

    try {
      setSaving(true);
      await api.put("/driver/profile/training", { trainings });

      Swal.fire({
        icon: "success",
        title: "Training Updated",
        text: "All training details saved successfully",
        timer: 1400,
        showConfirmButton: false
      });
    } catch {
      Swal.fire("Error", "Unable to save training details", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="rail-page flex items-center justify-center">
          <div className="rail-card px-8 py-6 text-[#6B7280]">Loading training details...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="rail-page">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BackButton />
                <div>
                  <h2 className="rail-page-title">Health / Training Details</h2>
                  <p className="rail-page-subtitle">Maintain mandatory compliance for rail operations</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#E8EEF5] px-4 py-3 text-sm text-[#0B3C5D]">
              <p className="font-semibold">Compliance status</p>
              <p className="text-[#1F6F8B]">Track upcoming renewals</p>
            </div>
          </div>

          <div className="rail-panel p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#F9FBFC] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EEF5] text-[#0B3C5D]">
                <HeartPulse size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2937]">Training Review</h3>
                <p className="text-sm text-[#6B7280]">Keep the training record current and complete.</p>
              </div>
            </div>

            <div className="space-y-4">
              {TRAINING_KEYS.map(key => (
                <TrainingSection
                  key={key}
                  title={key.replace("_", " ")}
                  data={trainings[key]}
                  onChange={v => setTrainings({ ...trainings, [key]: v })}
                />
              ))}
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-[#2E7D32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#256b28] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Training Details"}
            </button>
          </div>
        </div>
      </div>

    </>
  );
}

function TrainingSection({ title, data, onChange }) {
  const today = new Date();
  const dueDateObj = data.dueDate ? new Date(data.dueDate) : null;

  let statusBox = null;

  if (dueDateObj) {
    const diffMs = dueDateObj - today;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      statusBox = <div className="mb-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#F5C2C7] bg-[#FFF5F5] p-3 text-sm font-medium text-[#C62828]">Overdue by {Math.abs(daysLeft)} days</div>;
    } else if (daysLeft <= 30) {
      statusBox = <div className="mb-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#F9DDA8] bg-[#FFF8E1] p-3 text-sm font-medium text-[#F9A825]">Expiring in {daysLeft} days</div>;
    } else {
      statusBox = <div className="mb-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#C8E6C9] bg-[#F1F8E9] p-3 text-sm font-medium text-[#2E7D32]">Valid till {data.dueDate}</div>;
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#F9FBFC] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardCheck size={18} className="text-[#1F6F8B]" />
        <h3 className="text-lg font-semibold text-[#1F2937]">{title}</h3>
      </div>
      {statusBox}
      <div className="grid gap-4 md:grid-cols-3">
        <DateField label="Done Date" value={data.doneDate} onChange={v => { const schedule = calculateSchedule(v, data.dueDate); onChange({ ...data, doneDate: v, schedule }); }} />
        <DateField label="Next Due Date" value={data.dueDate} onChange={v => { const schedule = calculateSchedule(data.doneDate, v); onChange({ ...data, dueDate: v, schedule }); }} />
        <InputField label="Schedule" placeholder="Auto calculated" value={data.schedule} disabled />
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#1F2937]">{label}</label>
      <input type="text" value={value} placeholder={placeholder} disabled={disabled} onChange={e => onChange?.(e.target.value)} className="rail-input disabled:cursor-not-allowed disabled:bg-[#F3F4F6]" />
    </div>
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