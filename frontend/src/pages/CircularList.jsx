import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import { FileText, Download, Eye, X, Loader2 } from "lucide-react";
import Footer from "../components/Footer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFJS_WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function CircularList() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    const fetchCirculars = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/circulars");
        setCirculars(res.data);
      } catch (err) {
        console.error("Failed to load circulars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCirculars();
  }, []);

  const openViewer = (circular) => {
    setSelectedCircular(circular);
    setPdfLoading(true);
    setPdfError(false);
  };

  const closeViewer = () => {
    setSelectedCircular(null);
    setPdfLoading(true);
    setPdfError(false);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
        <BackButton />
          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            {/* LEFT */}
            
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    Official Circulars
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Latest circulars issued by the administration
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-500">
              <Loader2 size={36} className="animate-spin mb-4 text-indigo-600" />
              <p className="font-medium text-lg">Loading circulars...</p>
            </div>
          )}

          {!loading && circulars.length === 0 && (
            <div className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500 flex flex-col items-center">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <FileText size={48} className="text-slate-300" />
              </div>
              <p className="font-medium text-lg text-slate-600">No circulars available</p>
            </div>
          )}

          <div className="space-y-4">
            {circulars.map((c) => (
              <div
                key={c._id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm
                           hover:shadow-md hover:-translate-y-1 transition-all duration-250
                           flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* LEFT */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-base">{c.title}</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                      Posted on{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                      {c.originalFilename && (
                        <span className="ml-2 text-slate-400">
                          • {c.originalFilename}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* RIGHT - ACTION BUTTONS */}
                <div className="flex items-center gap-3">
                  {/* VIEW */}
                  <button
                    onClick={() => openViewer(c)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-white border border-slate-200 text-[#0b659a] rounded-xl hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {/* DOWNLOAD */}
                  <a
                    href={`${import.meta.env.VITE_API_URI}/admin/circulars/${c._id}/pdf`}
                    download
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-700 hover:text-white hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedCircular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D1D5DB] p-4">
              <p className="font-semibold text-[#1F2937]">{selectedCircular.title}</p>
              <button onClick={closeViewer} className="rounded-full p-2 text-[#1F2937] transition hover:bg-[#E8EEF5]">
                <X />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <Worker workerUrl={PDFJS_WORKER_URL}>
                {pdfError ? (
                  <div className="flex h-full items-center justify-center text-[#C8102E]">Failed to load PDF</div>
                ) : (
                  <Viewer
                    fileUrl={selectedCircular.pdfUrl}
                    withCredentials={false}
                    defaultScale={SpecialZoomLevel.PageFit}
                    onDocumentLoad={() => setPdfLoading(false)}
                    onDocumentLoadFail={() => {
                      setPdfLoading(false);
                      setPdfError(true);
                    }}
                  />
                )}
              </Worker>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
