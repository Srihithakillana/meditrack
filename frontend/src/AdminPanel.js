// src/AdminPanel.js
import React, { useState } from "react";
import axios from "axios";
import "./AdminPanel.css"; // We'll create this new CSS file

function AdminPanel() {
  const [apiKey, setApiKey] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingRecord, setEditingRecord] = useState(null); 

  const API_URL = "http://127.0.0.1:8000";

  const getAuthHeaders = () => ({
    "X-Admin-API-Key": apiKey,
  });

  const fetchAllPrescriptions = async () => {
    if (!apiKey) {
      setError("Please enter your Admin API Key.");
      return;
    }
    setIsLoading(true);
    setError("");
    setPrescriptions([]);

    try {
      const res = await axios.get(`${API_URL}/admin/prescriptions/`, {
        headers: getAuthHeaders(),
      });
      setPrescriptions(res.data);
    } catch (err) {
      const errorMsg =
        err.response?.status === 403
          ? "Invalid or incorrect Admin API Key."
          : err.response?.data?.detail || "Could not fetch data.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete record ${id}?`)) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/admin/prescriptions/${id}`, {
        headers: getAuthHeaders(),
      });
      setPrescriptions(prescriptions.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete record.");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      JSON.parse(editingRecord.llm_extracted_info);
    } catch (jsonError) {
      setError("Invalid JSON format in 'Extracted Info'. Please correct it.");
      return;
    }
    setError("");

    try {
      const updatePayload = {
        patient_name: editingRecord.patient_name,
        llm_extracted_info: editingRecord.llm_extracted_info,
      };

      const res = await axios.put(
        `${API_URL}/admin/prescriptions/${editingRecord.id}`,
        updatePayload,
        { headers: getAuthHeaders() }
      );

      setPrescriptions(
        prescriptions.map((p) => (p.id === editingRecord.id ? res.data : p))
      );
      setEditingRecord(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update record.");
    }
  };

  const onEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord({ ...editingRecord, [name]: value });
  };

  return (
    <div className="container admin-container">
      <header className="app-header">
        <h1>Admin Panel</h1>
        <p>Manage all prescription records.</p>
      </header>

      <div className="card api-key-section">
        <div className="form-group">
          <label htmlFor="apiKey">Admin API Key</label>
          <input
            type="password"
            id="apiKey"
            placeholder="Enter your secret admin key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <button onClick={fetchAllPrescriptions} className="button" disabled={isLoading}>
          {isLoading ? "Loading..." : "Fetch All Records"}
        </button>
      </div>

      {error && <p className="message error-message">{error}</p>}

      {editingRecord && (
        <div className="card edit-form-section">
          <h2>Editing Record ID: {editingRecord.id}</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="patient_name">Patient Name</label>
              <input
                type="text"
                id="patient_name"
                name="patient_name"
                value={editingRecord.patient_name}
                onChange={onEditFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="llm_extracted_info">Extracted Info (JSON)</label>
              <textarea
                id="llm_extracted_info"
                name="llm_extracted_info"
                rows="10"
                value={editingRecord.llm_extracted_info}
                onChange={onEditFormChange}
              />
            </div>
            <div className="edit-actions">
              <button type="submit" className="button">Save Changes</button>
              <button type="button" className="button button-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!editingRecord && (
        <div className="admin-list-section">
          <h2>All Records</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Extracted Info (Preview)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.patient_name}</td>
                    <td className="preview-cell">
                      {record.llm_extracted_info.substring(0, 100)}...
                    </td>
                    <td className="action-cell">
                      <button className="button-small" onClick={() => handleEdit(record)}>
                        Edit
                      </button>
                      <button className="button-small button-danger" onClick={() => handleDelete(record.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prescriptions.length === 0 && !isLoading && (
              <p style={{ textAlign: 'center', padding: '1rem' }}>No records found. (Have you fetched them?)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;