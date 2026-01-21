import { useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader"; 
import CustomPopup from "../components/Popup"; 
import { theme } from "../theme"; 
import LoadData from "../components/LoadData";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [rollOptions, setRollOptions] = useState([]);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);

  // Particles Setup
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    const fetchRollNumbers = async () => {
      setIsLoading(true);
      setPopupMessage(null);
      setPopupType(null);
      try {
        const snap = await getDocs(collection(db, "members"));
        let rolls = snap.docs.map((doc) => doc.id);
        rolls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        setRollOptions(rolls);
      } catch (err) {
        console.log(err)
        setPopupMessage("Failed to load roll numbers. Please try again.");
        setPopupType("error");
      } finally {
        setIsLoading(false);
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
      setIsLoading(true);
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
        setFullName("");
        console.log(err)
        setPopupMessage("Error fetching member name. Please try again.");
        setPopupType("error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchName();
  }, [rollNo]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setPopupMessage(null);
    setPopupType(null);
    setIsLoading(true);

    if (!rollNo) {
      setPopupMessage("❗Please select a roll number.");
      setPopupType("error");
      setIsLoading(false);
      return;
    }

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const emailExists = usersSnapshot.docs.some(d => d.data().email === email);
      const rollUsed = usersSnapshot.docs.some(d => d.data().roll_no === rollNo);

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

      setPopupMessage("✅ Signup successful. Please wait for admin approval.");
      setPopupType("success");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      let errorMessage = err.code ? err.code : err.message;
      setPopupMessage("Signup error: " + errorMessage);
      setPopupType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-white overflow-hidden">
      
      {/* Subtle Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            color: { value: theme.colors.primary },
            links: { color: theme.colors.primary, distance: 150, enable: true, opacity: 0.1, width: 1 },
            move: { enable: true, speed: 0.8 },
            number: { value: 40 },
            opacity: { value: 0.2 },
            size: { value: 2 },
          },
        }}
        className="absolute inset-0 z-0"
      />

      <LoadData />
      {isLoading && <Loader />}
      {popupMessage && (
        <CustomPopup
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)}
        />
      )}

      {/* The Premium Signup Box */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-[3rem] p-8 sm:p-10 border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
          
          <div className="text-center mb-8">
            <h2 
              className="text-2xl font-black tracking-tight"
              style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
            >
              Member Signup
            </h2>
            <div className="h-1 w-10 bg-orange-500 mx-auto rounded-full mt-2"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Roll Number Select */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-2 text-slate-400">
                Roll Number
              </label>
              <select
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 outline-none transition-all text-sm font-semibold bg-slate-50/50 focus:bg-white focus:ring-4 focus:border-orange-500/20"
                style={{ color: theme.colors.neutralDark, "--tw-ring-color": `${theme.colors.primary}10` }}
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                disabled={isLoading}
              >
                <option value="">Select Roll No</option>
                {rollOptions.map((roll) => (
                  <option key={roll} value={roll}>{roll}</option>
                ))}
              </select>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-2 text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 outline-none text-sm font-bold bg-orange-50/30"
                style={{ color: theme.colors.primary }}
                value={fullName}
                readOnly
                placeholder="Auto-filled name"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-2 text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 outline-none transition-all text-sm font-semibold bg-slate-50/50 focus:bg-white focus:ring-4 focus:border-orange-500/20"
                style={{ color: theme.colors.neutralDark, "--tw-ring-color": `${theme.colors.primary}10` }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-2 text-slate-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 outline-none transition-all text-sm font-semibold bg-slate-50/50 focus:bg-white focus:ring-4 focus:border-orange-500/20 pr-12"
                  style={{ color: theme.colors.neutralDark, "--tw-ring-color": `${theme.colors.primary}10` }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.primaryLight }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all flex justify-center items-center mt-4"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {isLoading ? "Signing Up..." : "Signup"}
            </button>

            {/* Footer Link */}
            <p className="text-[12px] text-center font-medium text-slate-400 mt-6">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-black hover:underline underline-offset-4 transition-colors"
                style={{ color: theme.colors.primary }}
              >
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Signup;