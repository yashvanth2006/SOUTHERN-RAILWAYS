import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { UploadCloud, FileText } from "lucide-react";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";

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
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
 
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-md">
       <BackButton/>
          {/* HEADER */}
          <div className="my-6">
            <h2 className="text-xl font-bold text-gray-800">
              Upload Official Circular
            </h2>
            <p className="text-sm text-gray-500">
              Upload PDF circulars for drivers and depot managers
            </p>
          </div>

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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* DATE INPUT */}
<div className="mb-5">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Circular Date
  </label>
  <input
    type="date"
    value={circularDate}
    onChange={e => setCircularDate(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
</div>

          {/* FILE UPLOAD */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>

            <label
              className="flex flex-col items-center justify-center gap-2
                         border-2 border-dashed border-indigo-300
                         rounded-xl p-6 cursor-pointer
                         hover:bg-indigo-50 transition"
            >
              <UploadCloud className="text-indigo-600" size={36} />
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
                <FileText size={18} className="text-indigo-600" />
                <span className="truncate">{pdf.name}</span>
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={upload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2
                       bg-indigo-600 text-white py-2.5 rounded-lg
                       font-medium hover:bg-indigo-700
                       disabled:opacity-60 transition"
          >
            {loading ? "Uploading..." : "Upload Circular"}
          </button>

        </div>
      </div>
      <Footer/>
    </>
  );
}
