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
import Profile from "./components/Profile";
import AllMember from "./components/AllMember";

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
      className="flex flex-col min-h-full"
      style={{
        background: theme.colors.background,
        fontFamily: theme.fonts.body,
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
        height: "100vh", // keep full viewport height for flex
      }}
    >
      {shouldShowNavbar && <Navbar />}

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/allmember" element={<AllMember />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppWrapper;
