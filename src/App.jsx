import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { theme } from "./theme";

// Pages
import Home from "./pages/user/Home";
import Login from "./pages/auth/Login";

// Components
import Splash from "./Splash";
import SuperAdmin from "./components/SuperAdmin";
import Navbar from "./components/Navbar";
import Activity from "./components/Activity";
import Notice from "./components/Notice";
import Profile from "./components/Profile";
import AllMember from "./components/AllMember";
import AddMessage from "./components/AddMessage";
import AddComplaint from "./components/AddComplaint";
import AddSuvichar from "./components/AddSuvichar";
import AddSuggestion from "./components/AddSuggestion";

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

  const hideNavbarRoutes = ["/"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
      }}
    >
      {shouldShowNavbar && <Navbar />}

      <div className="flex-1 overflow-auto">
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
          <Route path="/allmember" element={<AllMember />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppWrapper;
