import { useEffect, useMemo, useState, Fragment } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import ResponsiveSection from "./ResponsiveSection";

import {
  Wrench,
  CheckCircle,
  Clock,
  User,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AbnormalityDashboard({
  depot = "",
  isOpen = true,
  setIsOpen = () => {}
}) {
  const role = localStorage.getItem("role");

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(null);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("Pending");

  const [actionTaken, setActionTaken] = useState({});

  const loadReports = async () => {
    try {
      setLoading(true);

      const url = depot ? `/abnormalities?depot=${depot}` : "/abnormalities";

      const res = await api.get(url);

      setReports(res.data);
    } catch (err) {
      Swal.fire(
        "Error",

        err.response?.data?.msg || "Unable to load abnormalities",

        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [depot]);

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const searchMatch =
        report.driverName.toLowerCase().includes(search.toLowerCase()) ||
        report.pfNo.toLowerCase().includes(search.toLowerCase());

      const statusMatch = status === "" || report.status === status;

      return searchMatch && statusMatch;
    });
  }, [reports, search, status]);

  const totalReports = reports.length;

  const pendingReports = reports.filter((r) => r.status === "Pending").length;

  const completedReports = reports.filter(
    (r) => r.status === "Action Taken",
  ).length;

  const totalDrivers = new Set(reports.map((r) => r.driverId)).size;

  return (
    <ResponsiveSection
      id="section-abnormalities"
      title="Track Abnormalities"
      icon={<Wrench size={20} />}
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
      <div className="space-y-6">

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

      {/* Summary */}

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <SummaryCard
          icon={<AlertTriangle />}
          title="Total"
          value={totalReports}
        />

        <SummaryCard
          icon={<Clock />}
          title="Pending"
          value={pendingReports}
        />

        <SummaryCard
          icon={<CheckCircle />}
          title="Action Taken"
          value={completedReports}
        />

        <SummaryCard
          icon={<User />}
          title="Drivers"
          value={totalDrivers}
        />

      </div> */}

      {/* Filters */}

      {/* TABLE */}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[750px] w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#0b659a]/5 border-b border-[#0b659a]/10 text-[#0b659a] font-semibold">
            <tr>
              <th className="px-5 py-4">Driver</th>
              <th className="px-5 py-4">Depot</th>
              <th className="px-5 py-4">Tower Car</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-center">View</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No Reports Found
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((report) => (
                <Fragment key={report._id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">{report.driverName}</td>
                    <td className="px-5 py-4">{report.depotName}</td>
                    <td className="px-5 py-4">{report.towerCarNo}</td>
                    <td className="px-5 py-4">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        report.status === "Pending"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() =>
                          setExpanded(
                            expanded === report._id ? null : report._id,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 whitespace-nowrap"
                      >
                        {expanded === report._id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                        View
                      </button>
                    </td>
                  </tr>

                  {expanded === report._id && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50 px-4 sm:px-6 py-5">
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-red-600">
                            Report Details
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.abnormalities.map((item, index) => (
                              <div
                                key={index}
                                className="bg-white border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-xl p-4 break-words"
                              >
                                <h4 className="font-semibold text-[#0b659a]">
                                  {item.type}
                                </h4>

                                <p className="mt-2 text-gray-700 whitespace-pre-wrap break-words">
                                  {item.remarks?.trim() ? item.remarks : "-"}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">Action Taken</h4>

                            {role === "DEPOT_MANAGER" ? (
                              report.status === "Pending" ? (
                                <>
                                  <textarea
                                    rows={4}
                                    placeholder="Enter action taken..."
                                    value={actionTaken[report._id] || ""}
                                    onChange={(e) =>
                                      setActionTaken({
                                        ...actionTaken,

                                        [report._id]: e.target.value,
                                      })
                                    }
                                    className="w-full border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg px-4 py-2 text-sm"
                                  />

                                  <div className="mt-4 flex justify-end">
                                    <button
                                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg whitespace-nowrap"
                                      onClick={async () => {
                                      if (
                                        !(actionTaken[report._id] || "").trim()
                                      ) {
                                        return Swal.fire(
                                          "Required",
                                          "Enter Action Taken",
                                          "warning",
                                        );
                                      }

                                      try {
                                        await api.put(
                                          `/abnormalities/${report._id}/resolve`,

                                          {
                                            actionTaken:
                                              actionTaken[report._id],
                                          },
                                        );

                                        Swal.fire(
                                          "Success",

                                          "Marked as Action Taken",

                                          "success",
                                        );

                                        loadReports();
                                      } catch (err) {
                                        Swal.fire(
                                          "Error",

                                          err.response?.data?.msg ||
                                            "Unable to update",

                                          "error",
                                        );
                                      }
                                    }}
                                  >
                                    Mark as Action Taken
                                  </button>
                                  </div>
                                </>
                              ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 break-words">
                                  {report.actionTaken || "-"}
                                </div>
                              )
                            ) : (
                              <div className="bg-slate-100 rounded-lg p-4 break-words">
                                {report.actionTaken || "Pending"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>
        </div>
      </div>
      </div>
    </ResponsiveSection>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
      <div className="p-3 rounded-full bg-red-50 text-red-600">{icon}</div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>

        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
