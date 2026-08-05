import { Settings, Pencil, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function EngineDetails({
  engine,
  canEdit,
  canDelete,
  onEdit,
  onDelete
}) {

  if (!engine) return null;

  const Section = ({ title, children }) => (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#0b659a] text-white font-semibold px-6 py-3 flex items-center gap-2 text-lg tracking-wide">
        {title}
      </div>
      <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div className="flex flex-col">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-2.5 text-gray-800 font-medium min-h-[44px] flex items-center shadow-sm">
        {value || <span className="text-gray-400 italic">Not available</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50/50 rounded-2xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="bg-[#0b659a]/10 p-3 rounded-full">
            <Settings className="text-[#0b659a]" size={32}/>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              {engine.towerCarNumber}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-[#0b659a] bg-[#0b659a]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Depot: {engine.depot}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
  {canEdit && (
    <button
      onClick={onEdit}
      className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto"
    >
      <Pencil size={18} />
      Edit Logs
    </button>
  )}

  {canDelete && (
    <button
      onClick={onDelete}
      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto"
    >
      <Trash2 size={18} />
      Delete
    </button>
  )}
</div>
      </div>

      <Section title="Tower Car Information">
        <Field label="Tower Car Number" value={engine.towerCarNumber}/>
        <Field label="Depot" value={engine.depot}/>
        <Field label="Type" value={engine.towerCar?.type}/>
        <Field label="Make" value={engine.towerCar?.make}/>
        <Field
          label="Date of Commissioning (DOC)"
          value={engine.towerCar?.doc ? engine.towerCar.doc.substring(0,10) : ""}
        />
      </Section>

      <Section title="Brake Power Certificate">
        <Field
          label="Issue Date"
          value={engine.brakePower?.issueDate ? engine.brakePower.issueDate.substring(0,10) : ""}
        />
        <Field
          label="Due Date"
          value={engine.brakePower?.dueDate ? engine.brakePower.dueDate.substring(0,10) : ""}
        />
      </Section>

      <Section title="Engine">
        <Field label="Make" value={engine.engine?.make}/>
        <Field label="B Check Date" value={engine.engine?.bCheckDate?.substring?.(0,10)}/>
        <Field label="B Check Hours" value={engine.engine?.bCheckHours}/>
        <Field label="B Due Date" value={engine.engine?.bCheckDueDate?.substring?.(0,10)}/>
        <Field label="B Due Hours" value={engine.engine?.bCheckDueHours}/>
        <Field label="C Check Date" value={engine.engine?.cCheckDate?.substring?.(0,10)}/>
        <Field label="C Check Hours" value={engine.engine?.cCheckHours}/>
        <Field label="C Due Date" value={engine.engine?.cCheckDueDate?.substring?.(0,10)}/>
        <Field label="C Due Hours" value={engine.engine?.cCheckDueHours}/>
        <Field label="D Check Date" value={engine.engine?.dCheckDate?.substring?.(0,10)}/>
        <Field label="D Check Hours" value={engine.engine?.dCheckHours}/>
        <Field label="D Due Date" value={engine.engine?.dCheckDueDate?.substring?.(0,10)}/>
        <Field label="D Due Hours" value={engine.engine?.dCheckDueHours}/>
        <Field label="POH Date" value={engine.engine?.pohDate?.substring?.(0,10)}/>
        <Field label="POH Due Date" value={engine.engine?.pohDueDate?.substring?.(0,10)}/>
        <Field label="Remarks" value={engine.engine?.pohRemarks}/>
      </Section>

      <Section title="Ultrasonic Testing">
        <Field
          label="Done Date"
          value={engine.ultrasonicTesting?.doneDate?.substring?.(0,10)}
        />
        <Field
          label="Due Date"
          value={engine.ultrasonicTesting?.dueDate?.substring?.(0,10)}
        />
      </Section>

      <Section title="Hydraulic Oil Replacement">
        <Field
          label="Change Date"
          value={engine.hydraulicReplacement?.changeDate?.substring?.(0,10)}
        />
        <Field
          label="Current Hours"
          value={engine.hydraulicReplacement?.currentHours}
        />
        <Field
          label="Due Hours"
          value={engine.hydraulicReplacement?.dueHours}
        />
      </Section>

      <Section title="Starting Battery">
        <Field label="Make" value={engine.startingBattery?.make}/>
        <Field
          label="Commission Date"
          value={engine.startingBattery?.commissionDate?.substring?.(0,10)}
        />
        <Field
          label="Due Date"
          value={engine.startingBattery?.dueDate?.substring?.(0,10)}
        />
      </Section>

      <Section title="Lighting Battery">
        <Field label="Make" value={engine.lightingBattery?.make}/>
        <Field
          label="Commission Date"
          value={engine.lightingBattery?.commissionDate?.substring?.(0,10)}
        />
        <Field
          label="Due Date"
          value={engine.lightingBattery?.dueDate?.substring?.(0,10)}
        />
      </Section>

      <Section title="Generator">
        <Field label="Make" value={engine.generator?.make}/>
        <Field
          label="Service Date"
          value={engine.generator?.serviceDate?.substring?.(0,10)}
        />
        <Field
          label="Service Hours"
          value={engine.generator?.serviceHours}
        />
        <Field
          label="Due Hours"
          value={engine.generator?.dueHours}
        />
      </Section>

      <div className="mb-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="bg-red-600 text-white font-semibold px-6 py-3 flex items-center gap-2 text-lg tracking-wide">
          <AlertTriangle size={20} />
          Failure History
        </div>
        
        <div className="p-6">
          {engine.failures?.length ? (
            <div className="space-y-4">
              {engine.failures.map((item, index) => (
                <div
                  key={index}
                  className="border border-red-100 bg-red-50/50 rounded-xl p-5 grid md:grid-cols-3 gap-6 shadow-sm"
                >
                  <Field label="Component" value={item.component}/>
                  <Field label="Description" value={item.description}/>
                  <Field
                    label="Failure Date"
                    value={item.failureDate ? item.failureDate.substring(0,10) : ""}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <ShieldCheck className="text-green-500 mb-3" size={48} />
              <div className="text-gray-600 font-medium text-lg">
                No failures recorded
              </div>
              <p className="text-gray-400 text-sm mt-1">This tower car has a clean operational history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}