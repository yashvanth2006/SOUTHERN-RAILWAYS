import React, { useState } from "react";
import { Activity, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "./CustomSelect";

export default function DailyDutyLogsTable({ logs }) {
  const [logsPageSize, setLogsPageSize] = useState(5);
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);

  const totalLogs = logs?.length || 0;
  const totalPages = Math.ceil(totalLogs / logsPageSize);
  const logsStartIndex = (logsCurrentPage - 1) * logsPageSize;
  const logsEndIndex = Math.min(logsStartIndex + logsPageSize, totalLogs);
  const currentLogs = logs?.slice(logsStartIndex, logsEndIndex) || [];

  const handleLogsPageSizeChange = (e) => {
    setLogsPageSize(Number(e.target.value));
    setLogsCurrentPage(1);
  };

  return (
    <div className="rail-panel p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-[#0b659a]">
        <Activity />
        <h3>Daily Duty Logs</h3>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="py-4 px-4 text-left font-bold text-gray-900">Date</th>
              <th className="py-4 px-4 text-left font-bold text-gray-900">Sign ON</th>
              <th className="py-4 px-4 text-left font-bold text-gray-900">Sign OFF</th>
              <th className="py-4 px-4 text-center font-bold text-gray-900">KM</th>
              <th className="py-4 px-4 text-center font-bold text-gray-900">Breath</th>
              <th className="py-4 px-4 text-center font-bold text-gray-900">Mileage</th>
              <th className="py-4 px-4 text-center font-bold text-gray-900">Sign ON Image</th>
              <th className="py-4 px-4 text-center font-bold text-gray-900">Sign OFF Image</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {totalLogs === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500 border-b border-gray-200">
                  No duty logs available
                </td>
              </tr>
            ) : (
              currentLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-gray-600">
                    {log.logDate ? new Date(log.logDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="font-medium">{log.fromStation || "-"}</div>
                    {log.signInTime && (
                      <span className="text-xs text-gray-500">
                        {new Date(log.signInTime).toLocaleTimeString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="font-medium">{log.toStation || "-"}</div>
                    {log.signOutTime && (
                      <span className="text-xs text-gray-500">
                        {new Date(log.signOutTime).toLocaleTimeString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-center">{log.km || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    {log.breathAnalyserDone ? (
                      <span className="flex justify-center items-center gap-1 text-emerald-600">
                        <CheckCircle size={14}/> Yes
                      </span>
                    ) : (
                      <span className="flex justify-center items-center gap-1 text-amber-600">
                        <AlertTriangle size={14}/> No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-[#0b659a]">
                    {log.mileage?.toFixed(2) || "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {log.signInImage ? (
                      <a href={log.signInImage} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">
                        View
                      </a>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {log.signOutImage ? (
                      <a href={log.signOutImage} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700">
                        View
                      </a>
                    ) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalLogs > 0 && (
          <div className="flex items-center justify-end py-4 mt-2 gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <div style={{ minWidth: '80px' }}>
                <CustomSelect
                  value={logsPageSize}
                  onChange={(v) => handleLogsPageSizeChange({ target: { value: v } })}
                  options={[
                    { value: 5, label: "5" },
                    { value: 10, label: "10" },
                    { value: 15, label: "15" },
                    { value: 30, label: "30" }
                  ]}
                  placeholder="Rows"
                />
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {logsStartIndex + 1}–{logsEndIndex} of {totalLogs}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLogsCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={logsCurrentPage === 1}
                  className={`p-1.5 rounded-md ${
                    logsCurrentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setLogsCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={logsCurrentPage === totalPages}
                  className={`p-1.5 rounded-md ${
                    logsCurrentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
