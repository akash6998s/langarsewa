import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { initializeApp, getApps, getApp } from 'firebase/app'; // Import getApps and getApp
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Import your components
import Header from "./components/Header";
import Home from "./pages/Home";
import Activity from "./components/Activity";
import Members from "./components/Members";
import Profile from "./components/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import UploadAllData from "./components/databaseEditCode/UploadAllData";
import SuperAdmin from "./pages/SuperAdmin";
import EditDatabase from "./components/databaseEditCode/EditDatabase";
import RemoveImgFromMembers from "./components/databaseEditCode/removeImgFromAllMembers";
import UploadExpenseData from "./components/databaseEditCode/UploadExpenseData";
import LoadData from "./components/LoadData";
import Splash from "./Splash";
import WorkInProgress from "./components/WorkInProgress";
import TeamPerformance from "./components/TeamPerformance";

// Global variables for Firebase config and app ID
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true);
  const [isWorking, setIsWorking] = useState(false); // State to hold the 'working' status
  const [loadingFirestore, setLoadingFirestore] = useState(true); // State for Firestore loading
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const location = useLocation();

  // Effect for splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Effect for Firebase initialization and authentication
  useEffect(() => {
    let app;
    // Check if Firebase app is already initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp(); // If already initialized, get the default app
    }

    const firestore = getFirestore(app);
    const firebaseAuth = getAuth(app);

    setDb(firestore);
    setAuth(firebaseAuth);

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Sign in anonymously if no initial auth token is provided or user is not signed in
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
          } else {
            await signInAnonymously(firebaseAuth);
          }
          setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
        } catch (error) {
          console.error("Firebase authentication error:", error);
          setUserId(crypto.randomUUID()); // Fallback to a random ID
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // Effect to listen for 'working' status from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) return; // Wait for Firestore and Auth to be ready

    const docRef = doc(db, "working", "qCmBh8gyStEyQgjQuoQV");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsWorking(data.working === true); // Set isWorking based on the 'working' field
      } else {
        console.log("No such document for 'working' status!");
        setIsWorking(false); // Default to false if document doesn't exist
      }
      setLoadingFirestore(false);
    }, (error) => {
      console.error("Error fetching 'working' status:", error);
      setIsWorking(false); // Default to false on error
      setLoadingFirestore(false);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [db, isAuthReady]); // Re-run when db or auth state changes

  const pathname = window.location.pathname;
  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const isAdmin = loggedInMember?.isAdmin;

  const protectedPaths = ["/admin", "/superadmin"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !isAdmin) {
    window.location.href = "/";
  }

  if (showSplash || loadingFirestore) {
    // Show splash screen or a loading indicator while Firestore data is being fetched
    return <Splash />;
  }

  // If working is true, display "Work in progress" using the WorkInProgress component
  if (isWorking) {
    return <WorkInProgress />;
  }

  const hideHeaderRoutes = ["/", "/signup"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="h-screen flex flex-col">
      {/* Main content area - 90% */}
      <div
        className={`h-[${shouldHideHeader ? "100" : "90"}vh] overflow-y-auto`}
      >
        {/* LoadData component should be rendered here if it's meant to be global,
            otherwise it should be part of specific routes if it's loading data for them.
            For now, keeping it as is based on original code. */}
        <LoadData/>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/members" element={<Members />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
          <Route path="/load-data" element={<LoadData />} />
          <Route path="/team-performance" element={<TeamPerformance />} />

          {/* These route are for upload and managing backup data */}
          <Route path="/upload-backup" element={<UploadAllData />} />
          <Route path="/edit-database" element={<EditDatabase />} />
          <Route path="/remove-img" element={<RemoveImgFromMembers />} />
          <Route path="/upload-expense" element={<UploadExpenseData />} />
        </Routes>
      </div>

      {/* Bottom navbar - 10% */}
      {!shouldHideHeader && (
        <div className="h-[10vh]">
          <Header />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
