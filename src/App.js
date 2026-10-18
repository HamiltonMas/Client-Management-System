// src/App.js
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // Clear auth on every page load in development
    // Remove this line for production
    localStorage.removeItem("lawFirmAuth");
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    setLoading(true);
    try {
      const savedAuth = localStorage.getItem("lawFirmAuth");
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        const now = new Date().getTime();
        if (now - authData.loginTime < SESSION_DURATION_MS) {
          setIsAuthenticated(true);
          setUser(authData.user);
        } else {
          localStorage.removeItem("lawFirmAuth");
          setAuthError("Session expired. Please login again.");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("lawFirmAuth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    const authData = {
      user: userData,
      loginTime: new Date().getTime(),
      token: generateToken(),
    };
    localStorage.setItem("lawFirmAuth", JSON.stringify(authData));
    setIsAuthenticated(true);
    setUser(userData);
    setAuthError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("lawFirmAuth");
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView("dashboard");
    setAuthError("");
  };

  const generateToken = () => {
    return (
      "demo_token_" +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Loading Justice Legal Partners</h3>
          <p>Initializing secure system...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        authError={authError}
        clearError={() => setAuthError("")}
      />
    );
  }

  return (
    <div className="App">
      <Dashboard
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
        user={user}
      />
    </div>
  );
}

export default App;
