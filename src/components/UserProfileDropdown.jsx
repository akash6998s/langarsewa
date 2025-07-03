import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { theme } from "../theme";

const { colors, fonts } = theme;

function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div
      className="flex items-center justify-end"
      style={{ fontFamily: fonts.body }}
    >
      <div className="relative" ref={dropdownRef}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm"
          style={{
            backgroundColor: colors.neutralLight,
            color: colors.neutralDark,
            border: `1px solid ${colors.primaryLight}`,
          }}
        >
          <User size={20} />
          <ChevronDown
            size={18}
            className={`transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-3xl shadow-2xl border z-50 overflow-hidden"
            style={{
              backgroundColor: colors.neutralLight,
              borderColor: colors.primaryLight,
              fontFamily: fonts.body,
            }}
          >
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-all ${
                  isActive
                    ? "font-semibold"
                    : "hover:bg-[rgba(0,0,0,0.03)]"
                }`
              }
              style={{
                color: colors.primary,
              }}
            >
              <User size={18} />
              <span>My Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-5 py-3 text-sm transition-all hover:brightness-105"
              style={{
                color: colors.danger,
                backgroundColor: "transparent",
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfileDropdown;
