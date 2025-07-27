import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader"; // Import your Loader component
import CustomPopup from "../components/Popup"; // Import your custom Popup component

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setPopupMessage(null); // Clear any previous messages

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user approval status from the 'users' collection
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // This case should ideally not happen if signup creates the 'users' doc correctly
        setPopupMessage("❌ User profile not found. Please register or contact support.");
        setPopupType("error");
        await signOut(auth); // Sign out if user doc doesn't exist
        return;
      }

      const userData = userDocSnap.data();

      if (!userData.approved) {
        setPopupMessage("❌ Account not approved by admin yet. Please wait for approval.");
        setPopupType("error");
        await signOut(auth); // Sign out the unapproved user
        return;
      }

      // If approved, fetch the full member details from the 'members' collection
      // using the roll_no stored in the 'users' document.
      const memberRollNo = userData.roll_no;
      if (!memberRollNo) {
        setPopupMessage("❌ Member roll number not linked. Please contact support.");
        setPopupType("error");
        await signOut(auth);
        return;
      }

      const memberDocRef = doc(db, "members", memberRollNo);
      const memberDocSnap = await getDoc(memberDocRef);

      if (!memberDocSnap.exists()) {
        setPopupMessage("❌ Associated member profile not found. Please contact support.");
        setPopupType("error");
        await signOut(auth);
        return;
      }

      const approvedMemberData = { id: memberDocSnap.id, ...memberDocSnap.data() };

      // Save current member to localStorage (for other components like Profile, Activity)
      // It's crucial that this data is consistent with what's needed by other components.
      localStorage.setItem("loggedInMember", JSON.stringify(approvedMemberData));
      localStorage.setItem("loggedInMemberId", approvedMemberData.id); // Store the ID for direct lookups

      setPopupMessage("✅ Login successful!");
      setPopupType("success");

      // Delay navigation slightly to allow popup to be seen
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1500); // 1.5 seconds delay
    } catch (err) {
      let msg = "Login failed. Please check your credentials.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed login attempts. Please try again later.";
      }
      setPopupMessage(`❌ ${msg}`);
      setPopupType("error");
      console.error("Login error:", err); // Log full error for debugging
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      {/* Conditionally render Loader */}
      {isLoading && <Loader />}

      {/* Conditionally render Custom Popup */}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)} // Close popup by clearing message
        />
      )}

      {/* Removed LoadData component */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 ease-in-out hover:scale-105"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Welcome Back!</h2>

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
            disabled={isLoading} // Disable when loading
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
            disabled={isLoading} // Disable when loading
          />
        </div>

        <button
          type="submit"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? (
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