import { useEffect, useState } from "react";
import api from "../api/axios";
import CustomDatePicker from "../components/CustomDatePicker";
import Swal from "sweetalert2";
import {
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Train,
  UserCog,
  Filter,
  RefreshCw,
  AlertTriangle,
  Building2,
  Loader2,
  CalendarDays
} from "lucide-react";
import BackButton from "../components/BackButton";
import CustomSelect from "../components/CustomSelect";

export default function AdminCircularStatus() {
  const [circulars, setCirculars] = useState([]);
  const [selectedCircular, setSelectedCircular] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // ✅ NEW
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCirculars, setLoadingCirculars] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterDepot, setFilterDepot] = useState("");
  const userRole = localStorage.getItem("role");

  // ✅ LOAD CIRCULARS (with optional date filter)
  const loadCirculars = async (date = "") => {
    try {
      setLoadingCirculars(true);

      const res = await api.get("/admin/circulars", {
        params: date ? { date } : {}
      });

      setCirculars(res.data);

      if (res.data.length > 0) {
        setSelectedCircular(res.data[0]._id);
      } else {
        setSelectedCircular("");
        setReport(null);
      }

    } catch (err) {
      Swal.fire("Error", "Failed to load circulars", "error");
    } finally {
      setLoadingCirculars(false);
    }
  };

  useEffect(() => {
    loadCirculars();
  }, []);

  // Reload circulars when date changes
  useEffect(() => {
    loadCirculars(selectedDate);
  }, [selectedDate]);

  // Load acknowledgement report
  useEffect(() => {
    if (!selectedCircular) return;

    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/circulars/acknowledgement-report", {
          params: { circularId: selectedCircular }
        });
        setReport(res.data);
      } catch {
        Swal.fire("Error", "Failed to load acknowledgement report", "error");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [selectedCircular]);

  const filteredUsers = report?.users?.filter(user => {
    if (filterRole && user.role !== filterRole) return false;
    if (filterStatus === "acknowledged" && !user.acknowledged) return false;
    if (filterStatus === "pending" && user.acknowledged) return false;
    if (filterDepot && user.depotName !== filterDepot) return false;
    return true;
  }) || [];

  const uniqueDepots = [...new Set(report?.users?.map(u => u.depotName).filter(Boolean))].sort();

  const refreshReport = async () => {
    if (!selectedCircular) return;
    try {
      setLoading(true);
      const res = await api.get("/admin/circulars/acknowledgement-report", {
        params: { circularId: selectedCircular }
      });
      setReport(res.data);
      Swal.fire({ icon: "success", title: "Refreshed", timer: 1000, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "Failed to refresh", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <BackButton />

          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-l lg:text-3xl font-bold text-slate-800 tracking-tight break-words">
                    Circular Acknowledgements
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Monitor who has read and acknowledged circulars
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <button
              onClick={refreshReport}
              disabled={loading || !selectedCircular}
              className="bg-[#0b659a] hover:bg-[#084d78] text-white rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DATE FILTER */}
            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-center">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-[#0b659a]">
                  <CalendarDays size={16} />
                </div>
                Filter by Date
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CustomDatePicker
                  value={selectedDate}
                  onChange={(v) => setSelectedDate(v)}
                  placeholderText="DD/MM/YYYY"
                  className="w-full sm:w-[160px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition-all cursor-pointer"
                />

                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="text-sm font-medium text-[#0b659a] hover:text-[#09527d] transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* CIRCULAR SELECTOR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-center">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-[#0b659a]">
                  <FileText size={16} />
                </div>
                Select Circular
              </label>

              {loadingCirculars ? (
                <div className="flex items-center gap-2 text-slate-500 py-2">
                  <Loader2 size={18} className="animate-spin text-[#0b659a]" />
                  <span className="font-medium">Loading circulars...</span>
                </div>
              ) : circulars.length === 0 ? (
                <div className="text-amber-600 flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 font-medium">
                  <AlertTriangle size={18} />
                  No circulars found for selected date.
                </div>
              ) : (
                <CustomSelect
                  value={selectedCircular}
                  onChange={(v) => setSelectedCircular(v)}
                  options={circulars.map((c) => ({
                    value: c._id,
                    label: `${c.title} (${new Date(c.circularDate).toLocaleDateString()})`
                  }))}
                  placeholder="Select Circular"
                />
              )}
            </div>
          </div>

          {/* SUMMARY CARDS */}
          {report && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryCard icon={<Users />} label="Total Users" value={report.summary.total} color="slate" />
              <SummaryCard icon={<XCircle />} label="Pending" value={report.summary.pending} color="red" />
              <SummaryCard icon={<FileText />} label="Completion" value={`${report.summary.percentComplete}%`} color="indigo" />
            </div>
          )}
          {userRole !== "DEPOT_MANAGER" && (
            <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-3 text-slate-700 font-bold mr-2">
                <div className="p-2 bg-slate-100 rounded-lg text-[#0b659a]">
                  <Filter size={20} />
                </div>
                <span className="text-base">Filters</span>
              </div>


              {/* Wrapper to push filters to the right */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
                  {/* Role Filter */}
                  <CustomSelect
                    value={filterRole}
                    onChange={setFilterRole}
                    options={[
                      { value: "", label: "All Roles" },
                      { value: "DRIVER", label: "Driver" },
                      { value: "DEPOT_MANAGER", label: "SSE/TRD" },
                      ...(userRole !== "ADEE" ? [{ value: "ADEE", label: "ADEE" }] : []),
                    ]}
                    placeholder="All Roles"
                  />

                  {/* Depot Filter */}
                  <CustomSelect
                    value={filterDepot}
                    onChange={setFilterDepot}
                    options={[
                      { value: "", label: "All Depots" },
                      ...uniqueDepots.map(d => ({ value: d, label: d }))
                    ]}
                    placeholder="All Depots"
                  />
                </div>
            </div>
          )}

          {/* USERS TABLE (unchanged below this) */}
          {/* ⬇ Your existing table code remains exactly same ⬇ */}

          {/* USERS TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-500">
                <Loader2 size={36} className="animate-spin mb-4 text-[#0b659a]" />
                <p className="font-medium text-lg">Loading acknowledgement data...</p>
              </div>
            ) : !report || filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <FileText size={48} className="text-slate-300" />
                </div>
                <p className="font-medium text-lg text-slate-600">No results</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">PF No</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Depot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                        <td className="px-6 py-4">
                          {user.acknowledged ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-emerald-100 rounded-lg">
                              <CheckCircle size={14} />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-100 rounded-lg">
                              <XCircle size={14} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600">{user.pfNo}</td>
                        <td className="px-6 py-4 text-slate-600">{user.role}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-semibold bg-[#0b659a]/10 text-[#09527d] border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-[#0b659a]/10 rounded-lg">
                            {user.depotName || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>


    </>
  );
}

/* ================= COMPONENT ================= */

function SummaryCard({ icon, label, value, color }) {
  const colorClasses = {
    slate: "bg-slate-50 text-[#0b659a] border border-slate-100",
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    red: "bg-red-50 text-red-600 border border-red-100",
    indigo: "bg-slate-100 text-[#0b659a] border border-slate-200"
  };

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500; // 1.5 seconds

    const targetValue = parseInt(value, 10) || 0;
    const isPercent = typeof value === 'string' && value.includes('%');

    if (targetValue === 0) {
      setDisplayValue(isPercent ? '0%' : 0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentNum = Math.floor(easeProgress * targetValue);
      setDisplayValue(isPercent ? `${currentNum}%` : currentNum);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(isPercent ? `${targetValue}%` : targetValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 flex items-center gap-5">
      <div className={`p-4 rounded-2xl flex-shrink-0 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 tracking-wide mb-1 uppercase">{label}</p>
        <p className="text-3xl font-bold text-slate-800">{displayValue}</p>
      </div>
    </div>
  );
}
