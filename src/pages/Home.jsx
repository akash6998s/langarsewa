import React from "react";
import AttendanceSheet from "../components/AttendanceSheet";
import { theme } from "../theme";
import Topbar from "../components/Topbar";

function Home() {
  return (
    <div
      className="min-h-screen pt-2"
      style={{ background: theme.colors.background }}
    >
      <Topbar />

      <h2
        className="text-3xl mt-8 font-extrabold text-center tracking-tight leading-tight px-4 font-[EB_Garamond,serif]"
        style={{ color: theme.colors.neutralDark }}
      >
        सुदर्शन सेना भोजन वितरण
      </h2>

      <AttendanceSheet />
    </div>
  );
}

export default Home;
