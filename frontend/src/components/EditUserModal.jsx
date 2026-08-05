/**
 * EditUserModal Component
 *
 * Admin-only modal for editing user information.
 * Supports editing both User and DriverProfile data.
 * Well-aligned, responsive UI with tabbed sections.
 *
 * @module components/EditUserModal
 */

import { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  X,
  User,
  Building2,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Calendar,
  BadgeIndianRupee,
  FileText,
  MapPin,
  GraduationCap
} from "lucide-react";

export default function EditUserModal({ userId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [depots, setDepots] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    // User fields
    name: "",
    depotName: "",
    role: "",
    pfNo: "",
    // Driver Profile fields
    hrmsId: "",
    designation: "",
    basicPay: "",
    dateOfAppointment: "",
    dateOfEntryAsTWD: "",
    // Training fields
    trainings: {
      PME: { doneDate: "", dueDate: "", schedule: "4 years" },
      GRS_RC: { doneDate: "", dueDate: "", schedule: "3 years" },
      TR4: { doneDate: "", dueDate: "", schedule: "3 years" },
      OC: { doneDate: "", dueDate: "", schedule: "6 months" }
    }
  });

  const isDriver = formData.role === "DRIVER";

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, depotsRes] = await Promise.all([
          api.get(`/admin/users/${userId}`),
          api.get("/admin/depots")
        ]);

        const user = userRes.data;
        setDepots(depotsRes.data || []);

        // Format dates for input fields
        const formatDate = (date) => {
          if (!date) return "";
          return new Date(date).toISOString().split("T")[0];
        };

        const profile = user.profile || {};
        const trainings = profile.trainings || {};

        setFormData({
          name: user.name || "",
          depotName: user.depotName || "",
          role: user.role || "",
          pfNo: user.pfNo || "",
          hrmsId: profile.hrmsId || "",
          designation: profile.designation || "",
          basicPay: profile.basicPay || "",
          dateOfAppointment: formatDate(profile.dateOfAppointment),
          dateOfEntryAsTWD: formatDate(profile.dateOfEntryAsTWD),
          trainings: {
            PME: {
              doneDate: formatDate(trainings.PME?.doneDate),
              dueDate: formatDate(trainings.PME?.dueDate),
              schedule: trainings.PME?.schedule || "4 years"
            },
            GRS_RC: {
              doneDate: formatDate(trainings.GRS_RC?.doneDate),
              dueDate: formatDate(trainings.GRS_RC?.dueDate),
              schedule: trainings.GRS_RC?.schedule || "3 years"
            },
            TR4: {
              doneDate: formatDate(trainings.TR4?.doneDate),
              dueDate: formatDate(trainings.TR4?.dueDate),
              schedule: trainings.TR4?.schedule || "3 years"
            },
            OC: {
              doneDate: formatDate(trainings.OC?.doneDate),
              dueDate: formatDate(trainings.OC?.dueDate),
              schedule: trainings.OC?.schedule || "6 months"
            }
          }
        });

      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  // Handle form changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTrainingChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      trainings: {
        ...prev.trainings,
        [type]: {
          ...prev.trainings[type],
          [field]: value
        }
      }
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        depotName: formData.depotName,
        role: formData.role
      };

      // Include driver profile fields if driver
      if (formData.role === "DRIVER") {
        payload.hrmsId = formData.hrmsId;
        payload.designation = formData.designation;
        payload.basicPay = formData.basicPay ? Number(formData.basicPay) : undefined;
        payload.dateOfAppointment = formData.dateOfAppointment || undefined;
        payload.dateOfEntryAsTWD = formData.dateOfEntryAsTWD || undefined;

        // Format trainings - only include if dates are set
        const trainings = {};
        Object.keys(formData.trainings).forEach(type => {
          const t = formData.trainings[type];
          if (t.doneDate || t.dueDate) {
            trainings[type] = {
              doneDate: t.doneDate || undefined,
              dueDate: t.dueDate || undefined,
              schedule: t.schedule
            };
          }
        });
        if (Object.keys(trainings).length > 0) {
          payload.trainings = trainings;
        }
      }

      await api.put(`/admin/users/${userId}`, payload);

      await Swal.fire({
        icon: "success",
        title: "User Updated",
        text: "Changes saved successfully",
        timer: 1500,
        showConfirmButton: false
      });

      onSuccess?.();
      onClose();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.msg || "Failed to save changes"
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Reset Password?",
      text: `Password will be reset to PF Number (${formData.pfNo}). User must change it on next login.`,
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      confirmButtonText: "Reset Password"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post(`/admin/users/${userId}/reset-password`);

      await Swal.fire({
        icon: "success",
        title: "Password Reset",
        text: "User must change password on next login",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: err.response?.data?.msg || "Failed to reset password"
      });
    }
  };

  // Delete user
  const handleDelete = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete User?",
      html: `<p>This will permanently delete <strong>${formData.name}</strong> and all associated data.</p>
             <p class="text-red-600 font-semibold mt-2">This action cannot be undone!</p>`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete User"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`);

      await Swal.fire({
        icon: "success",
        title: "User Deleted",
        timer: 1500,
        showConfirmButton: false
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.response?.data?.msg || "Failed to delete user"
      });
    }
  };

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Tabs configuration
  const tabs = [
    { id: "basic", label: "Basic Info", icon: <User size={16} /> },
    ...(isDriver ? [
      { id: "bio", label: "Bio Data", icon: <FileText size={16} /> },
      { id: "training", label: "Training", icon: <GraduationCap size={16} /> }
    ] : [])
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0b659a] to-[#084d78] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit User</h2>
              <p className="text-sm text-white/80">
                {loading ? "Loading..." : `${formData.name} • ${formData.pfNo}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#0b659a]" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className="flex border-b bg-slate-50">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition
                    ${activeTab === tab.id
                      ? "text-[#0b659a] border-b-2 border-[#0b659a] bg-white"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                        placeholder="Enter full name"
                      />
                    </div>

                    {/* PF Number (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        PF Number
                      </label>
                      <input
                        type="text"
                        value={formData.pfNo}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">PF Number cannot be changed</p>
                    </div>

                    {/* Depot */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Building2 size={14} className="inline mr-1" />
                        Depot
                      </label>
                      <select
                        value={formData.depotName}
                        onChange={(e) => handleChange("depotName", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                      >
                        <option value="">Select Depot</option>
                        {depots.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                      >
                        <option value="DRIVER">Tower Wagon Driver (TWD)</option>
                        <option value="DEPOT_MANAGER">SSE/TRD (Depot Manager)</option>
                      </select>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-8 pt-6 border-t border-red-200 bg-red-50 -mx-6 -mb-6 px-6 pb-6">
                    <h4 className="text-sm font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Danger Zone
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleResetPassword}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition"
                      >
                        <RefreshCw size={16} />
                        Reset Password
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 size={16} />
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio Data Tab (Drivers only) */}
              {activeTab === "bio" && isDriver && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* HRMS ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        HRMS ID
                      </label>
                      <input
                        type="text"
                        value={formData.hrmsId}
                        onChange={(e) => handleChange("hrmsId", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                        placeholder="Enter HRMS ID"
                      />
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleChange("designation", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                        placeholder="e.g., TWD/PTJ (Tech-I/OHE/PTJ)"
                      />
                    </div>

                    {/* Basic Pay */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <BadgeIndianRupee size={14} className="inline mr-1" />
                        Basic Pay
                      </label>
                      <input
                        type="number"
                        value={formData.basicPay}
                        onChange={(e) => handleChange("basicPay", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                        placeholder="Enter basic pay"
                      />
                    </div>

                    {/* Date of Appointment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Calendar size={14} className="inline mr-1" />
                        Date of Appointment
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfAppointment}
                        onChange={(e) => handleChange("dateOfAppointment", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                      />
                    </div>

                    {/* Date of Entry as TWD */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Calendar size={14} className="inline mr-1" />
                        Date of Entry as TWD
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfEntryAsTWD}
                        onChange={(e) => handleChange("dateOfEntryAsTWD", e.target.value)}
                        className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Training Tab (Drivers only) */}
              {activeTab === "training" && isDriver && (
                <div className="space-y-6">
                  {["PME", "GRS_RC", "TR4", "OC"].map((type) => (
                    <div key={type} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <GraduationCap size={18} className="text-[#0b659a]" />
                        {type.replace("_", "/")} Training
                        <span className="text-xs font-normal text-gray-500 ml-2">
                          ({formData.trainings[type].schedule})
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Done Date</label>
                          <input
                            type="date"
                            value={formData.trainings[type].doneDate}
                            onChange={(e) => handleTrainingChange(type, "doneDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={formData.trainings[type].dueDate}
                            onChange={(e) => handleTrainingChange(type, "dueDate", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b659a]/40 focus:border-[#0b659a] transition text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t bg-slate-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#0b659a] rounded-lg hover:bg-[#084d78] disabled:bg-[#0b659a]/60 transition"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

