import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { theme } from "../theme";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Ensure this path is correct

// Import MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import InsightsIcon from "@mui/icons-material/Insights";
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

const navItems = [
  { name: "Home", path: "/home", icon: <HomeIcon /> },
  { name: "Activity", path: "/activity", icon: <InsightsIcon /> },
  { name: "Rank", path: "/rank", icon: <MilitaryTechIcon /> },
  { name: "Notification", path: "/notify", icon: <NotificationsIcon /> },
];

const Header = () => {
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    // Reference to the 'post' collection in Firestore
    const postCollectionRef = collection(db, "post");

    // Set up a real-time listener
    const unsubscribe = onSnapshot(postCollectionRef, (querySnapshot) => {
      // Update the state with the number of documents
      setPostCount(querySnapshot.size);
    }, (error) => {
      console.error("Error fetching post count: ", error);
    });

    // Cleanup function to detach the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const isSuperAdmin = loggedInMember?.isAdmin === true;

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
      <div className="flex justify-around items-center h-[9vh] max-w-full mx-auto px-2 sm:px-6">
        {fullNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center px-1 py-2 rounded-xl transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 group
                ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => ({
              color: isActive ? theme.colors.tertiary : theme.colors.primary,
              backgroundColor: "transparent",
              boxShadow: "none",
              transform: isActive ? "scale(1.05)" : "none",
              "--tw-ring-color": theme.colors.primaryLight,
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.color = theme.colors.neutralDark;
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.color = theme.colors.primary;
              }
            }}
          >
            <div className="text-xl sm:text-2xl mb-1 group-hover:scale-110 transition-transform duration-200 relative">
              {item.icon}
              {/* Conditionally render the badge only on the Notification icon */}
              {item.name === "Notification" && postCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {postCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium tracking-wide">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Header;