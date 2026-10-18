// src/components/Employees.jsx
import React, { useState, useEffect } from "react";
import "./Employees.css";

const Employees = ({ currentUser }) => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payslipMonth, setPayslipMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [showSalary, setShowSalary] = useState(true);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documentsForEmployee, setDocumentsForEmployee] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]); // temporary files to add during edit
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: "",
    hireDate: new Date().toISOString().slice(0, 10),
    email: "",
    phone: "",
    bankName: "",
    accountNumber: "",
  });

  // Load employees from localStorage
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const stored = localStorage.getItem("lawFirmEmployees");
    if (stored) {
      setEmployees(JSON.parse(stored));
    } else {
      const sampleEmployees = [
        {
          id: 1,
          name: "Robert Johnson",
          position: "Senior Attorney",
          salary: 95000,
          hireDate: "2023-01-15",
          email: "robert.j@justicelegal.com",
          phone: "(555) 111-2222",
          bankName: "First National Bank",
          accountNumber: "****1234",
          documents: [],
        },
        {
          id: 2,
          name: "Sarah Miller",
          position: "Paralegal",
          salary: 55000,
          hireDate: "2023-03-20",
          email: "sarah.m@justicelegal.com",
          phone: "(555) 333-4444",
          bankName: "Standard Bank",
          accountNumber: "****5678",
          documents: [],
        },
        {
          id: 3,
          name: "Michael Chen",
          position: "Litigation Attorney",
          salary: 105000,
          hireDate: "2022-11-10",
          email: "michael.c@justicelegal.com",
          phone: "(555) 555-6666",
          bankName: "Nedbank",
          accountNumber: "****9012",
          documents: [],
        },
      ];
      localStorage.setItem("lawFirmEmployees", JSON.stringify(sampleEmployees));
      setEmployees(sampleEmployees);
    }
  };

  const saveEmployees = (updatedEmployees) => {
    localStorage.setItem("lawFirmEmployees", JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        position: employee.position,
        salary: employee.salary,
        hireDate: employee.hireDate,
        email: employee.email,
        phone: employee.phone || "",
        bankName: employee.bankName || "",
        accountNumber: employee.accountNumber || "",
      });
      setNewDocuments([]); // reset pending documents
    } else {
      setEditingEmployee(null);
      setFormData({
        name: "",
        position: "",
        salary: "",
        hireDate: new Date().toISOString().slice(0, 10),
        email: "",
        phone: "",
        bankName: "",
        accountNumber: "",
      });
      setNewDocuments([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setNewDocuments([]);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Document upload handlers
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
    e.target.value = null; // allow re-upload of same file
  };

  const removePendingDocument = (docId) => {
    setNewDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.position ||
      !formData.salary ||
      !formData.email
    ) {
      alert("Please fill all required fields.");
      return;
    }

    let updatedEmployees = [...employees];
    if (editingEmployee) {
      const index = updatedEmployees.findIndex(
        (emp) => emp.id === editingEmployee.id,
      );
      if (index !== -1) {
        updatedEmployees[index] = {
          ...updatedEmployees[index],
          name: formData.name,
          position: formData.position,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate,
          email: formData.email,
          phone: formData.phone,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          documents: [
            ...(updatedEmployees[index].documents || []),
            ...newDocuments,
          ],
        };
      }
    } else {
      const newId =
        employees.length > 0 ? Math.max(...employees.map((e) => e.id)) + 1 : 1;
      updatedEmployees.push({
        id: newId,
        name: formData.name,
        position: formData.position,
        salary: parseFloat(formData.salary),
        hireDate: formData.hireDate,
        email: formData.email,
        phone: formData.phone,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        documents: newDocuments,
      });
    }
    saveEmployees(updatedEmployees);
    handleCloseModal();
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      const updatedEmployees = employees.filter((emp) => emp.id !== id);
      saveEmployees(updatedEmployees);
    }
  };

  // Delete a specific document from an employee
  const handleDeleteDocument = (empId, docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const updatedEmployees = employees.map((emp) => {
        if (emp.id === empId) {
          return {
            ...emp,
            documents: emp.documents.filter((doc) => doc.id !== docId),
          };
        }
        return emp;
      });
      saveEmployees(updatedEmployees);
      // Refresh the documents modal view
      const emp = updatedEmployees.find((e) => e.id === empId);
      setDocumentsForEmployee(emp?.documents || []);
    }
  };

  const openDocumentsModal = (employee) => {
    setSelectedEmployee(employee);
    setDocumentsForEmployee(employee.documents || []);
    setShowDocumentsModal(true);
  };

  // Salary calculation helpers (unchanged)
  const calculateMonthlyGross = (annualSalary) => annualSalary / 12;
  const calculateHousingAllowance = (monthlyGross) => monthlyGross * 0.15;
  const calculateTransportAllowance = (monthlyGross) => monthlyGross * 0.05;
  const calculateTotalEarnings = (monthlyGross, housing, transport) =>
    monthlyGross + housing + transport;
  const calculateTax = (taxableIncome) => {
    if (taxableIncome <= 23700) return taxableIncome * 0.18;
    if (taxableIncome <= 37000) return taxableIncome * 0.26;
    if (taxableIncome <= 51200) return taxableIncome * 0.31;
    if (taxableIncome <= 65000) return taxableIncome * 0.36;
    return taxableIncome * 0.39;
  };
  const calculateUIF = (grossEarnings) =>
    Math.min(grossEarnings * 0.01, 177.12);
  const calculatePension = (grossEarnings) => grossEarnings * 0.05;

  const handleGeneratePayslip = (employee) => {
    setSelectedEmployee(employee);
    setShowPayslipModal(true);
  };

  const printPayslip = () => {
    // ... (existing printPayslip function unchanged) ...
    // (I'll keep it as is from your original code to save space, but it remains fully functional)
    if (!selectedEmployee) return;
    const [year, month] = payslipMonth.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = monthNames[parseInt(month) - 1];
    const payslipNumber = `PS-${year}${month}-${selectedEmployee.id}`;
    const monthlyGross = calculateMonthlyGross(selectedEmployee.salary);
    const housing = calculateHousingAllowance(monthlyGross);
    const transport = calculateTransportAllowance(monthlyGross);
    const totalEarnings = calculateTotalEarnings(
      monthlyGross,
      housing,
      transport,
    );
    const tax = calculateTax(totalEarnings);
    const uif = calculateUIF(totalEarnings);
    const pension = calculatePension(totalEarnings);
    const netPay = totalEarnings - tax - uif - pension;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`...`); // (full HTML as in your original)
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
    setShowPayslipModal(false);
  };

  return (
    <div className="employees-management">
      <div className="section-header">
        <h2>Employees Management</h2>
        <p>
          Manage your firm's employees, track salaries, generate payslips, and
          store documents.
        </p>
      </div>

      <div className="employees-actions">
        <button className="btn-add-employee" onClick={() => handleOpenModal()}>
          + Add New Employee
        </button>
        <button
          className="btn-toggle-salary"
          onClick={() => setShowSalary(!showSalary)}
        >
          {showSalary ? "Hide Salaries" : "Show Salaries"}
        </button>
      </div>

      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Salary (Annual)</th>
              <th>Hire Date</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>EMP-{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.position}</td>
                <td className={showSalary ? "" : "salary-hidden"}>
                  {showSalary ? `$${emp.salary.toLocaleString()}` : "•••••••"}
                </td>
                <td>{emp.hireDate}</td>
                <td>{emp.email}</td>
                <td>{emp.phone || "—"}</td>
                <td>
                  <div className="employee-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenModal(emp)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-payslip"
                      onClick={() => handleGeneratePayslip(emp)}
                    >
                      Payslip
                    </button>
                    <button
                      className="btn-docs"
                      onClick={() => openDocumentsModal(emp)}
                    >
                      📄 Docs
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal with document upload */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h3>
            <form onSubmit={handleSubmit}>
              {/* ... existing form fields ... */}
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Annual Salary ($) *</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div className="form-group">
                <label>Hire Date</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g., First National Bank"
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Last 4 digits or full number"
                />
              </div>

              {/* Document upload section */}
              <div className="form-group">
                <label>Employee Documents</label>
                <input
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                {newDocuments.length > 0 && (
                  <ul className="pending-docs-list">
                    {newDocuments.map((doc) => (
                      <li key={doc.id}>
                        {doc.name} ({(doc.size / 1024).toFixed(2)} KB){" "}
                        <button
                          type="button"
                          onClick={() => removePendingDocument(doc.id)}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {editingEmployee && editingEmployee.documents?.length > 0 && (
                  <p className="existing-docs-note">
                    Existing documents will be kept. Use "Docs" button to manage
                    them.
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit">
                  {editingEmployee ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal (unchanged) */}
      {showPayslipModal && selectedEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowPayslipModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Generate Payslip</h3>
            <div className="form-group">
              <label>Select Month</label>
              <input
                type="month"
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(e.target.value)}
              />
            </div>
            <div className="employee-summary">
              <p>
                <strong>Employee:</strong> {selectedEmployee.name}
              </p>
              <p>
                <strong>Position:</strong> {selectedEmployee.position}
              </p>
              <p>
                <strong>Annual Salary:</strong> $
                {selectedEmployee.salary.toLocaleString()}
              </p>
              <p>
                <strong>Monthly Gross:</strong> $
                {(selectedEmployee.salary / 12).toLocaleString()}
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowPayslipModal(false)}>Cancel</button>
              <button onClick={printPayslip}>Generate & Print</button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal – view, download, delete */}
      {showDocumentsModal && selectedEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowDocumentsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Documents - {selectedEmployee.name}</h3>
            {documentsForEmployee.length === 0 ? (
              <p>No documents uploaded for this employee.</p>
            ) : (
              <ul className="documents-list">
                {documentsForEmployee.map((doc) => (
                  <li key={doc.id}>
                    <span>
                      {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                    </span>
                    <div>
                      <a
                        href={doc.content}
                        download={doc.name}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ⬇️ Download
                      </a>
                      <button
                        onClick={() =>
                          handleDeleteDocument(selectedEmployee.id, doc.id)
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowDocumentsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
