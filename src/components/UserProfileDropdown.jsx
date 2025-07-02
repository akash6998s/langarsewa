import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { theme } from "../theme";

const { colors, fonts } = theme;

function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click or ESC key
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
        {/* User Icon Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          aria-haspopup="true"
          aria-expanded={isOpen}
          style={{
            color: colors.neutralDark,
            border: `1px solid ${colors.secondary}33`,
            backgroundColor: colors.surface,
          }}
        >
          <User size={22} />
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
            className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border z-50"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.secondary}33`,
              fontFamily: fonts.body,
            }}
          >
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm rounded-2xl transition ${
                  isActive
                    ? "bg-yellow-100 text-yellow-700"
                    : "hover:bg-yellow-50 text-neutral-700"
                }`
              }
              style={{ fontFamily: fonts.body }}
            >
              <User size={18} color={colors.primary} />
              <span>My Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-5 py-3 text-sm rounded-2xl hover:bg-red-50 text-red-700 transition"
              style={{ fontFamily: fonts.body }}
            >
              <LogOut size={18} color={colors.accent} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfileDropdown;
