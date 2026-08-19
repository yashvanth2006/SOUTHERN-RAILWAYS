import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import api from "../api/axios";
import EngineDetails from "../components/EngineDetails";
import Swal from "sweetalert2";
import EngineFormModal from "../components/EngineFormModal";
import CustomSelect from "../components/CustomSelect";
import {
  Settings,
  Building2,
  Train,
  Pencil,
  Trash2,
  Plus,
  Save
} from "lucide-react";


export default function EnginePage() {
const role = localStorage.getItem("role");

const depotName = localStorage.getItem("depotName");

const assignedDepots = JSON.parse(
  localStorage.getItem("assignedDepots") || "[]"
);

const [selectedDepot, setSelectedDepot] = useState("");

  const [engineList, setEngineList] = useState([]);
const [availableDepots, setAvailableDepots] = useState([]);
const [availableTowerCars, setAvailableTowerCars] = useState([]);
const [allDepots, setAllDepots] = useState([]);
  // const [selectedEngine, setSelectedEngine] = useState("");

const [selectedTowerCar, setSelectedTowerCar] = useState("");
const [expandedEngine, setExpandedEngine] = useState(null);

  const [engine, setEngine] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const emptyEngine = {
    depot: "",
    towerCarNumber: "",

    towerCar: {
      type: "",
      make: "",
      doc: ""
    },

    brakePower: {
      issueDate: "",
      dueDate: ""
    },

    engine: {
      make: "",
      bCheckDate: "",
      bCheckHours: "",
      bCheckDueDate: "",
      bCheckDueHours: "",

      cCheckDate: "",
      cCheckHours: "",
      cCheckDueDate: "",
      cCheckDueHours: "",

      dCheckDate: "",
      dCheckHours: "",
      dCheckDueDate: "",
      dCheckDueHours: "",

      pohDate: "",
      pohDueDate: "",
      pohRemarks: ""
    },

    ultrasonicTesting: {
      doneDate: "",
      dueDate: ""
    },

    hydraulicReplacement: {
      changeDate: "",
      currentHours: "",
      dueHours: ""
    },

    startingBattery: {
      make: "",
      commissionDate: "",
      dueDate: ""
    },

    lightingBattery: {
      make: "",
      commissionDate: "",
      dueDate: ""
    },

    generator: {
      make: "",
      serviceDate: "",
      serviceHours: "",
      dueHours: ""
    },

    failures: []
  };

  const [formData, setFormData] = useState(emptyEngine);

  const canEdit =
    role === "SUPER_ADMIN" ||
    role === "DEPOT_MANAGER";

  const canDelete =
    role === "SUPER_ADMIN";

  const canCreate =
    role === "DEPOT_MANAGER";

  useEffect(() => {

    if (!selectedDepot) return;

    loadEngines();

  }, [selectedDepot]);

  useEffect(() => {

  loadAllDepots();

}, []);

useEffect(() => {

  if (!selectedTowerCar) return;

  setExpandedEngine(selectedTowerCar);

}, [selectedTowerCar]);

  // useEffect(() => {

  //   if (!selectedEngine) return;

  //   loadEngine();

  // }, [selectedEngine]);
const loadEngines = async () => {

  try {

    const url = selectedDepot
      ? `/engine?depot=${selectedDepot}`
      : "/engine";

    const res = await api.get(url);

    setEngineList(res.data);
    setAvailableTowerCars(res.data);

    // Build depot dropdown dynamically
    const depots = [...new Set(
      res.data.map(item => item.depot)
    )].sort();

    setAvailableDepots(depots);

      // if (res.data.length) {

      //   setSelectedEngine(res.data[0]._id);

      // } else {

      //   setSelectedEngine("");

      //   setEngine(null);

      // }

  } catch {

    Swal.fire(
      "Error",
      "Unable to load engines",
      "error"
    );

  }

};

const loadAllDepots = async () => {

  try {

    const res = await api.get("/engine/depots/list");

    setAllDepots(res.data);

  } catch (err) {

    console.error(err);

  }

};

  // const loadEngine = async () => {

  //   try {

  //     setLoading(true);

  //     const res = await api.get(
  //       `/engine/${selectedEngine}`
  //     );

  //     setEngine(res.data);

  //   } catch {

  //     Swal.fire(
  //       "Error",
  //       "Unable to load engine details",
  //       "error"
  //     );

  //   } finally {

  //     setLoading(false);

  //   }

  // };

const deleteEngine = async (engine) => {

  const result = await Swal.fire({
    title: "Delete Engine?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete"
  });

  if (!result.isConfirmed) return;

  try {

    await api.delete(`/engine/${engine._id}`);

    Swal.fire(
      "Deleted",
      "Engine removed successfully",
      "success"
    );

    await loadEngines();

    if (expandedEngine === engine._id) {
      setExpandedEngine(null);
    }

  } catch (err) {

    Swal.fire(
      "Error",
      err.response?.data?.msg || "Delete failed",
      "error"
    );

  }

};

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <BackButton/>
          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                  <Settings size={28} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    TW Management
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    View and manage Tower Car records
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            {canCreate && (
              <button
                onClick={() => {
                  setIsEdit(false);
                  setFormData(emptyEngine);
                  setShowModal(true);
                }}
                className="w-full sm:w-auto bg-[#0b659a] hover:bg-[#09527d] text-white rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <Plus size={18} />
                New Tower wagons
              </button>
            )}
          </div>

          {/* FILTERS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DEPOT */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Depot
                  </label>
                  <CustomSelect
                    value={selectedDepot}
                    onChange={setSelectedDepot}
                    options={[
                      { value: "", label: "Select Depot" },
                      ...allDepots.map(depot => ({ value: depot, label: depot }))
                    ]}
                    placeholder="Select Depot"
                  />
                </div>

              {/* TOWER CAR */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tower Car
                  </label>
                  <CustomSelect
                    value={selectedTowerCar}
                    onChange={setSelectedTowerCar}
                    options={[
                      { value: "", label: "Select Tower Car" },
                      ...availableTowerCars.map(item => ({ value: item._id, label: item.towerCarNumber }))
                    ]}
                    placeholder="Select Tower Car"
                  />
                </div>
            </div>
          </div>

          {/* ================= ENGINE LIST ================= */}

<div className="bg-white rounded-2xl shadow-sm">

  <div className="px-6 py-5 border-b border-slate-200">

    <h2 className="text-xl font-bold text-slate-800">
      Available Tower Wagons
    </h2>

    <p className="text-sm text-slate-500 mt-1">
      Click any engine to view complete details.
    </p>

  </div>

  {loading ? (

  <div className="p-8 sm:p-10 text-center">

      Loading...

    </div>

  ) : engineList.length === 0 ? (

    <div className="p-10 text-center text-slate-500">

      No Engines Found

    </div>

  ) : (

    engineList

      .filter((item) => {

        if (!selectedTowerCar) return true;

        return item._id === selectedTowerCar;

      })

      .map((item) => (

        <div
          key={item._id}
          className="border-b last:border-b-0"
        >

          <button

            onClick={() => {

              setExpandedEngine(

                expandedEngine === item._id
                  ? null
                  : item._id

              );

            }}

            className="w-full px-4 sm:px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition"

          >

           <div className="flex items-center gap-3 sm:gap-6 min-w-0">

              <div>

               <div className="font-semibold text-slate-800 break-words">

                  {item.towerCarNumber}

                </div>

               <div className="text-sm text-slate-500 break-words">

                  {item.depot}

                </div>

              </div>

            </div>

          <div className="text-xl sm:text-2xl flex-shrink-0">

              {expandedEngine === item._id ? "▲" : "▼"}

            </div>

          </button>

          {expandedEngine === item._id && (

           <div className="px-4 sm:px-6 pb-6">

              <EngineDetails

                engine={item}

                canEdit={

                  role === "SUPER_ADMIN" ||

                  (

                    role === "DEPOT_MANAGER" &&

                    item.depot === depotName

                  )

                }

                canDelete={

                  role === "SUPER_ADMIN"

                }

             onEdit={() => {

  setIsEdit(true);

  setFormData(item);

  setExpandedEngine(item._id);

  setShowModal(true);

}}
                onDelete={() => deleteEngine(item)}

              />

            </div>

          )}

        </div>

      ))

  )}

</div>
          {loading && (

           <div className="bg-white rounded-xl shadow p-8 sm:p-12 text-center">

              Loading Engine...

            </div>

          )}

          {/* {!loading && engine && (
            <EngineDetails
              engine={engine}
              canEdit={
                role === "SUPER_ADMIN" ||
                (role === "DEPOT_MANAGER" &&
                  engine?.depot === depotName)
              }
              canDelete={role === "SUPER_ADMIN"}
              onEdit={() => {
                setIsEdit(true);
                setFormData(engine);
                setShowModal(true);
              }}
              onDelete={deleteEngine}
            />
          )} */}
        </div>

      </div>

      <EngineFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        depotOptions={allDepots}
        isEdit={isEdit}
   refresh={async () => {

  await loadEngines();

  setExpandedEngine(null);

  setShowModal(false);

}}
      />
      

    </>
  );

}
