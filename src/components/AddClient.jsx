// src/components/AddClient.jsx
import React, { useState } from "react";
import "./AddClient.css";

const AddClient = ({ onAddClient, user }) => {
  const [client, setClient] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    ssnOrId: "",
    nationality: "",
    email: "",
    phone: "",
    mobile: "",
    workPhone: "",
    fax: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    clientType: "Individual",
    maritalStatus: "",
    occupation: "",
    employer: "",
    annualIncome: "",
    caseType: "",
    caseNumber: "",
    assignedAttorney: user?.name || "",
    caseDescription: "",
    caseValue: "",
    accountStartDate: new Date().toISOString().split("T")[0],
    registrationDate: new Date().toISOString().split("T")[0],
    accountStatus: "Active",
    billingMethod: "Monthly",
    hourlyRate: "",
    retainerAmount: "",
    paymentTerms: "Net 30",
    billingAddress: "",
    billingContact: "",
    billingEmail: "",
    billingPhone: "",
    paymentMethod: "",
    creditCardLastFour: "",
    creditCardType: "",
    bankName: "",
    bankAccountNumber: "",
    routingNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    preferredContactMethod: "Email",
    referralSource: "",
    languagePreference: "English",
    specialNeeds: "",
    notes: "",
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [documents, setDocuments] = useState([]); // new state for files

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setClient((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            content: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !client.firstName ||
      !client.lastName ||
      !client.email ||
      !client.caseType
    ) {
      alert("First name, last name, email, and case type are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const generateClientId = () => {
        const prefix = client.clientType === "Corporate" ? "CORP" : "IND";
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        return `${prefix}-${timestamp}-${random}`;
      };
      const completeClient = {
        ...client,
        id: generateClientId(),
        name: `${client.firstName} ${client.middleName ? client.middleName + " " : ""}${client.lastName}`.trim(),
        status: "Active",
        addedDate: new Date().toISOString().split("T")[0],
        caseValue: client.caseValue || "$0",
        attorney: user?.name || "System Administrator",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: user?.name || "Admin",
        balance: 0,
        outstandingInvoices: 0,
        documents: documents, // attach documents
      };
      onAddClient(completeClient);
      // reset form
      setClient({
        /* initial state */
      });
      setAvatarPreview(null);
      setDocuments([]);
      setActiveSection("basic");
      alert(`Client ${completeClient.name} added successfully!`);
    } catch (error) {
      console.error(error);
      alert("Failed to add client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) =>
    setClient((prev) => ({ ...prev, [field]: value }));

  const getInitials = () => {
    const first = client.firstName ? client.firstName[0] : "";
    const last = client.lastName ? client.lastName[0] : "";
    return `${first}${last}`.toUpperCase() || "?";
  };

  return (
    <div className="add-client">
      <div className="section-header">
        <h2>Add New Client</h2>
        <p>Enter comprehensive client information</p>
      </div>
      <div className="form-sections-nav">
        <button
          className={`section-nav-btn ${activeSection === "basic" ? "active" : ""}`}
          onClick={() => setActiveSection("basic")}
          type="button"
        >
          <span className="nav-icon">👤</span> Basic Info
        </button>
        <button
          className={`section-nav-btn ${activeSection === "contact" ? "active" : ""}`}
          onClick={() => setActiveSection("contact")}
          type="button"
        >
          <span className="nav-icon">📱</span> Contact
        </button>
        <button
          className={`section-nav-btn ${activeSection === "case" ? "active" : ""}`}
          onClick={() => setActiveSection("case")}
          type="button"
        >
          <span className="nav-icon">⚖️</span> Case Info
        </button>
        <button
          className={`section-nav-btn ${activeSection === "billing" ? "active" : ""}`}
          onClick={() => setActiveSection("billing")}
          type="button"
        >
          <span className="nav-icon">💰</span> Billing
        </button>
        <button
          className={`section-nav-btn ${activeSection === "additional" ? "active" : ""}`}
          onClick={() => setActiveSection("additional")}
          type="button"
        >
          <span className="nav-icon">📝</span> Additional
        </button>
      </div>
      <form onSubmit={handleSubmit} className="client-form">
        {/* Avatar upload (unchanged) */}
        <div className="form-group full-width avatar-upload-section">
          <label>Client Photo</label>
          <div className="avatar-upload-container">
            <div className="avatar-preview">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder-large">{getInitials()}</div>
              )}
            </div>
            <div className="avatar-upload-controls">
              <label className="file-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <span>📷 Upload Photo</span>
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  className="remove-avatar-btn"
                  onClick={() => {
                    setAvatarPreview(null);
                    setClient((prev) => ({ ...prev, avatar: null }));
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info Section (unchanged) */}
        {activeSection === "basic" && (
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="required">First Name</label>
                <input
                  type="text"
                  value={client.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  value={client.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label className="required">Last Name</label>
                <input
                  type="text"
                  value={client.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={client.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={client.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-Binary</option>
                </select>
              </div>
              <div className="form-group">
                <label>SSN / ID Number</label>
                <input
                  type="text"
                  value={client.ssnOrId}
                  onChange={(e) => handleInputChange("ssnOrId", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input
                  type="text"
                  value={client.nationality}
                  onChange={(e) =>
                    handleInputChange("nationality", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select
                  value={client.maritalStatus}
                  onChange={(e) =>
                    handleInputChange("maritalStatus", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={client.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Employer</label>
                <input
                  type="text"
                  value={client.employer}
                  onChange={(e) =>
                    handleInputChange("employer", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Annual Income ($)</label>
                <input
                  type="number"
                  value={client.annualIncome}
                  onChange={(e) =>
                    handleInputChange("annualIncome", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Section (unchanged) */}
        {activeSection === "contact" && (
          <div className="form-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="required">Email Address</label>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Primary Phone</label>
                <input
                  type="tel"
                  value={client.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mobile Phone</label>
                <input
                  type="tel"
                  value={client.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Work Phone</label>
                <input
                  type="tel"
                  value={client.workPhone}
                  onChange={(e) =>
                    handleInputChange("workPhone", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Fax Number</label>
                <input
                  type="tel"
                  value={client.fax}
                  onChange={(e) => handleInputChange("fax", e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  value={client.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={client.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={client.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  value={client.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={client.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Case Info Section (unchanged) */}
        {activeSection === "case" && (
          <div className="form-section">
            <h3 className="section-title">Case Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="required">Case Type</label>
                <select
                  value={client.caseType}
                  onChange={(e) =>
                    handleInputChange("caseType", e.target.value)
                  }
                  required
                >
                  <option value="">Select Case Type</option>
                  {caseTypeOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Case Number</label>
                <input
                  type="text"
                  value={client.caseNumber}
                  onChange={(e) =>
                    handleInputChange("caseNumber", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Assigned Attorney</label>
                <input
                  type="text"
                  value={client.assignedAttorney}
                  readOnly
                  className="read-only-input"
                />
              </div>
              <div className="form-group">
                <label>Account Start Date</label>
                <input
                  type="date"
                  value={client.accountStartDate}
                  onChange={(e) =>
                    handleInputChange("accountStartDate", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Registration Date</label>
                <input
                  type="date"
                  value={client.registrationDate}
                  onChange={(e) =>
                    handleInputChange("registrationDate", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Account Status</label>
                <select
                  value={client.accountStatus}
                  onChange={(e) =>
                    handleInputChange("accountStatus", e.target.value)
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                  <option>Closed</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Case Description</label>
                <textarea
                  value={client.caseDescription}
                  onChange={(e) =>
                    handleInputChange("caseDescription", e.target.value)
                  }
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Case Value ($)</label>
                <input
                  type="number"
                  value={client.caseValue}
                  onChange={(e) =>
                    handleInputChange("caseValue", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Billing Section (unchanged) */}
        {activeSection === "billing" && (
          <div className="form-section">
            <h3 className="section-title">Billing & Payment Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Billing Method</label>
                <select
                  value={client.billingMethod}
                  onChange={(e) =>
                    handleInputChange("billingMethod", e.target.value)
                  }
                >
                  <option>Monthly</option>
                  <option>Hourly</option>
                  <option>Contingency</option>
                  <option>Flat Fee</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  value={client.hourlyRate}
                  onChange={(e) =>
                    handleInputChange("hourlyRate", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Retainer Amount ($)</label>
                <input
                  type="number"
                  value={client.retainerAmount}
                  onChange={(e) =>
                    handleInputChange("retainerAmount", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <select
                  value={client.paymentTerms}
                  onChange={(e) =>
                    handleInputChange("paymentTerms", e.target.value)
                  }
                >
                  <option>Net 30</option>
                  <option>Net 15</option>
                  <option>Net 60</option>
                </select>
              </div>
              <div className="form-group full-width">
                <div className="address-copy-row">
                  <label>Billing Address</label>
                  <button
                    type="button"
                    className="copy-address-btn"
                    onClick={() => {
                      setClient((prev) => ({
                        ...prev,
                        billingAddress: prev.address,
                        billingContact: `${prev.firstName} ${prev.lastName}`,
                        billingEmail: prev.email,
                        billingPhone: prev.phone,
                      }));
                    }}
                  >
                    Copy from Primary Address
                  </button>
                </div>
                <input
                  type="text"
                  value={client.billingAddress}
                  onChange={(e) =>
                    handleInputChange("billingAddress", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Billing Contact</label>
                <input
                  type="text"
                  value={client.billingContact}
                  onChange={(e) =>
                    handleInputChange("billingContact", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Billing Email</label>
                <input
                  type="email"
                  value={client.billingEmail}
                  onChange={(e) =>
                    handleInputChange("billingEmail", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Billing Phone</label>
                <input
                  type="tel"
                  value={client.billingPhone}
                  onChange={(e) =>
                    handleInputChange("billingPhone", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={client.paymentMethod}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option>Credit Card</option>
                  <option>Bank Transfer</option>
                  <option>Check</option>
                  <option>Cash</option>
                </select>
              </div>
              {client.paymentMethod === "Credit Card" && (
                <>
                  <div className="form-group">
                    <label>Credit Card Type</label>
                    <select
                      value={client.creditCardType}
                      onChange={(e) =>
                        handleInputChange("creditCardType", e.target.value)
                      }
                    >
                      <option>Visa</option>
                      <option>MasterCard</option>
                      <option>American Express</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength="4"
                      value={client.creditCardLastFour}
                      onChange={(e) =>
                        handleInputChange(
                          "creditCardLastFour",
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                    />
                  </div>
                </>
              )}
              {client.paymentMethod === "Bank Transfer" && (
                <>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={client.bankName}
                      onChange={(e) =>
                        handleInputChange("bankName", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      value={client.bankAccountNumber}
                      onChange={(e) =>
                        handleInputChange("bankAccountNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Routing Number</label>
                    <input
                      type="text"
                      value={client.routingNumber}
                      onChange={(e) =>
                        handleInputChange("routingNumber", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Additional Section WITH DOCUMENT UPLOAD */}
        {activeSection === "additional" && (
          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  value={client.emergencyContactName}
                  onChange={(e) =>
                    handleInputChange("emergencyContactName", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={client.emergencyContactPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyContactPhone", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  value={client.emergencyContactRelationship}
                  onChange={(e) =>
                    handleInputChange(
                      "emergencyContactRelationship",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label>Preferred Contact Method</label>
                <select
                  value={client.preferredContactMethod}
                  onChange={(e) =>
                    handleInputChange("preferredContactMethod", e.target.value)
                  }
                >
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Text Message</option>
                  <option>Mail</option>
                </select>
              </div>
              <div className="form-group">
                <label>Referral Source</label>
                <select
                  value={client.referralSource}
                  onChange={(e) =>
                    handleInputChange("referralSource", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option>Existing Client</option>
                  <option>Attorney Referral</option>
                  <option>Online Search</option>
                  <option>Advertisement</option>
                  <option>Social Media</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language Preference</label>
                <select
                  value={client.languagePreference}
                  onChange={(e) =>
                    handleInputChange("languagePreference", e.target.value)
                  }
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Chinese</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Special Needs / Accommodations</label>
                <textarea
                  value={client.specialNeeds}
                  onChange={(e) =>
                    handleInputChange("specialNeeds", e.target.value)
                  }
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Additional Notes</label>
                <textarea
                  value={client.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows="4"
                />
              </div>

              {/* Document Upload Section */}
              <div className="form-group full-width">
                <label>Client Documents</label>
                <input type="file" multiple onChange={handleDocumentUpload} />
                {documents.length > 0 && (
                  <ul className="document-list">
                    {documents.map((doc) => (
                      <li key={doc.id}>
                        {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Client..." : "Add Client to System"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              if (window.confirm("Clear all data?")) {
                /* reset logic */
              }
            }}
            disabled={isSubmitting}
          >
            Clear All
          </button>
        </div>
        <div className="form-navigation-buttons">
          {activeSection !== "basic" && (
            <button
              type="button"
              className="nav-prev-btn"
              onClick={() => {
                const sections = [
                  "basic",
                  "contact",
                  "case",
                  "billing",
                  "additional",
                ];
                const idx = sections.indexOf(activeSection);
                if (idx > 0) setActiveSection(sections[idx - 1]);
              }}
            >
              ← Previous
            </button>
          )}
          {activeSection !== "additional" && (
            <button
              type="button"
              className="nav-next-btn"
              onClick={() => {
                const sections = [
                  "basic",
                  "contact",
                  "case",
                  "billing",
                  "additional",
                ];
                const idx = sections.indexOf(activeSection);
                if (idx < sections.length - 1)
                  setActiveSection(sections[idx + 1]);
              }}
            >
              Next →
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddClient;
