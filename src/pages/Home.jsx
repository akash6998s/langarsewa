import React from "react";
import { Link, useLocation } from "react-router-dom";
import AttendanceSheet from "../components/AttendanceSheet";
import WorkspaceButtons from "../components/WorkspaceButtons";

function Home() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuOptions = [
    { id: "createpost", icon: "✍️", path: "/createpost" },
    { id: "gallery", icon: "🖼️", path: "/gallery" },
    { id: "members", icon: "👥", path: "/members" },
    { id: "naamjap", icon: "🙏", path: "/naamjap" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* ---------- Header ---------- */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src="/logo.png"
                alt="Sudarshan Sena Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                सुदर्शन सेना
              </h1>
              <span className="w-[2px] h-5 bg-gray-300 rounded-full" />
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                भोजन वितरण
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-1 pt-8 space-y-10">
        {/* ---------- Services ---------- */}
        <section className="px-2">
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="w-1 h-4 bg-indigo-600 rounded-full" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              Workspace
            </h3>
          </div>

          <WorkspaceButtons
            show={["createpost", "gallery", "members", "naamjap"]}
          />
        </section>

        {/* ---------- Attendance ---------- */}
        <section>
          <div className="p-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <h3 className="text-lg font-black text-gray-900">
                Attendance Sheet
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50/40">
              <AttendanceSheet />
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Bottom Navigation ---------- */}
      <nav className="hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-[#121417] rounded-[2.5rem] px-8 py-4 shadow-2xl flex items-center justify-between border border-white/5">
          {menuOptions.map((option) => {
            const active = isActive(option.path);
            return (
              <Link
                key={option.id}
                to={option.path}
                className="relative flex flex-col items-center"
              >
                <div
                  className={`transition-all duration-300 ${active ? "scale-125 -translate-y-1" : "opacity-40"
                    }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                </div>
                {active && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}

export default Home;
