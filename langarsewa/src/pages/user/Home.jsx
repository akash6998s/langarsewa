import React from "react";
import AttendanceSheet from "../../components/AttendanceSheet";
import { theme } from "../../theme";

const Home = () => {
  return (
    <div
      className="flex flex-col h-full px-2"
      style={{
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      <h1
        className="text-3xl font-extrabold text-center my-6 tracking-wider uppercase drop-shadow-lg relative inline-block"
        style={{
          color: theme.colors.primary,
          fontFamily: theme.fonts.body,
        }}
      >
        सुदर्शन सेना - भोजन वितरण
      </h1>

      <div className="pb-20">
        <AttendanceSheet />
      </div>
    </div>
  );
};

export default Home;
