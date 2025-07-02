    import React, { useEffect, useState } from "react";
    import Loader from "./Loader";
    import Popup from "./Popup";

    const API_URL = "https://langar-backend.onrender.com";

    function UserStatus() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState({ message: "", type: "" });

    // ✅ Fetch user status data
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

    // ✅ Popup helper
    const showPopup = (message, type) => {
        setPopup({ message, type });
        setTimeout(() => {
        setPopup({ message: "", type: "" });
        }, 3000);
    };

    // ✅ Approve or Delete User
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
        <div className="bg-gradient-to-br from-[#fefcea] via-[#f8e1c1] to-[#fbd6c1] text-[#4e342e] font-serif min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-5xl font-bold text-center mb-10 text-[#7b341e] tracking-wide drop-shadow-md">
            Manage User Requests
            </h1>

            {users.length === 0 ? (
            <p className="text-center text-xl">No pending users.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full bg-white/90 rounded-3xl shadow-2xl border border-yellow-100 backdrop-blur-md">
                <thead className="bg-[#4caf50] text-white">
                    <tr>
                    <th className="py-4 px-6">Roll Number</th>
                    <th className="py-4 px-6">Login ID</th>
                    <th className="py-4 px-6">Password</th>
                    <th className="py-4 px-6">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, idx) => (
                    <tr
                        key={idx}
                        className="hover:bg-green-50 border-b border-gray-200"
                    >
                        <td className="py-4 px-6 text-center">{user.RollNumber}</td>
                        <td className="py-4 px-6 text-center">{user.loginId}</td>
                        <td className="py-4 px-6 text-center">{user.password}</td>
                        <td className="py-4 px-6 flex gap-4 justify-center">
                        <button
                            onClick={() =>
                            handleAction(user.RollNumber, "approve")
                            }
                            className="px-5 py-2 rounded-full bg-[#4caf50] hover:bg-[#43a047] text-white font-medium shadow-md transition"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() =>
                            handleAction(user.RollNumber, "delete")
                            }
                            className="px-5 py-2 rounded-full bg-[#e53935] hover:bg-[#d32f2f] text-white font-medium shadow-md transition"
                        >
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
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
