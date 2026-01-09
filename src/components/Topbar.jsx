import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { theme } from "../theme";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupIcon from "@mui/icons-material/Group";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CachedIcon from "@mui/icons-material/Cached";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CreateIcon from "@mui/icons-material/Create";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import logo from "/logo.png";

function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState(
    "https://placehold.co/40x40/CCCCCC/333333?text=U"
  );
  const [userName, setUserName] = useState("Member");
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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
      setProfileImageUrl("https://placehold.co/40x40/CCCCCC/333333?text=U");
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-14 px-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="LangarSewa Logo"
            className="h-10 w-10 object-contain"
          />
          <span
            className="font-bold text-lg hidden sm:inline"
            style={{ color: theme.colors.primary }}
          >
            LangarSewa
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Create Post */}
          <button
            onClick={() => navigate("/createpost")}
            className="flex items-center gap-1 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.neutralLight,
            }}
          >
            <CreateIcon fontSize="small" />
            <span className="text-sm font-semibold">Post</span>
          </button>

          {/* Gallery */}
          <button
            onClick={() => navigate("/gallery")}
            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
            style={{ color: theme.colors.primary }}
          >
            <PhotoLibraryIcon fontSize="small" />
            <span className="text-sm font-medium">Gallery</span>
          </button>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1 sm:gap-2 p-1 rounded-full hover:bg-gray-100"
            >
              <img
                src={profileImageUrl}
                alt="User"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border"
                style={{ borderColor: theme.colors.tertiaryLight }}
              />
              <span
                className="hidden md:inline text-sm font-medium"
                style={{ color: theme.colors.primary }}
              >
                {userName}
              </span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
                className="absolute right-0 mt-3 w-60 rounded-xl shadow-2xl z-[10000] p-3 transition-all duration-200"
                style={{
                  background: theme.colors.neutralLight,
                  border: `1px solid ${theme.colors.tertiaryLight}`,
                }}
              >
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                  style={{ color: theme.colors.primary }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <AccountCircle fontSize="small" />
                  Your Profile
                </NavLink>

                {/* <NavLink
                  to="/inchargelist"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100"
                  style={{ color: theme.colors.primary }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <ManageAccountsIcon fontSize="small" /> Incharge List
                </NavLink> */}

                <NavLink
                  to="/members"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                  style={{ color: theme.colors.primary }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <GroupIcon fontSize="small" />
                  All Members
                </NavLink>

                <NavLink
                  to="/updatedlist"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                  style={{ color: theme.colors.primary }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <ListAltIcon fontSize="small" />
                  Updated Details
                </NavLink>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                  style={{ color: theme.colors.primary }}
                >
                  <CachedIcon fontSize="small" />
                  Reload
                </button>

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
    </div>
  );
}

export default Topbar;
