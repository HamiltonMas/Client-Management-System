// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ClientList from "./ClientList";
import AddClient from "./AddClient";
import RecycleBin from "./RecycleBin";
import UserManagement from "./UserManagement";
import ViewClients from "./ViewClients";
import Employees from "./Employees";
import { PERMISSIONS } from "../constants/permissions";
import "./Dashboard.css";

const Dashboard = ({ currentView, setCurrentView, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Main active clients
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "John Smith",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      caseType: "Road Accident Fund",
      status: "Active",
      addedDate: "2024-01-15",
      attorney: "Robert Johnson",
      caseValue: "500000",
      assignedAttorney: "Robert Johnson",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 987-6543",
      caseType: "Medical Negligence",
      status: "Active",
      addedDate: "2024-01-20",
      attorney: "Michael Chen",
      caseValue: "250000",
      assignedAttorney: "Michael Chen",
      registrationDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Robert Chen",
      firstName: "Robert",
      lastName: "Chen",
      email: "r.chen@techcorp.com",
      phone: "(555) 456-7890",
      caseType: "Civil Litigation",
      status: "Pending",
      addedDate: "2024-01-25",
      attorney: "Lisa Wang",
      caseValue: "1200000",
      assignedAttorney: "Lisa Wang",
      registrationDate: "2024-01-25",
    },
    {
      id: 4,
      name: "Maria Garcia",
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.g@enterprise.com",
      phone: "(555) 234-5678",
      caseType: "Divorce",
      status: "Active",
      addedDate: "2024-02-01",
      attorney: "David Miller",
      caseValue: "150000",
      assignedAttorney: "David Miller",
      registrationDate: "2024-02-01",
    },
    {
      id: 5,
      name: "James Wilson",
      firstName: "James",
      lastName: "Wilson",
      email: "j.wilson@realestate.com",
      phone: "(555) 345-6789",
      caseType: "Trust",
      status: "Active",
      addedDate: "2024-02-10",
      attorney: "Sarah Thompson",
      caseValue: "750000",
      assignedAttorney: "Sarah Thompson",
      registrationDate: "2024-02-10",
    },
    {
      id: 6,
      name: "Emily Davis",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.d@familytrust.com",
      phone: "(555) 567-8901",
      caseType: "Labour Matters",
      status: "Closed",
      addedDate: "2023-12-15",
      attorney: "Jennifer Lee",
      caseValue: "85000",
      assignedAttorney: "Jennifer Lee",
      registrationDate: "2023-12-15",
    },
  ]);

  const [deletedClients, setDeletedClients] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    totalCaseValue: 0,
  });

  // Permission checks
  const canAddClient =
    user?.permissions?.includes(PERMISSIONS.ADD_CLIENTS) ||
    user?.role === "admin";
  const canDeleteClient =
    user?.permissions?.includes(PERMISSIONS.DELETE_CLIENTS) ||
    user?.role === "admin";
  const canViewRecycleBin =
    user?.permissions?.includes(PERMISSIONS.VIEW_RECYCLE_BIN) ||
    user?.role === "admin";
  const canRestoreClient =
    user?.permissions?.includes(PERMISSIONS.RESTORE_CLIENTS) ||
    user?.role === "admin";
  const canManageUsers =
    user?.permissions?.includes(PERMISSIONS.MANAGE_USERS) ||
    user?.role === "admin";
  const canManageEmployees =
    user?.permissions?.includes(PERMISSIONS.MANAGE_EMPLOYEES) ||
    user?.role === "admin";
  // Calculate stats
  useEffect(() => {
    const totalClients = clients.length;
    const activeCases = clients.filter((c) => c.status === "Active").length;
    const totalCaseValue = clients.reduce(
      (sum, c) =>
        sum + (parseInt(String(c.caseValue).replace(/[^0-9]/g, "")) || 0),
      0,
    );
    setStats({
      totalClients,
      activeCases,
      totalCaseValue: `$${(totalCaseValue / 1000000).toFixed(1)}M`,
    });
  }, [clients]);

  // Available views based on permissions
  const [availableViews, setAvailableViews] = useState(["dashboard"]);
  useEffect(() => {
    const views = ["dashboard"];
    views.push("view-clients");
    if (canAddClient) views.push("add-client");
    if (canViewRecycleBin) views.push("recycle-bin");
    if (canManageUsers) views.push("user-management");
    if (canManageEmployees) views.push("employees"); // <-- ADD THIS LINE
    setAvailableViews(views);
    if (!views.includes(currentView)) setCurrentView("dashboard");
  }, [
    user,
    currentView,
    setCurrentView,
    canAddClient,
    canViewRecycleBin,
    canManageUsers,
    canManageEmployees, // <-- ADD THIS DEPENDENCY
  ]);

  const addAuditLog = (action, details, username) => {
    setAuditLogs((prev) =>
      [
        {
          id: Date.now(),
          action,
          details,
          username,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 100),
    );
  };

  const addClient = (client) => {
    if (!canAddClient) {
      alert("Permission denied.");
      return;
    }
    const newClient = { ...client, id: Date.now() };
    setClients([...clients, newClient]);
    addAuditLog("CLIENT_ADDED", `Added client: ${client.name}`, user?.username);
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: "success",
        message: `Client ${client.name} added`,
        read: false,
        autoClose: true,
      },
      ...prev,
    ]);
  };

  const deleteClient = (id) => {
    if (!canDeleteClient) {
      alert("Permission denied.");
      return;
    }
    const clientToDelete = clients.find((c) => c.id === id);
    if (clientToDelete) {
      const deletedClient = {
        ...clientToDelete,
        deletedDate: new Date().toISOString().split("T")[0],
        deletedBy: user?.username,
      };
      setDeletedClients((prev) => [...prev, deletedClient]);
      setClients((prev) => prev.filter((c) => c.id !== id));
      addAuditLog(
        "CLIENT_DELETED",
        `Deleted client: ${clientToDelete.name}`,
        user?.username,
      );
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "warning",
          message: `${clientToDelete.name} moved to Recycle Bin`,
          read: false,
          autoClose: true,
        },
        ...prev,
      ]);
    }
  };

  const restoreClient = (id) => {
    if (!canRestoreClient) {
      alert("Permission denied.");
      return;
    }
    const clientToRestore = deletedClients.find((c) => c.id === id);
    if (clientToRestore) {
      const { deletedDate, deletedBy, ...restored } = clientToRestore;
      setClients((prev) => [...prev, restored]);
      setDeletedClients((prev) => prev.filter((c) => c.id !== id));
      addAuditLog(
        "CLIENT_RESTORED",
        `Restored client: ${restored.name}`,
        user?.username,
      );
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "success",
          message: `${restored.name} restored`,
          read: false,
          autoClose: true,
        },
        ...prev,
      ]);
    }
  };

  const permanentlyDeleteClient = (id) => {
    if (user?.role !== "admin") {
      alert("Only administrators can permanently delete clients.");
      return;
    }
    const clientToDelete = deletedClients.find((c) => c.id === id);
    if (clientToDelete) {
      setDeletedClients((prev) => prev.filter((c) => c.id !== id));
      addAuditLog(
        "CLIENT_PERMANENTLY_DELETED",
        `Permanently deleted ${clientToDelete.name}`,
        user?.username,
      );
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "error",
          message: `${clientToDelete.name} permanently deleted`,
          read: false,
          autoClose: true,
        },
        ...prev,
      ]);
    }
  };

  const updateClient = (id, updatedData) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updatedData, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
    addAuditLog("CLIENT_UPDATED", `Updated client ID ${id}`, user?.username);
  };

  // Auto‑cleanup deleted clients older than 60 days
  useEffect(() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const expired = deletedClients.filter((client) => {
      const deletedDate = new Date(client.deletedDate);
      return deletedDate < sixtyDaysAgo;
    });

    if (expired.length > 0) {
      setDeletedClients((prev) =>
        prev.filter((client) => {
          const deletedDate = new Date(client.deletedDate);
          return deletedDate >= sixtyDaysAgo;
        }),
      );
      addAuditLog(
        "AUTO_CLEANUP",
        `Auto-deleted ${expired.length} expired client(s) from Recycle Bin`,
        "system",
      );
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "info",
          message: `${expired.length} client(s) automatically deleted from Recycle Bin (60-day retention)`,
          read: false,
          autoClose: true,
        },
        ...prev,
      ]);
    }
  }, [deletedClients]);

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const clearAllNotifications = () => setNotifications([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((n) => !n.autoClose || Date.now() - n.id > 5000),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Session timeout warning
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  useEffect(() => {
    if (!user) return;
    const warningTimer = setTimeout(
      () => setShowTimeoutWarning(true),
      25 * 60 * 1000,
    );
    const logoutTimer = setTimeout(() => onLogout(), 30 * 60 * 1000);
    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      setShowTimeoutWarning(false);
    };
    window.addEventListener("click", resetTimers);
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      window.removeEventListener("click", resetTimers);
    };
  }, [user, onLogout]);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <ClientList
            clients={clients}
            onDelete={deleteClient}
            onUpdate={updateClient}
            stats={stats}
            user={user}
            canDelete={canDeleteClient}
          />
        );
      case "add-client":
        return canAddClient ? (
          <AddClient onAddClient={addClient} user={user} />
        ) : (
          <div className="permission-denied">
            <h2>Access Denied</h2>
          </div>
        );
      case "recycle-bin":
        return canViewRecycleBin ? (
          <RecycleBin
            deletedClients={deletedClients}
            onRestore={restoreClient}
            onPermanentlyDelete={permanentlyDeleteClient}
            user={user}
            canRestore={canRestoreClient}
          />
        ) : (
          <div className="permission-denied">
            <h2>Access Denied</h2>
          </div>
        );
      case "user-management":
        return canManageUsers ? (
          <UserManagement currentUser={user} />
        ) : (
          <div className="permission-denied">
            <h2>Access Denied</h2>
          </div>
        );
      case "view-clients":
        return (
          <ViewClients
            clients={clients}
            onDelete={deleteClient}
            onUpdate={updateClient}
            stats={stats}
            user={user}
            canDelete={canDeleteClient}
          />
        );
      case "employees":
        return <Employees currentUser={user} />;
      default:
        return (
          <ClientList
            clients={clients}
            onDelete={deleteClient}
            onUpdate={updateClient}
            stats={stats}
            user={user}
            canDelete={canDeleteClient}
          />
        );
    }
  };

  return (
    <div
      className={`dashboard ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <Sidebar
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v);
          setIsMobileMenuOpen(false);
        }}
        availableViews={availableViews}
        user={user}
        isMobileOpen={isMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="dashboard-main">
        <Navbar
          onLogout={onLogout}
          user={user}
          auditLogs={auditLogs}
          notifications={notifications}
          onMarkNotificationAsRead={markNotificationAsRead}
          onClearNotifications={clearAllNotifications}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        {/* Conditionally show user-info-banner only on dashboard view */}
        {currentView === "dashboard" && (
          <div className="user-info-banner">
            <div className="user-welcome">
              <h2>Welcome back, {user?.name}</h2>
              <p>
                {user?.role === "admin"
                  ? "Administrator"
                  : user?.role === "attorney"
                    ? "Senior Attorney"
                    : "Paralegal"}{" "}
                • Last login: Today
              </p>
            </div>
            <div className="user-stats">
              <div className="user-stat">
                <span className="stat-icon">👥</span>
                <div>
                  <h4>{clients.length}</h4>
                  <p>Total Clients</p>
                </div>
              </div>
              <div className="user-stat">
                <span className="stat-icon">⚖️</span>
                <div>
                  <h4>
                    {
                      clients.filter((c) => c.assignedAttorney === user?.name)
                        .length
                    }
                  </h4>
                  <p>Your Cases</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="dashboard-content">{renderView()}</main>
      </div>
      {showTimeoutWarning && (
        <div className="session-timeout-warning">
          <div className="timeout-content">
            <span className="timeout-icon">⏰</span>
            <div>
              <h4>Session expiring soon</h4>
              <p>You will be logged out due to inactivity.</p>
            </div>
            <button
              className="timeout-extend"
              onClick={() => setShowTimeoutWarning(false)}
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
