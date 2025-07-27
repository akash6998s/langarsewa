import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./../../components/Loader";
import { theme } from "../../theme";
import logo from "/favicon.png";

const API_URL = "https://langar-backend.onrender.com";

const Login = () => {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState(
    localStorage.getItem("lastLoginId") || ""
  );
  const [password, setPassword] = useState(
    localStorage.getItem("lastPassword") || ""
  );

  const [signupRollNo, setSignupRollNo] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupLoginId, setSignupLoginId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [members, setMembers] = useState([]);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  // 🔁 State for toggling password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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

        localStorage.setItem("lastLoginId", loginId);
        localStorage.setItem("lastPassword", password);

        navigate("/home");
      } else {
        showPopup(data.message || "Invalid credentials.", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      showPopup("Login failed due to server error.", "error");
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
      className="flex items-center flex-col justify-center px-4 py-10 font-inter"
      style={{
        background: theme.colors.background, // Uses background color from theme
      }}
    >
      {/* Logo Section */}
      <div className="flex w-full justify-center mb-10">
        <img
          src={logo}
          alt="Langar Sewa"
          className="w-32 h-32 object-contain shadow-2xl rounded-full p-2"
          style={{
            backgroundColor: theme.colors.neutralLight,
            border: `1px solid ${theme.colors.primary}`,
          }}
        />
      </div>

      {/* Login/Signup Card Container */}
      <div
        className="max-w-md w-full rounded-3xl shadow-2xl p-10 sm:p-12 border transition-all duration-500 ease-in-out transform hover:scale-[1.01]"
        style={{
          backgroundColor: theme.colors.neutralLight,
          borderColor: theme.colors.secondaryLight,
          backdropFilter: "blur(5px)", // Subtle blur effect for a modern feel
          border: "1px solid rgba(255, 255, 255, 0.4)",
        }}
      >
        {/* Title */}
        <h2
          className="text-4xl font-extrabold mb-10 text-center tracking-wide drop-shadow-md"
          style={{ color: theme.colors.primary }}
        >
          {isLoginMode ? "Welcome Back" : "Create Account"}
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
              }}
              required
            />
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 rounded-lg border placeholder-opacity-60 focus:outline-none focus:ring-4 transition"
                style={{
                  borderColor: theme.colors.secondaryLight,
                  color: theme.colors.primary,
                  backgroundColor: "#fff",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm"
              >
                {showLoginPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Login
            </button>
            <p
              className="text-center text-sm"
              style={{ color: theme.colors.secondary }}
            >
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

            <div className="relative">
              <input
                type={showSignupPassword ? "text" : "password"}
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full p-4 pr-12 rounded-lg border placeholder-opacity-60 focus:outline-none focus:ring-4 transition"
                style={{ borderColor: theme.colors.secondaryLight }}
                required
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm"
              >
                {showSignupPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Sign Up
            </button>

            <p
              className="text-center text-sm"
              style={{ color: theme.colors.secondary }}
            >
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
