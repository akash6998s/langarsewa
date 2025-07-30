import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from "react";

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

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const pathname = window.location.pathname;
  const loggedInMember = JSON.parse(localStorage.getItem("loggedInMember"));
  const isAdmin = loggedInMember?.isAdmin;

  const protectedPaths = ["/admin", "/superadmin"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !isAdmin) {
    window.location.href = "/";
  }

  console.log("Path:", pathname);
  console.log("isAdmin:", isAdmin);

  if (showSplash) return <Splash />;

  const hideHeaderRoutes = ["/", "/signup"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="h-screen flex flex-col">
      {/* Main content area - 90% */}
      <div
        className={`h-[${shouldHideHeader ? "100" : "90"}vh] overflow-y-auto`}
        >
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
