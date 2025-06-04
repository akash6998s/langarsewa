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
          text: theme.colors.secondary,
        };
      case "pending":
        return {
          bg: theme.colors.primaryLight,
          text: theme.colors.primary,
        };
      case "reject":
        return {
          bg: theme.colors.accent + "33", // add transparency
          text: theme.colors.accent,
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
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: theme.colors.accent + "22" }}
      >
        <p
          className="text-lg font-semibold"
          style={{ color: theme.colors.accent, fontFamily: theme.fonts.body }}
        >
          Error: {error}
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: theme.colors.background, fontFamily: theme.fonts.body }}
    >
      <div
        className="max-w-[1400px] mx-auto rounded-3xl p-8 shadow-xl"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <h2
          className="text-4xl font-extrabold mb-8 text-center"
          style={{ fontFamily: theme.fonts.heading, color: theme.colors.primary }}
        >
          User Management Dashboard
        </h2>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-10 flex-wrap">
          {["pending", "approved", "reject"].map((tab) => {
            const isActive = activeTab === tab;
            const colors = {
              pending: theme.colors.primary,
              approved: theme.colors.secondary,
              reject: theme.colors.accent,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition duration-300 shadow-md`}
                style={{
                  backgroundColor: isActive ? colors[tab] : theme.colors.neutralLight,
                  color: isActive ? theme.colors.surface : theme.colors.neutralDark,
                  boxShadow: isActive
                    ? `0 4px 12px ${colors[tab]}88`
                    : "0 2px 6px #00000015",
                  fontFamily: theme.fonts.heading,
                  textTransform: "capitalize",
                  minWidth: 100,
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-gray-300 shadow-sm">
          <table className="min-w-full border-collapse">
            <thead
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.surface,
                fontFamily: theme.fonts.heading,
              }}
            >
              <tr>
                {["Roll Number", "Email", "Status", "Actions"].map((head) => (
                  <th
                    key={head}
                    className="text-left px-8 py-4 tracking-wide select-none"
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
                    className="py-12 text-center text-gray-500 italic"
                    style={{ fontFamily: theme.fonts.body }}
                  >
                    No users found for this status.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = (user.status || "pending").toLowerCase();
                  const { bg, text } = getStatusColors(status);

                  return (
                    <tr
                      key={user.rollNumber}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-8 py-4 font-medium" style={{ color: theme.colors.neutralDark }}>
                        {user.rollNumber}
                      </td>
                      <td className="px-8 py-4 text-gray-700" style={{ fontFamily: theme.fonts.body }}>
                        {user.email}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          style={{
                            backgroundColor: bg,
                            color: text,
                            fontFamily: theme.fonts.body,
                          }}
                          className="px-4 py-1 rounded-full font-semibold text-xs select-none"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-wrap gap-3">
                          {status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(user.rollNumber, "approved")
                                }
                                className="rounded-lg px-4 py-2 font-semibold text-white shadow-md transition hover:brightness-110"
                                style={{ backgroundColor: theme.colors.secondary }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(user.rollNumber, "reject")
                                }
                                className="rounded-lg px-4 py-2 font-semibold text-white shadow-md transition hover:brightness-110"
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
                              className="rounded-lg px-4 py-2 font-semibold text-white shadow-md transition hover:brightness-110"
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
                              className="rounded-lg px-4 py-2 font-semibold text-white shadow-md transition hover:brightness-110"
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
