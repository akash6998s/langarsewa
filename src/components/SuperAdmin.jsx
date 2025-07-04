import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { theme } from "../theme";
import ManageAttendance from "./ManageAttendance";
import ManageDonation from "./ManageDonation";
import ManageExpense from "./ManageExpense";
import ManageFinance from "./ManageFinance";
import ManageMembers from "./ManageMembers";
import MembersActivity from "./MembersActivity";
import UserProfileDropdown from "./UserProfileDropdown";
import UserStatus from "./UserStatus";

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState("manageattendance");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const rollNumber = localStorage.getItem("rollNumber");
        if (!rollNumber) return;

        const response = await fetch(
          `https://langar-backend.onrender.com/api/members/${rollNumber}`
        );
        const data = await response.json();

        if (data && data.member) {
          setAdminData({
            name: data.member.Name + " " + (data.member.LastName || ""),
            profileImage: data.member.Photo
              ? `https://langar-backend.onrender.com/uploads/${data.member.Photo}`
              : "",
          });
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "manageattendance":
        return <ManageAttendance />;
      case "managedonation":
        return <ManageDonation />;
      case "manageexpense":
        return <ManageExpense />;
      case "managefinance":
        return <ManageFinance />;
      case "manageuser":
        return <UserStatus />;
      case "managemember":
        return <ManageMembers />;
        case "membersactivity":
        return <MembersActivity />;
      default:
        return <ManageAttendance />;
    }
  };

  const menuItems = [
    { name: "Manage Attendance", id: "manageattendance" },
    { name: "Manage Donation", id: "managedonation" },
    { name: "Manage Member", id: "managemember" },
    { name: "Manage Expense", id: "manageexpense" },
    { name: "Manage Finance", id: "managefinance" },
    { name: "Manage User", id: "manageuser" },
    { name: "Members Activity", id: "membersactivity" },
  ];

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: theme.colors.neutralLight,
        color: theme.colors.neutralDark,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Sidebar */}
      <div
        className={`w-72 absolute md:relative z-20 h-screen shadow-2xl rounded-r-3xl transition-transform duration-300 flex-shrink-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          backgroundColor: theme.colors.neutralLight,
          borderRight: `3px solid ${theme.colors.primary}`,
        }}
      >
        <div className="flex flex-col h-full overflow-hidden p-4">
          {/* Close Icon */}
          <div className="flex justify-end md:hidden mb-4">
            <FaTimes
              className="text-3xl cursor-pointer hover:opacity-80"
              onClick={() => setIsMenuOpen(false)}
              style={{ color: theme.colors.primary }}
            />
          </div>

          {/* Top - Admin Info */}
          {adminData && (
            <div className="flex flex-col items-center mb-4">
              <img
                src={
                  adminData.profileImage ||
                  "https://via.placeholder.com/150?text=No+Image"
                }
                alt="Admin"
                className="w-20 h-20 rounded-full border-4 object-cover shadow-md"
                style={{ borderColor: theme.colors.primary }}
              />
              <h2
                className="text-base font-bold text-center mt-2"
                style={{ color: theme.colors.primary }}
              >
                {adminData.name}
              </h2>
            </div>
          )}

          {/* Divider */}
          <hr
            className="mb-4 border-t"
            style={{ borderColor: theme.colors.primaryLight }}
          />

          {/* Sidebar Menu */}
          <div className="flex-1 overflow-hidden">
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium cursor-pointer transition-all duration-200 ${
                      isActive ? "shadow-md scale-[1.02]" : "hover:scale-[1.01]"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? theme.colors.primary
                        : "transparent",
                      color: isActive ? "#ffffff" : theme.colors.primary,
                      border: isActive
                        ? `1px solid ${theme.colors.primaryLight}`
                        : `1px solid transparent`,
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center p-5">
          {!isMenuOpen && (
            <FaBars
              className="text-3xl cursor-pointer hover:opacity-80 md:hidden"
              onClick={() => setIsMenuOpen(true)}
              style={{ color: theme.colors.primary }}
            />
          )}
          <div className="ml-auto">
            <UserProfileDropdown />
          </div>
        </div>

        {/* Page Content */}
        <div className="px-4" style={{ minHeight: "calc(100vh - 120px)" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
