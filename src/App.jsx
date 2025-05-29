import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/user/Home";
import Activity from "./components/Activity";
import Notice from "./components/Notice";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import AddMessage from "./components/AddMessage";
import AddComplaint from "./components/AddComplaint";
import AddSuvichar from "./components/AddSuvichar";
import AddSuggestion from "./components/AddSuggestion";
import Login from "./pages/auth/Login";
import ManageAttendance from "./components/ManageAttendance";
import ManageDonation from "./components/ManageDonation";
import ManageExpense from "./components/ManageExpense";
import ManageMembers from "./components/ManageMembers";
import AllMember from "./components/AllMember";
import ManageFinance from "./components/ManageFinance";
import UsersList from "./components/UsersList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // Update login state when user logs in
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Handle logout (optional)
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {/* Show Navbar only if logged in */}
      {isLoggedIn && <Navbar onLogout={handleLogout} />}
      <Routes>
        {/* Redirect root based on login status */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected routes */}
        {isLoggedIn ? (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/addsuvichar" element={<AddSuvichar />} />
            <Route path="/addcomplaint" element={<AddComplaint />} />
            <Route path="/addmessage" element={<AddMessage />} />
            <Route path="/addsuggestion" element={<AddSuggestion />} />
            <Route path="/manageattendance" element={<ManageAttendance />} />
            <Route path="/managedonation" element={<ManageDonation />} />
            <Route path="/manageexpense" element={<ManageExpense />} />
            <Route path="/managemembers" element={<ManageMembers />} />
             <Route path="/allmember" element={<AllMember />} />
              <Route path="/managefinance" element={<ManageFinance />} />
              <Route path="/userslist" element={<UsersList />} />
          </>
        ) : (
          // Redirect all unknown routes to login
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
