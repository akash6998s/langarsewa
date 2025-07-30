import React from "react";
import { NavLink } from "react-router-dom";
import { theme } from "../theme"; // Import the theme

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
  // Check if loggedInMember exists and has isAdmin property set to true
  const isSuperAdmin = loggedInMember?.isAdmin === true;

  // Conditionally add the Admin link if the user is a super admin
  const fullNavItems = isSuperAdmin
    ? [...navItems, { name: "Admin", path: "/superadmin", icon: <AdminPanelSettingsIcon /> }]
    : navItems;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 shadow-xl z-50"
      style={{
        backgroundColor: theme.colors.neutralLight,
        borderTop: `1px solid ${theme.colors.primaryLight}`,
        fontFamily: theme.fonts.body,
      }}
    >
      <div className="flex justify-around items-center h-[10vh] max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {fullNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all duration-300 ease-in-out
               focus:outline-none focus:ring-2 focus:ring-offset-2 group
               ${isActive ? 'active' : ''}` // Add 'active' class for easier targeting in onMouseEnter/onMouseLeave
            }
            style={({ isActive }) => ({
              // Active styles: change color, keep background transparent
              color: isActive ? theme.colors.tertiary : theme.colors.primary,
              backgroundColor: "transparent", // Always transparent as requested
              boxShadow: "none", // No shadow for active either
              transform: isActive ? "scale(1.05)" : "none",
              // Set the Tailwind ring color variable for focus state
              "--tw-ring-color": theme.colors.primaryLight,
            })}
            onMouseEnter={(e) => {
              // Apply hover styles only if the link is NOT active
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.color = theme.colors.neutralDark; // Darker text on hover for inactive
              }
            }}
            onMouseLeave={(e) => {
              // Revert hover styles only if the link is NOT active
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.color = theme.colors.primary; // Revert to primary text color
              }
            }}
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