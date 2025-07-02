import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Activity,
  UsersRound,
  CircleUser,
  ShieldCheck,
} from "lucide-react";
import UserProfileDropdown from "./UserProfileDropdown";
import { theme } from "../theme";

function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin");
    setIsAdmin(adminFlag === "true");
  }, []);

  const { colors, fonts } = theme;

  const baseNavStyle = {
    fontFamily: fonts.body,
    color: colors.neutralDark,
    fontWeight: 500,
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const activeNavStyle = {
    color: colors.primary,
    fontWeight: 700,
  };

  return (
    <>
      {/* Top Right Profile on mobile (hide in superadmin) */}
      {location.pathname !== "/superadmin" && (
        <div
          className="w-full z-[101] md:hidden"
          style={{ fontFamily: fonts.body }}
        >
          <div className="flex items-center justify-end px-4 py-2">
            <UserProfileDropdown />
          </div>
        </div>
      )}

      {/* Bottom Navbar */}
      <nav
        className="fixed bottom-0 left-0 right-0 shadow-lg z-[100] md:static md:shadow-none md:px-6 md:py-3 md:flex md:items-center md:justify-end"
        style={{
          backgroundColor: colors.background,
          fontFamily: fonts.body,
          borderTop: `1px solid ${colors.primaryLight}`,
        }}
      >
        <ul className="flex justify-around md:justify-end md:gap-10 p-2 md:p-0">
          {/* Normal Nav Items */}
          {[
            { to: "/home", icon: <Home size={20} />, label: "Home" },
            { to: "/activity", icon: <Activity size={20} />, label: "Activity" },
            { to: "/allmember", icon: <UsersRound size={20} />, label: "All Members" },
            { to: "/profile", icon: <CircleUser size={20} />, label: "Profile" },
          ].map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink to={to}>
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-gray-100 md:hover:bg-transparent"
                    style={{
                      ...baseNavStyle,
                      ...(isActive ? activeNavStyle : {}),
                    }}
                  >
                    {icon}
                    <span className="text-[11px] md:text-xs">{label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}

          {/* Super Admin Nav */}
          {isAdmin && (
            <li>
              <NavLink to="/superadmin">
                {({ isActive }) => (
                  <div
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-gray-100 md:hover:bg-transparent"
                    style={{
                      ...baseNavStyle,
                      ...(isActive ? activeNavStyle : {}),
                    }}
                  >
                    <ShieldCheck size={20} />
                    <span className="text-[11px] md:text-xs">SuperAdmin</span>
                  </div>
                )}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
