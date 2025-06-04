import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";

// Components
import Splash from "./Splash";
import Navbar from "./components/Navbar";
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  if (showSplash) return <Splash />;

  return (
    <Router>
      {isLoggedIn && <Navbar onLogout={handleLogout} />}
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected Routes */}
        {isLoggedIn ? (
          <>
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
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
