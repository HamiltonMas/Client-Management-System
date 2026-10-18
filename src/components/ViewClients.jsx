// src/components/ViewClients.jsx
import React, { useState, useMemo } from "react";
import ViewClient from "./ViewClient";
import "./ViewClients.css";

const ViewClients = ({
  clients,
  onDelete,
  onUpdate,
  stats,
  user,
  canDelete,
}) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const getClientName = (client) =>
    client.name || `${client.firstName} ${client.lastName}`;
  const getClientEmail = (client) => client.email || "—";
  const getClientPhone = (client) => client.phone || "—";
  const getClientAttorney = (client) =>
    client.assignedAttorney || client.attorney || "System Administrator";
  const getClientCaseType = (client) => client.caseType || "Other";
  const getClientStatus = (client) => client.status || "Active";
  const getClientAddedDate = (client) =>
    client.addedDate ||
    client.registrationDate ||
    new Date().toISOString().split("T")[0];

  const filteredAndSortedClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    let filtered = clients.filter((client) => {
      const matchesSearch =
        searchTerm === "" ||
        getClientName(client)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getClientEmail(client)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getClientPhone(client).includes(searchTerm) ||
        getClientCaseType(client)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getClientAttorney(client)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(client.id).includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" ||
        getClientStatus(client).toLowerCase() === statusFilter.toLowerCase();
      const matchesCaseType =
        caseTypeFilter === "all" ||
        getClientCaseType(client).toLowerCase() ===
          caseTypeFilter.toLowerCase();
      let matchesDateRange = true;
      const addedDate = getClientAddedDate(client);
      if (dateRange.start && addedDate)
        matchesDateRange = new Date(addedDate) >= new Date(dateRange.start);
      if (dateRange.end && addedDate)
        matchesDateRange =
          matchesDateRange && new Date(addedDate) <= new Date(dateRange.end);
      return (
        matchesSearch && matchesStatus && matchesCaseType && matchesDateRange
      );
    });
    filtered.sort((a, b) => {
      let comparison = 0;
      const nameA = getClientName(a);
      const nameB = getClientName(b);
      const statusA = getClientStatus(a);
      const statusB = getClientStatus(b);
      const caseTypeA = getClientCaseType(a);
      const caseTypeB = getClientCaseType(b);
      switch (sortBy) {
        case "name":
          comparison = nameA.localeCompare(nameB);
          break;
        case "status":
          comparison = statusA.localeCompare(statusB);
          break;
        case "caseType":
          comparison = caseTypeA.localeCompare(caseTypeB);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return filtered;
  }, [
    clients,
    searchTerm,
    statusFilter,
    caseTypeFilter,
    dateRange,
    sortBy,
    sortOrder,
  ]);

  const getCaseTypeClass = (caseType) => {
    const map = {
      "Road Accident Fund": "road-accident",
      "Medical Negligence": "medical-negligence",
      "Civil Litigation": "civil-litigation",
      Divorce: "divorce",
      Trust: "trust",
      "Labour Matters": "labour",
      "Estate & Wills": "estate",
      Maintenance: "maintenance",
      Contracts: "contracts",
      "Bail Application": "bail",
    };
    return map[caseType] || caseType?.toLowerCase().replace(/\s+/g, "-");
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "active") return "status-active";
    if (s === "closed") return "status-closed";
    if (s === "pending") return "status-pending";
    return "status-active";
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const handleUpdateClient = (id, updatedData) => {
    onUpdate(id, updatedData);
    setIsViewModalOpen(false);
  };

  const handleDeleteClient = (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      onDelete(id);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCaseTypeFilter("all");
    setDateRange({ start: "", end: "" });
    setSortBy("name");
    setSortOrder("asc");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (caseTypeFilter !== "all") count++;
    if (dateRange.start) count++;
    if (dateRange.end) count++;
    if (searchTerm) count++;
    return count;
  };

  return (
    <div className="view-clients">
      <div className="section-header">
        <h2>All Clients</h2>
        <p>Manage your firm's clients and cases</p>
      </div>

      <div className="search-filter-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, phone, case type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>
        <div className="filter-actions">
          <button
            className={`filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters{" "}
            {getActiveFiltersCount() > 0 && (
              <span className="filter-badge">{getActiveFiltersCount()}</span>
            )}
          </button>
          {(statusFilter !== "all" ||
            caseTypeFilter !== "all" ||
            dateRange.start ||
            dateRange.end ||
            searchTerm) && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Case Type</label>
              <select
                value={caseTypeFilter}
                onChange={(e) => setCaseTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                {caseTypeOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="status">Status</option>
                <option value="caseType">Case Type</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="results-summary">
        <span>
          Showing <strong>{filteredAndSortedClients.length}</strong> of{" "}
          <strong>{clients.length}</strong> clients
        </span>
      </div>

      <div className="table-container">
        {filteredAndSortedClients.length > 0 ? (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Case Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="client-cell">
                      <div className="client-avatar-small">
                        <span>{getClientName(client).charAt(0)}</span>
                      </div>
                      <div>
                        <div className="client-name">
                          {getClientName(client)}
                        </div>
                        <div className="client-attorney">
                          {getClientAttorney(client)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{getClientEmail(client)}</div>
                    <div className="client-phone">{getClientPhone(client)}</div>
                  </td>
                  <td>
                    <span
                      className={`case-type ${getCaseTypeClass(getClientCaseType(client))}`}
                    >
                      {getClientCaseType(client)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(getClientStatus(client))}`}
                    >
                      {getClientStatus(client)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewClient(client)}
                      >
                        View
                      </button>
                      {canDelete && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Clients Found</h3>
            <p>Adjust your filters or add a new client.</p>
          </div>
        )}
      </div>

      {isViewModalOpen && selectedClient && (
        <ViewClient
          client={selectedClient}
          onClose={() => setIsViewModalOpen(false)}
          onUpdate={handleUpdateClient}
          onDelete={handleDeleteClient}
          user={user}
        />
      )}
    </div>
  );
};

export default ViewClients;
