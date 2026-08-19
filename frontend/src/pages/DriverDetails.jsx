import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import CustomDatePicker from "../components/CustomDatePicker";
import {
  User,
  Building2,
  IdCard,
  ClipboardList,
  Activity,
  FileText,
  Calendar,
  BadgeIndianRupee,
  Hash,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import BackButton from "../components/BackButton";
import DailyDutyLogsTable from "../components/DailyDutyLogsTable";

export default function DriverDetails() {
  const { driverId } = useParams();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);

  const [tcardSelectedDate, setTcardSelectedDate] = useState("");
  const [tcardAvailableDates, setTcardAvailableDates] = useState([]);
  const [tcardData, setTcardData] = useState([]);
  const [tcardLoading, setTcardLoading] = useState(false);
  const [tcardTotalCount, setTcardTotalCount] = useState(0);

  /* ================= T-CARD ================= */

  const loadTCardDates = async () => {
    try {
      setTcardLoading(true);
      const res = await api.get(`/depot/driver/${driverId}/tcards`);
      const tcards = res.data || [];

      const dates = [...new Set(tcards.map(t => t.date?.substring(0, 10)))]
        .filter(Boolean)
        .sort()
        .reverse();

      setTcardAvailableDates(dates);
      setTcardTotalCount(tcards.length);

      if (dates.length > 0) {
        setTcardSelectedDate(dates[0]);
        setTcardData(
          tcards.filter(t => t.date?.substring(0, 10) === dates[0])
        );
      }
    } finally {
      setTcardLoading(false);
    }
  };

  const loadTCardByDate = async (date) => {
    try {
      setTcardLoading(true);
      const res = await api.get(`/depot/driver/${driverId}/tcards`);
      const tcards = res.data || [];
      setTcardData(
        tcards.filter(t => t.date?.substring(0, 10) === date)
      );
    } finally {
      setTcardLoading(false);
    }
  };

  const goToPreviousDate = () => {
    const i = tcardAvailableDates.indexOf(tcardSelectedDate);
    if (i < tcardAvailableDates.length - 1) {
      setTcardSelectedDate(tcardAvailableDates[i + 1]);
    }
  };

  const goToNextDate = () => {
    const i = tcardAvailableDates.indexOf(tcardSelectedDate);
    if (i > 0) {
      setTcardSelectedDate(tcardAvailableDates[i - 1]);
    }
  };

  useEffect(() => {
    loadTCardDates();
  }, [driverId]);

  useEffect(() => {
    if (tcardSelectedDate) loadTCardByDate(tcardSelectedDate);
  }, [tcardSelectedDate]);

  useEffect(() => {
    api.get(`/depot/driver/${driverId}`).then(res => {
      setData(res.data);
      setLogs(res.data.logs || []);
    });
  }, [driverId]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading driver details...
      </div>
    );
  }

  const profile = data.profile || {};
  const lrList = profile.lrDetails || [];
  const trainings = profile.trainings || {};

  return (
    <>

      <div className="rail-page">
        <div className="space-y-6">
          <BackButton />

          {/* ================= BASIC INFO ================= */}
          <Card>
            <SectionHeader icon={<User />} title="Basic Information" />
            <InfoGrid>
              <InfoCard label="Driver Name" value={data.name} icon={<User />} />
              <InfoCard label="PF Number" value={data.pfNo} icon={<IdCard />} />
              <InfoCard label="Depot" value={data.depotName} icon={<Building2 />} />
            </InfoGrid>
          </Card>

          {/* ================= BIO DATA ================= */}
          <Card>
            <SectionHeader icon={<ClipboardList />} title="Complete Bio Data" />
            <InfoGrid>
              <InfoCard label="HRMS ID" value={profile.hrmsId || "-"} icon={<Hash />} />
              <InfoCard label="Designation" value={profile.designation || "-"} />
              <InfoCard label="Basic Pay" value={profile.basicPay || "-"} icon={<BadgeIndianRupee />} />
              <InfoCard label="Date of Appointment" value={profile.dateOfAppointment?.substring(0, 10) || "-"} icon={<Calendar />} />
              <InfoCard label="Date of Entry as TWD" value={profile.dateOfEntryAsTWD?.substring(0, 10) || "-"} icon={<Calendar />} />
              <InfoCard
                label="Avg KM / Day"
                value={data.summary?.avgKmPerDay ?? 0}
                icon={<Activity />}
              />

              <InfoCard
                label="Duty ≥ 9 Hours"
                value={data.summary?.daysAbove9Hours ?? 0}
                icon={<CheckCircle className="text-green-600" />}
              />

              <InfoCard
                label="Duty < 9 Hours"
                value={data.summary?.daysBelow9Hours ?? 0}
                icon={<XCircle className="text-red-600" />}
              />
            </InfoGrid>
          </Card>


          {/* ================= TRAINING STATUS ================= */}
          {Object.keys(trainings).length > 0 && (
            <Card>

              <SectionHeader
                icon={<FileText />}
                title="Training Status"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {Object.entries(trainings).map(([key, training]) => {

                  if (!training) return null;

                  const today = new Date();

                  const dueDate = training.dueDate
                    ? new Date(training.dueDate)
                    : null;

                  const diffDays = dueDate
                    ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                    : null;

                  const isOverdue =
                    diffDays !== null && diffDays < 0;

                  const isExpiringSoon =
                    diffDays !== null &&
                    diffDays >= 0 &&
                    diffDays <= 15;

                  // CARD COLORS
                  let cardClasses =
                    "border-gray-200 bg-white";

                  let statusClasses =
                    "text-emerald-600";

                  let statusText = "Valid";

                  if (isOverdue) {
                    cardClasses =
                      "border-red-200 bg-red-50";

                    statusClasses =
                      "text-red-600";

                    statusText = "Overdue";
                  }
                  else if (isExpiringSoon) {
                    cardClasses =
                      "border-amber-200 bg-amber-50";

                    statusClasses =
                      "text-amber-600";

                    statusText =
                      `Expiring in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                  }

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border p-6 transition hover:shadow-md ${cardClasses}`}
                    >

                      {/* TOP */}
                      <div className="flex items-start justify-between mb-5">

                        <h3 className="text-2xl font-semibold text-gray-900">
                          {key.replace("_", "/")}
                        </h3>

                        <div className={`flex items-center gap-1 text-sm font-medium ${statusClasses}`}>

                          {isOverdue ? (
                            <XCircle size={16} />
                          ) : isExpiringSoon ? (
                            <AlertTriangle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}

                          {statusText}
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="space-y-3 text-gray-700">

                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Done:
                          </span>

                          <span>
                            {training.doneDate
                              ? new Date(training.doneDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Due:
                          </span>

                          <span>
                            {training.dueDate
                              ? new Date(training.dueDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>

                        <div className="text-gray-400 font-medium">
                          {training.schedule || "-"}
                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>
            </Card>
          )}


          {/* ================= DAILY LOGS ================= */}
          <DailyDutyLogsTable logs={logs} />

          {/* ================= LR DETAILS ================= */}
          {/* ================= LR DETAILS ================= */}
          {lrList.length > 0 && (
            <Card>

              <SectionHeader
                icon={<FileText />}
                title={`LR Details (${lrList.length} sections)`}
              />

              <div className="overflow-x-auto overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">

                <table className="w-full text-sm">

                  {/* HEADER */}
                  <thead className="bg-[#F8FAFC]">
                    <tr>

                      <th className="py-4 px-4 text-left font-bold text-gray-900">
                        Section
                      </th>

                      <th className="py-4 px-4 text-left font-bold text-gray-900">
                        Done Date
                      </th>

                      <th className="py-4 px-4 text-left font-bold text-gray-900">
                        Due Date
                      </th>

                      <th className="py-4 px-4 text-left font-bold text-gray-900">
                        Status
                      </th>

                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody className="bg-white">

                    {lrList.map((lr, i) => {

                      const today = new Date();

                      const dueDate = lr.dueDate
                        ? new Date(lr.dueDate)
                        : null;

                      const diffDays = dueDate
                        ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                        : null;

                      const isOverdue =
                        diffDays !== null && diffDays < 0;

                      const isExpiringSoon =
                        diffDays !== null &&
                        diffDays >= 0 &&
                        diffDays <= 15;

                      return (
                        <tr key={i} className="hover:bg-slate-50 transition">

                          {/* SECTION */}
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {lr.section}
                          </td>

                          {/* DONE DATE */}
                          <td className="py-3 px-4 text-gray-600">
  {lr.doneDate ? new Date(lr.doneDate).toLocaleDateString() : "-"}
</td>

                          {/* DUE DATE */}
                          <td className="py-3 px-4 text-gray-600">
  {lr.dueDate ? new Date(lr.dueDate).toLocaleDateString() : "-"}
</td>

                          {/* STATUS */}
                          <td className="px-6 py-5">

                            {isOverdue ? (

                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
                                <XCircle size={15} />
                                Overdue
                              </span>

                            ) : isExpiringSoon ? (

                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
                                <AlertTriangle size={15} />
                                Expiring in {diffDays} day{diffDays !== 1 ? "s" : ""}
                              </span>

                            ) : (

                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <CheckCircle size={15} />
                                Valid
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ================= T-CARD ================= */}
          {/* ================= T-CARD (ADMIN EXACT UI) ================= */}
          <Card>
            <SectionHeader
              icon={<ClipboardList />}
              title="Tower Car Daily Checklist"
            />

            {/* HEADER WITH COUNT + NAV */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

              <div className="text-sm text-gray-500">
                {tcardTotalCount > 0 && `(${tcardTotalCount} total records)`}
              </div>

              {tcardAvailableDates.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">

                  <div className="flex items-center justify-center gap-2">

                    <button
                      onClick={goToPreviousDate}
                      disabled={
                        tcardAvailableDates.indexOf(tcardSelectedDate) >=
                        tcardAvailableDates.length - 1 || tcardLoading
                      }
                      className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 flex-shrink-0"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      onClick={goToNextDate}
                      disabled={
                        tcardAvailableDates.indexOf(tcardSelectedDate) <= 0 ||
                        tcardLoading
                      }
                      className="p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none hover:bg-gray-50 disabled:opacity-50 flex-shrink-0 sm:hidden"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </div>

                  <div className="relative flex-1 w-full sm:w-auto">

                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0b659a]"
                    />

                    <div className="w-full sm:w-auto">
                      <CustomDatePicker
                        value={tcardSelectedDate}
                        onChange={(v) => setTcardSelectedDate(v)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-lg text-sm"
                        placeholderText="DD/MM/YYYY"
                      />
                    </div>

                  </div>

                  <button
                    onClick={goToNextDate}
                    disabled={
                      tcardAvailableDates.indexOf(tcardSelectedDate) <= 0 ||
                      tcardLoading
                    }
                    className="hidden sm:block p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none hover:bg-gray-50 disabled:opacity-50 flex-shrink-0"
                  >
                    <ChevronRight size={18} />
                  </button>

                </div>
              )}
            </div>

            {/* LOADING */}
            {tcardLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2
                  className="animate-spin text-[#0b659a]"
                  size={28}
                />
                <span className="ml-2 text-gray-500">
                  Loading checklist...
                </span>
              </div>
            )}

            {/* DATA */}
            {!tcardLoading && tcardData.length > 0 && (
              <div className="space-y-4">

                {tcardData.map((card) => (

                  <div
                    key={card._id}
                    className="border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none rounded-xl p-4 bg-slate-50"
                  >

                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-sm font-semibold">

                      <span className="break-words">
                        Date: {card.date?.substring(0, 10)}
                      </span>

                      <span className="break-words">
                        T-Car No: {card.tCarNo}
                      </span>

                    </div>

                    {/* ITEMS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                      {card.items?.map((item, idx) => {

                        const isDieselItem =
                          item.description === "Check Diesel level";

                        const isLowDiesel =
                          isDieselItem &&
                          item.dieselLevel !== null &&
                          item.dieselLevel < 500;

                        return (

                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm p-2 bg-white rounded-lg"
                          >

                            {/* CHECK ICON */}
                            <span
                              className={
                                item.checked === true
                                  ? "text-emerald-500 flex-shrink-0"
                                  : "text-red-500 flex-shrink-0"
                              }
                            >
                              {item.checked === true ? "✓" : "✗"}
                            </span>

                            <div className="flex-1 min-w-0">

                              {/* DESCRIPTION */}
                              <p
                                className={`break-words ${item.checked === true
                                    ? "text-emerald-500"
                                    : "text-red-500"
                                  }`}
                              >
                                {item.description}
                              </p>

                              {/* DIESEL */}
                              {isDieselItem &&
                                item.dieselLevel !== null && (
                                  <div
                                    className={`mt-1 inline-flex flex-wrap items-center px-3 py-1 rounded-lg text-xs font-semibold border
                          ${isLowDiesel
                                        ? "bg-red-50 text-red-700 border-red-300"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-300"
                                      }`}
                                  >
                                    Diesel Level: {item.dieselLevel} L
                                    {isLowDiesel &&
                                      " (Below Threshold)"}
                                  </div>
                                )}

                              {/* REMARK + PRIORITY */}
                              {item.remarks && (
                                <div className="mt-2 flex flex-wrap items-center gap-2">

                                  <p className="text-xs text-gray-500 break-words">
                                    Remarks: {item.remarks}
                                  </p>

                                  {item.priority && (
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap
                              ${item.priority === "HIGH"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-amber-100 text-amber-700"
                                        }`}
                                    >
                                      {item.priority === "HIGH"
                                        ? "High Priority"
                                        : "Less Priority"}
                                    </span>
                                  )}

                                </div>
                              )}

                            </div>

                          </div>

                        );
                      })}

                    </div>

                  </div>

                ))}

              </div>
            )}

            {/* NO DATA FOR DATE */}
            {!tcardLoading &&
              tcardSelectedDate &&
              tcardData.length === 0 &&
              tcardAvailableDates.length > 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <CalendarDays
                    size={40}
                    className="mx-auto text-gray-300 mb-3"
                  />
                  <p className="text-gray-500 font-medium">
                    No checklist found for selected date
                  </p>
                </div>
              )}

            {/* NO T-CARDS */}
            {!tcardLoading &&
              tcardAvailableDates.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <p className="text-gray-500">
                    No checklist submitted
                  </p>
                </div>
              )}
          </Card>

        </div>
      </div>


    </>
  );
}

/* ================= UI HELPERS ================= */

function Card({ children }) {
  return <div className="rail-panel p-4 sm:p-6 md:p-8">{children}</div>;
}

function SectionHeader({ title, icon }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-[#0b659a]">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{children}</div>;
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function TableWrapper({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0b659a] focus:border-transparent focus:outline-none">
      <table className="min-w-full">
        {children}
      </table>
    </div>
  );
}
function TableHead({ children, center }) {
  return (
    <th className={`px-4 py-3 border-b bg-slate-100 ${center && "text-center"}`}>
      {children}
    </th>
  );
}

function TableCell({ children, center }) {
  return (
    <td className={`px-4 py-2 border-b ${center && "text-center"}`}>
      {children}
    </td>
  );
}