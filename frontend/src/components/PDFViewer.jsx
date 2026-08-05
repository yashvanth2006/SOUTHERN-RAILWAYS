/**
 * PDFViewer Component
 *
 * A robust in-app PDF viewer using react-pdf-viewer.
 * Works with Cloudinary URLs and handles various edge cases.
 *
 * Features:
 * - In-app viewing (no external tabs)
 * - Zoom controls
 * - Page navigation
 * - Mobile responsive
 * - Error handling with fallback
 *
 * @module components/PDFViewer
 */

import { useState, useEffect } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import {
  FileText,
  AlertTriangle,
  ExternalLink,
  Download,
  Loader2
} from "lucide-react";

// PDF.js worker
const PDFJS_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function PDFViewer({
  url,
  title = "Document",
  onLoadSuccess,
  onLoadError,
  height = "calc(100vh - 200px)"
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);

  // Create default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Hide sidebar
    toolbarPlugin: {
      fullScreenPlugin: {
        // Enable fullscreen
      },
    },
  });

  // Process Cloudinary URL to ensure it's viewable
  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      return;
    }

    // For Cloudinary raw URLs, we might need to add fl_attachment:false
    let finalUrl = url;

    // If it's a Cloudinary URL with raw resource type
    

    setProcessedUrl(finalUrl);
    setLoading(true);
    setError(null);
  }, [url]);

  const handleDocumentLoad = () => {
    setLoading(false);
    setError(null);
    onLoadSuccess?.();
  };

  const handleDocumentError = (err) => {
    console.error("PDF load error:", err);
    setLoading(false);
    setError("Failed to load PDF");
    onLoadError?.(err);
  };

  // Error/Fallback UI
  if (error || !processedUrl) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center my-8">
        <FileText className="mx-auto text-indigo-600 mb-4" size={48} />
        <h3 className="text-gray-800 font-semibold mb-2">
          {error || "Unable to Display PDF"}
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          The PDF viewer encountered an issue. You can still view the document by opening it directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2
                       bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition"
          >
            <ExternalLink size={18} />
            Open PDF
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2
                       bg-gray-100 text-gray-700 rounded-lg
                       hover:bg-gray-200 transition"
          >
            <Download size={18} />
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <Worker workerUrl={PDFJS_WORKER_URL}>
        <div className="h-full border rounded-lg overflow-hidden bg-gray-100">
          <Viewer
            fileUrl={processedUrl}
            plugins={[defaultLayoutPluginInstance]}
            defaultScale={SpecialZoomLevel.PageWidth}
            onDocumentLoad={handleDocumentLoad}
            renderError={handleDocumentError}
            theme={{
              theme: 'light'
            }}
          />
        </div>
      </Worker>
    </div>
  );
}

/**
 * Simplified PDF viewer for modals (without heavy toolbar)
 */
export function SimplePDFViewer({ url, onLoad, onError }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
        <FileText className="mx-auto text-indigo-600 mb-4" size={48} />
        <h3 className="text-gray-800 font-semibold mb-2">PDF Preview Unavailable</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Please use the buttons below to view the document.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onClick={() => onLoad?.()}
          >
            <ExternalLink size={18} />
            View PDF
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Download size={18} />
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}
      <Worker workerUrl={PDFJS_WORKER_URL}>
        <Viewer
          fileUrl={url}
          defaultScale={SpecialZoomLevel.PageWidth}
          onDocumentLoad={() => {
            setLoading(false);
            onLoad?.();
          }}
          renderError={() => {
            setError(true);
            onError?.();
          }}
        />
      </Worker>
    </div>
  );
}

