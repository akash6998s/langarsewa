import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { theme } from "../theme";

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
    alert("You cannot change the status of this Roll Number");
    return;
  }

  let confirmMsg = "";

  if (newStatus === "approved") {
    confirmMsg = "Are you sure you want to approve this user?";
  } else if (newStatus === "reject") {
    confirmMsg = "Are you sure you want to reject this user?";
  } else if (newStatus === "delete") {
    confirmMsg = "Are you sure you want to permanently delete this user?";
  }

  if (!window.confirm(confirmMsg)) return;

  try {
    let url = "https://langarsewa-db.onrender.com/signup/update-status";
    let payload = { rollNumber, status: newStatus };

    if (newStatus === "delete") {
      url = "https://langarsewa-db.onrender.com/signup/delete-user";
      payload = { rollNumber };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update status");
    }

    setRefreshTrigger((prev) => prev + 1);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};


  const handleAdminChange = async (rollNumber, isAdmin) => {
  if (rollNumber == 8) {
    alert("You cannot change the status of this Roll Number");
    return;
  }

  const confirmMsg = isAdmin
    ? "Are you sure you want to make this user an admin?"
    : "Are you sure you want to remove this user from admin status?";

  if (!window.confirm(confirmMsg)) return;

  try {
    const response = await fetch("https://langarsewa-db.onrender.com/signup/update-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rollNumber, admin: isAdmin }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update admin");
    }

    setRefreshTrigger((prev) => prev + 1);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};


  const getStatusColors = (status) => {
    switch (status) {
      case "approved":
        return { bg: theme.colors.secondary, text: theme.colors.background };
      case "pending":
        return { bg: theme.colors.primary, text: theme.colors.background };
      case "reject":
        return { bg: theme.colors.accent, text: theme.colors.background };
      default:
        return { bg: theme.colors.background, text: theme.colors.neutralDark };
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
      className="min-h-screen mt-8 px-2"
      style={{
        fontFamily: theme.fonts.body,
        backgroundColor: theme.colors.background,
        color: theme.colors.neutralDark,
      }}
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
      <div className="flex justify-center mb-8 rounded-lg shadow-sm max-w-md mx-auto border-2 border-yellow-400 bg-white">
        {["pending", "approved", "reject"].map((tab) => (
          <button
            key={tab}
            className="w-1/3 py-3 font-semibold transition-colors duration-300 text-center"
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor:
                activeTab === tab ? theme.colors.primary : "transparent",
              color:
                activeTab === tab
                  ? theme.colors.background
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

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-300 shadow-lg bg-white">
        <table className="min-w-full border-collapse">
          <thead
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
              fontFamily: theme.fonts.heading,
            }}
          >
            <tr>
              <th className="text-left px-10 py-5">Roll No.</th>
              <th className="text-left px-10 py-5">Email</th>
              <th className="text-left px-10 py-5">Status</th>
              {activeTab === "approved" && (
                <th className="text-left px-10 py-5">Admin</th>
              )}
              <th className="text-left px-10 py-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-500 italic">
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
                    }`}
                    // onMouseEnter={(e) =>
                    //   (e.currentTarget.style.backgroundColor = theme.colors.primaryLight)
                    // }
                    // onMouseLeave={(e) =>
                    //   (e.currentTarget.style.backgroundColor =
                    //     idx % 2 === 0 ? "#F9FAFB" : "#FFFFFF")
                    // }
                  >
                    <td className="px-10 py-5 font-medium">{user.rollNumber}</td>
                    <td className="px-10 py-5 truncate max-w-xs">{user.email}</td>
                    <td className="px-10 py-5">
                      <span
                        className="px-5 py-1 rounded-full font-semibold text-sm select-none"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    {activeTab === "approved" && (
                      <td className="px-10 py-5">
                        {user.rollNumber === "8" || user.rollNumber === 8 ? (
                          // <span className="italic text-gray-500">Locked</span>
                          <select
                          disabled
                            value={user.isAdmin ? "yes" : "no"}
                            onChange={(e) =>
                              handleAdminChange(user.rollNumber, e.target.value === "yes")
                            }
                            className="border border-gray-300 px-3 py-1 rounded-md"
                          >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        ) : (
                          <select
                            value={user.isAdmin ? "yes" : "no"}
                            onChange={(e) =>
                              handleAdminChange(user.rollNumber, e.target.value === "yes")
                            }
                            className="border border-gray-300 px-3 py-1 rounded-md"
                          >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        )}
                      </td>
                    )}

                    <td className="px-10 py-5">
                      <div className="flex flex-wrap gap-4 justify-start sm:justify-center">
                        {status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(user.rollNumber, "approved")}
                              className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg hover:brightness-110 active:scale-95"
                              style={{ backgroundColor: theme.colors.secondary }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(user.rollNumber, "reject")}
                              className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg hover:brightness-110 active:scale-95"
                              style={{ backgroundColor: theme.colors.accent }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {status === "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(user.rollNumber, "reject")}
                            className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg hover:brightness-110 active:scale-95"
                            style={{ backgroundColor: theme.colors.accent }}
                          >
                            Reject
                          </button>
                        )}
                        {status === "reject" && (
                          <button
                            onClick={() => handleUpdateStatus(user.rollNumber, "delete")}
                            className="rounded-lg px-5 py-2 font-semibold text-white shadow-lg hover:brightness-110 active:scale-95"
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
  );
};

export default UsersList;
