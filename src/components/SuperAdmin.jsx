import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { theme } from "../theme";
import ManageAttendance from "./ManageAttendance";
import ManageDonation from "./ManageDonation";
import ManageExpense from "./ManageExpense";
import ManageFinance from "./ManageFinance";
import ManageMembers from "./ManageMembers";
import UserProfileDropdown from "./UserProfileDropdown";
import UserStatus from "./UserStatus";

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState("manageattendance");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "manageattendance":
        return <ManageAttendance />;
      case "managedonation":
        return <ManageDonation />;
      case "manageexpense":
        return <ManageExpense />;
      case "managefinance":
        return <ManageFinance />;
      case "manageuser":
        return <UserStatus />;
      case "managemember":
        return <ManageMembers />;
      default:
        return <ManageAttendance />;
    }
  };

  const menuItems = [
    { name: "Manage Attendance", id: "manageattendance" },
    { name: "Manage Donation", id: "managedonation" },
    { name: "Manage Member", id: "managemember" },
    { name: "Manage Expense", id: "manageexpense" },
    { name: "Manage Finance", id: "managefinance" },
    { name: "Manage User", id: "manageuser" },
  ];

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: theme.colors.neutralLight,
        color: theme.colors.neutralDark,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Sidebar */}
      <div
        className={`w-72 flex flex-col absolute md:relative z-20 h-screen shadow-2xl rounded-r-3xl transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          backgroundColor: theme.colors.neutralLight,
          borderRight: `2px solid ${theme.colors.primary}`,
          fontFamily: theme.fonts.heading,
        }}
      >
        <div className="flex flex-col justify-between p-6 h-full">
          <div>
            {/* Close Button for Mobile */}
            <div className="flex items-center justify-end mb-8">
              <FaTimes
                className="text-3xl cursor-pointer md:hidden hover:opacity-80"
                onClick={() => setIsMenuOpen(false)}
                style={{ color: theme.colors.surface }}
              />
            </div>

            {/* Navigation */}
            <h2
              className="text-3xl font-extrabold mb-10 text-center tracking-wide"
              style={{ color: theme.colors.surface }}
            >
              Super Admin
            </h2>
            <nav className="space-y-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer py-3 px-5 rounded-lg flex items-center gap-3 text-lg font-semibold transition-all duration-200 ${
                    activeTab === item.id ? "shadow-md scale-105" : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === item.id
                        ? theme.colors.primary
                        : "transparent",
                    color:
                      activeTab === item.id
                        ? "#ffffff"
                        : theme.colors.surface,
                  }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <span>{item.name}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center p-5">
          {!isMenuOpen && (
            <FaBars
              className="text-3xl cursor-pointer hover:opacity-80 md:hidden"
              onClick={() => setIsMenuOpen(true)}
              style={{ color: theme.colors.tertiary }}
            />
          )}
          <div className="ml-auto">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4" style={{ minHeight: "calc(100vh - 120px)" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
