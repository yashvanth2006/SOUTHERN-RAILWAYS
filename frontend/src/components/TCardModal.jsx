import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import CustomSelect from "./CustomSelect";
import api from "../api/axios";

export default function TCardModal({ isOpen, onClose, towerCars }) {
  const [tCarNo, setTCarNo] = useState("");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTCarNo("");
      const checklistTemplate = [
        "Check Diesel level",
        "Drain water sediments fuel filter",
        "Check engine oil level and top up if necessary",
        "Check fuel, oil, water and exhaust leak",
        "Check air cleaner oil level",
        "Check air line leak",
        "Fill radiator tank with treated water if necessary",
        "Clean compressor breather",
        "Drain air receiver tank and close drain cock",
        "Clean crank case breather",
        "Start engine and note oil pressure",
        "Record oil pressure and brake pressure"
      ];
      setItems(
        checklistTemplate.map((d) => ({
          description: d,
          checked: false,
          remarks: "",
          priority: "",
          dieselLevel: "",
        }))
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!tCarNo) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "T Car No is required",
      });
      return;
    }

    let hasError = false;
    let errorMessage = "";

    const collected = items.map((i) => {
      let dieselLvl = null;
      if (i.description === "Check Diesel level") {
        if (!i.dieselLevel) {
          hasError = true;
          errorMessage = "Diesel Level is required";
        } else {
          dieselLvl = Number(i.dieselLevel);
        }
      }

      if (i.remarks && !i.priority) {
        hasError = true;
        errorMessage = "Select priority for all remarks";
      }

      return {
        description: i.description,
        checked: i.checked,
        remarks: i.remarks.trim(),
        priority: i.remarks.trim() ? i.priority : null,
        dieselLevel: dieselLvl,
      };
    });

    if (hasError) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: errorMessage,
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/driver/tcard", { tCarNo, items: collected });
      onClose();
      await Swal.fire({
        icon: "success",
        title: "Checklist Saved",
        text: "Daily T-Card checklist submitted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.msg || "Unable to save checklist.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center border-b border-slate-100 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">
            Daily Tower Car Checklist
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tower Car
            </label>
            <CustomSelect
              value={tCarNo}
              onChange={setTCarNo}
              options={[
                { value: "", label: "Select Tower Car" },
                ...towerCars.map((t) => ({ value: t, label: t })),
              ]}
              placeholder="Select Tower Car"
            />
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md"
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) =>
                      handleItemChange(idx, "checked", e.target.checked)
                    }
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-[#0b659a] focus:ring-[#0b659a]"
                  />
                  <span className="text-sm font-semibold text-slate-800 leading-snug">
                    {item.description}
                  </span>
                </label>

                {item.description === "Check Diesel level" && (
                  <div className="mt-4 ml-8">
                    <input
                      type="number"
                      value={item.dieselLevel}
                      onChange={(e) =>
                        handleItemChange(idx, "dieselLevel", e.target.value)
                      }
                      placeholder="Enter Diesel Level (Litres)"
                      min="0"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-[#0b659a] outline-none transition-all"
                    />
                  </div>
                )}

                <div className="mt-3 ml-8">
                  <input
                    type="text"
                    value={item.remarks}
                    onChange={(e) =>
                      handleItemChange(idx, "remarks", e.target.value)
                    }
                    placeholder="Remarks (optional)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-[#0b659a] outline-none transition-all"
                  />
                </div>

                {item.remarks.trim() && (
                  <div className="mt-3 ml-8">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Priority
                    </label>
                    <CustomSelect
                      value={item.priority}
                      onChange={(val) => handleItemChange(idx, "priority", val)}
                      options={[
                        { value: "", label: "Select Priority" },
                        { value: "HIGH", label: "🔴 High Priority" },
                        { value: "LOW", label: "🟡 Less Priority" },
                      ]}
                      placeholder="Select Priority"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-center gap-3 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-[#0b659a] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#09527d] hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Checklist"}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl bg-[#64748b] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#475569] hover:-translate-y-0.5 transition-all outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
