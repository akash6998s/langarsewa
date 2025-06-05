import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { theme } from ".././theme";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://langarsewa-db.onrender.com/signup");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [refreshTrigger]);

  const filteredUsers = users.filter((user) => {
    const userStatus = user.status ? user.status.toLowerCase() : "pending";
    return userStatus === activeTab;
  });

  const handleUpdateStatus = async (rollNumber, newStatus) => {
    if (rollNumber == 8) {
      alert("You can not change the status of this Roll Number");
    } else {
      try {
        const response = await fetch(
          "https://langarsewa-db.onrender.com/signup/update-status",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rollNumber, status: newStatus }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update status");
        }

        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  // Helper to get colors from theme
  const getStatusColors = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: theme.colors.secondaryLight,
          text: theme.colors.surface,
        };
      case "pending":
        return {
          bg: theme.colors.primaryLight,
          text: theme.colors.surface,
        };
      case "reject":
        return {
          bg: theme.colors.accent, // add transparency
          text: theme.colors.surface,
        };
      default:
        return {
          bg: theme.colors.tertiary,
          text: theme.colors.neutralDark,
        };
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div
        className="flex justify-center items-center min-h-screen px-4"
        style={{ backgroundColor: theme.colors.accent + "22" }}
      >
        <p
          className="text-lg font-semibold text-center max-w-md"
          style={{ color: theme.colors.accent, fontFamily: theme.fonts.body }}
        >
          Error: {error}
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen p-6"
      style={{
        fontFamily: theme.fonts.body,
      }}
    >
      <div
        className=""
      >
        <h2
          className="text-4xl font-extrabold mb-12 text-center tracking-tight"
          style={{
            fontFamily: theme.fonts.heading,
            color: theme.colors.primary,
          }}
        >
          User Management Dashboard
        </h2>

        {/* Tabs */}
        <div className="flex justify-center mb-8 rounded-lg shadow-sm bg-white border border-yellow-400 max-w-md mx-auto">
          {["pending", "approved", "reject"].map((tab) => (
            <button
              key={tab}
              className="w-1/3 py-3 font-semibold rounded-lg transition-colors duration-300 text-center"
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor:
                  activeTab === tab ? theme.colors.primary : "transparent",
                color:
                  activeTab === tab
                    ? theme.colors.surface
                    : theme.colors.neutralDark,
                boxShadow:
                  activeTab === tab
                    ? `0 4px 6px -1px ${theme.colors.primaryLight}`
                    : "none",
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-3xl border border-gray-300 shadow-lg">
          <table className="min-w-full border-collapse">
            <thead
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.surface,
                fontFamily: theme.fonts.heading,
              }}
            >
              <tr>
                {["Roll No.", "Email", "Status", "Actions"].map((head) => (
                  <th
                    key={head}
                    className="text-left px-10 py-5 tracking-wide select-none"
                    style={{ userSelect: "none" }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-gray-500 italic"
                    style={{ fontFamily: theme.fonts.body }}
                  >
                    No users found for this status.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const status = (user.status || "pending").toLowerCase();
                  const { bg, text } = getStatusColors(status);

                  return (
                    <tr
                      key={user.rollNumber}
                      className={`transition-colors duration-300 ${
                        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-${theme.colors.primaryLight.replace("#", "")}`}
                      style={{
                        cursor: "default",
                        userSelect: "none",
                        transitionProperty: "background-color",
                      }}
                    >
                      <td
                        className="px-10 py-5 font-medium"
                        style={{ color: theme.colors.neutralDark }}
                      >
                        {user.rollNumber}
                      </td>
                      <td
                        className="px-10 py-5 text-gray-700 truncate max-w-xs"
                        style={{ fontFamily: theme.fonts.body }}
                        title={user.email}
                      >
                        {user.email}
                      </td>
                      <td className="px-10 py-5">
                        <span
                          style={{
                            backgroundColor: bg,
                            color: text,
                            fontFamily: theme.fonts.body,
                          }}
                          className="px-5 py-1 rounded-full font-semibold text-sm select-none"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex flex-wrap gap-4 justify-start sm:justify-center">
                          {status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    user.rollNumber,
                                    "approved"
                                  )
                                }
                                className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:brightness-110 active:scale-95"
                                style={{
                                  backgroundColor: theme.colors.secondary,
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(user.rollNumber, "reject")
                                }
                                className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:brightness-110 active:scale-95"
                                style={{ backgroundColor: theme.colors.accent }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {status === "approved" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(user.rollNumber, "reject")
                              }
                              className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:brightness-110 active:scale-95"
                              style={{ backgroundColor: theme.colors.accent }}
                            >
                              Reject
                            </button>
                          )}
                          {status === "reject" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(user.rollNumber, "delete")
                              }
                              className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:brightness-110 active:scale-95"
                              style={{ backgroundColor: theme.colors.primary }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
