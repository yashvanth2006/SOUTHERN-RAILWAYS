import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { getDistrictAbbreviation } from "../utils/districtMapping";
import {
  Shield,
  Users,
  Train,
  UserCog,
  Filter,
  UserPlus,
  Eye,
  Pencil,
  AlertTriangle,
  ClipboardList,
  Search,
  TrainFront,
  UsersRound,
  FileWarning,
  CalendarClock,
  Megaphone,
  TriangleAlert,
  Wrench,
  Funnel,
  CheckCircle,
  XCircle,
  Building2,
  Loader2,
  CalendarDays,
  X
} from "lucide-react";

import ResponsiveSection from "../components/ResponsiveSection";
import UserDetailModal from "../components/UserDetailModal";
import EditUserModal from "../components/EditUserModal";
import IssueDashboard from "./IssueDashboard";
import AbnormalityDashboard from "../components/AbnormalityDashboard";
import CustomSelect from "../components/CustomSelect";


export default function AdminDashboard() {
  const [depot, setDepot] = useState("");
  const [issues, setIssues] = useState([]);
  const [abnormalities, setAbnormalities] = useState([]);
  const [depots, setDepots] = useState([]);
  const [showIssues, setShowIssues] = useState(false);

  const [showOverdues, setShowOverdues] = useState(false);

  const [showAbnormalities, setShowAbnormalities] = useState(false);
  const [managers, setManagers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [miniAdmins, setMiniAdmins] = useState([]); // ✅ NEW
  const [overdues, setOverdues] = useState([]);
  const [loadingOverdues, setLoadingOverdues] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- LR Due Search State ---
  const [lrSearch, setLrSearch] = useState("");
  const [showLrDropdown, setShowLrDropdown] = useState(false);
  const [selectedLrDriver, setSelectedLrDriver] = useState("");

  // --- PME/GRS/OC Search State ---
  const [pmeSearch, setPmeSearch] = useState("");
  const [showPmeDropdown, setShowPmeDropdown] = useState(false);
  const [selectedPmeDriver, setSelectedPmeDriver] = useState("");

  const role = localStorage.getItem("role");
  const isADEE = role === "ADEE";

  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [circularPendings, setCircularPendings] = useState(0);
  const navigate = useNavigate();

  // --- Universal Search State ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    // Combine all users and add a 'roleLabel' for the UI
    const allUsers = [
      ...managers.map(u => ({ ...u, roleLabel: "SSE/TRD" })),
      ...miniAdmins.map(u => ({ ...u, roleLabel: "ADEE" })),
      ...drivers.map(u => ({ ...u, roleLabel: "Driver" }))
    ];
    
    return allUsers.filter(u => 
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.pfNo && u.pfNo.toLowerCase().includes(query)) ||
      (u.hrmsId && u.hrmsId.toLowerCase().includes(query))
    ).slice(0, 15);
  }, [searchQuery, managers, miniAdmins, drivers]);

  /* ================= OVERDUE SUMMARY ================= */

  const totalOverdues = overdues.length;

  const trainingOverdues = overdues.filter(
    item => item.category === "Training Overdue"
  ).length;

  const lrOverdues = overdues.filter(
    item => item.category === "LR Overdue"
  ).length;

  const trainingOverdueRecords = overdues.filter(
    item => item.category === "Training Overdue"
  );

  const lrOverdueRecords = overdues.filter(
    item => item.category === "LR Overdue"
  );

  // --- LR Due Search Filtering ---
  const lrFilteredDrivers = useMemo(() => {
    if (!lrSearch.trim()) return [];
    const prefix = lrSearch.toLowerCase();
    const uniqueNames = new Set();
    lrOverdueRecords.forEach(record => {
      if (record.driverName.toLowerCase().startsWith(prefix)) {
        uniqueNames.add(record.driverName);
      }
    });
    return Array.from(uniqueNames).sort();
  }, [lrSearch, lrOverdueRecords]);

  const displayedLrRecords = useMemo(() => {
    return selectedLrDriver
      ? lrOverdueRecords.filter(r => r.driverName === selectedLrDriver)
      : lrOverdueRecords;
  }, [lrOverdueRecords, selectedLrDriver]);

  const handleSelectLrDriver = (driverName) => {
    setLrSearch(driverName);
    setSelectedLrDriver(driverName);
    setShowLrDropdown(false);
  };

  const handleLrSearchChange = (e) => {
    setLrSearch(e.target.value);
    setSelectedLrDriver("");
    setShowLrDropdown(true);
  };

  // --- PME/GRS/OC Search Filtering ---
  const pmeFilteredDrivers = useMemo(() => {
    if (!pmeSearch.trim()) return [];
    const prefix = pmeSearch.toLowerCase();
    const uniqueNames = new Set();
    trainingOverdueRecords.forEach(record => {
      if (record.driverName.toLowerCase().startsWith(prefix)) {
        uniqueNames.add(record.driverName);
      }
    });
    return Array.from(uniqueNames).sort();
  }, [pmeSearch, trainingOverdueRecords]);

  const displayedPmeRecords = useMemo(() => {
    return selectedPmeDriver
      ? trainingOverdueRecords.filter(r => r.driverName === selectedPmeDriver)
      : trainingOverdueRecords;
  }, [trainingOverdueRecords, selectedPmeDriver]);

  const handleSelectPmeDriver = (driverName) => {
    setPmeSearch(driverName);
    setSelectedPmeDriver(driverName);
    setShowPmeDropdown(false);
  };

  const handlePmeSearchChange = (e) => {
    setPmeSearch(e.target.value);
    setSelectedPmeDriver("");
    setShowPmeDropdown(true);
  };

  const circularPending = drivers.filter(
    d => !d.lastAcknowledgedCircularId
  ).length;

  const overdueDrivers = new Set(
    overdues.map(item => item.driverId)
  ).size;
  /* ================= ISSUES SUMMARY ================= */

  const issueTotal = issues.length;

  const issuePending =
    issues.filter(i => i.status === "Pending").length;

  const issueResolved =
    issues.filter(i => i.status === "Resolved").length;

  /* ================= ABNORMALITY SUMMARY ================= */

  const abnormalityTotal = abnormalities.length;

  const abnormalityPending =
    abnormalities.filter(a => a.status === "Pending").length;

  const abnormalityResolved =
    abnormalities.filter(
      a => a.status === "Action Taken"
    ).length;

  /* ================= LOAD DEPOTS ================= */
  const loadDepots = async () => {
    try {
      const res = await api.get("/admin/depots");
      setDepots(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire("Error", "Failed to load depots", "error");
    }
  };

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/users${depot ? `?depot=${depot}` : ""}`
      );
      setManagers(res.data.managers || []);
      setDrivers(res.data.drivers || []);
      setMiniAdmins(res.data.mini || []); // ✅ NEW

    } catch {
      Swal.fire("Error", "Unable to fetch admin data", "error");
    } finally {
      setLoading(false);
    }
  };
  const loadOverdues = async () => {
    try {

      setLoadingOverdues(true);

      const res = await api.get(
        `/admin/overdue-records${depot ? `?depot=${depot}` : ""}`
      );

      setOverdues(res.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoadingOverdues(false);

    }
  };
  const loadIssues = async () => {
    try {
      const res = await api.get(
        `/issues${depot ? `?depot=${depot}` : ""}`
      );

      setIssues(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const loadAbnormalities = async () => {
    try {
      const res = await api.get(
        `/abnormalities${depot ? `?depot=${depot}` : ""}`
      );

      setAbnormalities(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const viewDriverDetails = (userId) => {
    navigate(`/admin/user/${userId}`);
    window.scrollTo(0, 0);
  };

  const viewManagerDetails = (userId) => {
    setSelectedManagerId(userId);
  };

  const viewMiniAdminDetails = (userId) => { // ✅ NEW
    setSelectedManagerId(userId);
  };
  const loadCirack = async () => {

    try {

      // Get latest circular
      const circularRes = await api.get("/admin/circulars");

      if (circularRes.data.length > 0) {

        const latestCircularId = circularRes.data[0]._id;

        // Get acknowledgement report
        const ackRes = await api.get(
          "/admin/circulars/acknowledgement-report",
          {
            params: {
              circularId: latestCircularId,
            },
          }
        );

        setCircularPendings(ackRes.data.summary.pending);

      } else {

        setCircularPendings(0);

      }

    } catch (err) {

      console.error("Failed to load circular summary", err);

    }
  }
  useEffect(() => {
    loadDepots();
    loadCirack();
  }, []);

  useEffect(() => {
    loadUsers();
    loadOverdues();

    loadIssues();

    loadAbnormalities();
  }, [depot]);

  const scrollToSection = (id, toggleStateFn, currentState) => {
    if (toggleStateFn && !currentState) {
      toggleStateFn(true);
    }
    setTimeout(() => {
      const section = document.getElementById(id);
      if (section) {
        // Account for mobile sticky top header (h-16 = 64px) + some breathing room
        const headerOffset = window.innerWidth < 1024 ? 80 : 24;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        
        // Mobile UX: Automatically open ResponsiveSection dropdowns if they are closed after scrolling
        if (window.innerWidth < 768) {
          setTimeout(() => {
            const header = section.children[0];
            const content = section.children[1];
            if (header && content && content.classList.contains('hidden')) {
              header.click();
            }
          }, 600); // Wait for smooth scroll to finish
        }
      }
    }, 100);
  };

  return (
    <>

      <div className="rail-watermark min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                  <Shield size={28} />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-600 mb-1">Hi, {localStorage.getItem("userName") || "User"}!</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    {`${isADEE ? "ADEE" : "Sr.DEE"}/TRD/${isADEE ? (localStorage.getItem("depotName") || "") : getDistrictAbbreviation(localStorage.getItem("active_super_admin_district_name") || localStorage.getItem("districtName"))} Dashboard`}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {isADEE ? "Visibility across assigned depots" : "Global visibility across all depots"}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 self-end lg:self-auto relative">

              {/* UNIVERSAL SEARCH (Super Admin only) */}
              {!isADEE && (
                <div className="flex items-center">
                  {isSearchOpen ? (
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm w-[calc(100vw-3rem)] sm:w-64 md:w-80 absolute right-0 top-0 sm:relative z-50">
                      <Search size={18} className="text-slate-400 mr-2 shrink-0" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search Name, PF, or HRMS ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full focus:outline-none text-sm bg-transparent font-medium text-slate-700"
                      />
                      <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
                        <X size={16} />
                      </button>
                      
                      {/* DROPDOWN */}
                      {searchQuery.trim() && (
                        <div className="absolute top-full mt-2 right-0 w-full sm:w-[350px] bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden z-50">
                          {searchResults.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto">
                              {searchResults.map(user => (
                                <div key={user._id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                  <div className="min-w-0 pr-2">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                      <span className="font-mono bg-slate-100 px-1.5 rounded">{user.pfNo || "-"}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                      <span className="truncate">{user.roleLabel} • {user.depotName || "N/A"}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                        if (user.roleLabel === 'Driver') viewDriverDetails(user._id);
                                        else if (user.roleLabel === 'ADEE') viewMiniAdminDetails(user._id);
                                        else viewManagerDetails(user._id);
                                      }}
                                      className="p-1.5 text-[#0b659a] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                        setEditUserId(user._id);
                                      }}
                                      className="p-1.5 text-[#0b659a] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                      title="Edit User"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-slate-500">
                              No users found matching "{searchQuery}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2.5 bg-white text-slate-600 hover:text-[#0b659a] hover:bg-blue-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
                      title="Universal Search"
                    >
                      <Search size={20} />
                    </button>
                  )}
                </div>
              )}

              {!isADEE && (
                <button
                  onClick={() => navigate("/admin/register")}
                  className="bg-[#0b659a] hover:bg-[#0f82c5] text-white rounded-xl px-4 sm:px-5 py-2.5 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium shrink-0"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>
          </div>
          {/* ================= STAT CARDS GRID ================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={<UserCog />}
              label="SSE / TRD"
              value={managers.length}
              onClick={() => scrollToSection("section-managers")}
            />
            <StatCard
              icon={<TrainFront />}
              label="Drivers"
              value={drivers.length}
              onClick={() => scrollToSection("section-drivers")}
            />
            {!isADEE && (
              <StatCard
                icon={<UsersRound />}
                label="Mini Admins"
                value={miniAdmins.length}
                onClick={() => scrollToSection("section-mini-admins")}
              />
            )}
            <StatCard
              icon={<FileWarning />}
              label="PME/GRS/OC Due"
              value={trainingOverdues}
              colorClass="bg-red-50 text-red-600"
              onClick={() => scrollToSection("section-overdues", setShowOverdues, showOverdues)}
            />
            <StatCard
              icon={<CalendarClock />}
              label="LR Due"
              value={lrOverdues}
              colorClass="bg-red-50 text-red-600"
              onClick={() => scrollToSection("section-overdues", setShowOverdues, showOverdues)}
            />
            <StatCard
              icon={<Megaphone />}
              label="Circular Pending"
              value={circularPendings}
              colorClass="bg-red-50 text-red-600"
              onClick={() => navigate("/admin/circular-status")}
            />
            <StatCard
              icon={<TriangleAlert />}
              label="TW issues (higher priority)"
              value={issueTotal}
              colorClass="bg-red-50 text-red-600"
              onClick={() => scrollToSection("section-issues", setShowIssues, showIssues)}
            />
            <StatCard
              icon={<Wrench />}
              label="Track Abnormalities"
              value={abnormalityTotal}
              colorClass="bg-red-50 text-red-600"
              onClick={() => scrollToSection("section-abnormalities", setShowAbnormalities, showAbnormalities)}
            />
          </div>




          {/* </div> */}


          {/* ================= FILTER ================= */}
          <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 font-bold">
              <div className="p-2 bg-slate-100 rounded-lg text-[#0b659a]">
                <Funnel size={20} />
              </div>
              <span className="text-base">Filter by Depot</span>
            </div>

            <CustomSelect
              value={depot}
              onChange={setDepot}
              options={[
                { value: "", label: "All Depots" },
                ...depots.map(d => ({ value: d, label: d }))
              ]}
              placeholder="All Depots"
              className="w-full sm:w-64"
            />
          </div>
          <IssueDashboard depot={depot} isOpen={showIssues} setIsOpen={setShowIssues} />

          <AbnormalityDashboard depot={depot} isOpen={showAbnormalities} setIsOpen={setShowAbnormalities} />

          <ResponsiveSection
            id="section-overdues"
            title="Overdue Records"
            icon={<ClipboardList size={20} />}
            isOpenProp={showOverdues}
            onToggle={setShowOverdues}
            alwaysCollapsible={true}
          >
            <div className="space-y-8">

                {/* ================= LR OVERDUES ================= */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-red-600" size={22} />
                      <h3 className="text-xl font-bold text-slate-800">
                        LR Due Records
                      </h3>
                    </div>

                    {/* LR Due Search */}
                    <div className="relative w-full sm:w-64 md:w-80">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          placeholder="Search Driver"
                          value={lrSearch}
                          onChange={handleLrSearchChange}
                          onFocus={() => setShowLrDropdown(true)}
                          onBlur={() => setTimeout(() => setShowLrDropdown(false), 200)}
                          className="border border-slate-200 w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b659a]"
                        />
                      </div>
                      
                      {showLrDropdown && lrSearch.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {lrFilteredDrivers.length > 0 ? (
                            lrFilteredDrivers.map(name => (
                              <div 
                                key={name} 
                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                onMouseDown={() => handleSelectLrDriver(name)}
                              >
                                {name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-slate-500">
                              No records found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Table
                    headers={[
                      "Driver",
                      "PF No",
                      "Depot",
                      // "Category",
                      "Item",
                      "Due Date",
                      "Overdue",
                      "Action",
                    ]}
                    loading={loadingOverdues}
                    emptyText="No LR Due records"
                  >
                    {displayedLrRecords.map((record, index) => (
                      <tr
                        key={`${record.driverId}-${index}`}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {record.driverName}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {record.pfNo}
                        </td>

                        <td className="px-5 py-4">
                          <Badge>{record.depotName}</Badge>
                        </td>

                        {/* <td className="px-5 py-4 text-slate-600">
              {record.category}
            </td> */}

                        <td className="px-5 py-4 text-slate-600">
                          {record.item}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {new Date(record.dueDate).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                            {record.overdueDays} Days
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => navigate(`/admin/user/${record.driverId}`)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>

                {/* ================= TRAINING OVERDUES ================= */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-amber-600" size={22} />
                      <h3 className="text-xl font-bold text-slate-800">
                        PME/GRS/OC Records
                      </h3>
                    </div>

                    {/* PME Search */}
                    <div className="relative w-full sm:w-64 md:w-80">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          placeholder="Search Driver"
                          value={pmeSearch}
                          onChange={handlePmeSearchChange}
                          onFocus={() => setShowPmeDropdown(true)}
                          onBlur={() => setTimeout(() => setShowPmeDropdown(false), 200)}
                          className="border border-slate-200 w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b659a]"
                        />
                      </div>
                      
                      {showPmeDropdown && pmeSearch.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {pmeFilteredDrivers.length > 0 ? (
                            pmeFilteredDrivers.map(name => (
                              <div 
                                key={name} 
                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                onMouseDown={() => handleSelectPmeDriver(name)}
                              >
                                {name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-slate-500">
                              No records found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Table
                    headers={[
                      "Driver",
                      "PF No",
                      "Depot",
                      // "Category",
                      "Item",
                      "Due Date",
                      "Overdue",
                      "Action",
                    ]}
                    loading={loadingOverdues}
                    emptyText="No PME/GRS/OC records"
                  >
                    {displayedPmeRecords.map((record, index) => (
                      <tr
                        key={`${record.driverId}-${index}`}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {record.driverName}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {record.pfNo}
                        </td>

                        <td className="px-5 py-4">
                          <Badge>{record.depotName}</Badge>
                        </td>

                        {/* <td className="px-5 py-4 text-slate-600">
              {record.category}
            </td> */}

                        <td className="px-5 py-4 text-slate-600">
                          {record.item}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {new Date(record.dueDate).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                            {record.overdueDays} Days
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => navigate(`/admin/user/${record.driverId}`)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>

              </div>
          </ResponsiveSection>

          {/* ================= MINI ADMINS (NEW) ================= */}
          {!isADEE && <ResponsiveSection id="section-mini-admins" title="Mini Admins (ADEE)" icon={<UsersRound />}>
            <Table
              headers={["Name", "PF No", "Depot", "Actions"]}
              loading={loading}
              emptyText="No mini admins found"
            >
              {miniAdmins.map(m => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                  <td className="px-5 py-4 text-slate-600">{m.pfNo || "-"}</td>
                  <td className="px-5 py-4">
                    <Badge>{m.depotName || "N/A"}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewMiniAdminDetails(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </ResponsiveSection>}


          {/* ================= MANAGERS ================= */}
          <ResponsiveSection id="section-managers" title="SSE/TRD" icon={<UserCog />}>
            <Table headers={["Name", "PF No", "Depot", "Actions"]} loading={loading} emptyText="No managers found">
              {managers.map(m => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                  <td className="px-5 py-4 text-slate-600">{m.pfNo || "-"}</td>
                  <td className="px-5 py-4">
                    <Badge>SSE/TRD/{m.depotName}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewManagerDetails(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </ResponsiveSection>

          {/* ================= DRIVERS ================= */}
          <ResponsiveSection id="section-drivers" title="Drivers" icon={<TrainFront />}>
            <Table headers={["PF No", "Name", "Depot", "Actions"]} loading={loading} emptyText="No drivers found">
              {drivers.map(d => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-5 py-4 text-slate-600">{d.pfNo}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{d.name}</td>
                  <td className="px-5 py-4">
                    <Badge>{d.depotName}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewDriverDetails(d._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(d._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </ResponsiveSection>

        </div>
      </div>

      {selectedManagerId && (
        <UserDetailModal
          userId={selectedManagerId}
          onClose={() => setSelectedManagerId(null)}
          isAdmin={true}
        />
      )}

      {editUserId && (
        <EditUserModal
          userId={editUserId}
          onClose={() => setEditUserId(null)}
          onSuccess={() => loadUsers()}
        />
      )}

      
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ icon, label, value, colorClass, onClick }) {
  const iconStyle = colorClass || "bg-slate-100 text-[#0b659a]";
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500; // 1.5 seconds
    const targetValue = Number(value) || 0;

    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutExpo for a very snappy start and slow finish
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(Math.floor(easeProgress * targetValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 group transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 sm:gap-4 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`p-3 sm:p-4 ${iconStyle} group-hover:bg-[#0b659a] group-hover:text-white rounded-2xl flex-shrink-0 transition-colors duration-300`}>
        {icon}
      </div>
      <div className="flex flex-col items-center">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide mb-1 uppercase transition-colors duration-300 line-clamp-2">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-slate-800 transition-colors duration-300">{displayValue}</p>
      </div>
    </div>
  );
}

function Table({ headers, children, loading, emptyText }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-[#0b659a]/5 border-b border-[#0b659a]/10 text-[#0b659a] font-semibold">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={headers.length} className="py-8 text-center text-slate-500 font-medium">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && (!children || (Array.isArray(children) ? children.length === 0 : false)) && (
              <tr>
                <td colSpan={headers.length} className="py-8 text-center text-slate-500 font-medium">
                  {emptyText}
                </td>
              </tr>
            )}
            {!loading && children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="px-3 py-1.5 text-xs font-semibold bg-[#0b659a]/10 text-[#0b659a] border border-slate-200 rounded-lg inline-flex items-center justify-center whitespace-nowrap">
      {children}
    </span>
  );
}
