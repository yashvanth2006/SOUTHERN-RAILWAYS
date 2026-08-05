import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { Download, Calendar, Building2, Loader2 } from "lucide-react";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";

export default function AdminReportDownload() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depot, setDepot] = useState("");
  const [depots, setDepots] = useState([]);
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const download = async () => {
    if (!from || !to) {
      Swal.fire("Missing Dates", "Please select From & To dates", "warning");
      return;
    }

    try {
      setDownloading(true);
      const res = await api.get("/admin/reports/download", {
        params: { from, to, depot },
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
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6">
<BackButton/>

          {/* HEADER */}
          <div className="my-6">
            <h2 className="text-xl font-bold text-gray-800">
              Admin Report Download
            </h2>
            <p className="text-sm text-gray-500">
              Generate CSV reports based on date range and depot
            </p>
          </div>

          {/* FILTERS */}
          <div className="space-y-5">

            {/* DATE RANGE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full border rounded-lg pl-10 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full border rounded-lg pl-10 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* DEPOT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depot
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={depot}
                  onChange={e => setDepot(e.target.value)}
                  className="w-full border rounded-lg pl-10 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">All Depots</option>
                  {depots.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
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
                         : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
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
      <Footer/>
    </>
  );
}
