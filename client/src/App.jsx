import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Discover from "./pages/Discover.jsx";
import Messages from "./pages/Messages.jsx";
import Campings from "./pages/Campings.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import Admin from "./pages/Admin.jsx";

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideNav = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen text-white">
      <Routes>
        <Route path="/" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/campings" element={<ProtectedRoute><Campings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute>{user?.role === "admin" ? <Admin /> : <Navigate to="/" />}</ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {!hideNav && user && <BottomNav />}
    </div>
  );
};

export default App;
