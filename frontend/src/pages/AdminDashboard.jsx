import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
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
  ClipboardList
} from "lucide-react";
import Footer from "../components/Footer";
import UserDetailModal from "../components/UserDetailModal";
import EditUserModal from "../components/EditUserModal";
import IssueDashboard from "./IssueDashboard";
import AbnormalityDashboard from "../components/AbnormalityDashboard";

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

  const role = localStorage.getItem("role");
  const isADEE = role === "ADEE";

  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
const [circularPendings, setCircularPendings] = useState(0);
  const navigate = useNavigate();

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
  };

  const viewManagerDetails = (userId) => {
    setSelectedManagerId(userId);
  };

  const viewMiniAdminDetails = (userId) => { // ✅ NEW
    setSelectedManagerId(userId);
  };
const loadCirack=async ()=>{

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
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                  <Shield size={28} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    {isADEE ? "ADEE/TRD Dashboard" : "Sr.DEE/TRD/SA Dashboard"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {isADEE ? "Visibility across assigned depots" : "Global visibility across all depots"}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            {!isADEE && (
              <button
                onClick={() => navigate("/admin/register")}
                className="bg-[#0b659a] hover:bg-[#0f82c5] text-white rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <UserPlus size={18} />
                Add User
              </button>
            )}
          </div>
            {/* ================= STAT CARDS GRID ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<UserCog />}
                label="SSE / TRD"
                value={managers.length}
                onClick={() => scrollToSection("section-managers")}
              />
              <StatCard
                icon={<Train />}
                label="Drivers"
                value={drivers.length}
                onClick={() => scrollToSection("section-drivers")}
              />
              {!isADEE && (
                <StatCard
                  icon={<Users />}
                  label="Mini Admins"
                  value={miniAdmins.length}
                  onClick={() => scrollToSection("section-mini-admins")}
                />
              )}
              <StatCard
                icon={<AlertTriangle />}
                label="PME/GRS/OC Due"
                value={trainingOverdues}
                colorClass="bg-red-50 text-red-600"
                onClick={() => scrollToSection("section-overdues", setShowOverdues, showOverdues)}
              />
              <StatCard
                icon={<AlertTriangle />}
                label="LR Due"
                value={lrOverdues}
                colorClass="bg-red-50 text-red-600"
                onClick={() => scrollToSection("section-overdues", setShowOverdues, showOverdues)}
              />
              <StatCard
                icon={<AlertTriangle />}
                label="Circular Pending"
                value={circularPendings}
                colorClass="bg-red-50 text-red-600"
                onClick={() => navigate("/admin/circular-status")}
              />
              <StatCard
                icon={<AlertTriangle />}
                label="TW issues (higher priority)"
                value={issueTotal}
                colorClass="bg-red-50 text-red-600"
                onClick={() => scrollToSection("section-issues", setShowIssues, showIssues)}
              />
              <StatCard
                icon={<AlertTriangle />}
                label="Track Abnormalities"
                value={abnormalityTotal}
                colorClass="bg-red-50 text-red-600"
                onClick={() => scrollToSection("section-abnormalities", setShowAbnormalities, showAbnormalities)}
              />
            </div>




{/* </div> */}
      

          {/* ================= FILTER ================= */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 font-bold">
              <div className="p-2 bg-slate-100 rounded-lg text-[#0b659a]">
                <Filter size={20} />
              </div>
              <span className="text-base">Filter by Depot</span>
            </div>

            <select
              value={depot}
              onChange={e => setDepot(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Depots</option>
              {depots.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
            <div id="section-issues" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#0b659a] group/card">
              <button
                onClick={() => setShowIssues(!showIssues)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white transition-colors duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-amber-50 group-hover/card:bg-[#0b659a] rounded-xl bg-red-50 text-red-600 group-hover/card:text-white transition-colors duration-300">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-lg font-bold text-slate-800 transition-colors duration-300">TW issues (higher priority)</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showIssues ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showIssues && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                  <IssueDashboard selectedDepot={depot} />
                </div>
              )}
            </div>

            <div id="section-abnormalities" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#0b659a] group/card">
              <button
                onClick={() => setShowAbnormalities(!showAbnormalities)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white transition-colors duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-red-50 group-hover/card:bg-[#0b659a] rounded-xl text-red-600 group-hover/card:text-white transition-colors duration-300">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-lg font-bold text-slate-800 transition-colors duration-300">Track Abnormalities</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showAbnormalities ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showAbnormalities && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                  <AbnormalityDashboard selectedDepot={depot} />
                </div>
              )}
            </div>

            <div id="section-overdues" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#0b659a] group/card">
              <button
                onClick={() => setShowOverdues(!showOverdues)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white transition-colors duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-50 group-hover/card:bg-[#0b659a] rounded-xl text-indigo-600 group-hover/card:text-white transition-colors duration-300">
                    <ClipboardList size={20} />
                  </div>
                  <span className="text-lg font-bold text-slate-800 transition-colors duration-300">Overdue Records</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showOverdues ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showOverdues && (
  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-8">

    {/* ================= LR OVERDUES ================= */}
    <div>
      <div className="flex items-center gap-3 mb-4">
        <ClipboardList className="text-red-600" size={22} />
        <h3 className="text-xl font-bold text-slate-800">
          LR Due Records
        </h3>
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
        {lrOverdueRecords.map((record, index) => (
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
      <div className="flex items-center gap-3 mb-4">
        <ClipboardList className="text-amber-600" size={22} />
        <h3 className="text-xl font-bold text-slate-800">
          PME/GRS/OC Records
        </h3>
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
        {trainingOverdueRecords.map((record, index) => (
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
)}
            </div>

          {/* ================= MINI ADMINS (NEW) ================= */}
          {!isADEE  && <Section id="section-mini-admins" title="Mini Admins (ADEE)" icon={<Users />}>
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
                    <Badge>{m.assignedDepots.join("/")}</Badge>
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
          </Section> }
          

          {/* ================= MANAGERS ================= */}
          <Section id="section-managers" title="SSE/TRD" icon={<Users />}>
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
          </Section>

          {/* ================= DRIVERS ================= */}
          <Section id="section-drivers" title="Drivers" icon={<Train />}>
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
          </Section>

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

      <Footer />
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
      className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0b659a] hover:-translate-y-1 group transition-all duration-300 flex items-center gap-5 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`p-4 ${iconStyle} group-hover:bg-[#0b659a] group-hover:text-white rounded-2xl flex-shrink-0 transition-colors duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 tracking-wide mb-1 uppercase transition-colors duration-300">{label}</p>
        <p className="text-3xl font-bold text-slate-800 transition-colors duration-300">{displayValue}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children, id }) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 flex flex-col group/section transition-all duration-300 hover:shadow-md hover:border-[#0b659a] hover:-translate-y-1">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white transition-colors duration-300">
        <div className="p-2.5 bg-slate-100 group-hover/section:bg-[#0b659a] group-hover/section:text-white rounded-xl text-[#0b659a] transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 transition-colors duration-300">
          {title}
        </h3>
      </div>
      <div className="p-6 bg-slate-50/30 flex-1">
        {children}
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
    <span className="px-3 py-1.5 text-xs font-semibold bg-[#0b659a]/10 text-[#0b659a] border border-[#0b659a]/20 rounded-lg inline-flex items-center justify-center whitespace-nowrap">
      {children}
    </span>
  );
}
