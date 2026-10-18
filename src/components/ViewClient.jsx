// src/components/ViewClient.jsx
import React, { useState, useEffect } from "react";
import "./ViewClient.css";

const ViewClient = ({ client, onClose, onUpdate, onDelete, user }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newDocuments, setNewDocuments] = useState([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDetails, setCallDetails] = useState({
    date: "",
    time: "",
    notes: "",
  });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    amount: "",
    description: "",
  });

  const caseTypeOptions = [
    "Road Accident Fund",
    "Medical Negligence",
    "Civil Litigation",
    "Divorce",
    "Trust",
    "Labour Matters",
    "Estate & Wills",
    "Maintenance",
    "Contracts",
    "Bail Application",
  ];

  useEffect(() => {
    if (client) {
      setEditedClient({ ...client });
      if (client.avatar) setAvatarPreview(client.avatar);
    }
    setNewDocuments([]);
  }, [client]);

  // --- Document upload in edit mode ---
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDocuments((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePendingDocument = (docId) => {
    setNewDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  // --- Quick Actions handlers ---
  const handleQuickAddDocument = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: reader.result,
      };
      const updatedDocs = [...(client.documents || []), newDoc];
      onUpdate(client.id, { ...client, documents: updatedDocs });
      alert(`Document "${file.name}" added successfully.`);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleScheduleCall = () => {
    if (!callDetails.date || !callDetails.time) {
      alert("Please select date and time for the call.");
      return;
    }
    const callNote = `Scheduled call on ${callDetails.date} at ${callDetails.time}. Notes: ${callDetails.notes}`;
    const currentNotes = client.notes || "";
    const updatedNotes = currentNotes
      ? currentNotes + "\n" + callNote
      : callNote;
    onUpdate(client.id, { ...client, notes: updatedNotes });
    setShowCallModal(false);
    setCallDetails({ date: "", time: "", notes: "" });
    alert("Call scheduled and added to client notes.");
  };

  const handleCreateInvoice = () => {
    if (!invoiceDetails.amount || invoiceDetails.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    const invoiceNote = `Invoice created: $${invoiceDetails.amount} - ${invoiceDetails.description}`;
    const currentNotes = client.notes || "";
    const updatedNotes = currentNotes
      ? currentNotes + "\n" + invoiceNote
      : invoiceNote;
    onUpdate(client.id, { ...client, notes: updatedNotes });
    setShowInvoiceModal(false);
    setInvoiceDetails({ amount: "", description: "" });
    alert(`Invoice for $${invoiceDetails.amount} recorded.`);
  };

  // --- Fixed Print Function ---
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${client.firstName} ${client.lastName} - Client Profile</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 40px;
              color: #1e293b;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #1e3a8a;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0;
              color: #64748b;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #1e3a8a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-weight: 600;
              color: #475569;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 14px;
              color: #1e293b;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            .status-active { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef9c3; color: #854d0e; }
            .status-closed { background: #f1f5f9; color: #334155; }
            .documents-list {
              margin-top: 10px;
            }
            .document-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eef2f6;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Justice Legal Partners</h1>
            <p>Client Profile - Printed on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Full Name</span><span class="info-value">${client.firstName} ${client.middleName ? client.middleName + " " : ""}${client.lastName}</span></div>
              <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="status-badge status-${client.status?.toLowerCase()}">${client.status}</span></span></div>
              <div class="info-item"><span class="info-label">Date of Birth</span><span class="info-value">${client.dateOfBirth || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Gender</span><span class="info-value">${client.gender || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Nationality</span><span class="info-value">${client.nationality || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Occupation</span><span class="info-value">${client.occupation || "N/A"}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Email</span><span class="info-value">${client.email}</span></div>
              <div class="info-item"><span class="info-label">Phone</span><span class="info-value">${client.phone || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Mobile</span><span class="info-value">${client.mobile || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Address</span><span class="info-value">${client.address || "N/A"}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Case Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Case Type</span><span class="info-value">${client.caseType}</span></div>
              <div class="info-item"><span class="info-label">Case Number</span><span class="info-value">${client.caseNumber || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Assigned Attorney</span><span class="info-value">${client.assignedAttorney || "Not assigned"}</span></div>
              <div class="info-item"><span class="info-label">Registration Date</span><span class="info-value">${client.registrationDate || "N/A"}</span></div>
              <div class="info-item full-width"><span class="info-label">Case Description</span><span class="info-value">${client.caseDescription || "N/A"}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Documents (${client.documents?.length || 0})</div>
            <div class="documents-list">
              ${client.documents && client.documents.length > 0 ? client.documents.map((doc) => `<div class="document-item"><span>${doc.name}</span><span>${(doc.size / 1024).toFixed(2)} KB</span></div>`).join("") : "<p>No documents uploaded.</p>"}
            </div>
          </div>

          <div class="footer">
            Confidential Document - Justice Legal Partners
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  // --- Other existing handlers ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditedClient((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedClient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (
      !editedClient.firstName ||
      !editedClient.lastName ||
      !editedClient.email
    ) {
      alert("First name, last name, and email are required.");
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updated = {
        ...editedClient,
        name: `${editedClient.firstName} ${editedClient.middleName ? editedClient.middleName + " " : ""}${editedClient.lastName}`.trim(),
        lastModified: new Date().toISOString(),
        modifiedBy: user?.name || "Admin",
        updatedAt: new Date().toISOString(),
        documents: [...(editedClient.documents || []), ...newDocuments],
      };
      onUpdate(client.id, updated);
      setIsEditMode(false);
      setNewDocuments([]);
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete ${client.firstName} ${client.lastName}? It will be moved to recycle bin.`,
      )
    ) {
      onDelete(client.id);
      onClose();
    }
  };

  const getInitials = () => {
    const first = client?.firstName ? client.firstName[0] : "";
    const last = client?.lastName ? client.lastName[0] : "";
    return `${first}${last}`.toUpperCase() || "?";
  };

  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    const cleaned = ("" + phone).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const map = {
      Active: "success",
      Inactive: "warning",
      Pending: "info",
      Closed: "error",
    };
    return map[status] || "default";
  };

  const getCaseTypeClass = (caseType) => {
    if (!caseType) return "";
    const map = {
      "Road Accident Fund": "road-accident-fund",
      "Medical Negligence": "medical-negligence",
      "Civil Litigation": "civil-litigation",
      Divorce: "divorce",
      Trust: "trust",
      "Labour Matters": "labour-matters",
      "Estate & Wills": "estate-wills",
      Maintenance: "maintenance",
      Contracts: "contracts",
      "Bail Application": "bail-application",
    };
    return map[caseType] || caseType.toLowerCase().replace(/\s+/g, "-");
  };

  if (!client) return null;

  return (
    <div className="view-client-modal" onClick={onClose}>
      <div
        className={`view-client-content ${isEditMode ? "edit-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal-btn" onClick={onClose}>
          ✕
        </button>

        {/* Client Header */}
        <div className="client-header">
          <div className="client-profile-section">
            <div className="client-avatar-container">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${client.firstName} ${client.lastName}`}
                  className="client-avatar"
                />
              ) : (
                <div className="client-avatar-placeholder">{getInitials()}</div>
              )}
              {isEditMode && (
                <label className="avatar-upload-btn">
                  📷 Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
            <div className="client-info-header">
              {isEditMode ? (
                <div className="name-input-group">
                  <input
                    type="text"
                    name="firstName"
                    value={editedClient?.firstName || ""}
                    onChange={handleInputChange}
                    className="form-control name-input"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    name="middleName"
                    value={editedClient?.middleName || ""}
                    onChange={handleInputChange}
                    className="form-control name-input"
                    placeholder="Middle Name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={editedClient?.lastName || ""}
                    onChange={handleInputChange}
                    className="form-control name-input"
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h1 className="client-name">
                  {client.firstName}{" "}
                  {client.middleName && `${client.middleName} `}
                  {client.lastName}
                </h1>
              )}
              <div className="client-status-container">
                <div
                  className={`client-status-badge status-${getStatusClass(client.status)}`}
                >
                  <span className="status-dot"></span>
                  {isEditMode ? (
                    <select
                      name="status"
                      value={editedClient?.status || "Active"}
                      onChange={handleInputChange}
                      className="form-control status-select"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Pending</option>
                      <option>Closed</option>
                    </select>
                  ) : (
                    client.status
                  )}
                </div>
                <div className="client-id">ID: {client.id || "N/A"}</div>
              </div>
              <div className="client-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Case Type</span>
                  <span
                    className={`meta-value case-type-${getCaseTypeClass(client.caseType)}`}
                  >
                    {client.caseType}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Assigned Attorney</span>
                  <span className="meta-value">
                    {client.assignedAttorney || "Not assigned"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Registration Date</span>
                  <span className="meta-value">
                    {formatDate(client.registrationDate)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Modified</span>
                  <span className="meta-value">
                    {client.updatedAt ? formatDate(client.updatedAt) : "Never"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="client-details-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📋 Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            👤 Personal Info
          </button>
          <button
            className={`tab-btn ${activeTab === "case" ? "active" : ""}`}
            onClick={() => setActiveTab("case")}
          >
            ⚖️ Case Details
          </button>
          <button
            className={`tab-btn ${activeTab === "billing" ? "active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            💰 Billing Info
          </button>
          <button
            className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            📁 Documents
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-grid">
              <div className="overview-section">
                <h3>🔄 Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-details">
                      <div className="activity-title">
                        Client Profile Updated
                      </div>
                      <div className="activity-time">
                        {formatDate(client.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">📧</div>
                    <div className="activity-details">
                      <div className="activity-title">Email Sent to Client</div>
                      <div className="activity-time">Yesterday at 2:30 PM</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">📅</div>
                    <div className="activity-details">
                      <div className="activity-title">
                        Consultation Scheduled
                      </div>
                      <div className="activity-time">Tomorrow at 10:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overview-section">
                <h3>📊 Quick Stats</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <div className="stat-label">Total Billed</div>
                      <div className="stat-value">$0</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-info">
                      <div className="stat-label">Documents</div>
                      <div className="stat-value">
                        {client.documents?.length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📞</div>
                    <div className="stat-info">
                      <div className="stat-label">Last Contact</div>
                      <div className="stat-value">N/A</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                      <div className="stat-label">Next Meeting</div>
                      <div className="stat-value">N/A</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overview-section">
                <h3>📝 Recent Notes</h3>
                <div className="notes-preview">
                  {client.notes ? (
                    <div className="notes-content-preview">
                      {client.notes.length > 200
                        ? `${client.notes.substring(0, 200)}...`
                        : client.notes}
                    </div>
                  ) : (
                    <div className="no-notes">No notes added</div>
                  )}
                </div>
              </div>
              <div className="overview-section">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions">
                  <button
                    className="quick-action-btn"
                    onClick={() =>
                      (window.location.href = `mailto:${client.email}`)
                    }
                  >
                    📧 Send Email
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => setShowCallModal(true)}
                  >
                    📞 Schedule Call
                  </button>
                  <label className="quick-action-btn upload-label">
                    📄 Add Document
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={handleQuickAddDocument}
                      style={{ display: "none" }}
                    />
                  </label>
                  <button
                    className="quick-action-btn"
                    onClick={() => setShowInvoiceModal(true)}
                  >
                    💰 Create Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information Tab - unchanged */}
          {activeTab === "personal" && (
            <div className="detail-grid">{/* ... */}</div>
          )}

          {/* Case Details Tab - unchanged */}
          {activeTab === "case" && (
            <div className="detail-grid">{/* ... */}</div>
          )}

          {/* Billing Tab - unchanged */}
          {activeTab === "billing" && (
            <div className="detail-grid">{/* ... */}</div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="documents-section">
              <h3>📁 Client Documents</h3>
              {isEditMode && (
                <div className="documents-upload-area">
                  <label className="upload-document-btn">
                    📤 Upload Documents (multiple)
                    <input
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                  {newDocuments.length > 0 && (
                    <div className="pending-documents">
                      <p>Pending to add:</p>
                      <ul>
                        {newDocuments.map((doc) => (
                          <li key={doc.id}>
                            {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                            <button
                              type="button"
                              onClick={() => removePendingDocument(doc.id)}
                            >
                              ❌
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="documents-list">
                {editedClient?.documents?.length > 0 ||
                client.documents?.length > 0 ? (
                  (editedClient?.documents || client.documents).map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-icon">📄</div>
                      <div className="document-info">
                        <div className="document-name">{doc.name}</div>
                        <div className="document-meta">
                          {(doc.size / 1024).toFixed(2)} KB •{" "}
                          {doc.type || "application/octet-stream"}
                        </div>
                      </div>
                      <a
                        href={doc.content}
                        download={doc.name}
                        className="document-action-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="no-documents">
                    No documents uploaded for this client.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCallModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCallModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Schedule a Call</h3>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={callDetails.date}
                  onChange={(e) =>
                    setCallDetails({ ...callDetails, date: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={callDetails.time}
                  onChange={(e) =>
                    setCallDetails({ ...callDetails, time: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={callDetails.notes}
                  onChange={(e) =>
                    setCallDetails({ ...callDetails, notes: e.target.value })
                  }
                  rows="2"
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowCallModal(false)}>Cancel</button>
                <button onClick={handleScheduleCall}>Schedule</button>
              </div>
            </div>
          </div>
        )}

        {showInvoiceModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowInvoiceModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Create Invoice</h3>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceDetails.amount}
                  onChange={(e) =>
                    setInvoiceDetails({
                      ...invoiceDetails,
                      amount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={invoiceDetails.description}
                  onChange={(e) =>
                    setInvoiceDetails({
                      ...invoiceDetails,
                      description: e.target.value,
                    })
                  }
                  placeholder="Legal services, consultation, etc."
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowInvoiceModal(false)}>
                  Cancel
                </button>
                <button onClick={handleCreateInvoice}>Create Invoice</button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="client-actions">
          {isEditMode ? (
            <div className="edit-actions">
              <button
                className="action-btn btn-cancel"
                onClick={() => {
                  setIsEditMode(false);
                  setEditedClient({ ...client });
                  setAvatarPreview(client.avatar || null);
                  setNewDocuments([]);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="action-btn btn-save"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>Saving...
                  </>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            </div>
          ) : (
            <div className="view-actions">
              <button
                className="action-btn btn-edit"
                onClick={() => setIsEditMode(true)}
              >
                ✏️ Edit Client
              </button>
              <button className="action-btn btn-delete" onClick={handleDelete}>
                🗑️ Delete Client
              </button>
              <button className="action-btn btn-print" onClick={handlePrint}>
                🖨️ Print Profile
              </button>
              <button
                className="action-btn btn-email"
                onClick={() =>
                  (window.location.href = `mailto:${client.email}`)
                }
              >
                📧 Send Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewClient;
