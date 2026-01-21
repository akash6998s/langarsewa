import React from "react";
import AttendanceSheet from "../components/AttendanceSheet";
import WorkspaceButtons from "../components/WorkspaceButtons";

function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ---------- Fully Centered Header (Logo + Heading Stacked) ---------- */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-3">

          {/* Centered Heading */}
         <div className="text-center py-4">
  <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-gray-900">
    सुदर्शन सेना <span className="text-orange-600">भोजन वितरण</span>
  </h1>
</div>

          
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-1.5 space-y-2">
        
        {/* Workspace Buttons Section */}
        <section className="bg-transparent border-none p-0 m-0 shadow-none outline-none">
          <WorkspaceButtons
            show={["createpost", "gallery", "members", "naamjap"]}
          />
        </section>

        {/* Attendance Section */}
        <section className="bg-transparent border-none p-0 m-0 shadow-none outline-none">
          <AttendanceSheet />
        </section>
      </main>

      {/* CSS Reset */}
      <style>{`
        header, section, div, main, nav {
          border: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        body {
          background-color: white !important;
          margin: 0;
          padding: 0;
        }

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