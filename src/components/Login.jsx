// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import "./Login.css";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../constants/permissions";

const USERS_VERSION = 3; // increment this whenever you change default users

const DEFAULT_USERS = [
  {
    id: 1,
    username: "nathasha",
    password: "admin123",
    name: "Nathasha Tshihatu",
    role: "admin",
    email: "nathasha@justicelegal.com",
    permissions: Object.values(PERMISSIONS),
  },
  {
    id: 2,
    username: "Hamilton",
    password: "UndBun67@",
    name: "Hamilton Masipa",
    role: "attorney",
    email: "robert.j@justicelegal.com",
    permissions: ROLE_PERMISSIONS.attorney,
  },
  {
    id: 3,
    username: "paralegal",
    password: "paralegal123",
    name: "Sarah Miller",
    role: "paralegal",
    email: "sarah.m@justicelegal.com",
    permissions: ROLE_PERMISSIONS.paralegal,
  },
];

const Login = ({ onLogin, authError, clearError }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showTestCreds, setShowTestCreds] = useState(false);

  // Initialize / reseed default users when version changes or a known user is missing
  useEffect(() => {
    const storedVersion = localStorage.getItem("lawFirmUsersVersion");
    const storedUsers = localStorage.getItem("lawFirmUsers");

    let needsSeed = !storedUsers || storedVersion !== String(USERS_VERSION);

    if (!needsSeed) {
      try {
        const parsed = JSON.parse(storedUsers);
        // Ensure every default user still exists with the exact credentials
        const allPresent = DEFAULT_USERS.every((du) =>
          parsed.some(
            (u) => u.username === du.username && u.password === du.password,
          ),
        );
        if (!allPresent) needsSeed = true;
      } catch {
        needsSeed = true;
      }
    }

    if (needsSeed) {
      localStorage.setItem("lawFirmUsers", JSON.stringify(DEFAULT_USERS));
      localStorage.setItem("lawFirmUsersVersion", String(USERS_VERSION));
      console.log("Default users initialized with version", USERS_VERSION);
    }
  }, []);

  // Load remembered username
  useEffect(() => {
    const remembered = localStorage.getItem("lawFirmRememberMe");
    if (remembered) {
      try {
        const data = JSON.parse(remembered);
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - data.timestamp < oneWeek) {
          setCredentials((prev) => ({ ...prev, username: data.username }));
          setRememberMe(true);
        }
      } catch (error) {
        localStorage.removeItem("lawFirmRememberMe");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    clearError();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const usersJson = localStorage.getItem("lawFirmUsers");
      if (!usersJson) {
        setError("System error: No users found.");
        setLoading(false);
        return;
      }

      const users = JSON.parse(usersJson);
      const foundUser = users.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password,
      );

      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        if (rememberMe) {
          localStorage.setItem(
            "lawFirmRememberMe",
            JSON.stringify({
              username: credentials.username,
              timestamp: Date.now(),
            }),
          );
        } else {
          localStorage.removeItem("lawFirmRememberMe");
        }
        onLogin(userWithoutPassword);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  const fillCredentials = (username, password) => {
    setCredentials({ username, password });
    setError("");
    clearError();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="firm-logo">
            <div className="logo-shield">
              <span className="logo-icon">⚖️</span>
            </div>
            <div>
              <h1>Justice Legal Partners</h1>
              <p className="firm-tagline">Client Management System</p>
            </div>
          </div>
          <h2>Admin Portal Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="Enter username"
              required
              disabled={loading}
              onKeyPress={handleKeyPress}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="Enter password"
                required
                disabled={loading}
                onKeyPress={handleKeyPress}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={() => alert("Contact support: support@justicelegal.com")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Forgot password?
            </button>
          </div>

          {(error || authError) && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error || authError}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !credentials.username || !credentials.password}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* ===== TEST CREDENTIALS PANEL ===== */}
          {process.env.NODE_ENV !== "production" && (
            <div
              style={{
                marginTop: "1rem",
                border: "1px dashed #c9a227",
                borderRadius: "8px",
                background: "#fffdf5",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setShowTestCreds((v) => !v)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.9rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#7a5c00",
                  fontSize: "0.9rem",
                }}
              >
                <span>🧪 Test Login Credentials</span>
                <span>{showTestCreds ? "▲" : "▼"}</span>
              </button>

              {showTestCreds && (
                <div
                  style={{
                    padding: "0 0.9rem 0.8rem",
                    fontSize: "0.85rem",
                    color: "#3a3a3a",
                  }}
                >
                  <p style={{ margin: "0 0 0.6rem", color: "#7a5c00" }}>
                    Click an account to auto-fill the form:
                  </p>

                  {/* Admin */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      background: "#fdf3d6",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <div>
                      <strong>👑 Admin</strong>
                      <div>
                        <code>nathasha</code> / <code>admin123</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillCredentials("nathasha", "admin123")}
                      style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        border: "1px solid #c9a227",
                        background: "#c9a227",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Use
                    </button>
                  </div>

                  {/* Attorney */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      background: "#f4f6fa",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <div>
                      <strong>⚖️ Attorney</strong>
                      <div>
                        <code>Hamilton</code> / <code>UndBun67@</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillCredentials("Hamilton", "UndBun67@")}
                      style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        border: "1px solid #4a6fa5",
                        background: "#4a6fa5",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Use
                    </button>
                  </div>

                  {/* Paralegal */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      background: "#f2f7f2",
                    }}
                  >
                    <div>
                      <strong>📋 Paralegal</strong>
                      <div>
                        <code>paralegal</code> / <code>paralegal123</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials("paralegal", "paralegal123")
                      }
                      style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        border: "1px solid #4a7c59",
                        background: "#4a7c59",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Use
                    </button>
                  </div>

                  <p
                    style={{
                      margin: "0.6rem 0 0",
                      fontSize: "0.75rem",
                      color: "#8a8a8a",
                    }}
                  >
                    ⚠️ For testing only — remove this panel before production.
                  </p>
                </div>
              )}
            </div>
          )}
          {/* ===== END TEST CREDENTIALS PANEL ===== */}

          <div className="security-info">
            <p>Secured with encryption</p>
            <p className="security-sub">All activities are monitored</p>
          </div>
        </form>

        <div className="login-footer">
          <div className="footer-links">
            <a href="/" onClick={(e) => e.preventDefault()}>
              Privacy
            </a>
            <span className="separator">•</span>
            <a href="/" onClick={(e) => e.preventDefault()}>
              Terms
            </a>
            <span className="separator">•</span>
            <a href="/" onClick={(e) => e.preventDefault()}>
              Support
            </a>
          </div>
          <p className="copyright">© 2024 Justice Legal Partners</p>
          <p className="confidential">Confidential Information</p>
          <p className="version">v2.1.4</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
