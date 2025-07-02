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
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        color: theme.colors.neutralDark,
      }}
    >
      <div className="mx-auto px-4 pt-4 max-w-4xl pb-20">
        <h1
          className="text-4xl font-extrabold text-center mb-10 drop-shadow-md"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.fonts.heading,
          }}
        >
          Dashboard
        </h1>

        {users.length === 0 ? (
          <p className="text-center text-xl font-medium">
            No pending user requests.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user, idx) => (
              <div
                key={idx}
                className="rounded-3xl shadow-xl border p-6 flex flex-col justify-between"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primaryLight,
                }}
              >
                {/* User Info */}
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-semibold text-lg">
                      {user.RollNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Login ID</p>
                    <p className="font-semibold text-lg">{user.loginId}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAction(user.RollNumber, "approve")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold shadow-md hover:brightness-110 active:scale-95"
                    style={{
                      backgroundColor: theme.colors.secondary,
                      color: theme.colors.background,
                    }}
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(user.RollNumber, "delete")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold shadow-md hover:brightness-110 active:scale-95"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.background,
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
