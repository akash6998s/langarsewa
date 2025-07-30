import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader"; // Import your Loader component
import CustomPopup from "../components/Popup"; // Import your CustomPopup component
import { theme } from "../theme"; // Import the theme
import { Link } from "react-router-dom";
import LoadData from "../components/LoadData";


function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [rollOptions, setRollOptions] = useState([]);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  // States for custom Loader and Popup
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'success' or 'error'

  useEffect(() => {
    const fetchRollNumbers = async () => {
      setIsLoading(true); // Start loading for roll numbers
      setPopupMessage(null); // Clear any previous messages
      setPopupType(null); // Clear popup type as well
      try {
        const snap = await getDocs(collection(db, "members"));
        const rolls = snap.docs.map((doc) => doc.id);
        setRollOptions(rolls);
      } catch (err) {
        console.error("Error fetching roll numbers:", err);
        setPopupMessage("Failed to load roll numbers. Please try again.");
        setPopupType("error");
      } finally {
        setIsLoading(false); // End loading
      }
    };
    fetchRollNumbers();
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      if (!rollNo) {
        setFullName("");
        return;
      }
      setIsLoading(true); // Start loading for name fetch
      setPopupMessage(null);
      setPopupType(null); // Clear popup type as well
      try {
        const docSnap = await getDoc(doc(db, "members", rollNo));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(`${data.name || ""} ${data.last_name || ""}`.trim());
        } else {
          setFullName("");
          setPopupMessage("Member not found for this roll number.");
          setPopupType("error");
        }
      } catch (err) {
        console.error("Error fetching member name:", err);
        setFullName("");
        setPopupMessage("Error fetching member name. Please try again.");
        setPopupType("error");
      } finally {
        setIsLoading(false); // End loading
      }
    };
    fetchName();
  }, [rollNo]);

  const handleSignup = async (e) => {
    e.preventDefault();
    // Clear any existing messages and set loading state
    setPopupMessage(null);
    setPopupType(null); // Clear popup type as well
    setIsLoading(true);

    if (!rollNo) {
      setPopupMessage("❗Please select a roll number.");
      setPopupType("error");
      setIsLoading(false); // Stop loading if validation fails
      return;
    }

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const emailExists = usersSnapshot.docs.some(
        (doc) => doc.data().email === email
      );
      const rollUsed = usersSnapshot.docs.some(
        (doc) => doc.data().roll_no === rollNo
      );

      if (emailExists) {
        setPopupMessage(
          "❌ This email is already registered and awaiting approval."
        );
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      if (rollUsed) {
        setPopupMessage(
          "❌ This roll number is already registered and awaiting approval."
        );
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          // If email is already in use, try to sign in with it.
          userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
        } else {
          // For any other Firebase auth error, re-throw to be caught by the outer catch block
          throw err;
        }
      }

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        password, // Storing password directly in Firestore is NOT recommended for production.
        // For a real app, you'd only store user metadata, not credentials.
        roll_no: rollNo,
        approved: false,
        createdAt: new Date(),
      });

      setPopupMessage("✅ Signup successful. Please wait for admin approval.");
      setPopupType("success"); // Set success type for the popup
      // Delay navigation slightly to allow popup to be seen
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      // Provide a more user-friendly message for common Firebase auth errors
      let errorMessage = "An unknown error occurred during signup.";
      if (err.code) {
        switch (err.code) {
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please use a stronger password (at least 6 characters).';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use by another account.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Your account has been disabled.';
            break;
          default:
            errorMessage = err.message; // Fallback to Firebase's message
        }
      } else {
        errorMessage = err.message; // Use generic error message if no code
      }
      setPopupMessage("Signup error: " + errorMessage);
      setPopupType("error"); // Set error type for the popup
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      <LoadData/>
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

      <div
        className="shadow-xl rounded-2xl p-8 w-full max-w-md border"
        style={{
          backgroundColor: theme.colors.neutralLight,
          borderColor: theme.colors.primaryLight,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <h2
          className="text-2xl font-semibold text-center mb-6"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.fonts.heading,
          }}
        >
          Member Signup
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Roll No */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Roll Number
            </label>
            <select
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.neutralDark,
                borderWidth: "1px",
                borderStyle: "solid",
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
              }}
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
              disabled={isLoading} // Disable when loading
            >
              <option value="">Select Roll No</option>
              {rollOptions.map((roll) => (
                <option key={roll} value={roll}>
                  {roll}
                </option>
              ))}
            </select>
          </div>

          {/* Name (read-only) */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Name
            </label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-lg focus:outline-none"
              style={{
                backgroundColor: theme.colors.tertiaryLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.primary,
                borderWidth: "1px",
                borderStyle: "solid",
              }}
              value={fullName}
              readOnly
              disabled={isLoading} // Disable when loading
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Email
            </label>
            <input
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading} // Disable when loading
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.neutralDark,
                borderWidth: "1px",
                borderStyle: "solid",
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
                "--tw-placeholder-color": theme.colors.primary, // Custom property for placeholder
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.colors.primary }}
            >
              Password
            </label>
            <input
              type="password"
              className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading} // Disable when loading
              style={{
                backgroundColor: theme.colors.neutralLight,
                borderColor: theme.colors.primaryLight,
                color: theme.colors.neutralDark,
                borderWidth: "1px",
                borderStyle: "solid",
                outlineColor: theme.colors.primary,
                "--tw-ring-color": theme.colors.primary,
                "--tw-placeholder-color": theme.colors.primary, // Custom property for placeholder
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full font-semibold py-2.5 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.neutralLight,
              "--tw-ring-color": theme.colors.primaryLight,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                theme.colors.primaryLight)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = theme.colors.primary)
            }
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? "Signing Up..." : "Signup"}
          </button>
          <p
            className="text-sm text-center"
            style={{ color: theme.colors.primary }}
          >
            Already have an account?{" "}
            <Link
              to="/"
              className="font-medium hover:underline transition-colors duration-200"
              style={{ color: theme.colors.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = theme.colors.primaryLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = theme.colors.primary)
              }
            >
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;