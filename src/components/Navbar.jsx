import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";

const initialNotifications = [
  {
    id: 1,
    message: "New client added: John Doe",
    read: false,
    date: new Date("2026-02-10T09:15:00"),
  },
  {
    id: 2,
    message: "Appointment scheduled with Jane Smith",
    read: true,
    date: new Date("2026-02-10T08:30:00"),
  },
  {
    id: 3,
    message: "Monthly report generated successfully",
    read: false,
    date: new Date("2026-02-09T17:45:00"),
  },
  {
    id: 4,
    message: "Password changed successfully",
    read: true,
    date: new Date("2026-02-09T12:20:00"),
  },
  {
    id: 5,
    message: "New message from client: Alice Cooper",
    read: false,
    date: new Date("2026-02-10T10:05:00"),
  },
];

const Navbar = ({ onLogout, user, onToggleMobileMenu, isSidebarCollapsed }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const notificationsRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <nav className={`navbar ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="navbar-left">
        <button className="mobile-nav-toggle" onClick={onToggleMobileMenu}>
          ☰
        </button>
        <div>
          <h1>Client Management System</h1>
          <p className="current-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <div
          className={`notification-wrapper ${showNotifications ? "show" : ""}`}
          ref={notificationsRef}
        >
          <button
            className="notification-bell"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <span>🔔</span>
            {unreadNotifications > 0 && (
              <span className="notification-count">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </button>

          <div className="notification-dropdown">
            <div className="dropdown-header">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button className="clear-btn" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
            </div>
            <div className="dropdown-list">
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.read ? "read" : "unread"}`}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <span className="notification-message">{n.message}</span>
                    <span className="notification-time">
                      {new Date(n.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div
          className={`user-dropdown-wrapper ${showUserDropdown ? "show" : ""}`}
          ref={userDropdownRef}
        >
          <button
            className="user-info"
            onClick={() => setShowUserDropdown((prev) => !prev)}
          >
            <div className="user-avatar">
              <span>{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || "User"}</p>
              <p className="user-role">{user?.role || "Role"}</p>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          <div className="user-dropdown">
            <div className="dropdown-item" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
