import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import IssueDashboard from "./IssueDashboard";
import AbnormalityDashboard from "../components/AbnormalityDashboard";
import Swal from "sweetalert2";
import { getDistrictAbbreviation } from "../utils/districtMapping";
import {
  Search,
  Eye,
  TrainFront,
  ClipboardList,
  ShieldAlert,
  Clock,
  TriangleAlert,
  FileWarning,
  CalendarClock,
  Megaphone,
  Wrench
} from "lucide-react";

import ResponsiveSection from "../components/ResponsiveSection";

export default function DepotManagerDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
const [overdues, setOverdues] = useState([]);
const [issues, setIssues] = useState([]);
const [abnormalities, setAbnormalities] = useState([]);
const [showIssues, setShowIssues] = useState(false);
const [circularPendings, setCircularPendings] = useState(0);
const [showAbnormalities, setShowAbnormalities] = useState(false);

const [showOverdues, setShowOverdues] = useState(false);

const [showCirculars, setShowCirculars] = useState(false);
  const navigate = useNavigate();

  // --- LR Due Search State ---
  const [lrSearch, setLrSearch] = useState("");
  const [showLrDropdown, setShowLrDropdown] = useState(false);
  const [selectedLrDriver, setSelectedLrDriver] = useState("");

  // --- PME/GRS/OC Search State ---
  const [pmeSearch, setPmeSearch] = useState("");
  const [showPmeDropdown, setShowPmeDropdown] = useState(false);
  const [selectedPmeDriver, setSelectedPmeDriver] = useState("");

  /* ================= VIEW USER DETAILS ================= */
  const viewUserDetails = (userId) => {
    // Navigate to dedicated detail page for full comprehensive view
    navigate(`/manager/driver/${userId}`);
  };

  useEffect(() => {
   Promise.all([
  api.get("/depot/drivers"),
  api.get("/admin/overdue-records"),
  api.get("/issues"),
  api.get("/abnormalities")
])
.then(([driverRes, overdueRes, issueRes, abnormalityRes]) => {

  setDrivers(driverRes.data);

  setOverdues(overdueRes.data);

  setIssues(issueRes.data);

  setAbnormalities(abnormalityRes.data);

})
.catch(() => {

  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load dashboard"
  });

})
.finally(() => setLoading(false));
  }, []);

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.pfNo.includes(search)
  );
/* ================= OVERDUE SUMMARY ================= */

const cirack=async()=>{
  
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
    // print()

  } else {

    setCircularPendings(0);

  }

} catch (err) {

  console.error("Failed to load circular summary", err);

}
}

useEffect(()=>{
  cirack();
},[])


const totalOverdues = overdues.length;

const trainingOverdues =
  overdues.filter(
    o => o.category === "Training Overdue"
  ).length;

const lrOverdues =
  overdues.filter(
    o => o.category === "LR Overdue"
  ).length;

/* ================= OVERDUE TABLE DATA ================= */

const trainingOverdueRecords =
  overdues.filter(
    o => o.category === "Training Overdue"
  );

const lrOverdueRecords =
  overdues.filter(
    o => o.category === "LR Overdue"
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

  const issueTotal = issues.length;

const issuePending =
  issues.filter(i => i.status === "Pending").length;

const abnormalityTotal = abnormalities.length;

const abnormalityPending =
  abnormalities.filter(a => a.status === "Pending").length;
const circularPending = drivers.filter(
  d => !d.lastAcknowledgedCircularId
).length;   
// setCircularPending(res.data.circularPending);


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
      
      if (window.innerWidth < 768) {
        setTimeout(() => {
          const header = section.children[0];
          const content = section.children[1];
          if (header && content && content.classList.contains('hidden')) {
            header.click();
          }
        }, 600);
      }
    }
  }, 100);
};

  return (
    <>

      <div className="rail-watermark min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
           {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm"> */}
           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-lg font-medium text-slate-600 mb-1">Hi, {localStorage.getItem("userName") || "User"}!</p>
              <h2 className="text-2xl font-bold text-gray-800">
                {`SSE/TRD/${localStorage.getItem("depotName")} Dashboard`}
              </h2>
              <p className="text-sm text-gray-500">
                Manage drivers under your depot
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
              <TrainFront className="text-blue-600" />
              <span className="font-semibold text-gray-700">
                Total Drivers: {drivers.length}
              </span>
            </div>
          </div>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

  <StatCard
    icon={<TrainFront />}
    label="Drivers"
    value={drivers.length}
    onClick={() =>
      scrollToSection("section-drivers")
    }
  />

  <StatCard
    icon={<FileWarning />}
    label="PME/GRS/OC Due"
    value={trainingOverdues}
    onClick={() =>
      scrollToSection(
        "section-overdues",
        setShowOverdues,
        showOverdues
      )
    }

    colorClass="bg-red-50 text-red-600"
  />

  <StatCard
    icon={<CalendarClock />}
    label="LR Due"
    value={lrOverdues}
    onClick={() =>
      scrollToSection(
        "section-overdues",
        setShowOverdues,
        showOverdues
      )
    }
    colorClass="bg-red-50 text-red-600"
  />

  <StatCard
    icon={<Megaphone />}
    label="Circular Pending"
    colorClass="bg-red-50 text-red-600"
    value={circularPendings}
    
                onClick={() => navigate("/admin/circular-status")}
  />

  <StatCard
    icon={<TriangleAlert />}
    label="TW Issues"
    value={issuePending}
    colorClass="bg-red-50 text-red-600"
    onClick={() =>
      scrollToSection(
        "section-issues",
        setShowIssues,
        showIssues
      )
    }
  />

  <StatCard
    icon={<Wrench />}
    colorClass="bg-red-50 text-red-600"
    label="Track Abnormalities"
    value={abnormalityPending}
    onClick={() =>
      scrollToSection(
        "section-abnormalities",
        setShowAbnormalities,
        showAbnormalities
      )
    }
  />

</div>

          {/* SEARCH */}
          {/* <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 w-full">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by PF No or Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full focus:outline-none text-sm min-w-0"
            />
          </div>
         */}


<IssueDashboard isOpen={showIssues} setIsOpen={setShowIssues} />

<AbnormalityDashboard isOpen={showAbnormalities} setIsOpen={setShowAbnormalities} />


<ResponsiveSection
  id="section-overdues"
  title="Overdue Records"
  icon={<ClipboardList size={20}/>}
  isOpenProp={showOverdues}
  onToggle={setShowOverdues}
  alwaysCollapsible={true}
>
  <div className="border-t p-5">

        {/* KEEP EVERYTHING INSIDE HERE */}

  <div>

    

    <div className="p-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-red-600" size={22}/>
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

          // "Category",

          "Item",

          "Due Date",

          "Overdue",

          "Action",

        ]}

        loading={loading}

        emptyText="No LR Due Records"

      >

        {displayedLrRecords.map((record, index) => (

          <tr

            key={`${record.driverId}-${index}`}

            className="hover:bg-slate-50 border-t"

          >

            <td className="px-5 py-4 font-medium">

              {record.driverName}

            </td>

            <td className="px-5 py-4">

              {record.pfNo}

            </td>

            {/* <td className="px-5 py-4">

              <span

                className={`px-3 py-1 rounded-full text-xs font-medium ${

                  record.category === "Training Overdue"

                    ? "bg-red-100 text-red-700"

                    : "bg-[#0b659a]/10 text-[#0b659a]"

                }`}

              >

                {record.category}

              </span>

            </td> */}

            <td className="px-5 py-4">

              {record.item}

            </td>

            <td className="px-5 py-4">

              {new Date(record.dueDate).toLocaleDateString()}

            </td>

            <td className="px-5 py-4">

              <span className="text-red-600 font-semibold">

                {record.overdueDays} Days

              </span>

            </td>

            <td className="px-5 py-4">

              <button

                onClick={() =>

                  navigate(`/manager/driver/${record.driverId}`)

                }

                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border- [#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"

              >

                <Eye size={15} />

                View

              </button>

            </td>

          </tr>

        ))}

      </Table>

    </div>

  </div>



  {/* ================= TRAINING DUE ================= */}

  <div>

    <div className="p-5">

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

          // "Category",

          "Item",

          "Due Date",

          "Overdue",

          "Action",

        ]}

        loading={loading}

        emptyText="No PME/GRS/OC Records"

      >

        {displayedPmeRecords.map((record, index) => (

          <tr

            key={`${record.driverId}-${index}`}

            className="hover:bg-slate-50 border-t"

          >

            <td className="px-5 py-4 font-medium">

              {record.driverName}

            </td>

            <td className="px-5 py-4">

              {record.pfNo}

            </td>

            {/* <td className="px-5 py-4">

              <span

                className={`px-3 py-1 rounded-full text-xs font-medium ${

                  record.category === "Training Overdue"

                    ? "bg-red-100 text-red-700"

                    : "bg-[#0b659a]/10 text-[#0b659a]"

                }`}

              >

                {record.category}

              </span>

            </td> */}

            <td className="px-5 py-4">

              {record.item}

            </td>

            <td className="px-5 py-4">

              {new Date(record.dueDate).toLocaleDateString()}

            </td>

            <td className="px-5 py-4">

              <span className="text-red-600 font-semibold">

                {record.overdueDays} Days

              </span>

            </td>

            <td className="px-5 py-4">

              <button

                onClick={() =>

                  navigate(`/manager/driver/${record.driverId}`)

                }

                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border- [#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"

              >

                <Eye size={15} />

                View

              </button>

            </td>

          </tr>

        ))}

      </Table>

    </div>

  </div>
      </div>
</ResponsiveSection>





          {/* TABLE */}
 <ResponsiveSection
    id="section-drivers"
    title="Drivers"
    icon={<TrainFront />}
>
            <div className="overflow-x-auto">
               
  <div className="overflow-x-auto">
             <table className="min-w-[850px] w-full text-sm">
                <thead className="bg-[#0b659a]/5 border-b border-[#0b659a]/10 text-[#0b659a] font-semibold">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">PF No</th>
                    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">Name</th>
                    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">Depot</th>
                    <th className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">
                        Loading drivers...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredDrivers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">
                        No drivers found
                      </td>
                    </tr>
                  )}

                  {filteredDrivers.map(d => (
                    <tr
    key={d._id}
    className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0"
>
                      <td className="px-4 py-3 font-medium">
                        {d.pfNo}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        {d.name}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <Badge>
                          {d.depotName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewUserDetails(d._id)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border- [#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </ResponsiveSection>

        </div>
      </div>


      
    </>
  );
}
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
      className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 group transition-all duration-300 flex items-center gap-5 ${onClick ? "cursor-pointer" : ""}`}
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


function Badge({ children }) {
  return (
    <span
      className="
      px-3
      py-1.5
      text-xs
      font-semibold
      bg-[#0b659a]/10
      text-[#0b659a]
      border
      border-[#0b659a]/20
      rounded-lg
      inline-flex
      items-center
      justify-center
      whitespace-nowrap
      "
    >
      {children}
    </span>
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


// function StatCard({ icon, label, value, colorClass, onClick }) {
//   const iconStyle = colorClass || "bg-slate-100 text-[#0b659a]";
//   const [displayValue, setDisplayValue] = useState(0);

//   useEffect(() => {
//     let startTimestamp = null;
//     const duration = 1500; // 1.5 seconds
//     const targetValue = Number(value) || 0;

//     if (targetValue === 0) {
//       setDisplayValue(0);
//       return;
//     }

//     const step = (timestamp) => {
//       if (!startTimestamp) startTimestamp = timestamp;
//       const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
//       // easeOutExpo for a very snappy start and slow finish
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       setDisplayValue(Math.floor(easeProgress * targetValue));
      
//       if (progress < 1) {
//         window.requestAnimationFrame(step);
//       } else {
//         setDisplayValue(targetValue);
//       }
//     };
    
//     window.requestAnimationFrame(step);
//   }, [value]);

//   return (
//     <div 
//       onClick={onClick}
//       className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 group transition-all duration-300 flex items-center gap-5 ${onClick ? "cursor-pointer" : ""}`}
//     >
//       <div className={`p-4 ${iconStyle} group-hover:bg-[#0b659a] group-hover:text-white rounded-2xl flex-shrink-0 transition-colors duration-300`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-sm font-semibold text-slate-500 tracking-wide mb-1 uppercase transition-colors duration-300">{label}</p>
//         <p className="text-3xl font-bold text-slate-800 transition-colors duration-300">{displayValue}</p>
//       </div>
//     </div>
//   );
// }
