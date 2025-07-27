import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import LoadData from "../components/LoadData";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [rollOptions, setRollOptions] = useState([]);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRollNumbers = async () => {
      const snap = await getDocs(collection(db, "members"));
      const rolls = snap.docs.map((doc) => doc.id);
      setRollOptions(rolls);
    };
    fetchRollNumbers();
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      if (!rollNo) return setFullName("");
      try {
        const docSnap = await getDoc(doc(db, "members", rollNo));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(`${data.name || ""} ${data.last_name || ""}`.trim());
        } else {
          setFullName("");
        }
      } catch (err) {
        console.error("Error fetching member:", err);
        setFullName("");
      }
    };
    fetchName();
  }, [rollNo]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!rollNo) {
      alert("❗Please select a roll number.");
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
        alert("❌ This email is already registered and awaiting approval.");
        return;
      }

      if (rollUsed) {
        alert("❌ This roll number is already registered and awaiting approval.");
        return;
      }

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        password,
        roll_no: rollNo,
        approved: false,
        createdAt: new Date(),
      });

      alert("✅ Signup successful. Please wait for admin approval.");
      navigate("/");
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <LoadData />
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
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-300"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
