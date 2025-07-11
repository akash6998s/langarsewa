import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import Popup from "./Popup";
import { Check, X } from "lucide-react";
import { theme } from "../theme";

const API_URL = "https://langar-backend.onrender.com";

function UserStatus() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/user-status`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        showPopup("Failed to fetch users", "error");
      }
    } catch (err) {
      console.error(err);
      showPopup("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  const handleAction = async (rollNumber, action) => {
    const confirm = window.confirm(
      `Are you sure you want to ${action} this user?`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, action }),
      });
      const data = await res.json();

      if (data.success) {
        showPopup(data.message, "success");
        fetchUsers();
      } else {
        showPopup(data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showPopup("Error performing action", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      <div className="mx-auto px-4 pt-4 max-w-4xl pb-20">
        <div className="flex justify-center">
          <h1
            className="text-3xl md:text-5xl font-extrabold text-center mb-12 tracking-wider uppercase drop-shadow-lg relative inline-block"
            style={{ color: theme.colors.primary }}
          >
            Manage Users
            <span
              className="absolute left-1/2 -bottom-2 w-1/2 h-1 rounded-full"
              style={{
                transform: "translateX(-50%)",
                background: `linear-gradient(to right, ${theme.colors.primaryLight}, ${theme.colors.primary})`,
              }}
            />
          </h1>
        </div>

        {users.length === 0 ? (
          <p
            className="text-center text-xl font-medium"
            style={{ color: theme.colors.primary }}
          >
            No pending user requests.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user, idx) => (
              <div
                key={idx}
                className="rounded-3xl shadow-xl border p-6 flex flex-col justify-between"
                style={{
                  backgroundColor: theme.colors.neutralLight,
                  borderColor: theme.colors.primaryLight,
                }}
              >
                {/* User Info */}
                <div className="space-y-3 mb-6">
                  <div>
                    <p
                      style={{
                        color: theme.colors.tertiary,
                        fontSize: "0.875rem",
                      }}
                    >
                      Roll Number
                    </p>
                    <p
                      style={{
                        fontWeight: "600",
                        fontSize: "1.125rem",
                        color: theme.colors.primary,
                      }}
                    >
                      {user.RollNumber}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        color: theme.colors.tertiary,
                        fontSize: "0.875rem",
                      }}
                    >
                      Login ID
                    </p>
                    <p
                      style={{
                        fontWeight: "600",
                        fontSize: "1.125rem",
                        color: theme.colors.primary,
                      }}
                    >
                      {user.loginId}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAction(user.RollNumber, "approve")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold shadow-md hover:brightness-110 active:scale-95"
                    style={{
                      backgroundColor: theme.colors.success,
                      color: theme.colors.neutralLight,
                    }}
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(user.RollNumber, "delete")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold shadow-md hover:brightness-110 active:scale-95"
                    style={{
                      backgroundColor: theme.colors.danger,
                      color: theme.colors.neutralLight,
                    }}
                  >
                    <X size={18} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
}

export default UserStatus;
