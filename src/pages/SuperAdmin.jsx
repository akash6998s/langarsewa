import React, { useState } from "react";
import ManageAttendance from "../components/ManageAttendance";
import ManageDonation from "../components/ManageDonation";
import ManageExpense from "../components/ManageExpense";
import Managemember from "../components/Managemember";
import ManageFinance from "../components/ManageFinance";

// ✅ MUI Icons
import GroupIcon from "@mui/icons-material/Group";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// Updated navItems with components
const navItems = [
  { name: "Manage Member", key: "member", icon: <GroupIcon fontSize="small" /> },
  { name: "Manage Attendance", key: "attendance", icon: <FactCheckIcon fontSize="small" /> },
  { name: "Manage Donations", key: "donations", icon: <VolunteerActivismIcon fontSize="small" /> },
  { name: "Manage Expense", key: "expense", icon: <MoneyOffIcon fontSize="small" /> },
  { name: "Manage Finance", key: "finance", icon: <CurrencyExchangeIcon fontSize="small" /> },
];

const SuperAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("member");

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "member":
        return <Managemember />;
      case "attendance":
        return <ManageAttendance />;
      case "donations":
        return <ManageDonation />;
      case "expense":
        return <ManageExpense />;
      case "finance":
        return <ManageFinance />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 text-xl font-medium p-8">
            Please select a section from the sidebar to view content.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shadow-md md:z-auto
        `}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="font-extrabold text-2xl tracking-wide">Super Admin</div>
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md p-1"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setIsOpen(false); // Close sidebar on mobile
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ease-in-out
                ${
                  activeTab === item.key
                    ? "bg-indigo-500 text-white shadow-md font-semibold"
                    : "text-gray-700 hover:bg-gray-200 hover:text-indigo-700"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75
              `}
              aria-current={activeTab === item.key ? "page" : undefined}
            >
              {item.icon}
              <span className="text-base">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-lg fixed top-0 left-0 right-0 z-30 h-16">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md p-1"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <h1 className="text-xl font-bold text-indigo-600">Super Admin</h1>
          <div className="w-8" /> {/* Placeholder for alignment */}
        </header>

        {/* Desktop Header */}
        <header className="hidden md:block bg-white shadow-md p-6 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Welcome, Super Admin!
          </h1>
          <p className="text-gray-500 text-md mt-1">Manage your Langar App operations efficiently.</p>
        </header>

        {/* Dynamic Component Area */}
        <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin;
