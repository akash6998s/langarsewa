import React, { useState } from "react";
import ManageAttendance from "../components/ManageAttendance";
import ManageDonation from "../components/ManageDonation";
import ManageExpense from "../components/ManageExpense";
import ManageFinance from "../components/ManageFinance"; // Ensure this is the updated one
import Managemember from "../components/ManageMember";
import { theme } from "../theme"; // Import the theme

// ✅ MUI Icons
import GroupIcon from "@mui/icons-material/Group";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AdminPanel from "./AdminPanel";
import InsightsIcon from "@mui/icons-material/Insights";
import LoadData from "../components/LoadData"; // Assuming this handles data loading for local storage
import ActivityTracker from "../components/ActivityTracker";

// Updated navItems with components and new order
const navItems = [
  {
    name: "Manage Attendance",
    key: "attendance",
    icon: <FactCheckIcon fontSize="small" />,
  },
  {
    name: "Manage Donations",
    key: "donations",
    icon: <VolunteerActivismIcon fontSize="small" />,
  },
  {
    name: "Manage Expense",
    key: "expense",
    icon: <MoneyOffIcon fontSize="small" />,
  },
  {
    name: "Manage Member",
    key: "member",
    icon: <GroupIcon fontSize="small" />,
  },
  {
    name: "Manage Finance",
    key: "finance",
    icon: <CurrencyExchangeIcon fontSize="small" />,
  },
  {
    name: "Activity Tracker",
    key: "activityracker",
    icon: <InsightsIcon fontSize="small" />,
  },
  { name: "Users", key: "users", icon: <GroupIcon fontSize="small" /> },
];

const SuperAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Set default active tab to 'attendance'
  const [activeTab, setActiveTab] = useState("attendance");

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
      case "activityracker":
        return <ActivityTracker />;
      case "users":
        return <AdminPanel />;
      default:
        return (
          <div
            className="flex items-center justify-center h-full text-xl font-medium p-8 text-center"
            style={{ color: theme.colors.primary }}
          >
            Please select a section from the sidebar to view content.
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen flex font-[Inter,sans-serif] antialiased" // Added antialiased for smoother fonts
      style={{ background: theme.colors.background }}
    >
      <LoadData /> {/* This component seems to handle initial data loading */}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 shadow-xl z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shadow-md md:z-auto
        `}
        style={{ backgroundColor: theme.colors.neutralLight }}
      >
        <div
          className="flex justify-between items-center p-5 border-b text-white"
          style={{
            background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
            borderColor: theme.colors.primaryLight,
          }}
        >
          <div
            className="font-extrabold text-2xl tracking-wide font-[EB_Garamond,serif]"
            style={{ color: theme.colors.neutralLight }}
          >
            Super Admin
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2"
            style={{
              color: theme.colors.neutralLight,
              outlineColor: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.neutralLight,
              "--tw-ring-opacity": 0.75,
            }}
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
                focus:outline-none focus:ring-2 focus:ring-opacity-75 border-b-2 border-transparent
                ${activeTab === item.key ? "shadow-md" : ""}
              `}
              style={{
                backgroundColor:
                  activeTab === item.key ? theme.colors.primary : "transparent",
                color:
                  activeTab === item.key
                    ? theme.colors.neutralLight
                    : theme.colors.primary,
                fontWeight: activeTab === item.key ? "semibold" : "normal",
                boxShadow:
                  activeTab === item.key
                    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
                    : "none",
                "--tw-ring-color": theme.colors.primaryLight, // Tailwind ring color
                borderColor:
                  activeTab === item.key
                    ? theme.colors.primaryLight
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.key) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.primaryLight;
                  e.currentTarget.style.color = theme.colors.neutralDark;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.key) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = theme.colors.primary;
                }
              }}
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
        <header
          className="md:hidden flex items-center justify-between p-4 shadow-lg fixed top-0 left-0 right-0 z-30 h-16"
          style={{ backgroundColor: theme.colors.neutralLight }}
        >
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md focus:outline-none focus:ring-2"
            style={{
              color: theme.colors.primary,
              outlineColor: theme.colors.primaryLight,
              "--tw-ring-color": theme.colors.primaryLight,
              "--tw-ring-opacity": 0.75,
            }}
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <h1
            className="text-xl font-bold font-[EB_Garamond,serif]"
            style={{ color: theme.colors.primary }}
          >
            Super Admin
          </h1>
          <div className="w-8" /> {/* Placeholder for alignment */}
        </header>

        {/* Desktop Header */}
        <header
          className="hidden md:block shadow-md p-6 border-b"
          style={{
            backgroundColor: theme.colors.neutralLight,
            borderColor: theme.colors.primaryLight,
          }}
        >
          <h1
            className="text-3xl font-extrabold font-[EB_Garamond,serif]"
            style={{ color: theme.colors.neutralDark }}
          >
            Welcome, Super Admin!
          </h1>
          <p className="text-md mt-1" style={{ color: theme.colors.primary }}>
            Manage your Langar App operations efficiently.
          </p>
        </header>

        {/* Dynamic Component Area */}
        <main
          className="mt-16 pb-12 md:mt-0 overflow-auto"
          style={{ width: "100vw" }}
        >
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin;
