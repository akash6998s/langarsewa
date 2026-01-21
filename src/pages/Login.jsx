import { useState, useEffect, useCallback } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import LoadData from "../components/LoadData";
import { theme } from "../theme";

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Particles Initialization
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    // 1. Scroll lock implementation from New Code
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    // 2. Auto-fill from localStorage logic from New Code
    try {
      const storedMember = localStorage.getItem("loggedInMember");
      if (storedMember) {
        const memberData = JSON.parse(storedMember);
        if (memberData.email && memberData.password) {
          setEmail(memberData.email);
          setPassword(memberData.password);
        }
      }
    } catch (error) {
      console.log("Storage error:", error);
      localStorage.removeItem("loggedInMember");
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Firebase Auth
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: Check Pending Status (Firestore)
      const pendingSnap = await getDoc(doc(db, "users", res.user.uid));
      if (pendingSnap.exists()) {
        setErrorMessage("Access denied. Your account is pending admin approval.");
        await signOut(auth);
        return;
      }

      // Step 3: Verify with Local Database (allMembers)
      const allMembers = JSON.parse(localStorage.getItem("allMembers")) || [];
      const approvedMember = allMembers.find(
        (member) => member.email === email && member.password === password
      );

      if (!approvedMember) {
        setErrorMessage("Profile not verified. Please contact the administrator.");
        await signOut(auth);
        return;
      }

      // Step 4: Success Logic
      localStorage.setItem("loggedInMember", JSON.stringify(approvedMember));
      navigate("/home", { replace: true });
    } catch (err) {
      console.log(err);
      setErrorMessage("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-white overflow-hidden">
      
      {/* Premium Particles Background */}
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
      
      {/* Premium Design Box */}
      <div className="relative z-10 w-full max-w-sm animate-fadeIn">
        <div 
          className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_100px_rgba(0,0,0,0.12)] transition-shadow duration-500"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-4 inline-block p-1">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-25 h-25 object-contain mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `<div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto" style="background:${theme.colors.primary}">L</div>`;
                }}
              />
            </div>
            <h2 
              className="text-2xl font-black tracking-tight"
              style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
            >
              Member Login
            </h2>
            <p className="text-slate-400 text-[12px] font-bold uppercase tracking-[0.2em] mt-2">
              सुदर्शन सेना भोजन वितरण
            </p>
          </div>

          {errorMessage && (
            <div 
              className="mb-6 p-3 rounded-xl text-[11px] font-bold text-center border animate-shake"
              style={{ 
                backgroundColor: theme.colors.dangerLight, 
                color: theme.colors.danger,
                borderColor: theme.colors.danger + "20"
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                disabled={loading}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 outline-none transition-all text-sm font-semibold bg-slate-50/50 focus:bg-white focus:ring-4 focus:border-orange-500/20 shadow-sm"
                style={{ 
                  color: theme.colors.neutralDark,
                  "--tw-ring-color": `${theme.colors.primary}10`
                }}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 outline-none transition-all text-sm font-semibold bg-slate-50/50 focus:bg-white focus:ring-4 focus:border-orange-500/20 shadow-sm pr-12"
                  style={{ 
                    color: theme.colors.neutralDark,
                    "--tw-ring-color": `${theme.colors.primary}10`
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:scale-110 active:scale-95"
                  style={{ color: theme.colors.primaryLight }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)] active:scale-95 hover:brightness-110 transition-all flex justify-center items-center mt-2"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In to Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[12px] font-medium text-slate-400">
              Don't have an account? 
              <Link 
                to="/signup" 
                className="ml-1.5 font-black hover:underline underline-offset-4"
                style={{ color: theme.colors.primary }}
              >
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default Login;