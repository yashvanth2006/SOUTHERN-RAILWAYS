import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import BackButton from "../components/BackButton";
import { FileText, Download, Eye, X, Loader2, Trash2, CheckCircle, AlertTriangle, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import Swal from "sweetalert2";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import { useCircularGuard } from "../context/CircularGuard";

const PDFJS_WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function CircularList() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const viewerContainerRef = useRef(null);
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn: PdfZoomIn, ZoomOut: PdfZoomOut, CurrentScale } = zoomPluginInstance;
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const { acknowledgeCircular: guardAcknowledge } = useCircularGuard();

  const [acknowledgedIds, setAcknowledgedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("acknowledgedCirculars");
      const ids = stored ? JSON.parse(stored) : [];
      const lastSeen = localStorage.getItem("lastSeenCircularId");
      if (lastSeen && !ids.includes(lastSeen)) ids.push(lastSeen);
      return ids;
    } catch (e) {
      return [];
    }
  });
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const handleAcknowledge = async (id) => {
    try {
      setIsAcknowledging(true);
      await api.post(`/admin/circulars/${id}/acknowledge`);
      const newIds = [...acknowledgedIds, id];
      setAcknowledgedIds(newIds);
      localStorage.setItem("acknowledgedCirculars", JSON.stringify(newIds));
      localStorage.setItem("lastSeenCircularId", id);
      sessionStorage.setItem("circularAcknowledged", id);
      // Also clear the guard's pending circular so it stops redirecting
      await guardAcknowledge();
    } catch (err) {
      console.error("Acknowledgement failed:", err);
      Swal.fire("Error", "Failed to acknowledge circular", "error");
    } finally {
      setIsAcknowledging(false);
    }
  };

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

  // Auto-open logic when navigated from popup
  useEffect(() => {
    if (circulars.length > 0 && location.state?.openCircularId) {
      const targetCircular = circulars.find(c => c._id === location.state.openCircularId);
      if (targetCircular && !selectedCircular) {
        openViewer(targetCircular);
        // Clear React Router state so closing the viewer doesn't immediately reopen it
        navigate(".", { replace: true, state: {} });
      }
    }
  }, [circulars, location.state, selectedCircular, navigate]);

  // Block body scroll when viewer is open
  useEffect(() => {
    if (selectedCircular) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCircular]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

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

  const handleDownload = async (c) => {
    try {
      const res = await api.get(`/admin/circulars/${c._id}/pdf`, { responseType: 'blob' });
      
      const blob = res.data;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", c.originalFilename || `${c.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      Swal.fire("Error", "Failed to process download.", "error");
    }
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure you want to delete this circular?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (isConfirmed) {
      try {
        await api.delete(`/admin/circulars/${id}`);
        setCirculars(prev => prev.filter(c => c._id !== id));
        Swal.fire("Deleted!", "The circular has been deleted.", "success");
      } catch (err) {
        console.error("Failed to delete circular:", err);
        Swal.fire("Error!", "Failed to delete the circular.", "error");
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <BackButton />
          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
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
            <div className="bg-white py-16 rounded-2xl shadow-sm flex flex-col items-center justify-center text-slate-500 w-full">
              <Loader2 size={36} className="animate-spin mb-4 text-[#0b659a]" />
              <p className="font-medium text-lg">Loading circulars...</p>
            </div>
          )}

          {!loading && circulars.length === 0 && (
            <div className="bg-white py-16 rounded-2xl shadow-sm text-center text-slate-500 flex flex-col items-center w-full">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <FileText size={48} className="text-slate-300" />
              </div>
              <p className="font-medium text-lg text-slate-600">No circulars available</p>
            </div>
          )}

          <div className="space-y-4 w-full">
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
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-800 text-base">{c.title}</p>
                      {role !== "SUPER_ADMIN" && role !== "MASTER_ADMIN" && (
                        acknowledgedIds.includes(c._id) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-emerald-200">
                            <CheckCircle size={12} /> Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            <AlertTriangle size={12} /> Pending
                          </span>
                        )
                      )}
                    </div>
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
                  <button
                    onClick={() => handleDownload(c)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-700 hover:text-white hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>

                  {/* DELETE */}
                  {role === "SUPER_ADMIN" && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-white border border-slate-200 text-red-600 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
      </div>

      {selectedCircular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div ref={viewerContainerRef} className="h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#D1D5DB] p-3 sm:p-4 bg-white z-10 shrink-0 gap-3 sm:gap-0">
              <p className="font-semibold text-[#1F2937] truncate w-full sm:w-auto pr-4 text-sm sm:text-base">{selectedCircular.title}</p>
              <div className="flex items-center justify-end w-full sm:w-auto gap-1 sm:gap-2">
                <PdfZoomOut>
                  {(props) => (
                    <button onClick={props.onClick} disabled={props.isDisabled} className={`rounded-full p-2 text-[#1F2937] transition ${props.isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#E8EEF5]'}`} title="Zoom Out">
                      <ZoomOut size={18} />
                    </button>
                  )}
                </PdfZoomOut>
                <CurrentScale>
                  {(props) => <span className="text-sm font-medium w-12 text-center">{Math.round(props.scale * 100)}%</span>}
                </CurrentScale>
                <PdfZoomIn>
                  {(props) => (
                    <button onClick={props.onClick} disabled={props.isDisabled} className={`rounded-full p-2 text-[#1F2937] transition ${props.isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#E8EEF5]'}`} title="Zoom In">
                      <ZoomIn size={18} />
                    </button>
                  )}
                </PdfZoomIn>
                <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>
                <button onClick={toggleFullscreen} className="hidden sm:block rounded-full p-2 text-[#1F2937] transition hover:bg-[#E8EEF5]" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={() => handleDownload(selectedCircular)} className="rounded-full p-2 text-[#1F2937] transition hover:bg-[#E8EEF5]" title="Download">
                  <Download size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button onClick={closeViewer} className="rounded-full p-2 text-red-600 transition hover:bg-red-50" title="Close">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="relative flex-1 min-h-0 bg-slate-100">
                <Worker workerUrl={PDFJS_WORKER_URL}>
                  {pdfError ? (
                    <div className="flex h-full items-center justify-center text-[#C8102E]">Failed to load PDF</div>
                  ) : (
                    <Viewer
                      fileUrl={selectedCircular.pdfUrl}
                      plugins={[zoomPluginInstance]}
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

              {role !== "SUPER_ADMIN" && role !== "MASTER_ADMIN" && (
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8">
                  {acknowledgedIds.includes(selectedCircular._id) ? (
                    <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-emerald-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                      <CheckCircle size={18} />
                      Acknowledged
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleAcknowledge(selectedCircular._id)}
                      disabled={isAcknowledging}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isAcknowledging ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
                      Acknowledge
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
    </>
  );
}
