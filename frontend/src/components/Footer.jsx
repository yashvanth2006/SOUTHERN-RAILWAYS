import { Mail, Github } from "lucide-react";

export default function Footer() {
  const sendMail = (e) => {
    e.preventDefault();

    const message = e.target.message.value.trim();
    if (!message) return;

    const subject = encodeURIComponent(
      "Query from Tower Wagon Driver Management System"
    );
    const body = encodeURIComponent(message);

    // ✅ Gmail web (works on all systems)
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=ssrskillworks@gmail.com&su=${subject}&body=${body}`,
      "_blank"
    );

    e.target.reset();
  };

  return (
    <footer className="bg-[#0b659a] text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* LOGO + ABOUT */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/app-logo.png"
                alt="Project Logo"
                className="h-10 w-10 object-contain"
              />
              <h3 className="text-lg font-semibold leading-tight">
                Tower Wagon Driver <br className="hidden sm:block" />
                Management System
              </h3>
            </div>

            <p className="text-sm leading-relaxed">
              A centralized platform for managing driver activities, official
              circulars, reports, and operational compliance in railway systems.
            </p>

            <p className="text-xs leading-relaxed opacity-90">
              Developed by students of the Department of Computer Science and
              Engineering, Sri Shakthi Institute of Engineering and Technology.
            </p>
          </div>

          {/* DEVELOPER LINKS */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Developer Contact</h4>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} />
                <a
                  href="mailto:ssrskillworks@gmail.com"
                  className="hover:underline break-all"
                >
                  Gmail
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Github size={16} />
                <a
                  href="https://github.com/sudharshansudhir/Railway-Department"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* QUERY FORM */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Have a Query?</h4>

            <form onSubmit={sendMail} className="space-y-3">
              <textarea
                name="message"
                rows="4"
                placeholder="Enter your message here..."
                className="w-full rounded-lg p-3 text-sm text-gray-800
                           border border-black/40 resize-none
                           focus:outline-none focus:ring-2 focus:ring-black"
              />

              <button
                type="submit"
                className="w-full sm:w-auto bg-black text-white
                           px-5 py-2 rounded-lg text-sm font-medium
                           hover:bg-gray-900 transition"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/20 my-8"></div>

        {/* BOTTOM */}
        <div className="text-center text-xs sm:text-sm opacity-90">
          © {new Date().getFullYear()} Tower Wagon Driver Management System.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}
