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
        className="fixed bottom-0 z-50 left-0 right-0 shadow-lg md:static md:shadow-none md:px-6 md:py-3 md:flex md:items-center md:justify-end"
        style={{
          backgroundColor: colors.neutralLight,
          fontFamily: fonts.body,
          borderTop: `1px solid ${colors.primaryLight}`,
        }}
      >
        <ul className="flex justify-around md:justify-end md:gap-10 p-2 md:p-0">
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
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive
                        ? colors.secondaryLight
                        : "transparent",
                      color: isActive ? colors.primary : colors.neutralDark,
                      fontWeight: isActive ? "700" : "500",
                      fontFamily: fonts.body,
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
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive
                        ? colors.secondaryLight
                        : "transparent",
                      color: isActive ? colors.primary : colors.neutralDark,
                      fontWeight: isActive ? "700" : "500",
                      fontFamily: fonts.body,
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
