import { useEffect, useState } from "react";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";
import {
  User,
  BadgeIndianRupee,
  Calendar,
  IdCard,
  Building2
} from "lucide-react";
import CustomDatePicker from "../components/CustomDatePicker";
export default function DriverProfile() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    hrmsId: "",
    designation: "",
    basicPay: "",
    dateOfAppointment: "",
    dateOfEntryAsTWD: ""
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/driver/profile").then(res => {
      setUser(res.data.user);

      const p = res.data.profile || {};

      setForm({
        hrmsId: p.hrmsId || "",
        designation: p.designation || "",
        basicPay: p.basicPay || "",
        dateOfAppointment: p.dateOfAppointment?.substring(0, 10) || "",
        dateOfEntryAsTWD: p.dateOfEntryAsTWD?.substring(0, 10) || ""
      });
    });
  }, []);

  const save = async () => {
    if (!form.hrmsId || !form.designation || !form.basicPay) {
      Swal.fire(
        "Missing Data",
        "HRMS ID, Designation & Basic Pay are mandatory",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);
      await api.put("/driver/profile/bio", form);

      Swal.fire({
        icon: "success",
        title: "Bio Data Updated",
        timer: 1300,
        showConfirmButton: false
      });
    } catch {
      Swal.fire("Error", "Unable to save bio data", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <>
        <div className="rail-page flex items-center justify-center">
          <div className="rail-card px-8 py-6 text-[#6B7280]">Loading profile details...</div>
        </div>

      </>
    );
  }

  return (
    <>
      <div className="rail-page">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BackButton />
                <div>
                  <h2 className="rail-page-title">Driver Bio Data</h2>
                  <p className="rail-page-subtitle">Maintain official profile information</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rail-panel p-4 sm:p-6 md:p-8">
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <ReadOnly label="Driver Name" value={user.name} icon={<User size={16} />} />
              <ReadOnly label="PF Number" value={user.pfNo} icon={<IdCard size={16} />} />
              <ReadOnly label="Depot" value={user.depotName} icon={<Building2 size={16} />} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="HRMS ID" icon={<IdCard size={18} />} value={form.hrmsId} onChange={v => setForm({ ...form, hrmsId: v })} />
              <Input label="Designation" icon={<User size={18} />} value={form.designation} onChange={v => setForm({ ...form, designation: v })} />
              <Input label="Basic Pay" type="number" icon={<BadgeIndianRupee size={18} />} value={form.basicPay} onChange={v => setForm({ ...form, basicPay: v })} />
              <DateInput label="Date of Appointment" value={form.dateOfAppointment} onChange={v => setForm({ ...form, dateOfAppointment: v })} />
              <DateInput label="Date of Entry as TWD" value={form.dateOfEntryAsTWD} onChange={v => setForm({ ...form, dateOfEntryAsTWD: v })} />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#2E7D32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#256b28] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Bio Data"}
            </button>
          </div>
        </div>
      </div>

    </>
  );
}

function ReadOnly({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border-[#D1D5DB] bg-[#F9FBFC] p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
        {icon} {label}
      </p>
      <p className="font-semibold text-[#1F2937]">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, icon, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#1F2937]">{label}</label>
      <div className="relative">
        <span className="rail-input-icon">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="rail-input rail-input-with-icon"
        />
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#1F2937]">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-slate-400">
            <Calendar size={18} />
          </div>
          <div className="w-full">
            <CustomDatePicker
              value={value}
              onChange={onChange}
              className="rail-input rail-input-with-icon w-full pl-10"
              placeholderText="DD/MM/YYYY"
            />
          </div>
        </div>
    </div>
  );
}
