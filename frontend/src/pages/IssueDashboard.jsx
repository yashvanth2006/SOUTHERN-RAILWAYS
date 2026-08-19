import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import ResponsiveSection from "../components/ResponsiveSection";

import {
  TriangleAlert,
  Search,
  CheckCircle,
  Clock,
  User,
  Eye,
} from "lucide-react";

export default function IssueDashboard({
  depot = "",
  isOpen = true,
  setIsOpen = () => {}
}) {
  const role = localStorage.getItem("role");

  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("Pending");

//   const [depot, setDepot] = useState("");

  const loadIssues = async () => {
    try {
      setLoading(true);

      const url = depot ? `/issues?depot=${depot}` : "/issues";
      const res = await api.get(url);

      setIssues(res.data);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Unable to load issues",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [depot]);

  // const depots = [...new Set(issues.map((i) => i.depot))];

  // const filtered = useMemo(() => {
  //   return issues.filter((issue) => {
  //     const searchMatch =
  //       issue.driverName.toLowerCase().includes(search.toLowerCase()) ||
  //       issue.pfNo.toLowerCase().includes(search.toLowerCase());

  //     const statusMatch = status === "" || issue.status === status;

  //   const depotMatch =
  // selectedDepot === "" ||
  // issue.depot === selectedDepot;

  //     return searchMatch && statusMatch && depotMatch;
  //   });
  // }, [issues, search, status, selectedDepot]);

  const filtered = useMemo(() => {
  return issues.filter((issue) => {
    const searchMatch =
      issue.driverName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      issue.pfNo
        .toLowerCase()
        .includes(search.toLowerCase());

    return searchMatch;
  });
}, [issues, search]);



  const total = issues.length;

  const pending = issues.filter((i) => i.status === "Pending").length;

  const resolved = issues.filter((i) => i.status === "Resolved").length;

  const drivers = new Set(issues.map((i) => i.driverId)).size;

  return (
    <ResponsiveSection
      id="section-issues"
      title="TW Issues (Higher Priority)"
      icon={<TriangleAlert size={20} />}
      isOpenProp={isOpen}
      onToggle={setIsOpen}
      alwaysCollapsible={true}
      headerRight={
        <div className="relative w-full sm:w-64 md:w-80">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search Driver"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value && !isOpen) setIsOpen(true);
            }}
            className="border border-slate-200 w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b659a]"
          />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6 p-1">

        {/* Mobile Search - Rendered only on mobile inside expanded content */}
        <div className="md:hidden relative w-full mb-4">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search Driver"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value && !isOpen) setIsOpen(true);
            }}
            className="border border-slate-200 w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b659a]"
          />
        </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-[#0b659a]/5 border-b border-[#0b659a]/10 text-[#0b659a] font-semibold">
                <tr>
                  <TH>Driver</TH>

                  <TH>Depot</TH>

                  <TH>Tower Car</TH>

                  <TH>Checklist</TH>

                  <TH>Remarks</TH>

                  <TH>Status</TH>

                  <TH>Date</TH>

                  <TH>Action</TH>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 whitespace-nowrap">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((issue) => (
                    <tr key={issue.checklistId} className="hover:bg-slate-50 transition-colors">
                      <TD>{issue.driverName}</TD>

                      <TD>{issue.depot}</TD>

                      <TD>{issue.towerCar}</TD>

                      <TD>{issue.checklistType}</TD>

                      <td className="px-5 py-4 max-w-xs break-words">
  {issue.remarks}
</td>

                      <TD>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold

${
  issue.status === "Pending"
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700"
}

`}
                        >
                          {issue.status}
                        </span>
                      </TD>

                      <TD>
                        {new Date(issue.checklistDate).toLocaleDateString()}
                      </TD>

                      <TD>
                        {role === "DEPOT_MANAGER" ? (
                          issue.status === "Pending" ? (
                            <button
                              onClick={async () => {
                                const confirm = await Swal.fire({
                                  title: "Resolve Issue?",

                                  text: "Mark this issue as resolved?",

                                  icon: "question",

                                  showCancelButton: true,

                                  confirmButtonText: "Resolve",
                                });

                                if (!confirm.isConfirmed) return;

                                try {
                                  await api.put(
                                    `/issues/${issue.checklistId}/resolve`,
                                  );

                                  Swal.fire(
                                    "Resolved",

                                    "Issue marked as resolved.",

                                    "success",
                                  );

                                  loadIssues();
                                } catch (err) {
                                  Swal.fire(
                                    "Error",

                                    err.response?.data?.msg ||
                                      "Unable to resolve issue",

                                    "error",
                                  );
                                }
                              }}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-green-600 rounded-lg hover:bg-green-600 hover:text-white hover:border-green-600 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 whitespace-nowrap"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 whitespace-nowrap">
                              <Eye size={16} /> View
                            </button>
                          )
                        ) : (
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 whitespace-nowrap">
                            <Eye size={16} /> View
                          </button>
                        )}
                      </TD>
                    </tr>
                  ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
  colSpan={8}
  className="text-center py-10 text-gray-500 font-medium whitespace-nowrap"
>
                      No results
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
    </ResponsiveSection>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex gap-3 items-center">
      <div className="p-3 rounded-full bg-red-50 text-red-600">{icon}</div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>

        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function TH({ children }) {
  return (
    <th className="px-5 py-4 text-left whitespace-nowrap">
      {children}
    </th>
  );
}

function TD({ children }) {
  return (
    <td className="px-5 py-4 whitespace-nowrap">
      {children}
    </td>
  );
}
