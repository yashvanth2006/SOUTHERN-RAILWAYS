import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Swal from "sweetalert2";

import {
  AlertTriangle,
  Search,
  CheckCircle,
  Clock,
  User,
  Eye,
} from "lucide-react";

export default function IssueDashboard({
  selectedDepot = ""
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

      const res = await api.get("/issues");

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
  }, []);

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

    const depotMatch =
      selectedDepot === "" ||
      issue.depot === selectedDepot;

    return searchMatch && depotMatch;
  });
}, [issues, search, selectedDepot]);



  const total = issues.length;

  const pending = issues.filter((i) => i.status === "Pending").length;

  const resolved = issues.filter((i) => i.status === "Resolved").length;

  const drivers = new Set(issues.map((i) => i.driverId)).size;

  return (
    <>
      {/* <Navbar/> */}

      <div className="">
        <div className="max-w-7xl mx-auto space-y-6 p-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={30} />

            <div>
              <h2 className="text-2xl font-bold">High Priority Issues</h2>

              <p className="text-gray-500">Last 30 Days</p>
            </div>
            </div>

            <div className="bg-white rounded-xl shadow p-3 sm:p-4 flex w-full lg:w-auto">
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                placeholder="Search Driver"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border w-full lg:w-80 rounded-lg pl-10 pr-4 py-2"
              />
            </div>
            
          </div>
          </div>

          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card icon={<AlertTriangle />} title="Total" value={total} />

            <Card icon={<Clock />} title="Pending" value={pending} />

            <Card icon={<CheckCircle />} title="Resolved" value={resolved} />

            <Card icon={<User />} title="Drivers" value={drivers} />
          </div> */}

          

          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-100">
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

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 whitespace-nowrap">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((issue) => (
                    <tr key={issue.checklistId} className="border-t">
                      <TD>{issue.driverName}</TD>

                      <TD>{issue.depot}</TD>

                      <TD>{issue.towerCar}</TD>

                      <TD>{issue.checklistType}</TD>

                      <td className="px-3 sm:px-4 py-3 max-w-xs break-words">
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
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg whitespace-nowrap"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button className="text-[#0b659a] hover:text-[#084d78] transition p-1">
                              <Eye size={18} />
                            </button>
                          )
                        ) : (
                          <button className="text-[#0b659a] hover:text-[#084d78] transition p-1">
                            <Eye size={18} />
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

      {/* <Footer /> */}
    </>
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
    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">
      {children}
    </th>
  );
}

function TD({ children }) {
  return (
    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
      {children}
    </td>
  );
}
