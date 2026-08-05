import { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import Footer from "../components/Footer";

import { AlertTriangle, Send } from "lucide-react";

const towerCars = ["RU 927/017", "SR 220035", "SR 210018", "SR 960025", "SR 23025", "SR 240063", "RU 06878", "SR 230022", "SR 210067", "RU 01896", "RU 176019", "SR 230059", "RU 9516", "RU 9514", "RU 9496", "RU 950021", "LR", "TRAINING"];

const abnormalityTypes = ["Track Side Abnormality", "Visibility of Signal", "Foreign Material on Track", "Trespassing Human", "Trespassing Cattle", "Others"];

export default function DriverAbnormality() {
  const [towerCarNo, setTowerCarNo] = useState("");
  const [history, setHistory] = useState([]);
  const [remarks, setRemarks] = useState({
    "Track Side Abnormality": "",
    "Visibility of Signal": "",
    "Foreign Material on Track": "",
    "Trespassing Human": "",
    "Trespassing Cattle": "",
    "Others": ""
  });

  const loadHistory = async () => {
    try {
      const res = await api.get("/abnormalities/my");
      setHistory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const submit = async () => {
    if (!towerCarNo) {
      Swal.fire("Missing", "Select Tower Car", "warning");
      return;
    }

    const abnormalities = abnormalityTypes.map(type => ({
      type,
      remarks: remarks[type]
    }));

    try {
      await api.post("/abnormalities", { towerCarNo, abnormalities });
      Swal.fire("Success", "Report Submitted", "success");
      setTowerCarNo("");
      setRemarks({
        "Track Side Abnormality": "",
        "Visibility of Signal": "",
        "Foreign Material on Track": "",
        "Trespassing Human": "",
        "Trespassing Cattle": "",
        "Others": ""
      });
      loadHistory();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Unable to submit", "error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="rail-page">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BackButton />
                <div>
                  <h2 className="rail-page-title">Track Abnormality Report</h2>
                  <p className="rail-page-subtitle">Submit all abnormalities observed during duty</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rail-panel p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#D1D5DB] bg-[#F9FBFC] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EEF5] text-[#C8102E]">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2937]">Operational incident report</h3>
                <p className="text-sm text-[#6B7280]">Record safety concerns for the current duty.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F2937]">Tower Car Number</label>
                <select value={towerCarNo} onChange={e => setTowerCarNo(e.target.value)} className="rail-input">
                  <option value="">Select Tower Car</option>
                  {towerCars.map(car => <option key={car} value={car}>{car}</option>)}
                </select>
              </div>

              {abnormalityTypes.map(type => (
                <div key={type} className="rounded-2xl border border-[#D1D5DB] bg-[#F9FBFC] p-4">
                  <h3 className="font-semibold text-[#C8102E]">{type}</h3>
                  <textarea rows={3} value={remarks[type]} onChange={e => setRemarks({ ...remarks, [type]: e.target.value })} placeholder="Enter remarks" className="rail-input mt-3 min-h-[96px]" />
                </div>
              ))}
            </div>

            <button onClick={submit} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#C8102E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a50d26]">
              <Send size={18} /> Submit Report
            </button>
          </div>

          <div className="rail-card overflow-hidden">
            <div className="border-b border-[#D1D5DB] px-5 py-4">
              <h3 className="font-semibold text-[#1F2937]">Previous Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F9FBFC] text-left text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Tower Car</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-[#6B7280]">No Reports</td>
                    </tr>
                  )}
                  {history.map(report => (
                    <tr key={report._id} className="border-t border-[#E5E7EB]">
                      <td className="px-4 py-3">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{report.towerCarNo}</td>
                      <td className="px-4 py-3"><span className={`rail-badge ${report.status === "Pending" ? "rail-status-danger" : "rail-status-valid"}`}>{report.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}