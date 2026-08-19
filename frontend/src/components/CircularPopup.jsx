/**
 * CircularPopup Component
 *
 * Full-screen overlay popup that embeds the PDF viewer directly.
 * Includes Zoom In/Out, Acknowledge button, and a "Later" dismiss option.
 * No navigation required — user stays on their current page.
 */

import { useEffect, useState, useRef } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import {
  ZoomIn,
  ZoomOut,
  CheckCircle,
  Loader2,
  AlertTriangle,
  X,
  FileWarning
} from "lucide-react";

const PDFJS_WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function CircularPopup({ circular, onAcknowledge, onClose, loading }) {
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn: PdfZoomIn, ZoomOut: PdfZoomOut, CurrentScale } = zoomPluginInstance;

  // Block body scroll while popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!circular) return null;

  const handleAcknowledge = async () => {
    try {
      await onAcknowledge();
      setAcknowledged(true);
    } catch (err) {
      // Error is handled and alerted in CircularGuard, just don't set acknowledged state
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-[#0b659a]/10 text-[#0b659a] shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                New Circular — Action Required
              </p>
              <p className="text-sm font-bold text-slate-800 truncate">
                {circular.title}
              </p>
            </div>
          </div>

          {/* Zoom controls + Close */}
          <div className="flex items-center gap-1 shrink-0 ml-3">
            <PdfZoomOut>
              {(props) => (
                <button
                  onClick={props.onClick}
                  disabled={props.isDisabled || pdfLoading}
                  title="Zoom Out"
                  className={`rounded-full p-2 text-slate-600 transition ${
                    props.isDisabled || pdfLoading
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <ZoomOut size={18} />
                </button>
              )}
            </PdfZoomOut>

            <CurrentScale>
              {(props) => (
                <span className="text-sm font-medium w-12 text-center text-slate-700">
                  {Math.round(props.scale * 100)}%
                </span>
              )}
            </CurrentScale>

            <PdfZoomIn>
              {(props) => (
                <button
                  onClick={props.onClick}
                  disabled={props.isDisabled || pdfLoading}
                  title="Zoom In"
                  className={`rounded-full p-2 text-slate-600 transition ${
                    props.isDisabled || pdfLoading
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <ZoomIn size={18} />
                </button>
              )}
            </PdfZoomIn>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button
              onClick={onClose}
              title="Remind me later"
              className="rounded-full p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── PDF VIEWER ── */}
        <div className="relative flex-1 min-h-0 bg-slate-100">
          {pdfError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <FileWarning size={40} className="text-slate-400" />
              <p className="font-medium">Failed to load PDF</p>
              <a
                href={circular.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0b659a] text-white rounded-lg text-sm hover:bg-[#09527d] transition"
              >
                Open in new tab
              </a>
            </div>
          ) : (
            <Worker workerUrl={PDFJS_WORKER_URL}>
              <Viewer
                fileUrl={circular.pdfUrl}
                plugins={[zoomPluginInstance]}
                defaultScale={SpecialZoomLevel.PageFit}
                onDocumentLoad={() => setPdfLoading(false)}
                onDocumentLoadFail={() => {
                  setPdfLoading(false);
                  setPdfError(true);
                }}
              />
            </Worker>
          )}

          {/* PDF Loading spinner */}
          {pdfLoading && !pdfError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <Loader2 className="animate-spin text-[#0b659a] mx-auto mb-2" size={32} />
                <p className="text-sm text-slate-500">Loading circular...</p>
              </div>
            </div>
          )}

          {/* ── ACKNOWLEDGE BUTTON (bottom-right over PDF) ── */}
          <div className="absolute bottom-5 right-5">
            {acknowledged ? (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none-emerald-200 shadow-lg">
                <CheckCircle size={18} />
                Acknowledged
              </span>
            ) : (
              <button
                onClick={handleAcknowledge}
                disabled={loading || pdfLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                {loading ? "Acknowledging..." : "Acknowledge & Continue"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
