import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import CustomSelect from "../components/CustomSelect";
import Swal from "sweetalert2";
import {
  LogIn,
  LogOut,
  Route,
  Gauge,
  MapPin,
  Hash,
  CheckCircle,
  Camera,
  ImagePlus,
  RefreshCw
} from "lucide-react";
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

  const [towerCars, setTowerCars] = useState([]);

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
    api.get("/engine/tower-cars/list").then(res => setTowerCars(res.data || []));

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
      <div className="rail-page">
        <div className="space-y-6">
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
            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold text-[#1F2937]">Tower Car Number</label>
              <CustomSelect 
                value={twNumber} 
                onChange={setTwNumber} 
                disabled={signedIn} 
                options={[
                  { value: "", label: "Select Tower Car" },
                  ...towerCars.map(opt => ({ value: opt, label: opt }))
                ]}
                placeholder="Select Tower Car"
                icon={<Hash size={18} />}
              />
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-[#1F2937]">
              <input type="checkbox" checked={breathAnalyserinitial} onChange={() => setBreathAnalyserinitial(!breathAnalyserinitial)} className="h-4 w-4 rounded border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB]" />
              Breath Analyser Test Done
            </label>
            <PhotoUploadBox image={signInImage} onImageSelect={setSignInImage} onImageRemove={() => setSignInImage(null)} />
            <ActionButton label={signedIn ? "Signed ON" : "Sign ON"} icon={<CheckCircle />} onClick={signIn} loading={loading} disabled={signedIn} color="green" />
          </SectionCard>

          <SectionCard title="Sign OFF" icon={<LogOut />} status={signedIn ? "Pending" : "Disabled"} tone={signedIn ? "danger" : "info"}>
            <ReadOnlyInput label="To Station (Auto detected)" icon={<MapPin size={18} />} value={toStation} />
            <Input label="Total Distance (KM)" icon={<Route size={18} />} value={km} onChange={setKm} disabled={!signedIn} />
            <label className="mt-3 flex items-center gap-3 text-sm font-semibold text-[#1F2937]">
              <input type="checkbox" checked={breathAnalyserDone} onChange={() => setBreathAnalyserDone(!breathAnalyserDone)} className="h-4 w-4 rounded border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB]" />
              Breath Analyser Test Done
            </label>
            <PhotoUploadBox image={signOutImage} onImageSelect={setSignOutImage} onImageRemove={() => setSignOutImage(null)} />
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#D1D5DB] bg-[#F9FBFC] p-4">
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

function PhotoUploadBox({ image, onImageSelect, onImageRemove }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  return (
    <div className="mt-4">
      <label className="block text-sm font-semibold text-[#1F2937] mb-2">
        Upload Breath Analyser Photo
      </label>

      {image ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#0b659a]/30 bg-[#F8FAFC] p-4 text-center transition-all">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Photo Attached</p>
              <p className="text-xs text-slate-500 truncate max-w-[200px] mx-auto">{image.name}</p>
            </div>
            <button
              onClick={onImageRemove}
              className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw size={14} /> Retake / Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition-all hover:border-[#0b659a]/50 hover:bg-slate-100">
          <p className="mb-4 text-sm font-medium text-slate-500">How would you like to attach the photo?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0b659a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#09527d]"
            >
              <Camera size={18} />
              Take Photo
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ImagePlus size={18} />
              Browse Gallery
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={(e) => onImageSelect(e.target.files[0])}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={(e) => onImageSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}