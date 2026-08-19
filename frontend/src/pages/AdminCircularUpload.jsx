import { useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import { UploadCloud, FileText, FileUp } from "lucide-react";
import BackButton from "../components/BackButton";
import CustomDatePicker from "../components/CustomDatePicker";

export default function AdminCircularUpload() {
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [circularDate, setCircularDate] = useState("");

  const upload = async () => {
  if (!title || !pdf || !circularDate) {
    Swal.fire("Missing Data", "Title, Date and PDF required", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("pdf", pdf);
  formData.append("circularDate", circularDate); // ✅ send date

  try {
    setLoading(true);
    await api.post("/admin/circulars", formData);
    Swal.fire("Uploaded", "Circular uploaded successfully", "success");
    setTitle("");
    setPdf(null);
    setCircularDate("");
  } catch {
    Swal.fire("Error", "Upload failed", "error");
  } finally {
    setLoading(false);
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
              <FileUp size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Upload Official Circular
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Upload PDF circulars for drivers and depot managers
              </p>
            </div>
          </div>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm max-w-3xl mx-auto">
          {/* TITLE INPUT */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Circular Title
            </label>
            <input
              type="text"
              placeholder="e.g. Safety Guidelines – Jan 2026"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0b659a]"
            />
          </div>

          {/* DATE INPUT */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Circular Date
  </label>
    <div className="relative">
      <CustomDatePicker
        value={circularDate}
        onChange={(v) => setCircularDate(v)}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 
                   text-gray-700 bg-white shadow-sm
                   hover:border-[#0b659a]/40 focus:outline-none 
                   focus:ring-2 focus:ring-[#0b659a]/20 focus:border-[#0b659a]
                   transition-all duration-200"
        placeholderText="DD/MM/YYYY"
      />
  </div>
</div>

          {/* FILE UPLOAD */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>

            <label
              className="flex flex-col items-center justify-center gap-2
                         border-2 border-dashed border-[#0b659a]/40
                         rounded-xl p-6 cursor-pointer
                         hover:bg-[#0b659a]/10 transition"
            >
              <UploadCloud className="text-[#0b659a]" size={36} />
              <span className="text-sm text-gray-600">
                Click to select PDF file
              </span>
              <span className="text-xs text-gray-400">
                PDF files only
              </span>

              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={e => setPdf(e.target.files[0])}
              />
            </label>

            {/* FILE NAME */}
            {pdf && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <FileText size={18} className="text-[#0b659a]" />
                <span className="truncate">{pdf.name}</span>
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={upload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2
                       bg-[#0b659a] text-white py-2.5 rounded-lg
                       font-medium hover:bg-[#09527d]
                       disabled:opacity-60 transition"
          >
            {loading ? "Uploading..." : "Upload Circular"}
          </button>

        </div>
      </div>
      
    </>
  );
}
