// src/components/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar and scroll to top automatically on route change
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="bg-[#F8FAFC]">
      <div className="flex min-h-screen">
        
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ease-out ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Container */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"}
        `}>
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Mobile Top Bar (Only visible on small screens) */}
          <header className="lg:hidden sticky top-0 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-30">
            <div className="flex items-center gap-3">
              <img src="/app-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold text-sm leading-tight text-slate-800 break-words text-left">TOWER WAGON</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>

          {/* Page Content Outlet */}
          <main className="flex-1 relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </main>

        </div>
      </div>

      {/* Global Full-Width Footer (Only on Dashboard Home Pages) */}
      {[
        "/driver", 
        "/manager", 
        "/admin", 
        "/adee", 
        "/master-admin"
      ].includes(location.pathname) && (
        <Footer />
      )}
    </div>
  );
}
