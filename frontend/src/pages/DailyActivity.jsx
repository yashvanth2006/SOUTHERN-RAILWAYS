import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";
import {
  LogIn,
  LogOut,
  Route,
  Gauge,
  MapPin,
  Hash,
  CheckCircle
} from "lucide-react";
import Footer from "../components/Footer";

export default function DailyActivity() {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [twNumber, setTwNumber] = useState("");
  const [km, setKm] = useState("");
  const [breathAnalyserinitial, setBreathAnalyserinitial] = useState(false);
  const [breathAnalyserDone, setBreathAnalyserDone] = useState(false);
const [signInImage, setSignInImage] = useState(null);

const [signOutImage, setSignOutImage] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalDistance = Number(km || 0);
  const mileageAmount = totalDistance * 5.2;

  const towerCars = ["RU 927/017", "SR 220035", "SR 210018", "SR 960025", "SR 23025", "SR 240063", "RU 06878", "SR 230022", "SR 210067", "RU 01896", "RU 176019", "SR 230059", "RU 9516", "RU 9514", "RU 9496", "RU 950021", "LR", "TRAINING"];

  const getLocationName = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject();

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();

        resolve(data.address?.railway || data.address?.station || data.display_name);
      });
    });
  };

  useEffect(() => {
    api.get("/driver/active-duty").then(async res => {
      if (res.data.active) {
        setSignedIn(true);
        setFromStation(res.data.fromStation);
        setTwNumber(res.data.twNumber);
        setBreathAnalyserDone(res.data.breathAnalyserDone);
      } else {
        const loc = await getLocationName();
        setFromStation(loc);
      }
    });
  }, []);

const signIn = async () => {

  if (!twNumber) {

    Swal.fire(
      "Missing Data",
      "Tower Car Number required",
      "warning"
    );

    return;

  }

  try {

    setLoading(true);

    const formData = new FormData();

    formData.append("fromStation", fromStation);

    formData.append("twNumber", twNumber);

    formData.append(
      "breathAnalyserinitial",
      breathAnalyserinitial
    );

    if (signInImage) {

      formData.append("image", signInImage);

    }

    await api.post(
      "/driver/signin",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setSignedIn(true);

    Swal.fire({
      icon: "success",
      title: "Signed ON",
      text: "Duty started successfully",
      timer: 1400,
      showConfirmButton: false
    });

  } catch (e) {

    Swal.fire(
      "Error",
      e.response?.data?.msg || "Failed",
      "error"
    );

  } finally {

    setLoading(false);

  }

};

const signOut = async () => {

  if (!km || !breathAnalyserDone) {

    Swal.fire(
      "Missing Data",
      "KM required",
      "warning"
    );

    return;

  }

  try {

    setLoading(true);

    const loc = await getLocationName();

    setToStation(loc);

    const formData = new FormData();

    formData.append("toStation", loc);

    formData.append("km", km);

    formData.append(
      "breathAnalyserDone",
      breathAnalyserDone
    );

    if (signOutImage) {

      formData.append("image", signOutImage);

    }

    await api.post(
      "/driver/signout",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    Swal.fire({
      icon: "success",
      title: "Duty Completed",
      text: "Mileage recorded successfully",
      timer: 1600,
      showConfirmButton: false
    });

    setSignedIn(false);

    setTwNumber("");

    setKm("");

    setBreathAnalyserDone(false);

    setSignInImage(null);

    setSignOutImage(null);

    const freshLoc = await getLocationName();

    setFromStation(freshLoc);

  } catch (e) {

    Swal.fire(
      "Error",
      e.response?.data?.msg || "Failed",
      "error"
    );

  } finally {

    setLoading(false);

  }

};

  return (
    <>
      <Navbar />
      <div className="rail-page">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BackButton />
                <div>
                  <h2 className="rail-page-title">Mileage & Duty Log</h2>
                  <p className="rail-page-subtitle">Track daily duty sign-on and mileage submission</p>
                </div>
              </div>
            </div>
          </div>

          <SectionCard title="Sign ON" icon={<LogIn />} status={signedIn ? "Completed" : "Pending"} tone={signedIn ? "valid" : "warning"}>
            <ReadOnlyInput label="From Station" icon={<MapPin size={18} />} value={fromStation} />
            <SelectInput label="Tower Car Number" icon={<Hash size={18} />} value={twNumber} onChange={setTwNumber} disabled={signedIn} options={towerCars} />
            <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-[#1F2937]">
              <input type="checkbox" checked={breathAnalyserinitial} onChange={() => setBreathAnalyserinitial(!breathAnalyserinitial)} className="h-4 w-4 rounded border-[#D1D5DB]" />
              Breath Analyser Test Done
            </label>
            <div className="mt-4">

  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
    Upload Breath Analyser Photo
  </label>

  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={(e) =>
      setSignInImage(e.target.files[0])
    }
    className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-sm"
  />

  {signInImage && (

    <p className="mt-2 text-sm text-green-700">

      📷 {signInImage.name}

    </p>

  )}

</div>
            <ActionButton label={signedIn ? "Signed ON" : "Sign ON"} icon={<CheckCircle />} onClick={signIn} loading={loading} disabled={signedIn} color="green" />
          </SectionCard>

          <SectionCard title="Sign OFF" icon={<LogOut />} status={signedIn ? "Pending" : "Disabled"} tone={signedIn ? "danger" : "info"}>
            <ReadOnlyInput label="To Station (Auto detected)" icon={<MapPin size={18} />} value={toStation} />
            <Input label="Total Distance (KM)" icon={<Route size={18} />} value={km} onChange={setKm} disabled={!signedIn} />
            <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-[#1F2937]">
              <input type="checkbox" checked={breathAnalyserDone} onChange={() => setBreathAnalyserDone(!breathAnalyserDone)} className="h-4 w-4 rounded border-[#D1D5DB]" />
              Breath Analyser Test Done
            </label>
            <div className="mt-4">

  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
    Upload Breath Analyser Photo
  </label>

  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={(e) =>
      setSignOutImage(e.target.files[0])
    }
    className="block w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-sm"
  />

  {signOutImage && (

    <p className="mt-2 text-sm text-green-700">

      📷 {signOutImage.name}

    </p>

  )}

</div>
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#D1D5DB] bg-[#F9FBFC] p-4">
              <Gauge className="text-[#0B3C5D]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Calculated Amount</p>
                <p className="text-2xl font-bold text-[#0B3C5D]">₹ {mileageAmount.toFixed(2)}</p>
              </div>
            </div>
            <ActionButton label="Sign OFF" icon={<LogOut />} onClick={signOut} loading={loading} disabled={!signedIn} color="red" />
          </SectionCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

function SectionCard({ title, icon, status, tone, children }) {
  const toneClasses = {
    valid: "rail-status-valid",
    warning: "rail-status-warning",
    danger: "rail-status-danger",
    info: "rail-status-info"
  };

  return (
    <div className="rail-card p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#1F2937]">
          {icon}
          {title}
        </div>
        <span className={`rail-badge ${toneClasses[tone]}`}>{status}</span>
      </div>
      {children}
    </div>
  );
}

function Input({ label, icon, value, onChange, disabled }) {
  return (
    <div className="mb-3">
      <label className="mb-2 block text-sm font-semibold text-[#1F2937]">{label}</label>
      <div className="relative">
        <span className="rail-input-icon">{icon}</span>
        <input value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="rail-input rail-input-with-icon disabled:bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

function SelectInput({ label, icon, value, onChange, disabled, options }) {
  return (
    <div className="mb-3">
      <label className="mb-2 block text-sm font-semibold text-[#1F2937]">{label}</label>
      <div className="relative">
        <span className="rail-input-icon">{icon}</span>
        <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="rail-input rail-input-with-icon disabled:bg-[#F3F4F6]">
          <option value="">Select Tower Car</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ReadOnlyInput({ label, icon, value }) {
  return (
    <div className="mb-3">
      <label className="mb-2 block text-sm font-semibold text-[#1F2937]">{label}</label>
      <div className="relative">
        <span className="rail-input-icon">{icon}</span>
        <input value={value} readOnly title={value} className="rail-input rail-input-with-icon truncate bg-[#F9FBFC]" />
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, loading, disabled, color }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${color === "red" ? "bg-[#C8102E] hover:bg-[#a50d26]" : "bg-[#2E7D32] hover:bg-[#256b28]"} ${disabled || loading ? "cursor-not-allowed opacity-70" : ""}`}>
      {loading ? "Processing..." : label}
      {icon}
    </button>
  );
}