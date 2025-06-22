import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ---
// ## MessageBox Component
// Displays a transient message (success or error) to the user.
// Uses Tailwind CSS for styling.
// ---
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";
  const borderColor = type === "success" ? "border-green-400" : "border-red-400";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div
        className={`relative max-w-sm w-full p-6 rounded-lg shadow-lg ${bgColor} border ${borderColor} flex flex-col items-center justify-center`}
      >
        <p className={`text-lg font-semibold mb-4 ${textColor} text-center`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg font-bold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
            type === "success"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

// ---
// ## Login Component
// Handles user authentication (Login and Signup) and fetches member data.
// Manages UI state for forms and messages.
// ---
const Login = () => {
   const navigate = useNavigate();
  // Login form state (autofilled from localStorage)
  const [email, setEmail] = useState(localStorage.getItem("lastEmail") || "");
  const [password, setPassword] = useState(localStorage.getItem("lastPassword") || "");

  // Signup form state
  const [signupRollNo, setSignupRollNo] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [members, setMembers] = useState([]); // Stores fetched member data

  // UI state for mode switching and message display
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for signup
  const [message, setMessage] = useState(null); // Message to display in MessageBox
  const [messageType, setMessageType] = useState("info"); // Type of message (success, error, info)

  // Effect to fetch members data on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("https://langarsewa-db.onrender.com/members");
        if (!response.ok) {
          throw new Error("Failed to fetch members data.");
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
        showMessageBox("Failed to load member data. Please try again.", "error");
      }
    };
    fetchMembers();
  }, []);

  // Effect to auto-fill signup name based on selected roll number
  useEffect(() => {
    if (signupRollNo && members.length > 0) {
      const selectedMember = members.find(
        (member) => String(member.roll_no) === String(signupRollNo)
      );
      if (selectedMember) {
        setSignupName(
          `${selectedMember.name || ""} ${selectedMember.last_name || ""}`.trim()
        );
      } else {
        setSignupName("");
      }
    } else {
      setSignupName("");
    }
  }, [signupRollNo, members]);

  // --- Message Box Handlers ---
  const showMessageBox = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessageBox = () => {
    setMessage(null);
    setMessageType("info");
  };

  // --- Form Submission Handlers ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://langarsewa-db.onrender.com/signup/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("rollNumber", data.rollNumber);
        localStorage.setItem("isAdmin", data.isAdmin);
        localStorage.setItem("isSuperAdmin", data.isSuperAdmin);
        // Store credentials for autofill on next visit
        localStorage.setItem("lastEmail", email);
        localStorage.setItem("lastPassword", password);
        localStorage.setItem("isLoggedIn", "true");
        showMessageBox("Login successful!", "success");
        navigate('/home')
      } else {
        showMessageBox(data.message || "Invalid email or password. Please try again.", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showMessageBox("Login failed due to a network error. Please try again later.", "error");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!signupRollNo || !signupName || !signupEmail || !signupPassword) {
      showMessageBox("Please fill in all signup fields.", "error");
      return;
    }

    try {
      const response = await fetch("https://langarsewa-db.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNumber: signupRollNo,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessageBox("Account created successfully! Please wait for admin approval and then log in.", "success");
        setIsLoginMode(true);
        setSignupRollNo("");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
      } else {
        showMessageBox(data.message || "Signup failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      showMessageBox("Signup failed due to a network error. Please try again later.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-yellow-50 to-yellow-100 px-4 font-inter">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 sm:p-12 border border-yellow-300">
        <h2 className="text-3xl font-extrabold text-yellow-700 mb-8 text-center tracking-wide">
          {isLoginMode ? "Welcome Back" : "Create Your Account"}
        </h2>

        {isLoginMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <input
              type="email"
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                className="text-yellow-600 hover:text-yellow-800 font-bold underline focus:outline-none"
                onClick={() => setIsLoginMode(false)}
              >
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <select
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition appearance-none"
              value={signupRollNo}
              onChange={(e) => setSignupRollNo(e.target.value)}
              required
            >
              <option value="">Select Roll Number</option>
              {members.map((member) => (
                <option key={member.roll_no} value={member.roll_no}>
                  {member.roll_no}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              placeholder="Full Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              readOnly
              required
            />
            <input
              type="email"
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              placeholder="Email Address"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
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
                className="text-yellow-600 hover:text-yellow-800 font-bold underline focus:outline-none"
                onClick={() => setIsLoginMode(true)}
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
      <MessageBox message={message} type={messageType} onClose={closeMessageBox} />
    </div>
  );
};

export default Login;