import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CustomSelect from "../components/CustomSelect";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
  Crown,
  UserPlus,
  IdCard,
  User,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Users,
  Pencil
} from "lucide-react";

export default function MasterAdminDashboard() {
  const navigate = useNavigate();

  const [superAdmins, setSuperAdmins] = useState([]);
  const [pfNo, setPfNo] = useState("");
  const [name, setName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [selectedDistrictNav, setSelectedDistrictNav] = useState("");
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);

  const loadSuperAdmins = async () => {
    try {
      const res = await api.get("/admin/super-admins");
      setSuperAdmins(res.data);
    } catch (err) {
      console.error("Failed to load super admins:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load super admins from database.",
      });
    }
  };

  const loadDistricts = async () => {
    try {
      const res = await api.get("/admin/districts");
      setDistricts(res.data || []);
    } catch (err) {
      console.error("Failed to load districts:", err);
    }
  };

  useEffect(() => {
    loadSuperAdmins();
    loadDistricts();
  }, []);

  // Derived registered districts list
  const registeredDistricts = superAdmins.map((sa) => sa.districtName);

  /* ================= REGISTER SUPER ADMIN ================= */
  const handleRegisterUser = async () => {
    if (!pfNo.trim() || !name.trim() || !districtName) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in PF Number, Name, and select a District.",
        confirmButtonColor: "#0b659a"
      });
      return;
    }

    // District Validation: Check whether the selected district already has a Super Admin
    const existingSA = superAdmins.find(
      (sa) => sa.districtName?.toLowerCase() === districtName.toLowerCase()
    );

    if (existingSA) {
      Swal.fire({
        icon: "error",
        title: "District Already Assigned",
        text: "A Super Admin is already registered for this district.",
        confirmButtonColor: "#dc2626"
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/register", {
        pfNo: pfNo.trim(),
        name: name.trim(),
        role: "SUPER_ADMIN",
        districtName,
      });

      Swal.fire({
        icon: "success",
        title: "Super Admin Registered",
        text: `Super Admin ${name} successfully assigned to ${districtName} district.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Clear form
      setPfNo("");
      setName("");
      setDistrictName("");
      
      // Reload the list from the database
      loadSuperAdmins();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.msg || "Failed to register super admin.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT SUPER ADMIN PROFILE ================= */
  const handleEditSuperAdminProfile = async (sa) => {
    let actionTaken = null;

    const { value: formValues } = await Swal.fire({
      title: "Edit Super Admin",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input id="swal-input-name" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#0b659a] focus:border-[#0b659a] outline-none" placeholder="Enter new name" value="${sa.name}">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">PF Number</label>
            <input id="swal-input-pf" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#0b659a] focus:border-[#0b659a] outline-none" placeholder="Enter PF Number" value="${sa.pfNo}">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password (Optional)</label>
            <input id="swal-input-password" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#0b659a] focus:border-[#0b659a] outline-none" placeholder="Leave blank to keep current">
          </div>
          
          <div class="pt-4 flex flex-col sm:flex-row gap-2 border-t mt-4">
            <button id="swal-btn-reset" class="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors w-full">Reset Password</button>
            <button id="swal-btn-delete" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors w-full">Delete</button>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      confirmButtonColor: "#0b659a",
      didOpen: () => {
        document.getElementById('swal-btn-reset').addEventListener('click', () => {
          actionTaken = 'RESET';
          Swal.close();
        });
        document.getElementById('swal-btn-delete').addEventListener('click', () => {
          actionTaken = 'DELETE';
          Swal.close();
        });
      },
      preConfirm: () => {
        const newName = document.getElementById('swal-input-name').value.trim();
        const newPfNo = document.getElementById('swal-input-pf').value.trim();
        const newPassword = document.getElementById('swal-input-password').value.trim();
        if (!newName) {
          Swal.showValidationMessage("Name cannot be empty");
          return false;
        }
        if (!newPfNo) {
          Swal.showValidationMessage("PF Number cannot be empty");
          return false;
        }
        return { name: newName, pfNo: newPfNo, password: newPassword };
      }
    });

    if (actionTaken === 'RESET') {
      const confirm = await Swal.fire({
        title: "Reset Password?",
        text: `Are you sure you want to reset the password for ${sa.name}? It will be reset to their PF Number.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, reset it"
      });
      if (confirm.isConfirmed) {
        try {
          await api.post(`/admin/users/${sa.id}/reset-password`);
          Swal.fire("Reset!", "Password has been reset.", "success");
        } catch (err) {
          Swal.fire("Error", "Failed to reset password.", "error");
        }
      }
    } else if (actionTaken === 'DELETE') {
      const confirm = await Swal.fire({
        title: "Delete Super Admin?",
        text: `Are you sure you want to delete ${sa.name}? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete"
      });
      if (confirm.isConfirmed) {
        try {
          await api.delete(`/admin/users/${sa.id}`);
          Swal.fire("Deleted!", "Super Admin has been deleted.", "success");
          loadSuperAdmins();
        } catch (err) {
          Swal.fire("Error", err.response?.data?.msg || "Failed to delete Super Admin.", "error");
        }
      }
    } else if (formValues) {
      if (formValues.name === sa.name && formValues.pfNo === sa.pfNo && !formValues.password) {
        return; // No changes
      }

      try {
        await api.put("/admin/super-admins/profile", {
          targetId: sa.id,
          name: formValues.name,
          pfNo: formValues.pfNo,
          password: formValues.password
        });
        Swal.fire("Saved!", "Super Admin profile has been updated.", "success");
        loadSuperAdmins();
      } catch (err) {
        console.error("Failed to update profile:", err);
        Swal.fire("Error", err.response?.data?.msg || "Failed to update Super Admin.", "error");
      }
    }
  };

  /* ================= NAVIGATE TO SUPER ADMIN ================= */
  const handleNavigateToSuperAdmin = (superAdminId, districtId, districtName) => {
    if (!superAdminId) return;
    if (districtId) {
      localStorage.setItem("active_super_admin_district", districtId);
    }
    if (districtName) {
      localStorage.setItem("active_super_admin_district_name", districtName);
    }
    navigate(`/master-admin/scope/${superAdminId}`);
  };

  return (
    <>

      <div className="rail-watermark min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex-shrink-0">
                <Crown size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-slate-600 mb-1">Hi, {localStorage.getItem("userName") || "User"}!</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    Master Admin Portal
                  </h1>
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    Head of Super Admins
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 font-medium sm:whitespace-normal">
                  Southern Railway • Centralized Super Admin Management & District Administration
                </p>
              </div>
            </div>
          </div>

          {/* ================= STATS SUMMARY ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-5 min-w-0">
              <div className="p-4 bg-slate-100 text-[#0b659a] rounded-2xl flex-shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 break-words">
                  Registered Super Admins
                </p>
                <p className="text-3xl font-bold text-slate-800">{superAdmins.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-5 min-w-0">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0">
                <MapPin size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 break-words">
                  Active Admin Districts
                </p>
                <p className="text-3xl font-bold text-slate-800">{registeredDistricts.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-5 min-w-0">
              <div className="p-4 bg-[#0b659a]/10 text-[#0b659a] rounded-2xl flex-shrink-0">
                <Building2 size={26} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 break-words">
                  Available Districts
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {districts.length > 0 ? (districts.length - registeredDistricts.length) : 0} / {districts.length}
                </p>
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. REGISTER SUPER ADMIN FORM (Left Column - 5 cols) */}
            <div className="lg:col-span-5 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-blue-50 text-[#0b659a] rounded-xl">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Register Super Admin</h2>
                    <p className="text-xs text-slate-500 font-medium">Create a new Super Admin for a district</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* PF NUMBER */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      PF Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <IdCard size={18} />
                      </span>
                      <input
                        type="text"
                        placeholder="Enter PF Number"
                        value={pfNo}
                        onChange={(e) => setPfNo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        placeholder="Enter Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* DISTRICT NAME DROPDOWN */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      District Assignment
                    </label>
                    <CustomSelect
                      value={districtName}
                      onChange={setDistrictName}
                      options={[
                        { value: "", label: "Select District" },
                        ...districts.map((districtObj) => {
                          const isAssigned = registeredDistricts.includes(districtObj.name);
                          return {
                            value: districtObj.name,
                            label: `${districtObj.name} ${isAssigned ? "(Super Admin Assigned)" : ""}`
                          };
                        })
                      ]}
                      placeholder="Select District"
                      icon={<MapPin size={18} />}
                    />
                  </div>

                  {/* REGISTER USER BUTTON */}
                  <button
                    onClick={handleRegisterUser}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2 mt-4 ${
                      loading
                        ? "bg-[#0b659a]/60 cursor-not-allowed"
                        : "bg-[#0b659a] hover:bg-[#0f82c5] active:scale-[0.99] hover:shadow-md"
                    }`}
                  >
                    <UserPlus size={18} />
                    {loading ? "Registering User..." : "Register User"}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. DISTRICT DROPDOWN NAVIGATION & REGISTERED LIST (Right Column - 7 cols) */}
            <div className="lg:col-span-7 space-y-6 min-w-0">
              
              {/* NAVIGATE TO SUPER ADMIN DASHBOARD CARD */}
              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ExternalLink size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Navigate to Super Admin</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Select a district to view its corresponding Super Admin dashboard
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <div className="flex-1 min-w-0">
                    <CustomSelect
                      value={selectedDistrictNav}
                      onChange={(val) => {
                        setSelectedDistrictNav(val);
                        const selectedSa = superAdmins.find(sa => sa.id === val);
                        if (selectedSa) {
                          handleNavigateToSuperAdmin(
                            selectedSa.id, 
                            selectedSa.districtId || selectedSa.districtName,
                            selectedSa.districtName
                          );
                        }
                      }}
                      options={[
                        { value: "", label: "-- Select Super Admin District --" },
                        ...superAdmins.map((sa) => ({
                          value: sa.id,
                          label: `${sa.districtName} Division (${sa.name} - ${sa.pfNo})`
                        }))
                      ]}
                      placeholder="-- Select Super Admin District --"
                      icon={<Building2 size={18} />}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const selectedSa = superAdmins.find(sa => sa.id === selectedDistrictNav);
                      if (selectedSa) {
                        handleNavigateToSuperAdmin(
                          selectedSa.id, 
                          selectedSa.districtId || selectedSa.districtName,
                          selectedSa.districtName
                        );
                      }
                    }}
                    disabled={!selectedDistrictNav}
                    className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      selectedDistrictNav
                        ? "bg-[#0b659a] hover:bg-[#0f82c5] text-white shadow-sm hover:shadow-md cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Go to Dashboard
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* REGISTERED SUPER ADMINS TABLE */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 text-[#0b659a] rounded-xl">
                      <Users size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Registered Super Admins ({superAdmins.length})
                    </h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-[#0b659a]/5 border-b border-[#0b659a]/10 text-[#0b659a] font-semibold">
                      <tr>
                        <th className="px-6 py-4">PF Number</th>
                        <th className="px-6 py-4">Super Admin Name</th>
                        <th className="px-6 py-4">Assigned District</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {superAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                            No Super Admins registered yet.
                          </td>
                        </tr>
                      ) : (
                        superAdmins.map((sa) => (
                          <tr key={sa.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-mono font-medium text-slate-700">
                              {sa.pfNo}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {sa.name}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0b659a] border border-blue-100">
                                <CheckCircle2 size={12} />
                                {sa.districtName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleNavigateToSuperAdmin(
                                    sa.id, 
                                    sa.districtId || sa.districtName,
                                    sa.districtName
                                  )}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] transition-all shadow-sm"
                                >
                                  View District
                                  <ExternalLink size={12} />
                                </button>
                                <button
                                  onClick={() => handleEditSuperAdminProfile(sa)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] transition-all shadow-sm"
                                >
                                  Edit
                                  <Pencil size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      
    </>
  );
}
