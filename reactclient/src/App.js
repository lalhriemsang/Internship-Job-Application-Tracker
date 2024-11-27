import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./authContext"; // Import useAuth from authContext
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AddApplicationPage from "./pages/AddApplication";
import SkillsProgress from "./pages/SkillsProgress";
import "./App.css";
// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth(); // Correct usage of useAuth

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo">
          Job Analysis Portal
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/home" className="navbar-link">
              Home
            </Link>
          </li>

          {!user ? (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link">
                  Profile
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/addApplication" className="navbar-link">
                  Add Application
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/skillsProgress" className="navbar-link">
                  Skills Progress
                </Link>{" "}
                {/* Add Skills Progress link */}
              </li>
              <li className="navbar-item">
                <button onClick={logout} className="navbar-button">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/addApplication" element={<AddApplicationPage />} />
          <Route path="/skillsProgress" element={<SkillsProgress />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
