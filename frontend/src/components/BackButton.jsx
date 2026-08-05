import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-semibold text-[#0B3C5D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1F6F8B] hover:bg-[#E8EEF5] focus:outline-none focus:ring-2 focus:ring-[#1F6F8B] ${className}`.trim()}
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </button>
  );
}
