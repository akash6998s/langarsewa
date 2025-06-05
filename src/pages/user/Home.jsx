import React from "react";
import AttendanceSheet from "../../components/AttendanceSheet";
import UserProfileDropdown from "../../components/UserProfileDropdown";
import { theme } from "../../theme";

const Home = () => {
  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
      }}
      className="min-h-screen bg-[#FFF8E7] pt-6 font-[Inter] text-[#1E293B] relative"
    >
      {/* Top Right User Dropdown */}
      <div className="absolute top-4 right-4">
        <UserProfileDropdown />
      </div>

      {/* Centered Heading */}
      <h1 className="text-3xl md:text-4xl font-bold font-[Merriweather] text-[#9D174D] text-center mt-16 mb-4">
        सुदर्शन सेना - भोजन वितरण
      </h1>

      {/* Main Section */}
      <div className="p-2">
        <AttendanceSheet />
      </div>
    </div>
  );
};

export default Home;
