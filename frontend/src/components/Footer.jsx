import { 
  Mail, 
  Github, 
  GraduationCap, 
  Home, 
  ClipboardList, 
  TriangleAlert, 
  FileText, 
  CheckSquare, 
  Send, 
  ShieldCheck, 
  Heart,
  ShieldUser,
  TrainFront,
  Files,
  ClipboardCheck,
  FileUp,
  Crown,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const role = localStorage.getItem("role");

  const sendMail = (e) => {
    e.preventDefault();

    const message = e.target.message.value.trim();
    if (!message) return;

    const subject = encodeURIComponent(
      "Query from Tower Wagon Driver Management System"
    );
    const body = encodeURIComponent(message);

    // Gmail web (works on all systems)
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=towercar@gmail.com&su=${subject}&body=${body}`,
      "_blank"
    );

    e.target.reset();
  };

  // Define the dynamic quick links based on the user's role
  const getQuickLinks = () => {
    switch (role) {
      case "DRIVER":
        return [
          { to: "/driver", icon: <ShieldUser size={18} />, label: "TW Driver Dashboard" },
          { to: "/driver/engine", icon: <TrainFront size={18} />, label: "TW Dashboard" },
          { to: "/driver/daily", icon: <ClipboardList size={18} />, label: "Duty Logs" },
          { to: "/driver/abnormalities", icon: <TriangleAlert size={18} />, label: "Abnormalities" },
          { to: "/circulars", icon: <Files size={18} />, label: "Circulars" },
        ];
      case "DEPOT_MANAGER":
        return [
          { to: "/manager", icon: <ShieldUser size={18} />, label: "TW Driver Dashboard" },
          { to: "/manager/engine", icon: <TrainFront size={18} />, label: "TW Dashboard" },
          { to: "/admin/circular-status", icon: <ClipboardCheck size={18} />, label: "Circular Status" },
          { to: "/circulars", icon: <Files size={18} />, label: "Circulars" },
        ];
      case "SUPER_ADMIN":
        return [
          { to: "/admin", icon: <ShieldUser size={18} />, label: "TW Driver Dashboard" },
          { to: "/admin/engine", icon: <TrainFront size={18} />, label: "TW Dashboard" },
          { to: "/admin/circular-upload", icon: <FileUp size={18} />, label: "Upload Circular" },
          { to: "/admin/circular-status", icon: <ClipboardCheck size={18} />, label: "Circular Status" },
          { to: "/circulars", icon: <Files size={18} />, label: "Circulars" },
          { to: "/admin/report-download", icon: <ClipboardList size={18} />, label: "Reports" },
        ];
      case "ADEE":
        return [
          { to: "/adee", icon: <ShieldUser size={18} />, label: "TW Driver Dashboard" },
          { to: "/adee/engine", icon: <TrainFront size={18} />, label: "TW Dashboard" },
          { to: "/admin/circular-status", icon: <ClipboardCheck size={18} />, label: "Circular Status" },
          { to: "/circulars", icon: <Files size={18} />, label: "Circulars" },
        ];
      case "MASTER_ADMIN":
        return [
          { to: "/master-admin", icon: <Crown size={18} />, label: "Master Admin" },
          { to: "/admin", icon: <Shield size={18} />, label: "Super Admin Dashboard" },
          { to: "/admin/engine", icon: <TrainFront size={18} />, label: "TW Dashboard" },
          { to: "/admin/circular-status", icon: <ClipboardCheck size={18} />, label: "Circular Status" },
          { to: "/circulars", icon: <Files size={18} />, label: "Circulars" },
          { to: "/admin/report-download", icon: <ClipboardList size={18} />, label: "Reports" },
        ];
      default:
        // Fallback or unauthenticated state links
        return [
          { to: "/", icon: <Home size={18} />, label: "Home" }
        ];
    }
  };

  const quickLinks = getQuickLinks();

  return (
    <footer 
      className="relative z-10 bg-cover bg-bottom bg-no-repeat text-white overflow-hidden border-t-4 border-[#1a73e8]"
      style={{ backgroundImage: "url('/Footerbg.png')", backgroundColor: "#0b3c5d" }}
    >
      {/* Very light overlay just to ensure white text readability without darkening the image too much */}
      <div className="absolute inset-0 bg-[#0b3c5d]/20 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* COLUMN 1: BRAND & ABOUT */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                 <img
                  src="/app-logo.png"
                  alt="Project Logo"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold leading-tight tracking-tight">
                Tower Wagon Driver<br />Management System
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              A centralized platform for managing driver activities, official circulars, reports, and operational compliance in railway systems.
            </p>

            <div className="w-12 h-1 bg-[#1a73e8] rounded-full"></div>

            <div className="flex items-start gap-3 text-slate-300">
              <GraduationCap className="shrink-0 mt-0.5 text-[#1a73e8]" size={20} />
              <p className="text-xs leading-relaxed">
                Developed by students of the Department of Computer Science and Engineering, Sri Shakthi Institute of Engineering and Technology.
              </p>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="space-y-6 lg:pl-4">
            <h4 className="font-bold text-lg tracking-wide">Quick Links</h4>
            <ul className="space-y-4 text-sm text-slate-300">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.to} 
                    className="flex items-center gap-3 hover:text-white hover:translate-x-1 transition-all group cursor-pointer w-fit"
                  >
                    <span className="text-[#1a73e8] group-hover:text-white transition-colors">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: DEVELOPER CONTACT */}
          <div className="space-y-6 lg:pl-2">
            <h4 className="font-bold text-lg tracking-wide">Developer Contact</h4>
            <div className="space-y-4">
              
              <a href="mailto:towercar@gmail.com" className="block">
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#08152e]/60 border border-white/5 hover:bg-[#08152e] hover:border-white/10 transition-all group">
                  <div className="bg-[#1a73e8] p-2.5 rounded-full shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-[#1a73e8]/20">
                    <Mail size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Gmail</p>
                    <p className="text-xs text-slate-400">support@twdriver.in</p>
                  </div>
                </div>
              </a>

              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#08152e]/60 border border-white/5 hover:bg-[#08152e] hover:border-white/10 transition-all group">
                  <div className="bg-[#1a73e8] p-2.5 rounded-full shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-[#1a73e8]/20">
                    <Github size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">GitHub</p>
                    <p className="text-xs text-slate-400">github.com/twdriver</p>
                  </div>
                </div>
              </a>

            </div>
          </div>

          {/* COLUMN 4: HAVE A QUERY */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg tracking-wide">Have a Query?</h4>
            <form onSubmit={sendMail} className="space-y-4">
              <textarea
                name="message"
                rows="3"
                placeholder="Enter your message here..."
                className="w-full rounded-xl p-4 text-sm text-white bg-[#08152e]/60
                           border border-white/10 resize-none shadow-inner
                           focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent placeholder-slate-500 transition-all"
              />

              <button
                type="submit"
                className="w-auto flex items-center justify-center gap-2 bg-[#1a73e8] text-white
                           px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#1a73e8]/30
                           hover:bg-[#1557b0] hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM DIVIDER */}
        <div className="border-t border-white/10 mt-16 mb-6"></div>

        {/* BOTTOM STATUS BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#1a73e8]" />
            <span>Your safety. Our priority.</span>
          </div>
          
          <div className="text-center">
            {new Date().getFullYear()} Tower Wagon Driver Management System<br className="md:hidden" />
          </div>

          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#1a73e8]" />
            <span>Built with dedication for Southern Railways</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
