import { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import { Download, Calendar, Building2, Loader2, User, ClipboardList } from "lucide-react";
import BackButton from "../components/BackButton";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomSelect from "../components/CustomSelect";

export default function AdminReportDownload() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depot, setDepot] = useState("");
  const [depots, setDepots] = useState([]);
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [preset, setPreset] = useState("None");
  const [driverId, setDriverId] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // 🔹 Fetch depots from backend
  useEffect(() => {
    const fetchDepots = async () => {
      try {
        setLoadingDepots(true);
        const res = await api.get("/admin/depots");
        setDepots(res.data);
      } catch (err) {
        console.error("Failed to load depots:", err);
        Swal.fire("Error", "Failed to load depots", "error");
      } finally {
        setLoadingDepots(false);
      }
    };
    fetchDepots();
  }, []);

  // 🔹 Fetch drivers when depot changes
  useEffect(() => {
    if (!depot) {
      setDrivers([]);
      setDriverId("");
      return;
    }

    const fetchDrivers = async () => {
      try {
        setLoadingDrivers(true);
        const res = await api.get("/admin/users", { params: { depot } });
        setDrivers(res.data.drivers || []);
        setDriverId("");
      } catch (err) {
        console.error("Failed to load drivers:", err);
      } finally {
        setLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, [depot]);

  const handlePresetChange = (selected) => {
    setPreset(selected);

    if (selected === "None") {
      setFrom("");
      setTo("");
      return;
    }

    const today = new Date();
    let days = 0;

    if (selected === "Last 7 Days") days = 7;
    else if (selected === "Last 14 Days") days = 14;
    else if (selected === "Last 30 Days") days = 30;

    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - days);

    setFrom(fromDate.toISOString().split("T")[0]);
    setTo(today.toISOString().split("T")[0]);
  };

  const handleManualDateChange = (type, value) => {
    setPreset("None");
    if (type === "from") setFrom(value);
    else setTo(value);
  };

  const download = async () => {
    if (!from || !to) {
      Swal.fire("Missing Dates", "Please select From & To dates", "warning");
      return;
    }

    try {
      setDownloading(true);
      const res = await api.get("/admin/reports/download", {
        params: { from, to, depot, ...(driverId && { driverId }) },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-report-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: "Report has been downloaded successfully",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Download failed:", err);
      Swal.fire("Download Failed", "Unable to generate report. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>

      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
              <ClipboardList size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Admin Report Download
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Generate CSV reports based on date range and depot
              </p>
            </div>
          </div>
        </div>

        {/* ================= FILTERS CARD ================= */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm max-w-4xl mx-auto">
          {/* FILTERS */}
          <div className="space-y-5">

            {/* DATE RANGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>

              <div className="mb-4">
                <CustomSelect
                  value={preset}
                  onChange={handlePresetChange}
                  options={[
                    { value: "None", label: "Preset: None" },
                    { value: "Last 7 Days", label: "Last 7 Days" },
                    { value: "Last 14 Days", label: "Last 14 Days" },
                    { value: "Last 30 Days", label: "Last 30 Days" }
                  ]}
                  placeholder="Select Preset"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Calendar
                        size={18}
                        className={preset !== "None" ? "text-gray-300" : "text-gray-400"}
                      />
                    </div>
                    <div className="w-full">
                      <CustomDatePicker
                        value={from}
                        onChange={(v) => handleManualDateChange("from", v)}
                        disabled={preset !== "None"}
                        className="w-full border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg pl-10 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                        placeholderText="DD/MM/YYYY"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Calendar
                        size={18}
                        className={preset !== "None" ? "text-gray-300" : "text-gray-400"}
                      />
                    </div>
                    <div className="w-full">
                      <CustomDatePicker
                        value={to}
                        onChange={(v) => handleManualDateChange("to", v)}
                        disabled={preset !== "None"}
                        className="w-full border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg pl-10 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                        placeholderText="DD/MM/YYYY"
                      />
                    </div>
                  </div>
              </div>
            </div>

            {/* DEPOT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depot
              </label>

              <div className="relative">
                <CustomSelect
                  value={depot}
                  onChange={v => setDepot(v)}
                  options={[
                    { value: "", label: "All Depots" },
                    ...depots.map(d => ({ value: d, label: d }))
                  ]}
                  placeholder="All Depots"
                  icon={<Building2 size={18} />}
                />
              </div>
            </div>

            {/* DRIVER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver
              </label>

              <div className="relative">
                <CustomSelect
                  value={driverId}
                  onChange={v => setDriverId(v)}
                  disabled={!depot || loadingDrivers}
                  options={[
                    ...(!depot 
                        ? [{ value: "", label: "Select a depot first" }] 
                        : [{ value: "", label: "All Drivers" }]),
                    ...drivers.map(drv => ({ value: drv._id, label: `${drv.name} (${drv.pfNo})` }))
                  ]}
                  placeholder={!depot ? "Select a depot first" : "All Drivers"}
                  icon={
                    loadingDrivers 
                      ? <Loader2 size={18} className="animate-spin text-[#0b659a]" /> 
                      : <User size={18} className={!depot ? "text-gray-400" : "text-[#0b659a]"} />
                  }
                />
              </div>
            </div>

          </div>

          {/* ACTION */}
          <button
            onClick={download}
            disabled={downloading || !from || !to}
            className={`mt-6 w-full flex items-center justify-center gap-2
                       py-2.5 rounded-lg font-medium transition
                       ${downloading || !from || !to
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0b659a] text-white hover:bg-[#09527d]'}`}
          >
            {downloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download size={18} />
                Download CSV
              </>
            )}
          </button>

        </div>
      </div>

    </>
  );
}
