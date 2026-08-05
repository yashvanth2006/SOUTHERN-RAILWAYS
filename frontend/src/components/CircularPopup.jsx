/**
 * CircularPopup Component (v3 - With react-pdf-viewer)
 *
 * Mandatory circular viewer with acknowledgement.
 * Uses react-pdf-viewer for reliable in-app PDF display.
 *
 * Features:
 * - Blocks all navigation until acknowledged
 * - In-app PDF viewing (no external tabs)
 * - Mobile-first responsive design
 * - Scroll/time-based acknowledgement enabling
 * - Consistent UI with rest of application
 *
 * @module components/CircularPopup
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import {
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";

// PDF.js worker
const PDFJS_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function CircularPopup({ circular, onAcknowledge, loading }) {
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [pdfError, setPdfError] = useState(false);
  const [canAcknowledge, setCanAcknowledge] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

useEffect(() => {
  if (!circular?._id) return;

  const fetchSignedPdf = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `/api/admin/circulars/${circular._id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPdfUrl(res.data.url);
    } catch (err) {
      console.error("Failed to fetch signed PDF", err);
      setPdfError(true);
    }
  };

  fetchSignedPdf();
}, [circular?._id]);


useEffect(() => {
  const timeout = setTimeout(() => {
    if (!pdfLoaded) {
      setPdfError(true);
    }
  }, 8000);

  return () => clearTimeout(timeout);
}, [pdfLoaded]);



  const containerRef = useRef(null);

  // Minimum time required to enable acknowledgement
  const MIN_TIME_SECONDS = 5;

  // Detect content type
const isImage = false; // PDFs only
  const isPdf = !isImage;

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if user can acknowledge (after min time OR pdf loaded and scrolled)
  useEffect(() => {
    const timeMet = timeSpent >= MIN_TIME_SECONDS;
    const loaded = pdfLoaded || pdfError; // Allow if loaded or error (so they can use external link)
    setCanAcknowledge(loaded && timeMet);
  }, [timeSpent, pdfLoaded, pdfError]);

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!circular) return null;

  const progressPercent = Math.min((timeSpent / MIN_TIME_SECONDS) * 100, 100);

  // Process URL for Cloudinary
  // let viewerUrl = circular.pdfUrl;
  // if (viewerUrl?.includes("cloudinary.com") && viewerUrl?.includes("/raw/")) {
  //   // Ensure inline viewing for Cloudinary raw files
  //   const urlParts = viewerUrl.split("/upload/");
  //   if (urlParts.length === 2 && !viewerUrl.includes("fl_attachment")) {
  //     viewerUrl = `${urlParts[0]}/upload/fl_attachment:false/${urlParts[1]}`;
  //   }
  // }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base truncate">
              Mandatory Circular
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm truncate">
              {circular.title}
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs min-w-[40px] text-center font-medium">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 hover:bg-white/20 rounded-lg transition hidden sm:block"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-lg transition hidden sm:block"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      {!canAcknowledge && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
            <span className="flex items-center gap-1">
              <AlertTriangle size={14} />
              Please review the circular ({MIN_TIME_SECONDS - timeSpent}s remaining)
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* PDF Viewer Content */}
      <div className="flex-1 overflow-hidden bg-slate-100">
        {/* Loading State */}
        {!pdfLoaded && !pdfError && isPdf && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading circular...</p>
            </div>
          </div>
        )}

        {/* PDF Error / Fallback */}
        {pdfError && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
              <FileText className="mx-auto text-indigo-600 mb-4" size={48} />
              <h3 className="text-gray-800 font-semibold mb-2">
                PDF Preview Unavailable
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Your browser may not support in-app PDF viewing.
                Please use the buttons below.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={pdfUrl} target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2
                             bg-indigo-600 text-white rounded-lg
                             hover:bg-indigo-700 transition"
                >
                  <ExternalLink size={18} />
                  View PDF
                </a>
                <a
                    href={pdfUrl}
  target="_blank"
  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2
                             bg-gray-100 text-gray-700 rounded-lg
                             hover:bg-gray-200 transition"
                >
                  <Download size={18} />
                  Download
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                After viewing, return here and click "I Acknowledge"
              </p>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {isPdf && !pdfError && (
          <div
            className="h-full overflow-auto"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            <Worker workerUrl={PDFJS_WORKER_URL}>
              {pdfUrl && (
  <Viewer
    fileUrl={pdfUrl}
    defaultScale={SpecialZoomLevel.PageWidth}
    onDocumentLoad={(e) => {
      setPdfLoaded(true);
      setTotalPages(e.doc.numPages);
    }}
    onPageChange={(e) => setCurrentPage(e.currentPage + 1)}
    renderError={() => setPdfError(true)}
  />
)}

            </Worker>
          </div>
        )}

        {/* Image Viewer */}
        {isImage && (
          <div className="h-full overflow-auto flex items-start justify-center p-4">
            <img
              src={circular.pdfUrl}
              alt={circular.title}
              className="max-w-full rounded-lg shadow-xl"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              onLoad={() => setPdfLoaded(true)}
              onError={() => setPdfError(true)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t shadow-lg px-4 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-gray-600 text-sm">
              {totalPages > 0 && `Page ${currentPage} of ${totalPages} • `}
              Acknowledge to continue
            </p>
            <p className="text-gray-400 text-xs">
              Posted: {new Date(circular.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Download Option */}
            <a
              href={circular.pdfUrl}
              download
              className="flex items-center justify-center gap-2 px-4 py-2.5
                         bg-slate-100 text-slate-700 rounded-xl
                         hover:bg-slate-200 transition text-sm font-medium"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Acknowledge Button */}
            <button
              onClick={onAcknowledge}
              disabled={loading || !canAcknowledge}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2
                         px-6 py-2.5 rounded-xl font-semibold transition
                         ${canAcknowledge && !loading
                           ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
                           : "bg-gray-200 text-gray-400 cursor-not-allowed"
                         }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  {canAcknowledge ? "I Acknowledge" : `Wait ${MIN_TIME_SECONDS - timeSpent}s`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

