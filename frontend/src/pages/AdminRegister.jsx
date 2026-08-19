import { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  UserPlus,
  IdCard,
  User,
  Train,
  Shield
} from "lucide-react";
import BackButton from "../components/BackButton";
import CustomSelect from "../components/CustomSelect";

export default function AdminRegister() {
  const [assignedDepots, setAssignedDepots] = useState([]);
  const [depots, setDepots] = useState([]); // 🔥 dynamic depots
  const [form, setForm] = useState({
    name: "",
    pfNo: "",
    role: "",
    depotName: ""
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD DEPOTS FROM BACKEND ================= */
  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const res = await api.get("/admin/depots");
        setDepots(res.data || []);
      } catch (err) {
        console.error("Failed to load depots", err);
      }
    };

    fetchDepots();
  }, []);

  const submit = async () => {
    if (!form.name || !form.pfNo) {
      Swal.fire("Missing Data", "All fields are required", "warning");
      return;
    }

    if (
      ["DRIVER", "DEPOT_MANAGER", "ADEE"].includes(form.role) &&
      !form.depotName
    ) {
      Swal.fire("Missing Data", "Depot Name is required", "warning");
      return;
    }

    if (form.role === "ADEE" && assignedDepots.length === 0) {
      Swal.fire("Missing Data", "Assign at least one depot for ADEE", "warning");
      return;
    }

    try {
      setLoading(true);

      await api.post("/admin/register", {
        ...form,
        assignedDepots
      });

      Swal.fire({
        icon: "success",
        title: "User Created",
        text: `Password is same as PF No (${form.pfNo})`,
      });

      setForm({
        name: "",
        pfNo: "",
        role: "DRIVER",
        depotName: ""
      });

      setAssignedDepots([]);

    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="min-h-screen bg-slate-100 px-4 py-6">

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <BackButton />

          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-[#0b659a]/10">
                <UserPlus className="text-[#0b659a]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Register
            </h2>
          </div>

          <div className="space-y-5">

            <Input
              label="PF Number"
              icon={<IdCard />}
              value={form.pfNo}
              onChange={v => setForm({ ...form, pfNo: v })}
              placeholder="  Enter PF Number"
            />

            <Input
              label="Full Name"
              icon={<User />}
              value={form.name}
              onChange={v => setForm({ ...form, name: v })}
              placeholder="  Enter Full Name"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <CustomSelect
                value={form.role}
                onChange={v => setForm({ ...form, role: v })}
                options={[
                  { value: "", label: "Select Role" },
                  { value: "DRIVER", label: "Tower Wagon Driver (TWD)" },
                  { value: "DEPOT_MANAGER", label: "SSE/TRD (Depot Manager)" },
                  { value: "ADEE", label: "ADEE (Mini Admin)" }
                ]}
                placeholder="Select Role"
                icon={<Shield size={18} />}
              />
            </div>

            {/* DRIVER / MANAGER / ADEE DEPOT */}
            {["DRIVER", "DEPOT_MANAGER", "ADEE"].includes(form.role) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Depot Name
                  </label>
                  <CustomSelect
                    value={form.depotName}
                    onChange={v => setForm({ ...form, depotName: v })}
                    options={[
                      { value: "", label: "Select Depot" },
                      ...depots.map(d => ({ value: d, label: d }))
                    ]}
                    placeholder="Select Depot"
                    icon={<Train size={18} />}
                  />
                </div>
            )}

            {/* ADEE MULTI DEPOT */}
            {form.role === "ADEE" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assigned Manager Depots
                </label>
                <div className="grid grid-cols-3 gap-3 p-3 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg bg-white max-h-48 overflow-y-auto">
                  {depots.map(d => (
                    <label key={d} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={d}
                        checked={assignedDepots.includes(d)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedDepots([...assignedDepots, d]);
                          } else {
                            setAssignedDepots(assignedDepots.filter(depot => depot !== d));
                          }
                        }}
                        className="w-4 h-4 text-[#0b659a] border-gray-300 rounded focus:ring-[#0b659a]"
                      />
                      <span className="text-sm text-gray-700">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 text-sm p-3 rounded-xl">
              🔐 Default password will be <b>PF Number</b>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-white transition
                ${loading
                  ? "bg-[#0b659a]/60 cursor-not-allowed"
                  : "bg-[#0b659a] hover:bg-[#09527d]"
                }`}
            >
              {loading ? "Creating..." : "Register User"}
            </button>

          </div>
        </div>
      </div>


    </>
  );
}

/* ================= UI COMPONENTS ================= */

function Input({ label, value, onChange, icon, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          {icon}
        </span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg text-sm"
        />
      </div>
    </div>
  );
}