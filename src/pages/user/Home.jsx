import React from "react";
import AttendanceSheet from "../../components/AttendanceSheet";
import { theme } from "../../theme";

const Home = () => {
  return (
    <div
      style={{
        fontFamily: theme.fonts.body, // '"Open Sans", sans-serif'
        color: theme.colors.neutralDark, // '#374151'
      }}
      className="min-h-screen px-2 relative"
    >
      {/* Centered Heading */}
      <h1
        style={{
          color: theme.colors.primary, // '#D97706'
          fontFamily: theme.fonts.heading, // "'Poppins', sans-serif"
        }}
        className="text-3xl md:text-4xl font-bold text-center mt-8 mb-2"
      >
        सुदर्शन सेना - भोजन वितरण
      </h1>

      {/* Subtitle */}

      {/* Main Section */}
      <div
        style={{
          fontFamily: theme.fonts.body,
        }}
        className="mx-auto py-6 rounded-lg shadow"
      >
        <AttendanceSheet />
      </div>
    </div>
  );
};

export default Home;
