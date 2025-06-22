import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { theme } from "./theme";

// Pages
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";

// Components
import Splash from "./Splash";
import Navbar from "./components/Navbar"; // Make sure to import Navbar
import Activity from "./components/Activity";
import Notice from "./components/Notice";
import Profile from "./components/Profile";
import AddMessage from "./components/AddMessage";
import AddComplaint from "./components/AddComplaint";
import AddSuvichar from "./components/AddSuvichar";
import AddSuggestion from "./components/AddSuggestion";
import ManageAttendance from "./components/ManageAttendance";
import ManageDonation from "./components/ManageDonation";
import ManageExpense from "./components/ManageExpense";
import ManageMembers from "./components/ManageMembers";
import AllMember from "./components/AllMember";
import ManageFinance from "./components/ManageFinance";
import UsersList from "./components/UsersList";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  const hideNavbarRoutes = ["/"]; // Add more paths if needed
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        minHeight: "100vh",
      }}
      className="text-gray-800"
    >
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/addmessage" element={<AddMessage />} />
        <Route path="/addcomplaint" element={<AddComplaint />} />
        <Route path="/addsuvichar" element={<AddSuvichar />} />
        <Route path="/addsuggestion" element={<AddSuggestion />} />
        <Route path="/manageattendance" element={<ManageAttendance />} />
        <Route path="/managedonation" element={<ManageDonation />} />
        <Route path="/manageexpense" element={<ManageExpense />} />
        <Route path="/managemembers" element={<ManageMembers />} />
        <Route path="/allmember" element={<AllMember />} />
        <Route path="/managefinance" element={<ManageFinance />} />
        <Route path="/userslist" element={<UsersList />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
