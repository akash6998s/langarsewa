import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./../../components/Loader";
import { theme } from "../../theme";

const API_URL = "https://langar-backend.onrender.com";

const Login = () => {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState(localStorage.getItem("lastLoginId") || "");
  const [password, setPassword] = useState(localStorage.getItem("lastPassword") || "");

  const [signupRollNo, setSignupRollNo] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupLoginId, setSignupLoginId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [members, setMembers] = useState([]);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/members`);
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
        showPopup("Failed to load member data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (signupRollNo && members.length > 0) {
      const selected = members.find(
        (member) => String(member.RollNumber) === String(signupRollNo)
      );
      if (selected) {
        setSignupName(
          `${selected.Name || ""} ${selected.LastName || ""}`.trim()
        );
      } else {
        setSignupName("");
      }
    } else {
      setSignupName("");
    }
  }, [signupRollNo, members]);

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("rollNumber", data.user.rollNumber);
        localStorage.setItem("Name", data.user.Name);
        localStorage.setItem("LastName", data.user.LastName);
        localStorage.setItem("isAdmin", String(data.user.isAdmin));
        localStorage.setItem("isSuperAdmin", String(data.user.isSuperAdmin));

        showPopup("Login successful!", "success");
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        showPopup(data.message || "Invalid credentials.", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      showPopup("Login failed due to server error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!signupRollNo || !signupLoginId || !signupPassword) {
      showPopup("Please fill all fields.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: signupRollNo,
          loginId: signupLoginId,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showPopup("Account created successfully!", "success");
        setIsLoginMode(true);
        setSignupRollNo("");
        setSignupName("");
        setSignupLoginId("");
        setSignupPassword("");
      } else {
        showPopup(data.message || "Signup failed.", "error");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showPopup("Signup failed due to server error.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 font-inter"
      style={{ background: theme.colors.secondaryLight }}
    >
      <div
        className="max-w-md w-full rounded-3xl shadow-xl p-10 sm:p-12 border"
        style={{
          backgroundColor: theme.colors.neutralLight,
          borderColor: theme.colors.secondaryLight,
        }}
      >
        <h2
          className="text-3xl font-extrabold mb-8 text-center tracking-wide"
          style={{ color: theme.colors.primary }}
        >
          {isLoginMode ? "Welcome Back" : "Create Your Account"}
        </h2>

        {isLoginMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full p-4 rounded-lg border placeholder-opacity-60 focus:outline-none focus:ring-4 transition"
              style={{
                borderColor: theme.colors.secondaryLight,
                color: theme.colors.primary,
                backgroundColor: "#fff",
                boxShadow: `0 0 0 0.25rem ${theme.colors.secondaryLight}40`,
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg border placeholder-opacity-60 focus:outline-none focus:ring-4 transition"
              style={{
                borderColor: theme.colors.secondaryLight,
                color: theme.colors.primary,
                backgroundColor: "#fff",
              }}
              required
            />
            <button
              type="submit"
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Login
            </button>
            <p className="text-center text-sm" style={{ color: theme.colors.secondary }}>
              Don’t have an account?{" "}
              <button
                type="button"
                className="font-bold underline"
                style={{ color: theme.colors.primaryLight }}
                onClick={() => setIsLoginMode(false)}
              >
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <select
              value={signupRollNo}
              onChange={(e) => setSignupRollNo(e.target.value)}
              className="w-full p-4 rounded-lg border focus:outline-none focus:ring-4 transition"
              style={{ borderColor: theme.colors.secondaryLight }}
              required
            >
              <option value="">Select Roll Number</option>
              {members.map((m) => (
                <option key={m.RollNumber} value={m.RollNumber}>
                  {m.RollNumber}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Full Name"
              value={signupName}
              readOnly
              className="w-full p-4 rounded-lg border bg-gray-100 cursor-not-allowed"
              style={{
                borderColor: theme.colors.secondaryLight,
                color: theme.colors.secondary,
              }}
            />

            <input
              type="text"
              placeholder="Login ID"
              value={signupLoginId}
              onChange={(e) => setSignupLoginId(e.target.value)}
              className="w-full p-4 rounded-lg border placeholder-opacity-60 focus:outline-none focus:ring-4 transition"
              style={{ borderColor: theme.colors.secondaryLight }}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full p-4 rounded-lg border placeholder-opacity-60 focus:outline-none focus:ring-4 transition"
              style={{ borderColor: theme.colors.secondaryLight }}
              required
            />

            <button
              type="submit"
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Sign Up
            </button>

            <p className="text-center text-sm" style={{ color: theme.colors.secondary }}>
              Already have an account?{" "}
              <button
                type="button"
                className="font-bold underline"
                style={{ color: theme.colors.primaryLight }}
                onClick={() => setIsLoginMode(true)}
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>

      <InlinePopup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
};

// ✅ Inline Popup Component
const InlinePopup = ({ message, type, onClose }) => {
  if (!message) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? theme.colors.success : theme.colors.danger;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center justify-between gap-4 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 text-white`}
        style={{ backgroundColor: bgColor, minWidth: "280px" }}
      >
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-sm font-bold text-white bg-transparent px-3 py-1 rounded-md hover:bg-white hover:text-black transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};



export default Login;
