import React from "react";
import "./Sidebar.css";

const Sidebar = ({
  currentView,
  setCurrentView,
  availableViews,
  user,
  isMobileOpen,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", permission: null },
    {
      id: "view-clients",
      label: "View Clients",
      icon: "👥",
      permission: "view_clients",
    },
    {
      id: "add-client",
      label: "Add Client",
      icon: "➕",
      permission: "add_clients",
    },
    {
      id: "recycle-bin",
      label: "Recycle Bin",
      icon: "🗑️",
      permission: "view_recycle_bin",
    },
    {
      id: "user-management",
      label: "User Management",
      icon: "👤",
      permission: "manage_users",
    },
    {
      id: "employees",
      label: "Employees",
      icon: "👥",
      permission: "manage_employees",
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return (
      user?.permissions?.includes(item.permission) || user?.role === "admin"
    );
  });

  return (
    <div
      className={`sidebar ${isMobileOpen ? "mobile-open" : ""} ${isCollapsed ? "collapsed" : ""}`}
    >
      {/* Header with logo and toggle button below */}
      <div className="sidebar-header">
        <div className="logo-area">
          <div className="logo-icon">⚖️</div>
          {!isCollapsed && (
            <div className="logo-text">
              <h2>Justice Legal</h2>
              <p>Partners</p>
            </div>
          )}
        </div>
        {/* Toggle button placed under the logo */}
        <button className="collapse-btn" onClick={onToggleCollapse}>
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* User summary - collapsed shows only avatar */}
      <div className="user-summary">
        <div className="user-avatar">
          <span>{user?.name?.charAt(0) || "U"}</span>
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{user?.name || "User"}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {filteredNavItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${currentView === item.id ? "active" : ""}`}
                onClick={() => setCurrentView(item.id)}
                title={isCollapsed ? item.label : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - hidden when collapsed */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot"></div>
            <span>System Online</span>
          </div>
          <div className="copyright">
            <p>© 2024 Justice Legal Partners</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
