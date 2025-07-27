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
import Splash from './Splash'

function AppRoutes() {
   const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <div className="h-screen flex flex-col">
      {/* Main content area - 90% */}
      <div className="h-[90vh] overflow-y-auto">
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
      <div className="h-[10vh]">
        <Header />
      </div>
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
