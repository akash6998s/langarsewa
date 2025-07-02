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
        className="text-2xl  font-bold text-center my-4"
        style={{
          color: theme.colors.primary,
          fontFamily: theme.fonts.heading,
        }}
      >
        सुदर्शन सेना - भोजन वितरण
      </h1>

      <div className="pb-16">
        <AttendanceSheet />
      </div>
    </div>
  );
};

export default Home;
