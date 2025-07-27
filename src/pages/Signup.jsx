import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader"; // Import your Loader component
import CustomPopup from "../components/Popup"; // Import your custom Popup component

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
    if (!rollNo) {
      setPopupMessage("❗Please select a roll number.");
      setPopupType("error");
      return;
    }

    setIsLoading(true); // Start loading for signup process
    setPopupMessage(null); // Clear previous messages

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const emailExists = usersSnapshot.docs.some(
        (doc) => doc.data().email === email
      );
      const rollUsed = usersSnapshot.docs.some(
        (doc) => doc.data().roll_no === rollNo
      );

      if (emailExists) {
        setPopupMessage("❌ This email is already registered and awaiting approval.");
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      if (rollUsed) {
        setPopupMessage("❌ This roll number is already registered and awaiting approval.");
        setPopupType("error");
        setIsLoading(false);
        return;
      }

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          // If email is already in use, try to sign in with it.
          // This might happen if a user started signup but didn't complete Firestore part.
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
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
      // setPopupType("success");
      // Delay navigation slightly to allow popup to be seen
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setPopupMessage("Signup error: " + err.message);
      // setPopupType("error");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center">
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
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
          Member Signup
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Roll No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <select
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              value={fullName}
              readOnly
              disabled={isLoading} // Disable when loading
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading} // Disable when loading
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading} // Disable when loading
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-300"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? "Signing Up..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;