import api from "../api/axios";
import Swal from "sweetalert2";

export default function EngineFormModal({
  open,
  onClose,
  formData,
  setFormData,
  isEdit,
  refresh
}) {


    const saveEngine = async () => {

  try{

    if(isEdit){

      await api.put(

        `/engine/${formData._id}`,

        formData

      );

      Swal.fire(

        "Updated",

        "Engine updated successfully",

        "success"

      );

    }

    else{

      await api.post(

        "/engine",

        formData

      );

      Swal.fire(

        "Created",

        "Engine created successfully",

        "success"

      );

    }

    refresh();

    onClose();

  }

  catch(err){

    Swal.fire(

      "Error",

      err.response?.data?.msg ||

      "Unable to save",

      "error"

    );

  }

};
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl w-[95%] max-w-7xl max-h-[90vh] overflow-y-auto shadow-xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b p-5">

          <h2 className="text-2xl font-bold">

            {isEdit ? "Edit Engine" : "Create New Tower wagons"}

          </h2>

          <button
            onClick={onClose}
            className="text-red-600 text-xl"
          >
            ✕
          </button>

        </div>

        {/* BODY */}

{/* BODY */}

<div className="p-6 space-y-8">

  {/* ================= TOWER CAR INFORMATION ================= */}

  <div>

    <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
      TOWER CAR INFORMATION
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* DEPOT */}

      <div>

        <label className="block text-sm font-semibold mb-2">
          Depot
        </label>

        <select
          value={formData.depot}
          onChange={(e)=>
            setFormData({
              ...formData,
              depot:e.target.value
            })
          }
          className="w-full border rounded-lg px-4 py-2"
        >

          <option value="">
            Select Depot
          </option>

          {[
            "PTJ","PGT","POY","ED","CBE","MTP",
            "SA","JTJ","KRR","TPJ","DG",
            "MTDM","VRI","DPJ"
          ].map(item=>(
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}

        </select>

      </div>

      {/* TOWER CAR */}

      <div>

        <label className="block text-sm font-semibold mb-2">
          Tower Car Number
        </label>

        <select
          value={formData.towerCarNumber}
          onChange={(e)=>
            setFormData({
              ...formData,
              towerCarNumber:e.target.value
            })
          }
          className="w-full border rounded-lg px-4 py-2"
        >

          <option value="">
            Select Tower Car
          </option>

          {[
            "RU 927/017",
            "SR 220035",
            "SR 210018",
            "SR 960025",
            "SR 23025",
            "SR 240063",
            "RU 06878",
            "SR 230022",
            "SR 210067",
            "RU 01896",
            "RU 176019",
            "SR 230059",
            "RU 9516",
            "RU 9514",
            "RU 9496",
            "RU 950021"
          ].map(item=>(
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}

        </select>

      </div>

      {/* TYPE */}

      <div>

        <label className="block text-sm font-semibold mb-2">
          Type
        </label>

        <input
          value={formData.towerCar.type}
          onChange={(e)=>
            setFormData({
              ...formData,
              towerCar:{
                ...formData.towerCar,
                type:e.target.value
              }
            })
          }
          className="w-full border rounded-lg px-4 py-2"
        />

      </div>

      {/* MAKE */}

      <div>

        <label className="block text-sm font-semibold mb-2">
          Make
        </label>

        <input
          value={formData.towerCar.make}
          onChange={(e)=>
            setFormData({
              ...formData,
              towerCar:{
                ...formData.towerCar,
                make:e.target.value
              }
            })
          }
          className="w-full border rounded-lg px-4 py-2"
        />

      </div>

      {/* DOC */}

      <div>

        <label className="block text-sm font-semibold mb-2">
          DOC
        </label>

        <input
          type="date"
          value={formData.towerCar.doc}
          onChange={(e)=>
            setFormData({
              ...formData,
              towerCar:{
                ...formData.towerCar,
                doc:e.target.value
              }
            })
          }
          className="w-full border rounded-lg px-4 py-2"
        />

      </div>

    </div>

  </div>
  {/* ================= BRAKE POWER CERTIFICATE ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    BRAKE POWER CERTIFICATE
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    <div>

      <label className="block text-sm font-semibold mb-2">
        Issue Date
      </label>

      <input
        type="date"
        value={formData.brakePower.issueDate}
        onChange={(e)=>
          setFormData({
            ...formData,
            brakePower:{
              ...formData.brakePower,
              issueDate:e.target.value
            }
          })
        }
        className="w-full border rounded-lg px-4 py-2"
      />

    </div>

    <div>

      <label className="block text-sm font-semibold mb-2">
        Due Date
      </label>

      <input
        type="date"
        value={formData.brakePower.dueDate}
        onChange={(e)=>
          setFormData({
            ...formData,
            brakePower:{
              ...formData.brakePower,
              dueDate:e.target.value
            }
          })
        }
        className="w-full border rounded-lg px-4 py-2"
      />

    </div>

  </div>

</div>

{/* ================= ENGINE ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    ENGINE
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    {/* MAKE */}

    <div>

      <label className="block text-sm font-semibold mb-2">
        Make
      </label>

      <input
        value={formData.engine.make}
        onChange={(e)=>
          setFormData({
            ...formData,
            engine:{
              ...formData.engine,
              make:e.target.value
            }
          })
        }
        className="w-full border rounded-lg px-4 py-2"
      />

    </div>

  </div>

  {/* ================= B CHECK ================= */}

  <h3 className="font-bold text-lg mt-8 mb-4 border-b pb-2">
    B CHECK
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

    <InputDate
      label="Date"
      value={formData.engine.bCheckDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            bCheckDate:v
          }
        })
      }
    />

    <InputNumber
      label="Hours"
      value={formData.engine.bCheckHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            bCheckHours:v
          }
        })
      }
    />

    <InputDate
      label="Due Date"
      value={formData.engine.bCheckDueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            bCheckDueDate:v
          }
        })
      }
    />

    <InputNumber
      label="Due Hours"
      value={formData.engine.bCheckDueHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            bCheckDueHours:v
          }
        })
      }
    />

  </div>

  {/* ================= C CHECK ================= */}

  <h3 className="font-bold text-lg mt-8 mb-4 border-b pb-2">
    C CHECK
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

    <InputDate
      label="Date"
      value={formData.engine.cCheckDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            cCheckDate:v
          }
        })
      }
    />

    <InputNumber
      label="Hours"
      value={formData.engine.cCheckHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            cCheckHours:v
          }
        })
      }
    />

    <InputDate
      label="Due Date"
      value={formData.engine.cCheckDueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            cCheckDueDate:v
          }
        })
      }
    />

    <InputNumber
      label="Due Hours"
      value={formData.engine.cCheckDueHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            cCheckDueHours:v
          }
        })
      }
    />

  </div>

  {/* ================= D CHECK ================= */}

  <h3 className="font-bold text-lg mt-8 mb-4 border-b pb-2">
    D CHECK
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

    <InputDate
      label="Date"
      value={formData.engine.dCheckDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            dCheckDate:v
          }
        })
      }
    />

    <InputNumber
      label="Hours"
      value={formData.engine.dCheckHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            dCheckHours:v
          }
        })
      }
    />

    <InputDate
      label="Due Date"
      value={formData.engine.dCheckDueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            dCheckDueDate:v
          }
        })
      }
    />

    <InputNumber
      label="Due Hours"
      value={formData.engine.dCheckDueHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            dCheckDueHours:v
          }
        })
      }
    />

  </div>

  {/* ================= POH ================= */}

  <h3 className="font-bold text-lg mt-8 mb-4 border-b pb-2">
    POH
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    <InputDate
      label="POH Date"
      value={formData.engine.pohDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            pohDate:v
          }
        })
      }
    />

    <InputDate
      label="POH Due Date"
      value={formData.engine.pohDueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          engine:{
            ...formData.engine,
            pohDueDate:v
          }
        })
      }
    />

    <div>

      <label className="block text-sm font-semibold mb-2">
        Remarks
      </label>

      <input
        value={formData.engine.pohRemarks}
        onChange={(e)=>
          setFormData({
            ...formData,
            engine:{
              ...formData.engine,
              pohRemarks:e.target.value
            }
          })
        }
        className="w-full border rounded-lg px-4 py-2"
      />

    </div>

  </div>

</div>

{/* ================= ULTRASONIC TESTING ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    ULTRASONIC TESTING
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    <InputDate
      label="Done Date"
      value={formData.ultrasonicTesting.doneDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          ultrasonicTesting:{
            ...formData.ultrasonicTesting,
            doneDate:v
          }
        })
      }
    />

    <InputDate
      label="Due Date"
      value={formData.ultrasonicTesting.dueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          ultrasonicTesting:{
            ...formData.ultrasonicTesting,
            dueDate:v
          }
        })
      }
    />

  </div>

</div>

{/* ================= HYDRAULIC OIL REPLACEMENT ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    HYDRAULIC OIL REPLACEMENT
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    <InputDate
      label="Change Date"
      value={formData.hydraulicReplacement.changeDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          hydraulicReplacement:{
            ...formData.hydraulicReplacement,
            changeDate:v
          }
        })
      }
    />

    <InputNumber
      label="Current Hours"
      value={formData.hydraulicReplacement.currentHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          hydraulicReplacement:{
            ...formData.hydraulicReplacement,
            currentHours:v
          }
        })
      }
    />

    <InputNumber
      label="Due Hours"
      value={formData.hydraulicReplacement.dueHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          hydraulicReplacement:{
            ...formData.hydraulicReplacement,
            dueHours:v
          }
        })
      }
    />

  </div>

</div>

{/* ================= STARTING BATTERY ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    STARTING BATTERY
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    <InputText
      label="Make"
      value={formData.startingBattery.make}
      onChange={(v)=>
        setFormData({
          ...formData,
          startingBattery:{
            ...formData.startingBattery,
            make:v
          }
        })
      }
    />

    <InputDate
      label="Commission Date"
      value={formData.startingBattery.commissionDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          startingBattery:{
            ...formData.startingBattery,
            commissionDate:v
          }
        })
      }
    />

    <InputDate
      label="Due Date"
      value={formData.startingBattery.dueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          startingBattery:{
            ...formData.startingBattery,
            dueDate:v
          }
        })
      }
    />

  </div>

</div>

{/* ================= LIGHTING BATTERY ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    LIGHTING BATTERY
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    <InputText
      label="Make"
      value={formData.lightingBattery.make}
      onChange={(v)=>
        setFormData({
          ...formData,
          lightingBattery:{
            ...formData.lightingBattery,
            make:v
          }
        })
      }
    />

    <InputDate
      label="Commission Date"
      value={formData.lightingBattery.commissionDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          lightingBattery:{
            ...formData.lightingBattery,
            commissionDate:v
          }
        })
      }
    />

    <InputDate
      label="Due Date"
      value={formData.lightingBattery.dueDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          lightingBattery:{
            ...formData.lightingBattery,
            dueDate:v
          }
        })
      }
    />

  </div>

</div>

{/* ================= GENERATOR ================= */}

<div>

  <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    GENERATOR
  </div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

    <InputText
      label="Make"
      value={formData.generator.make}
      onChange={(v)=>
        setFormData({
          ...formData,
          generator:{
            ...formData.generator,
            make:v
          }
        })
      }
    />

    <InputDate
      label="Service Date"
      value={formData.generator.serviceDate}
      onChange={(v)=>
        setFormData({
          ...formData,
          generator:{
            ...formData.generator,
            serviceDate:v
          }
        })
      }
    />

    <InputNumber
      label="Service Hours"
      value={formData.generator.serviceHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          generator:{
            ...formData.generator,
            serviceHours:v
          }
        })
      }
    />

    <InputNumber
      label="Due Hours"
      value={formData.generator.dueHours}
      onChange={(v)=>
        setFormData({
          ...formData,
          generator:{
            ...formData.generator,
            dueHours:v
          }
        })
      }
    />

  </div>

</div>

{/* ================= FAILURE HISTORY ================= */}

<div>

  <div className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg mb-5">
    FAILURE HISTORY
  </div>

  {formData.failures.map((failure,index)=>(

    <div
      key={index}
      className="border rounded-lg p-4 mb-4 grid md:grid-cols-4 gap-4"
    >

      <InputText
        label="Component"
        value={failure.component}
        onChange={(v)=>{

          const copy=[...formData.failures];

          copy[index].component=v;

          setFormData({
            ...formData,
            failures:copy
          });

        }}
      />

      <InputText
        label="Description"
        value={failure.description}
        onChange={(v)=>{

          const copy=[...formData.failures];

          copy[index].description=v;

          setFormData({
            ...formData,
            failures:copy
          });

        }}
      />

      <InputDate
        label="Failure Date"
        value={failure.failureDate}
        onChange={(v)=>{

          const copy=[...formData.failures];

          copy[index].failureDate=v;

          setFormData({
            ...formData,
            failures:copy
          });

        }}
      />

      <div className="flex items-end">

        <button

          type="button"

          onClick={()=>{

            const copy=[...formData.failures];

            copy.splice(index,1);

            setFormData({
              ...formData,
              failures:copy
            });

          }}

          className="bg-red-600 text-white px-4 py-2 rounded-lg"

        >

          Delete

        </button>

      </div>

    </div>

  ))}

  <button

    type="button"

    onClick={()=>{

      setFormData({

        ...formData,

        failures:[
          ...formData.failures,
          {
            component:"",
            description:"",
            failureDate:""
          }
        ]

      });

    }}

    className="bg-indigo-600 text-white px-5 py-2 rounded-lg"

  >

    + Add Failure

  </button>

</div>

{/* ================= FOOTER ================= */}

<div className="flex justify-end gap-3 border-t pt-5">

  <button

    onClick={onClose}

    className="px-6 py-2 rounded-lg border"

  >

    Cancel

  </button>

  <button

    onClick={saveEngine}

    className="bg-indigo-600 text-white px-6 py-2 rounded-lg"

  >

    {isEdit ? "Update Engine" : "Create Engine"}

  </button>

</div>

</div>

      </div>

    </div>

    
  );
}

/* ==========================================================
   REUSABLE DATE FIELD
========================================================== */

function InputDate({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label}
      </label>

      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-2
                   focus:ring-2 focus:ring-indigo-500
                   focus:outline-none"
      />
    </div>
  );
}

/* ==========================================================
   REUSABLE NUMBER FIELD
========================================================== */

function InputNumber({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label}
      </label>

      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-2
                   focus:ring-2 focus:ring-indigo-500
                   focus:outline-none"
      />
    </div>
  );
}

/* ==========================================================
   REUSABLE TEXT FIELD
========================================================== */

function InputText({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-2
                   focus:ring-2 focus:ring-indigo-500
                   focus:outline-none"
      />
    </div>
  );
}





