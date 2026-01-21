import React from "react";
import AttendanceSheet from "../components/AttendanceSheet";
import WorkspaceButtons from "../components/WorkspaceButtons";

function Home() {
  // Navigation hatane ke baad menuOptions aur useLocation ki ab zaroorat nahi hai.

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ---------- Header (Zero Border, Zero Shadow) ---------- */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-3 py-5 flex items-center gap-3">
          <div className="w-9 h-9 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div class="w-full h-full bg-orange-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">S</div>`;
              }}
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap tracking-tight">
            सुदर्शन सेना भोजन वितरण
          </h1>
        </div>
      </header>

      {/* Main Content: side padding kam (px-1.5) aur gaps minimal rakhe hain */}
      <main className="max-w-lg mx-auto px-1.5 space-y-2">
        
        {/* Workspace Buttons Section: No padding, no border, no background */}
        <section className="bg-transparent border-none p-0 m-0 shadow-none outline-none">
          <WorkspaceButtons
            show={["createpost", "gallery", "members", "naamjap"]}
          />
        </section>

        {/* Attendance Section: Cleanest parent possible */}
        <section className="bg-transparent border-none p-0 m-0 shadow-none outline-none">
          <AttendanceSheet />
        </section>
      </main>

      {/* CSS Reset specifically for this page to kill any stubborn lines */}
      <style>{`
        header, section, div, main, nav {
          border: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
          outline: none !important;
          -webkit-box-shadow: none !important;
        }

        /* Taaki body ka background hamesha white dikhe */
        body {
          background-color: white !important;
          margin: 0;
          padding: 0;
        }

        /* Agar WorkspaceButtons ya AttendanceSheet ke andar koi box-shadow aa rahi ho */
        .workspace-buttons-container, 
        .attendance-sheet-container {
          box-shadow: none !important;
          border: none !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}

export default Home;