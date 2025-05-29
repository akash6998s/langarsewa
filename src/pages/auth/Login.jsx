import React, { useState, useEffect } from "react";

// Message Box Component (remains the same)
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

const App = ({ onLogin }) => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup state
  const [signupRollNo, setSignupRollNo] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [members, setMembers] = useState([]);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");

  // UI state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("http://localhost:5000/members");
        if (!response.ok) throw new Error("Error fetching members");
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        showMessageBox("Failed to load member data.", error); // Changed type to error
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (signupRollNo && members.length > 0) {
      const selected = members.find(
        (member) => String(member.roll_no) === String(signupRollNo)
      );
      if (selected) {
        setSignupName(
          `${selected.name || ""} ${selected.last_name || ""}`.trim()
        );
      } else {
        setSignupName("");
      }
    } else {
      setSignupName("");
    }
  }, [signupRollNo, members]);

  const showMessageBox = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessageBox = () => {
    setMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/signup/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming your backend sends a success message or token upon successful login
        localStorage.setItem("isLoggedIn", "true");
        showMessageBox("Login successful!", "success");
        onLogin(); // Call the onLogin prop to indicate successful login to parent component
      } else {
        // Handle login errors from the backend
        showMessageBox(data.message || "Invalid email or password.", "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showMessageBox("Login failed. Please try again later.", "error");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupRollNo && signupName && signupEmail && signupPassword) {
      try {
        const response = await fetch("http://localhost:5000/signup", {
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
          showMessageBox("Account created successfully! Please log in.", "success");
          setIsLoginMode(true);
          setSignupRollNo("");
          setSignupName("");
          setSignupEmail("");
          setSignupPassword("");
        } else {
          showMessageBox(data.message || "Signup failed. Try again.", "error");
        }
      } catch (error) {
        showMessageBox("Signup error. Please try again later.", "error");
        console.error("Signup Error:", error);
      }
    } else {
      showMessageBox("Please fill in all signup fields.", "error");
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotEmail) {
      showMessageBox(`Password reset link sent to ${forgotEmail}.`, "success");
      setForgotEmail("");
      setShowForgot(false);
    } else {
      showMessageBox("Please enter your email address.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-yellow-50 to-yellow-100 px-4 font-inter">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 sm:p-12 border border-yellow-300">
        {!showForgot ? (
          <>
            <h2 className="text-3xl font-extrabold text-yellow-700 mb-8 text-center tracking-wide">
              {isLoginMode ? "Welcome Back" : "Create Your Account"}
            </h2>

            {isLoginMode ? (
              // Login Form
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
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    className="text-yellow-600 hover:text-yellow-800 font-medium text-sm underline focus:outline-none"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
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
              // Signup Form
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
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-yellow-700 mb-8 text-center tracking-wide">
              Reset Password
            </h2>
            <form onSubmit={handleForgotSubmit} className="space-y-6">
              <input
                type="email"
                className="w-full p-4 rounded-lg border border-yellow-300 placeholder-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
                placeholder="Email Address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              >
                Send Reset Link
              </button>
              <p className="text-center text-gray-600 text-sm">
                Remember your password?{" "}
                <button
                  type="button"
                  className="text-yellow-600 hover:text-yellow-800 font-bold underline focus:outline-none"
                  onClick={() => setShowForgot(false)}
                >
                  Back to Login
                </button>
              </p>
            </form>
          </>
        )}
      </div>
      <MessageBox message={message} type={messageType} onClose={closeMessageBox} />
    </div>
  );
};

export default App;