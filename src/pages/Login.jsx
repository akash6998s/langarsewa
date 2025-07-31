import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LoadData from "../components/LoadData"; // Assuming this is your global loading component
import { theme } from "../theme"; // Import the theme
import { Link } from "react-router-dom";
// Import Material-UI Icons for password visibility
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state for the login process
  const [errorMessage, setErrorMessage] = useState(""); // Add state for error messages
  const navigate = useNavigate();

  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Effect to auto-fill credentials from localStorage on component mount
  useEffect(() => {
    try {
      const storedMember = localStorage.getItem("loggedInMember");
      if (storedMember) {
        const memberData = JSON.parse(storedMember);
        // Ensure email and password properties exist before setting
        if (memberData.email && memberData.password) {
          setEmail(memberData.email);
          setPassword(memberData.password);
        }
      }
    } catch (error) {
      console.error("Failed to parse loggedInMember from localStorage:", error);
      // Optionally, clear the malformed item from localStorage
      localStorage.removeItem("loggedInMember");
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(""); // Clear previous errors

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is still pending approval in 'users' collection
      const pendingSnap = await getDoc(doc(db, "users", res.user.uid));
      if (pendingSnap.exists()) {
        setErrorMessage(
          "❌ Account not approved by admin yet. Please wait for approval."
        );
        await signOut(auth); // Sign out the unapproved user
        return; // Stop further execution
      }

      // ✅ Use localStorage to find approved member from 'allMembers' data
      const allMembers = JSON.parse(localStorage.getItem("allMembers")) || [];
      const approvedMember = allMembers.find(
        (member) => member.email === email && member.password === password
      );

      if (!approvedMember) {
        setErrorMessage(
          "❌ Profile not found. Please ensure you are registered and approved."
        );
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
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      <LoadData /> {/* Your global data loader */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 ease-in-out hover:scale-105"
        style={{ backgroundColor: theme.colors.neutralLight }}
      >
        <h2
          className="text-3xl font-extrabold text-center mb-6"
          style={{
            color: theme.colors.neutralDark,
            fontFamily: theme.fonts.heading,
          }}
        >
          Welcome Back!
        </h2>

        {errorMessage && (
          <div
            className="border px-4 py-3 rounded relative"
            role="alert"
            style={{
              backgroundColor: theme.colors.dangerLight,
              borderColor: theme.colors.danger,
              color: theme.colors.danger,
            }}
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div>
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 rounded-lg focus:outline-none focus:z-10 sm:text-lg transition duration-200 ease-in-out"
            style={{
              borderColor: theme.colors.primaryLight,
              color: theme.colors.neutralDark,
              "--tw-placeholder-color": theme.colors.primary, // Custom property for placeholder
              outlineColor: theme.colors.primary,
              "--tw-ring-color": theme.colors.primary, // For focus ring
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <div className="relative"> {/* Added relative positioning for the icon */}
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"} // Toggle type based on state
              autoComplete="current-password"
              required
              className="appearance-none relative block w-full px-4 py-3 border placeholder-gray-500 rounded-lg focus:outline-none focus:z-10 sm:text-lg transition duration-200 ease-in-out pr-10" // Added pr-10 for icon space
              style={{
                borderColor: theme.colors.primaryLight,
                color: theme.colors.neutralDark,
                "--tw-placeholder-color": theme.colors.primary, // Custom property for placeholder
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary, // For focus ring
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
            />
            <button
              type="button" // Important: type="button" to prevent form submission
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              style={{ color: theme.colors.primary }}
              disabled={loading} // Disable button when loading
            >
              {/* MUI Icons for show/hide password */}
              {showPassword ? (
                <VisibilityOff className="h-5 w-5" />
              ) : (
                <Visibility className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.neutralLight,
            "--tw-ring-color": theme.colors.primaryLight,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = theme.colors.primaryLight)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = theme.colors.primary)
          }
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <svg
              className="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              style={{ color: theme.colors.neutralLight }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Log In"
          )}
        </button>

        <p
          className="text-sm text-center"
          style={{ color: theme.colors.primary }}
        >
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium underline hover:underline transition-colors duration-200"
            style={{ color: theme.colors.primary }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = theme.colors.primaryLight)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = theme.colors.primary)
            }
          >
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
