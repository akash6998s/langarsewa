import React, { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Logout functionality
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear();       // Clear all local storage
    sessionStorage.clear();     // Clear all session storage
    setIsOpen(false);           // Close the dropdown
    window.location.reload();   // Refresh the page
  };

  return (
    <div className="flex items-end justify-end mb-6">
      <div className="relative" ref={dropdownRef}>
        {/* User Icon Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="User menu"
        >
          <User size={24} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                  isActive ? "bg-gray-50" : ""
                }`
              }
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              My Profile
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              role="menuitem"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfileDropdown;
