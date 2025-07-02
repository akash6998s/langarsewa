import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./../../components/Loader";
import Popup from "./../../components/Popup";

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

  // ✅ Fetch Members for Signup Roll Dropdown
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

  // ✅ Auto-fill Name when Roll Number is selected
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

  // ✅ Popup Helper
  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => {
      setPopup({ message: "", type: "" });
    }, 3000);
  };

  // ✅ Login Handler
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

  // ✅ Signup Handler
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-yellow-50 to-yellow-100 px-4 font-inter">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 sm:p-12 border border-yellow-300">
        <h2 className="text-3xl font-extrabold text-yellow-700 mb-8 text-center tracking-wide">
          {isLoginMode ? "Welcome Back" : "Create Your Account"}
        </h2>

        {isLoginMode ? (
          // ✅ Login Form
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              required
            />
            <button
              type="submit"
              className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Login
            </button>
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-yellow-600 hover:text-yellow-800 font-bold underline"
                onClick={() => setIsLoginMode(false)}
              >
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          // ✅ Signup Form
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <select
              value={signupRollNo}
              onChange={(e) => setSignupRollNo(e.target.value)}
              className="w-full p-4 rounded-lg border border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
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
              className="w-full p-4 rounded-lg border border-yellow-300 bg-gray-100 cursor-not-allowed"
            />

            <input
              type="text"
              placeholder="Login ID"
              value={signupLoginId}
              onChange={(e) => setSignupLoginId(e.target.value)}
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              required
            />

            <button
              type="submit"
              className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Sign Up
            </button>

            <p className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                type="button"
                className="text-yellow-600 hover:text-yellow-800 font-bold underline"
                onClick={() => setIsLoginMode(true)}
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>

      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
};

export default Login;
