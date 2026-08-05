/**
 * UserDetailModal Component
 *
 * Reusable modal for viewing user details.
 * Used by both Super Admin and Depot Manager.
 * Consistent design across the application.
 *
 * @module components/UserDetailModal
 */

import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  X,
  User,
  Train,
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BookOpen,
  ClipboardCheck,
  Hash,
  BadgeIndianRupee,
  Loader2
} from "lucide-react";

export default function UserDetailModal({ userId, onClose, isAdmin = false }) {
  const [user, setUser] = useState(null);
  const [tcards, setTcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use different endpoints based on role
        const endpoint = isAdmin
          ? `/admin/users/${userId}`
          : `/depot/driver/${userId}`;

        const res = await api.get(endpoint);
        setUser(res.data);

        // If depot manager, also fetch T-Cards
        if (!isAdmin) {
          try {
            const tcardsRes = await api.get(`/depot/driver/${userId}/tcards`);
            setTcards(tcardsRes.data || []);
          } catch (err) {
            console.error("Failed to load T-Cards:", err);
            setTcards([]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, isAdmin]);

  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const isDriver = user?.role === "DRIVER";
  const profile = user?.profile || {};
  const trainings = profile?.trainings || {};
  const lrList = profile?.lrDetails || [];
  const logs = user?.logs || [];

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    ...(isDriver ? [
      { id: "training", label: "Training", icon: <FileCheck size={16} /> },
      { id: "lr", label: "LR Details", icon: <MapPin size={16} /> },
      { id: "duty", label: "Duty Logs", icon: <Activity size={16} /> },
      { id: "tcard", label: "T-Cards", icon: <ClipboardCheck size={16} /> }
    ] : [])
  ];

  return (
    <div
      className="fixed  inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white scale-80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#0b659a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isDriver ? <Train size={24} /> : <User size={24} />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {loading ? "Loading..." : user?.name || "User Details"}
              </h2>
              {user && (
                <p className="text-sm text-white/80">
                  {user.role=="DEPOT_MANAGER"?`SSE/TRD/${user.depotName}`:`${user.role}`} • {user.depotName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#0b659a] mx-auto mb-3" />
              <p className="text-gray-500">Loading user details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && user && (
          <>
            {/* Tabs */}
            <div className="border-b bg-gray-50 px-4 overflow-x-auto">
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-[#0b659a] text-[#0b659a]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard icon={<User />} label="Name" value={user.name} />
                      <InfoCard icon={<Hash />} label="PF Number" value={user.pfNo} />
                      <InfoCard icon={<Building2 />} label="Depot" value={user.depotName} />
                      {isDriver && profile.hrmsId && (
                        <InfoCard icon={<Hash />} label="HRMS ID" value={profile.hrmsId} />
                      )}
                      {isDriver && profile.designation && (
                        <InfoCard icon={<User />} label="Designation" value={profile.designation} />
                      )}
                      {isDriver && profile.basicPay && (
                        <InfoCard icon={<BadgeIndianRupee />} label="Basic Pay" value={`₹${profile.basicPay?.toLocaleString()}`} />
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  {isDriver && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Service Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard
                          icon={<Calendar />}
                          label="Date of Appointment"
                          value={profile.dateOfAppointment
                            ? new Date(profile.dateOfAppointment).toLocaleDateString()
                            : "-"}
                        />
                        <InfoCard
                          icon={<Calendar />}
                          label="Entry as TWD"
                          value={profile.dateOfEntryAsTWD
                            ? new Date(profile.dateOfEntryAsTWD).toLocaleDateString()
                            : "-"}
                        />
                      </div>
                    </div>
                  )}

                  {/* Circular Status */}
                  {user.circularStatus && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Circular Status
                      </h3>
                      <div className={`p-4 rounded-xl flex items-center gap-3 ${
                        user.circularStatus.acknowledged
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-amber-50 border border-amber-200"
                      }`}>
                        {user.circularStatus.acknowledged ? (
                          <>
                            <CheckCircle className="text-emerald-600" size={24} />
                            <div>
                              <p className="font-medium text-emerald-800">Latest Circular Acknowledged</p>
                              <p className="text-sm text-emerald-600">User has read the latest circular</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="text-amber-600" size={24} />
                            <div>
                              <p className="font-medium text-amber-800">Pending Acknowledgement</p>
                              <p className="text-sm text-amber-600">User has not acknowledged latest circular</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary Stats */}
                  {user.summary && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Summary Statistics
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {user.summary.totalDutyLogs !== undefined && (
                          <StatCard label="Duty Logs" value={user.summary.totalDutyLogs} />
                        )}
                        {user.summary.totalKm !== undefined && (
                          <StatCard label="Total KM" value={user.summary.totalKm?.toLocaleString() || 0} />
                        )}
                        {user.summary.totalHours !== undefined && (
                          <StatCard label="Total Hours" value={user.summary.totalHours?.toFixed(1) || 0} />
                        )}
                        {user.summary.totalTCards !== undefined && (
                          <StatCard label="T-Cards" value={user.summary.totalTCards} />
                        )}
                        {user.summary.driversInDepot !== undefined && (
                          <StatCard label="Drivers in Depot" value={user.summary.driversInDepot} />
                        )}
                        
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Training Tab */}
              {activeTab === "training" && isDriver && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Training Status
                  </h3>
                  {Object.keys(trainings).length === 0 ? (
                    <EmptyState message="No training records available" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(trainings).map(([key, training]) => (
                        <TrainingCard key={key} name={key} training={training} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LR Tab */}
              {activeTab === "lr" && isDriver && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    LR (Road Learning) Details
                  </h3>
                  {lrList.length === 0 ? (
                    <EmptyState message="No LR records available" />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Section</th>
                            <th className="px-4 py-3 text-left font-medium">Done Date</th>
                            <th className="px-4 py-3 text-left font-medium">Due Date</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lrList.map((lr, idx) => {
                            const isOverdue = lr.dueDate && new Date(lr.dueDate) < new Date();
                            return (
                              <tr key={idx} className="border-t">
                                <td className="px-4 py-3 font-medium">{lr.section}</td>
                                <td className="px-4 py-3">
                                  {lr.doneDate ? new Date(lr.doneDate).toLocaleDateString() : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {lr.dueDate ? new Date(lr.dueDate).toLocaleDateString() : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge isOverdue={isOverdue} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Duty Logs Tab */}
              {activeTab === "duty" && isDriver && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Recent Duty Logs
                  </h3>
                  {logs.length === 0 ? (
                    <EmptyState message="No duty logs available" />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-left font-medium">From</th>
                            <th className="px-4 py-3 text-left font-medium">To</th>
                            <th className="px-4 py-3 text-center font-medium">Hours</th>
                            <th className="px-4 py-3 text-center font-medium">KM</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.slice(0, 20).map((log, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-3">
                                {log.logDate ? new Date(log.logDate).toLocaleDateString() : "-"}
                              </td>
                              <td className="px-4 py-3">{log.fromStation || "-"}</td>
                              <td className="px-4 py-3">{log.toStation || "-"}</td>
                              <td className="px-4 py-3 text-center">{log.hours?.toFixed(1) || "-"}</td>
                              <td className="px-4 py-3 text-center">{log.km || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* T-Cards Tab */}
              {activeTab === "tcard" && isDriver && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Tower Car Safety Checklists
                  </h3>
                  {tcards.length === 0 ? (
                    <EmptyState message="No T-Card submissions available" />
                  ) : (
                    <div className="space-y-4">
                      {tcards.slice(0, 10).map((card) => (
                        <div key={card._id} className="border rounded-xl p-4 bg-slate-50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-800">
                              {new Date(card.date).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              T-Car No: {card.tCarNo}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {card.items?.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className={item.checked ? "text-emerald-500" : "text-red-500"}>
                                  {item.checked ? "✓" : "✗"}
                                </span>
                                <div>
                                  <p className={item.checked ? "text-gray-700" : "text-red-700"}>
                                    {item.description}
                                  </p>
                                  {item.remarks && (
                                    <p className="text-xs text-gray-400">
                                      Remarks: {item.remarks}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ========== HELPER COMPONENTS ========== */

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-semibold text-gray-800">{value || "-"}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[#0b659a]/10 rounded-xl p-4 text-center border border-[#0b659a]/20">
      <p className="text-2xl font-bold text-[#0b659a]">{value}</p>
      <p className="text-xs text-[#0b659a] font-medium">{label}</p>
    </div>
  );
}

function TrainingCard({ name, training }) {
  if (!training) return null;

  const isOverdue = training.dueDate && new Date(training.dueDate) < new Date();

  return (
    <div className={`p-4 rounded-xl border ${
      isOverdue
        ? "border-red-200 bg-red-50"
        : "border-emerald-200 bg-emerald-50"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800">{name.replace("_", "/")}</h4>
        <StatusBadge isOverdue={isOverdue} />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Done:</span>
          <span className="font-medium">
            {training.doneDate ? new Date(training.doneDate).toLocaleDateString() : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Due:</span>
          <span className="font-medium">
            {training.dueDate ? new Date(training.dueDate).toLocaleDateString() : "-"}
          </span>
        </div>
        {training.schedule && (
          <div className="flex justify-between">
            <span className="text-gray-500">Schedule:</span>
            <span className="font-medium text-gray-600">{training.schedule}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ isOverdue }) {
  return isOverdue ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
      <XCircle size={12} /> Overdue
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
      <CheckCircle size={12} /> Valid
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

