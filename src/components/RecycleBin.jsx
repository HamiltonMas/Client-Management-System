import React, { useEffect, useState } from "react";
import "./RecycleBin.css";

const RecycleBin = ({
  deletedClients,
  onRestore,
  onPermanentlyDelete,
  user,
  canRestore,
}) => {
  const [daysRemaining, setDaysRemaining] = useState({});

  useEffect(() => {
    const calculateDaysRemaining = () => {
      const newDaysRemaining = {};
      deletedClients.forEach((client) => {
        const deletedDate = new Date(client.deletedDate);
        const expiryDate = new Date(deletedDate);
        expiryDate.setDate(expiryDate.getDate() + 60);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newDaysRemaining[client.id] = diffDays > 0 ? diffDays : 0;
      });
      setDaysRemaining(newDaysRemaining);
    };
    calculateDaysRemaining();
  }, [deletedClients]);

  const getDaysClass = (days) => {
    if (days > 30) return "days-remaining-high";
    if (days > 7) return "days-remaining-medium";
    return "days-remaining-low";
  };

  return (
    <div className="recycle-bin">
      <div className="section-header">
        <h2>Recycle Bin</h2>
        <p>
          Deleted clients are stored here for 60 days before permanent deletion
        </p>
      </div>

      <div className="bin-info">
        <div className="info-card">
          <h3>⚠️ Important</h3>
          <p>
            Clients in the recycle bin will be automatically deleted after 60
            days.
          </p>
          <p>
            You can restore clients or delete them permanently before the 60-day
            period ends.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="deleted-clients-table">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Client Name</th>
              <th>Deleted Date</th>
              <th>Days Remaining</th>
              <th>Case Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletedClients.map((client) => (
              <tr key={client.id} className="deleted-row">
                <td>{client.id || "N/A"}</td>
                <td>
                  {client.name || `${client.firstName} ${client.lastName}`}
                </td>
                <td>{client.deletedDate}</td>
                <td>
                  <span
                    className={`days-badge ${getDaysClass(daysRemaining[client.id] || 0)}`}
                  >
                    {daysRemaining[client.id] || 0} days
                  </span>
                </td>
                <td>{client.caseType}</td>
                <td>
                  <div className="action-buttons">
                    {canRestore && (
                      <button
                        className="btn-restore"
                        onClick={() => onRestore(client.id)}
                      >
                        Restore
                      </button>
                    )}
                    {user?.role === "admin" && (
                      <button
                        className="btn-permanent-delete"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to permanently delete this client? This action cannot be undone.",
                            )
                          ) {
                            onPermanentlyDelete(client.id);
                          }
                        }}
                      >
                        Delete Permanently
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deletedClients.length === 0 ? (
        <div className="empty-state">
          <p>The recycle bin is empty. No clients have been deleted.</p>
        </div>
      ) : (
        <div className="warning-message">
          <p>
            ⚠️ {deletedClients.length} client(s) in recycle bin. Automatic
            deletion occurs after 60 days.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;
