import React, { useState } from "react";
import { FaBars, FaTimes, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";
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
    { name: "Manage Expense", id: "manageexpense" },
    { name: "Manage Finance", id: "managefinance" },
    { name: "Manage User", id: "manageuser" },
    { name: "Manage Member", id: "managemember" },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-indigo-950 to-blue-900 text-white w-72 flex flex-col absolute md:relative z-20 h-screen shadow-xl rounded-r-3xl transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col justify-between p-6 h-full">
          <div>
            {/* Close Button for Mobile */}
            <div className="flex items-center justify-end mb-8">
              <FaTimes
                className="text-2xl cursor-pointer md:hidden hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              />
            </div>

            {/* Navigation */}
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Super Admin
            </h2>
            <nav className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer py-3 px-4 rounded-xl flex items-center gap-3 text-base font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-indigo-700 text-white shadow-lg scale-105"
                      : "hover:bg-indigo-800 hover:text-white"
                  }`}
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

          {/* Back to Home */}
          {/* <div className="mt-10">
            <Link
              to="/home"
              className="cursor-pointer py-3 px-4 rounded-xl flex items-center gap-3 transition-all duration-200 hover:bg-indigo-800 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome className="text-xl" />
              <span className="text-base font-medium">Back to Home</span>
            </Link>
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center p-4 border-b border-gray-300">
          {!isMenuOpen && (
            <FaBars
              className="text-3xl text-gray-700 cursor-pointer hover:text-gray-900 md:hidden"
              onClick={() => setIsMenuOpen(true)}
            />
          )}
          <div className="ml-auto">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
