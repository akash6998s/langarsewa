import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LoadData from "../components/LoadData"; // Assuming this is your global loading component

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state for the login process
  const [errorMessage, setErrorMessage] = useState(""); // Add state for error messages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(""); // Clear previous errors

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is still pending approval in 'users' collection
      const pendingSnap = await getDoc(doc(db, "users", res.user.uid));
      if (pendingSnap.exists()) {
        setErrorMessage("❌ Account not approved by admin yet. Please wait for approval.");
        await signOut(auth); // Sign out the unapproved user
        return; // Stop further execution
      }

      // ✅ Use localStorage to find approved member from 'allMembers' data
      const allMembers = JSON.parse(localStorage.getItem("allMembers")) || [];
      const approvedMember = allMembers.find(
        (member) => member.email === email && member.password === password
      );

      if (!approvedMember) {
        setErrorMessage("❌ Approved member profile not found. Please ensure you are registered and approved.");
        await signOut(auth); // Sign out if member profile isn't found/approved
        return; // Stop further execution
      }

      // Save current member to localStorage
      localStorage.setItem("loggedInMember", JSON.stringify(approvedMember));

      // No alert needed for success, just navigate
      navigate("/home", { replace: true });
    } catch (err) {
      // Firebase authentication error messages can be generic, customize if needed
      let msg = "Login failed. Please check your credentials.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed login attempts. Please try again later.";
      }
      setErrorMessage(`❌ ${msg}`);
      console.error("Login error:", err); // Log full error for debugging
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <LoadData /> {/* Your global data loader */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 ease-in-out hover:scale-105"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Welcome Back!</h2>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div>
          <label htmlFor="email-address" className="sr-only">Email address</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg transition duration-200 ease-in-out"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition duration-200 ease-in-out"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Log In'
          )}
        </button>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors duration-200">
            Sign up here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;