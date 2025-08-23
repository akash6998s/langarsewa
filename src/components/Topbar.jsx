import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { theme } from "../theme";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";

function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState(
    "https://placehold.co/40x40/CCCCCC/333333?text=User"
  );
  const [userName, setUserName] = useState("Member");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
          if (parsedMember) {
            memberRollNo = parsedMember.roll_no;
            setUserName(parsedMember.name || "Member");
          }
        } catch (err) {
          console.log(err);
        }
      }

      if (memberRollNo !== null) {
        const extensions = ["png", "jpg", "jpeg", "webp", "ico"];
        for (const ext of extensions) {
          const url = `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${memberRollNo}.${ext}`;
          if (await checkImageExists(url)) {
            setProfileImageUrl(url);
            return;
          }
        }
      }
      setProfileImageUrl("https://placehold.co/40x40/CCCCCC/333333?text=User");
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

  return (
 <div
    className="w-full flex justify-between items-center h-16 px-4 py-2 bg-white/80 backdrop-blur-md shadow-lg rounded-xl border border-gray-200 relative z-[9999]"
    style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
  >      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-13 w-auto object-contain"
        />
        <span
          className="font-bold text-lg hidden sm:inline"
          style={{ color: theme.colors.primary }}
        >
          Langar Sewa
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center">
        {/* Reload Icon */}
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-full transition-all duration-300 transform hover:rotate-180 hover:scale-110"
          style={{ backgroundColor: theme.colors.primary }}
          title="Reload Page"
        >
          <RefreshIcon style={{ color: theme.colors.neutralLight }} />
        </button>

        {/* Profile Section */}
        <div ref={dropdownRef} className="ml-4 relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none"
          >
            <div className="relative">
              <img
                src={profileImageUrl}
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover border-2 transition-transform duration-300 hover:scale-105"
                style={{ borderColor: theme.colors.tertiaryLight }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            <span
              className="hidden md:inline font-medium text-sm"
              style={{ color: theme.colors.primary }}
            >
              {userName}
            </span>
            <svg
              className="w-5 h-5 transition-transform duration-200"
              style={{
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                color: theme.colors.primary,
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

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-60 rounded-xl shadow-2xl z-9999 p-3 transition-all duration-200"
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
      </div>
    </div>
  );
}

export default Topbar;
