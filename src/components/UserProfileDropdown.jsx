import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { theme } from "../theme";

const { colors, fonts } = theme;

function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    localStorage.clear();    
    sessionStorage.clear();     
    navigate('/')
    // window.location.reload();   
  };

  return (
    <div className="flex items-center justify-end" style={{ fontFamily: fonts.body }}>
      <div className="relative" ref={dropdownRef}>
        {/* User Icon Button with Down Arrow */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary cursor-pointer"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="User menu"
          style={{ color: colors.neutralDark }}
          type="button"
        >
          <User size={24} />
          <ChevronDown size={20} className={`${isOpen ? "rotate-180" : "rotate-0"} transition-transform`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-md shadow-lg py-2 z-50 ring-1 ring-black ring-opacity-5"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.neutralLight}` }}
          >
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive ? "bg-primaryLight text-primary" : "text-neutralDark"
                }`
              }
              style={{ fontFamily: fonts.body }}
            >
              <User size={18} color={colors.primary} />
              My Profile
            </NavLink>

            <button
              onClick={handleLogout}
              role="menuitem"
              className="flex items-center gap-3 w-full text-left px-5 py-2 text-sm font-medium rounded-md transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
              style={{
                color: colors.accent,
                fontFamily: fonts.body,
              }}
            >
              <LogOut size={18} color={colors.accent} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfileDropdown;
