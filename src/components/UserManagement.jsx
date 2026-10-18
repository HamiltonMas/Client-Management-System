// src/components/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  PERMISSIONS,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../constants/permissions";
import "./UserManagement.css";

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "attorney",
    permissions: [],
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const stored = localStorage.getItem("lawFirmUsers");
    if (stored) setUsers(JSON.parse(stored));
  };

  const saveUsers = (updatedUsers) => {
    localStorage.setItem("lawFirmUsers", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        name: "",
        email: "",
        role: "attorney",
        permissions: [...ROLE_PERMISSIONS.attorney],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: [...ROLE_PERMISSIONS[role]],
    }));
  };

  const togglePermission = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.username ||
      (!editingUser && !formData.password) ||
      !formData.name ||
      !formData.email
    ) {
      alert("Please fill all required fields");
      return;
    }

    let updatedUsers = [...users];
    if (editingUser) {
      const index = updatedUsers.findIndex((u) => u.id === editingUser.id);
      if (index !== -1) {
        updatedUsers[index] = {
          ...updatedUsers[index],
          username: formData.username,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions,
        };
        if (formData.password) updatedUsers[index].password = formData.password;
      }
    } else {
      const newId = Math.max(...users.map((u) => u.id), 0) + 1;
      updatedUsers.push({
        id: newId,
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
      });
    }
    saveUsers(updatedUsers);
    handleCloseModal();
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      saveUsers(updatedUsers);
    }
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <p>Create and manage system users with role-based permissions</p>
      </div>
      <div className="user-actions">
        <button className="btn-add-user" onClick={() => handleOpenModal()}>
          + Add New User
        </button>
      </div>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="permissions-list">
                    {user.permissions.slice(0, 3).map((p) => (
                      <span key={p} className="perm-badge">
                        {p.replace(/_/g, " ")}
                      </span>
                    ))}
                    {user.permissions.length > 3 && (
                      <span className="perm-badge">
                        +{user.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-icons">
                    <button
                      className="icon-btn edit"
                      onClick={() => handleOpenModal(user)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {!editingUser && "*"}</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {editingUser && (
                  <small>Leave blank to keep current password</small>
                )}
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="attorney">Attorney</option>
                  <option value="paralegal">Paralegal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm} className="perm-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                      />
                      <span>{perm.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit">
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
