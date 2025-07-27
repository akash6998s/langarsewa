import React from "react";
import { NavLink } from "react-router-dom";

// Import MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const navItems = [
  { name: "Home", path: "/home", icon: <HomeIcon /> },
  { name: "Activity", path: "/activity", icon: <InsightsIcon /> },
  { name: "Members", path: "/members", icon: <GroupIcon /> },
  { name: "Profile", path: "/profile", icon: <PersonIcon /> },
];

const Header = () => {
  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const isSuperAdmin = loggedInMember?.isAdmin === true;

  const fullNavItems = isSuperAdmin
    ? [...navItems, { name: "Admin", path: "/superadmin", icon: <AdminPanelSettingsIcon /> }]
    : navItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50">
      <div className="flex justify-around items-center h-[10vh] max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {fullNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all duration-300 ease-in-out
               ${isActive
                  ? "text-blue-700 bg-blue-50 shadow-md transform scale-105"
                  : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 group`
            }
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </div>
            <span className="text-xs font-medium tracking-wide">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Header;
