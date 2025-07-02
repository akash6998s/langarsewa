import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { theme } from "../theme"; // Ensure this path is correct
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
        backgroundColor: theme.colors.background, // Light yellow cream background
        color: theme.colors.neutralDark, // Dark gray text
        fontFamily: theme.fonts.body, // Open Sans for body text
      }}
    >
      {/* Sidebar */}
      <div
        className={`w-72 flex flex-col absolute md:relative z-20 h-screen shadow-2xl rounded-r-3xl transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          backgroundColor: theme.colors.surface, // White surface for sidebar
          borderRight: `2px solid ${theme.colors.primaryLight}`, // Amber-500 border for subtle separation
          color: theme.colors.neutralDark, // Dark gray text
          fontFamily: theme.fonts.heading, // Poppins for headings
        }}
      >
        <div className="flex flex-col justify-between p-6 h-full">
          <div>
            {/* Close Button for Mobile */}
            <div className="flex items-center justify-end mb-8">
              <FaTimes
                className="text-3xl cursor-pointer md:hidden hover:opacity-80"
                onClick={() => setIsMenuOpen(false)}
                style={{ color: theme.colors.tertiary }} // Gray-500 for the close icon
              />
            </div>

            {/* Navigation */}
            <h2
              className="text-3xl font-extrabold mb-10 text-center tracking-wide" // Increased tracking for heading
              style={{ color: theme.colors.primary }} // Saffron (amber-600) for primary heading
            >
              Super Admin
            </h2>
            <nav className="space-y-4"> {/* Increased vertical spacing for menu items */}
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer py-3 px-5 rounded-lg flex items-center gap-3 text-lg font-semibold transition-all duration-200 ${
                    activeTab === item.id
                      ? "shadow-md scale-105" // Subtle shadow and slight scale for active item
                      : "hover:bg-gray-50 hover:text-gray-700" // Light hover background and slightly darker text
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === item.id ? theme.colors.secondary : "transparent", // Emerald-500 for active tab background
                    color:
                      activeTab === item.id
                        ? theme.colors.surface // White text on active tab
                        : theme.colors.neutralDark, // Dark gray text for inactive tabs
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
        <div
          className="flex items-center p-5" // Added subtle shadow to navbar
        >
          {!isMenuOpen && (
            <FaBars
              className="text-3xl cursor-pointer hover:opacity-80 md:hidden"
              onClick={() => setIsMenuOpen(true)}
              style={{ color: theme.colors.tertiary }} // Gray-500 for the menu icon
            />
          )}
          <div className="ml-auto">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Content Area */}
        <div
          className="" // Larger margins, consistent padding, and a stronger shadow for content area
          style={{
            minHeight: 'calc(100vh - 120px)', // Adjust height to fill viewport
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;