import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { theme } from "../theme";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Import MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import InsightsIcon from "@mui/icons-material/Insights";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const navItems = [
  { name: "Home", path: "/home", icon: <HomeIcon /> },
  // { name: "Activity", path: "/activity", icon: <InsightsIcon /> },
  { name: "Rank", path: "/rank", icon: <MilitaryTechIcon /> },
  { name: "Notification", path: "/notify", icon: <NotificationsIcon /> },
];

const Header = () => {
  const [postCount, setPostCount] = useState(0);

  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const isSuperAdmin = loggedInMember?.isAdmin === true;
  const memberRollNo = loggedInMember?.roll_no;

  // Pehle .png se start karega
  const [imgSrc, setImgSrc] = useState(
    memberRollNo ? `https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${memberRollNo}.png` : ""
  );
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    const postCollectionRef = collection(db, "post");
    const unsubscribe = onSnapshot(
      postCollectionRef,
      (querySnapshot) => {
        setPostCount(querySnapshot.size);
      },
      (error) => {
        console.error("Error fetching post count: ", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleImageError = () => {
    // Sequence: .png -> .jpg -> .jpeg -> others (Icon)
    if (imgSrc.endsWith(".png")) {
      setImgSrc(`https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${memberRollNo}.jpg`);
    } else if (imgSrc.endsWith(".jpg")) {
      setImgSrc(`https://raw.githubusercontent.com/akash6998s/langarsewa/main/src/assets/uploads/${memberRollNo}.jpeg`);
    } else {
      // Agar koi bhi extension kaam nahi aayi
      setShowIcon(true);
    }
  };

  const fullNavItems = isSuperAdmin
    ? [
        ...navItems,
        {
          name: "Admin",
          path: "/superadmin",
          icon: <AdminPanelSettingsIcon />,
        },
      ]
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
              `flex flex-col items-center px-1 py-2 rounded-xl transition-all duration-300 ease-in-out group ${isActive ? "active" : ""}`
            }
            style={({ isActive }) => ({
              color: isActive ? theme.colors.tertiary : theme.colors.primary,
              transform: isActive ? "scale(1.05)" : "none",
            })}
          >
            <div className="text-xl sm:text-2xl mb-1 group-hover:scale-110 transition-transform duration-200 relative">
              {item.icon}
              {item.name === "Notification" && postCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {postCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium tracking-wide">
              {item.name}
            </span>
          </NavLink>
        ))}

        {/* Profile Section Added at the end */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center px-1 py-2 rounded-xl transition-all duration-300 ease-in-out group ${isActive ? "active" : ""}`
          }
          style={({ isActive }) => ({
            color: isActive ? theme.colors.tertiary : theme.colors.primary,
            transform: isActive ? "scale(1.05)" : "none",
          })}
        >
          <div className="text-xl sm:text-2xl mb-1 group-hover:scale-110 transition-transform duration-200 border-2 border-gray-200 rounded-full w-7 h-7 sm:w-8 sm:h-8 overflow-hidden flex items-center justify-center bg-gray-50">
            {memberRollNo && !showIcon ? (
              <img
                src={imgSrc}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <AccountCircleIcon />
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-medium tracking-wide">
            Profile
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default Header;