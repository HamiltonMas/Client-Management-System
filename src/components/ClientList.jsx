import React, { useState, useMemo } from "react";
import ViewClient from "./ViewClient";
import "./ClientList.css";

const ClientList = ({
  clients,
  onDelete,
  onUpdate,
  stats,
  user,
  canDelete,
}) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Case type options
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

  const getClientName = (client) => {
    if (client.name) return client.name;
    if (client.firstName && client.lastName)
      return `${client.firstName} ${client.lastName}`;
    if (client.client_name) return client.client_name;
    return "Unknown Client";
  };

  const getClientEmail = (client) => client.email || client.client_email || "—";
  const getClientPhone = (client) => client.phone || client.client_phone || "—";
  const getClientAttorney = (client) =>
    client.attorney || client.AssignedAttorney || "System Administrator";
  const getClientCaseType = (client) =>
    client.caseType || client.case_type || "Other";
  const getClientStatus = (client) => client.status || "Active";
  const getClientAddedDate = (client) =>
    client.addedDate ||
    client.added_date ||
    client.registrationDate ||
    new Date().toISOString().split("T")[0];
  const getClientId = (client) =>
    client.id || client.ID || Math.random().toString(36).substr(2, 9);

  // Filter and sort clients (sort by case value is removed from UI but kept for internal sorting if needed)
  const filteredAndSortedClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];

    let filtered = clients.filter((client) => {
      const clientName = getClientName(client).toLowerCase();
      const clientEmail = getClientEmail(client).toLowerCase();
      const clientPhone = getClientPhone(client);
      const clientCaseType = getClientCaseType(client).toLowerCase();
      const clientStatus = getClientStatus(client).toLowerCase();
      const clientAttorney = getClientAttorney(client).toLowerCase();
      const clientId = String(getClientId(client));

      const matchesSearch =
        searchTerm === "" ||
        clientName.includes(searchTerm.toLowerCase()) ||
        clientEmail.includes(searchTerm.toLowerCase()) ||
        clientPhone.includes(searchTerm) ||
        clientCaseType.includes(searchTerm.toLowerCase()) ||
        clientAttorney.includes(searchTerm.toLowerCase()) ||
        clientId.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || clientStatus === statusFilter.toLowerCase();
      const matchesCaseType =
        caseTypeFilter === "all" ||
        clientCaseType === caseTypeFilter.toLowerCase();

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
    <>
      <div className="client-list">
        <div className="section-header">
          <h2>Client Management</h2>
          <p>Manage your firm's clients and cases</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{stats?.totalClients || clients?.length || 0}</h3>
            <p>Total Clients</p>
          </div>
          <div className="stat-card">
            <h3>
              {stats?.activeCases ||
                clients?.filter((c) => getClientStatus(c) === "Active")
                  .length ||
                0}
            </h3>
            <p>Active Cases</p>
          </div>
          <div className="stat-card">
            <h3>
              {clients?.filter(
                (c) => getClientCaseType(c) === "Road Accident Fund",
              ).length || 0}
            </h3>
            <p>RAF Cases</p>
          </div>
          <div className="stat-card">
            <h3>
              $
              {stats?.totalCaseValue?.toLocaleString() ||
                clients
                  ?.reduce(
                    (sum, c) =>
                      sum + (Number(c.caseValue?.replace(/[^0-9]/g, "")) || 0),
                    0,
                  )
                  .toLocaleString() ||
                "0"}
            </h3>
            <p>Total Case Value</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search clients by name, email, phone, case type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
          <div className="filter-actions">
            <button
              className={`filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>🔍</span> Filters
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
                ✕ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Case Type</label>
                <select
                  value={caseTypeFilter}
                  onChange={(e) => setCaseTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Case Types</option>
                  {caseTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="caseType">Case Type</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="filter-select"
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
                  className="filter-input"
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
                  className="filter-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-count">
            Showing <strong>{filteredAndSortedClients.length}</strong> of{" "}
            <strong>{clients?.length || 0}</strong> clients
          </span>
          {sortBy !== "name" && (
            <span className="sort-info">
              Sorted by {sortBy} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
            </span>
          )}
        </div>

        {/* Table Container */}
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
                  <tr
                    key={getClientId(client)}
                    onClick={() => handleViewClient(client)}
                  >
                    <td data-label="Client">
                      <div className="client-cell">
                        <div className="client-avatar-small">
                          {client.avatar ? (
                            <img
                              src={client.avatar}
                              alt={getClientName(client)}
                            />
                          ) : (
                            <span>
                              {getClientName(client).charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                        <div className="client-info">
                          <div className="client-name">
                            {getClientName(client)}
                          </div>
                          <div className="client-attorney">
                            {getClientAttorney(client)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Contact">
                      <div className="contact-info">
                        <div className="contact-email">
                          {getClientEmail(client)}
                        </div>
                        <div className="contact-phone">
                          {getClientPhone(client)}
                        </div>
                      </div>
                    </td>
                    <td data-label="Case Type">
                      <span
                        className={`case-type ${getCaseTypeClass(getClientCaseType(client))}`}
                      >
                        {getClientCaseType(client)}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`status-badge ${getStatusClass(getClientStatus(client))}`}
                      >
                        {getClientStatus(client)}
                      </span>
                    </td>
                    <td
                      data-label="Actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleViewClient(client)}
                        >
                          👁️ View
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleViewClient(client)}
                        >
                          ✏️ Edit
                        </button>
                        {canDelete && (
                          <button
                            className="btn-delete"
                            onClick={() =>
                              handleDeleteClient(getClientId(client))
                            }
                          >
                            🗑️ Delete
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
              <p>
                {searchTerm ||
                statusFilter !== "all" ||
                caseTypeFilter !== "all" ||
                dateRange.start ||
                dateRange.end
                  ? "Try adjusting your search or filters"
                  : "Add your first client to get started."}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                caseTypeFilter !== "all" ||
                dateRange.start ||
                dateRange.end) && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
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
    </>
  );
};

export default ClientList;
