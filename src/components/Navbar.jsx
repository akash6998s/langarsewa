import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Activity,
  MoreHorizontal,
  ClipboardList,
  DollarSign,
  Receipt,
  Wallet,
  LayoutDashboard,
  UsersRound,
  CircleUser,
  UserCog,
} from "lucide-react";
import UserProfileDropdown from "./UserProfileDropdown";
import { theme } from ".././theme";

function Navbar() {
  const [showMore, setShowMore] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const moreRef = useRef();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin");
    setIsAdmin(adminFlag === "true");
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { colors, fonts } = theme;

  const baseNavStyle = {
    fontFamily: fonts.body,
    color: colors.neutralDark,
    fontWeight: 400,
    transition: "color 0.2s ease",
    cursor: "pointer",
  };

  const activeNavStyle = {
    color: colors.primary,
    fontWeight: 600,
  };

  return (
    <>
      {/* Top branding */}
      <div className="w-full z-[101] md:hidden" style={{ fontFamily: fonts.body }}>
        <div className="flex items-center justify-end px-4 py-2 md:px-6 md:py-3">
          <UserProfileDropdown />
        </div>
      </div>

      {/* Navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 shadow-md z-[100] md:static md:shadow-none md:px-6 md:py-3 md:flex md:items-center md:justify-end"
        style={{ backgroundColor: colors.background, fontFamily: fonts.body }}
      >
        <ul className="flex justify-around md:justify-end md:gap-10 p-2 text-sm relative md:p-0 md:flex-grow-0">
          {/* Main nav items */}
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
                    className="flex flex-col items-center"
                    style={{
                      ...baseNavStyle,
                      ...(isActive ? activeNavStyle : {}),
                    }}
                  >
                    {icon}
                    <span className="text-xs">{label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}

          {/* Admin "More" menu - shown only if isAdmin is true */}
          {isAdmin && (
            <li ref={moreRef} className="relative flex flex-col items-center">
              {showMore && (
                <ul
                  id="more-menu"
                  className="absolute mr-16 bottom-full mb-2 flex flex-col bg-white border border-gray-200 rounded shadow-md md:top-full md:mt-2 md:mb-0 md:right-0 md:left-auto"
                  style={{ fontFamily: fonts.body }}
                >
                  {[
                    { to: "/userslist", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
                    { to: "/managemembers", icon: <UserCog size={16} />, label: "Members" },
                    { to: "/manageattendance", icon: <ClipboardList size={16} />, label: "Attendance" },
                    { to: "/managedonation", icon: <DollarSign size={16} />, label: "Donation" },
                    { to: "/manageexpense", icon: <Receipt size={16} />, label: "Expense" },
                    { to: "/managefinance", icon: <Wallet size={16} />, label: "Finance" },
                  ].map(({ to, icon, label }) => (
                    <li key={to}>
                      <NavLink to={to}>
                        {({ isActive }) => (
                          <div
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => setShowMore(false)}
                            style={{
                              ...baseNavStyle,
                              ...(isActive ? activeNavStyle : {}),
                            }}
                          >
                            {icon}
                            {label}
                          </div>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => setShowMore((prev) => !prev)}
                className="flex flex-col items-center focus:outline-none cursor-pointer"
                aria-expanded={showMore}
                aria-controls="more-menu"
                style={{ ...baseNavStyle, color: colors.primary }}
              >
                <MoreHorizontal size={20} />
                <span className="text-xs">More</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
