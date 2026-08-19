import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import CustomSelect from "../components/CustomSelect";

import {
  AlertTriangle,
  Search,
  Building2,
  User,
  Eye,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";

export default function AdminOverdueRecords() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [depot, setDepot] = useState("");

  const [category, setCategory] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/overdue-records");
      setRecords(res.data);
    } catch {
      Swal.fire("Error", "Unable to fetch overdue records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const depots = [...new Set(records.map((r) => r.depotName))];

const filtered = useMemo(() => {

  const result = records.filter((record) => {
    const searchMatch =
      record.driverName.toLowerCase().includes(search.toLowerCase()) ||
      record.pfNo.toString().toLowerCase().includes(search.toLowerCase());

    const depotMatch =
      depot === "" || record.depotName === depot;

    const categoryMatch =
      category === "" || category === "All" || record.category === category;

    return searchMatch && depotMatch && categoryMatch;
  });


  return result;
}, [records, search, depot, category]);

  const healthCount = records.filter(
    (r) => r.category === "Training Overdue",
  ).length;

  const lrCount = records.filter((r) => r.category === "LR Overdue").length;

  const uniqueDrivers = new Set(records.map((r) => r.driverId)).size;

  return (
    <>

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={30} />

            <div>
              <h2 className="text-2xl font-bold">Overdue Records</h2>

              <p className="text-gray-500 text-sm">
                Drivers requiring immediate attention
              </p>
            </div>
          </div>

          <div
            className="grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-4"
          >
            <StatCard
              icon={<ShieldAlert />}
              title="Total Overdues"
              value={records.length}
            />

            <StatCard
              icon={<ClipboardList />}
              title="Training Overdue"
              value={healthCount}
            />

            <StatCard icon={<Building2 />} title="LR Overdue" value={lrCount} />

            <StatCard icon={<User />} title="Drivers" value={uniqueDrivers} />
          </div>

          <div
            className="bg-white
rounded-xl
shadow
p-4
flex
flex-wrap
gap-3"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute
left-3
top-3
text-gray-400"
              />

              <input
                placeholder="Search Driver / PF"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10
pr-4
py-2
border
rounded-lg"
              />
            </div>

            <CustomSelect
              value={depot}
              onChange={setDepot}
              options={[
                { value: "", label: "All Depots" },
                ...depots.map(d => ({ value: d, label: d }))
              ]}
              placeholder="All Depots"
              className="w-full sm:w-auto min-w-[150px]"
            />

            <CustomSelect
              value={category}
              onChange={setCategory}
              options={[
                { value: "All", label: "All Categories" },
                { value: "Training Overdue", label: "Training Overdue" },
                { value: "LR Overdue", label: "LR Overdue" }
              ]}
              placeholder="All Categories"
              className="w-full sm:w-auto min-w-[150px]"
            />
          </div>

          <div
            className="bg-white
rounded-xl
shadow
overflow-x-auto"
          >
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <TableHead>Driver</TableHead>

                  <TableHead>PF No</TableHead>

                  <TableHead>Depot</TableHead>

                  <TableHead>Category</TableHead>

                  <TableHead>Item</TableHead>

                  <TableHead>Due Date</TableHead>

                  <TableHead>Overdue</TableHead>

                  <TableHead>Action</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((record,index) => (
                    <tr
                     key={`${record.driverId}-${record.category}-${record.item}-${record.dueDate}-${index}`}
                      className="border-t hover:bg-slate-50"
                    >
                      <TableCell>{record.driverName}</TableCell>

                      <TableCell>{record.pfNo}</TableCell>

                      <TableCell>{record.depotName}</TableCell>

                      <TableCell>
                        <span
                          className={`

px-3

py-1

rounded-full

text-xs

font-medium

${
  record.category === "Training Overdue"
    ? "bg-red-100 text-red-700"
    : "bg-[#0b659a]/10 text-[#0b659a]"
}

`}
                        >
                          {record.category}
                        </span>
                      </TableCell>

                      <TableCell>{record.item}</TableCell>

                      <TableCell>
                        {new Date(record.dueDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <span className="text-red-600 font-semibold">
                          {record.overdueDays} Days
                        </span>
                      </TableCell>

                      <TableCell>
                        <button
                          onClick={() =>
                            navigate(`/admin/user/${record.driverId}`)
                          }
                          className="inline-flex
items-center
gap-1
bg-[#0b659a]
text-white
px-3
py-1.5
rounded-lg
hover:bg-[#09527d]"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </TableCell>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      
    </>
  );
}

function StatCard({ icon, title, value }) {
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

function TableHead({ children }) {
  return <th className="px-4 py-3 text-left">{children}</th>;
}

function TableCell({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}
