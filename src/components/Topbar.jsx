import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiRefreshCcw } from "react-icons/fi";
import { theme } from "../theme";

function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState(
    "https://placehold.co/24x24/CCCCCC/333333?text=User"
  );

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

  return (
    <div className="w-full flex justify-end items-center px-2">
      {/* Reload Icon Button */}
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform duration-200 transform hover:scale-105"
        style={{
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
        }}
      >
        Reload
      </button>

      {/* Profile Dropdown */}
      <div ref={dropdownRef} className="ml-4 relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full transition-all duration-200 hover:shadow-md focus:outline-none"
          style={{
            background: theme.colors.neutralLight,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <img
            src={profileImageUrl}
            alt="User Profile"
            className="w-8 h-8 rounded-full object-cover"
            style={{
              border: `1px solid ${theme.colors.borderLight}`,
            }}
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
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
            style={{
              background: theme.colors.neutralLight,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <NavLink
              to="/members"
              className="block px-4 py-2 text-sm hover:bg-opacity-10"
              style={{
                color: theme.colors.text,
                backgroundColor: "transparent",
              }}
              onClick={() => setIsDropdownOpen(false)}
            >
              Member
            </NavLink>
            <NavLink
              to="/"
              className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-10"
              style={{
                color: theme.colors.text,
                backgroundColor: "transparent",
              }}
            >
              Sign Out
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;
