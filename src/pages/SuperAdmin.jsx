import React, { useEffect, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import ManageAttendance from "../components/ManageAttendance";
import ManageDonation from "../components/ManageDonation";
import ManageExpense from "../components/ManageExpense";
import ManageFinance from "../components/ManageFinance";
import Managemember from "../components/ManageMember";
import { theme } from "../theme";
import AdminPanel from "./AdminPanel";
import LoadData from "../components/LoadData";
import MemberPerformance from "../components/MemberPerformance";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";                                        

// ✅ MUI Icons
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChecklistIcon from "@mui/icons-material/Checklist";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

// ✅ Centralize and refine nav items.
// Using an object for component mapping makes the switch statement unnecessary.
const navItems = {
  attendance: {
    name: "Manage Attendance",
    component: <ManageAttendance />,
    icon: <ChecklistIcon fontSize="small" />,
  },
  donations: {
    name: "Manage Donations",
    component: <ManageDonation />,
    icon: <FavoriteIcon fontSize="small" />,
  },
  expense: {
    name: "Manage Expense",
    component: <ManageExpense />,
    icon: <ReceiptLongIcon fontSize="small" />,
  },
  member: {
    name: "Manage Member",
    component: <Managemember />,
    icon: <PeopleAltIcon fontSize="small" />,
  },
  finance: {
    name: "Manage Finance",
    component: <ManageFinance />,
    icon: <AccountBalanceWalletIcon fontSize="small" />,
  },
  memberperformance: {
    name: "Member Performance",
    component: <MemberPerformance />,
    icon: <LeaderboardIcon fontSize="small" />,
  },
  users: {
    name: "Users",
    component: <AdminPanel />,
    icon: <ManageAccountsIcon fontSize="small" />,
  },
};

// You can define a single array for rendering the sidebar to maintain order
const navItemsOrder = [
  "attendance",
  "donations",
  "expense",
  "member",
  "finance",
  "memberperformance",
  "users",
];

const SuperAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(
    "https://placehold.co/24x24/CCCCCC/333333?text=User"
  );

  const dropdownRef = useRef(null);

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const toggleDropdown = useCallback(
    () => setIsDropdownOpen((prev) => !prev),
    []
  );

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      const loggedInMemberString = localStorage.getItem("loggedInMember");
      let memberRollNo = null;

      if (loggedInMemberString) {
        try {
          const parsedMember = JSON.parse(loggedInMemberString);
          memberRollNo = parsedMember?.roll_no;
        } catch (err) {
          console.error(
            "Failed to parse loggedInMember from localStorage:",
            err
          );
        }
      }

      if (memberRollNo) {
        const extensions = ["png", "jpg", "jpeg", "webp", "ico"];
        for (const ext of extensions) {
          const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${memberRollNo}.${ext}`;
          if (await checkImageExists(url)) {
            setProfileImageUrl(url);
            return;
          }
        }
      }

      setProfileImageUrl("https://placehold.co/24x24/CCCCCC/333333?text=User");
    };

    loadImage();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Simplified and more declarative rendering logic
  const ActiveComponent = navItems[activeTab]?.component || (
    <div
      className="flex items-center justify-center h-full text-xl font-medium p-8 text-center"
      style={{ color: theme.colors.primary }}
    >
      Please select a section from the sidebar to view content.
    </div>
  );

  return (
    <div
      className="min-h-screen flex font-[Inter,sans-serif] antialiased"
      style={{ background: theme.colors.background }}
    >
      <LoadData />
      <aside
        className={`fixed top-0 left-0 h-full w-72 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:shadow-md md:z-auto`}
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
          {navItemsOrder.map((key) => {
            const item = navItems[key];
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-opacity-75 border-b-2 border-transparent
                  ${activeTab === key ? "shadow-md" : ""}`}
                style={{
                  backgroundColor:
                    activeTab === key ? theme.colors.primary : "transparent",
                  color:
                    activeTab === key
                      ? theme.colors.neutralLight
                      : theme.colors.primary,
                  fontWeight: activeTab === key ? "semibold" : "normal",
                  boxShadow:
                    activeTab === key ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
                  "--tw-ring-color": theme.colors.primaryLight,
                  borderColor:
                    activeTab === key
                      ? theme.colors.primaryLight
                      : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== key) {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.primaryLight;
                    e.currentTarget.style.color = theme.colors.neutralDark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== key) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.colors.primary;
                  }
                }}
                aria-current={activeTab === key ? "page" : undefined}
                aria-label={item.name}
              >
                {item.icon}
                <span className="text-base">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

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
            <span className="sr-only">Super Admin Dashboard</span>
            Super Admin
          </h1>
          <div ref={dropdownRef} className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full transition-all duration-200 hover:shadow-md focus:outline-none"
              style={{
                background: theme.colors.neutralLight,
                border: `1px solid ${theme.colors.border}`,
              }}
              aria-label="User profile menu"
            >
              <img
                src={profileImageUrl}
                alt="User Profile"
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: `1px solid ${theme.colors.borderLight}` }}
              />
              <svg
                className="w-4 h-4 transition-transform duration-200"
                style={{
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: theme.colors.iconLight,
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10"
                style={{
                  background: theme.colors.neutralLight,
                  border: `1px solid ${theme.colors.tertiaryLight}`,
                }}
              >
                {/* My Profile */}
              <NavLink
                to="/members"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                style={{ color: theme.colors.primary }}
                onClick={() => setIsDropdownOpen(false)}
              >
                <PersonOutlineIcon fontSize="small" />
                My Profile
              </NavLink>

              {/* All Members */}
              <NavLink
                to="/members"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                style={{ color: theme.colors.primary }}
                onClick={() => setIsDropdownOpen(false)}
              >
                👥 All Members
              </NavLink>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Sign Out */}
              <NavLink
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-100 hover:pl-5"
                style={{ color: theme.colors.danger }}
                onClick={() => {
                  localStorage.removeItem("loggedInMember");
                  setIsDropdownOpen(false);
                }}
              >
                <LogoutIcon fontSize="small" />
                Sign Out
              </NavLink>
              </div>
            )}
          </div>
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

        <main
          className="mt-16 pb-12 md:mt-0 overflow-auto"
          style={{ width: "100vw" }}
        >
          {ActiveComponent}
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin;
