import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ResponsiveSection({ title, icon, children, headerRight, id, defaultOpen = false, isOpenProp, onToggle, alwaysCollapsible = false }) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  const isActuallyOpen = isOpenProp !== undefined ? isOpenProp : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isActuallyOpen);
    } else {
      setInternalIsOpen(!isActuallyOpen);
    }
  };

  return (
    <div 
      id={id} 
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 flex flex-col group/section transition-all duration-300 hover:shadow-md hover:border-[#0b659a] md:hover:-translate-y-1"
    >
      <div 
        className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white transition-colors duration-300 select-none ${alwaysCollapsible ? 'cursor-pointer' : 'cursor-pointer md:cursor-default'}`}
        onClick={(e) => {
          // On mobile, always toggle state. On desktop, only toggle if alwaysCollapsible is true.
          if (alwaysCollapsible || window.innerWidth < 768) {
            handleToggle();
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 group-hover/section:bg-[#0b659a] group-hover/section:text-white rounded-xl text-[#0b659a] transition-colors duration-300 flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800 transition-colors duration-300">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Desktop Header Right (e.g. Search) */}
          {headerRight && (
            <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
              {headerRight}
            </div>
          )}

          {/* Chevron Toggle */}
          <div className={`${alwaysCollapsible ? '' : 'md:hidden'} text-slate-500 flex-shrink-0`}>
            {isActuallyOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      
      {/* Content wrapper: hidden on mobile if not open, always block on md+ unless alwaysCollapsible */}
      <div className={`p-4 sm:p-6 bg-slate-50/30 flex-1 ${isActuallyOpen ? 'block' : 'hidden'} ${alwaysCollapsible ? '' : 'md:block'} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}
