import React, { useState, useEffect } from "react";
import api from '../services/api';
import "../App.css";
// We only need the loader for the button
import { FiLoader } from "react-icons/fi"; 

function AdminPanel() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingRecord, setEditingRecord] = useState(null); 

  const fetchAllPrescriptions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/prescriptions/`);
      setPrescriptions(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Could not fetch data.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically fetch when the page loads
  useEffect(() => {
    fetchAllPrescriptions();
  }, []); // Empty array means this runs once on mount

  const handleDelete = async (id) => {
    // Use a simple browser confirm
    if (!window.confirm(`Are you sure you want to delete record ${id}?`)) {
      return;
    }
    try {
      await api.delete(`/admin/prescriptions/${id}`);
      // Update the UI by removing the deleted record
      setPrescriptions(prescriptions.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete record.");
    }
  };

  // --- These functions handle the edit form ---

  const handleEdit = (record) => {
    // Set the record to be edited, this will show the edit form
    setEditingRecord({ ...record });
  };

  const handleCancelEdit = () => {
    // Clear the editing record, this will hide the edit form
    setEditingRecord(null);
    setError(""); // Clear any old errors
  };

  const onEditFormChange = (e) => {
    const { name, value } = e.target;
    // Update the editingRecord state as the user types
    setEditingRecord({ ...editingRecord, [name]: value });
  };

  // --- This function runs when "Save Changes" is clicked ---

  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    if (!editingRecord) return;

    // Validate that the JSON is valid before sending
    try {
      JSON.parse(editingRecord.llm_extracted_info);
    } catch (jsonError) {
      setError("Invalid JSON format in 'Extracted Info'. Please correct it.");
      return;
    }
    setError(""); // Clear error if JSON is valid

    try {
      const updatePayload = {
        patient_name: editingRecord.patient_name,
        llm_extracted_info: editingRecord.llm_extracted_info,
      };

      const res = await api.put(
        `/admin/prescriptions/${editingRecord.id}`,
        updatePayload
      );

      // Update the list with the new data from the server
      setPrescriptions(
        prescriptions.map((p) => (p.id === editingRecord.id ? res.data : p))
      );
      
      // Close the edit form
      setEditingRecord(null); 
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update record.");
    }
  };

  return (
    <div className="container admin-container">
      <header className="app-header">
        <h1>Admin Panel (Delete/Edit)</h1>
        <p>Manage all prescription records.</p>
      </header>

      {error && <p className="message error-message">{error}</p>}

      {/* --- This is the Edit Form --- */}
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

      {/* --- This is the Main Table (hidden when editing) --- */}
      {!editingRecord && (
        <div className="admin-list-section">
          <h2>
            All Records
            {/* --- MODIFIED: Reload Button --- */}
            <button 
              onClick={fetchAllPrescriptions} 
              className="button-small" 
              title="Reload Records"
              disabled={isLoading}
              style={{ minWidth: '80px' }} // Give it a fixed width
              
            >
              {isLoading ? (
                <div className="loader" style={{borderColor: '#fff', borderBottomColor: 'transparent'}}></div>
              ) : (
                'Reload'
              )}
            </button>
          </h2>
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
                {prescriptions.length > 0 ? (
                  prescriptions.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.patient_name}</td>
                      <td className="preview-cell">
                        {record.llm_extracted_info.substring(0, 100)}...
                      </td>
                      <td className="action-cell">
                        {/* --- MODIFIED: This button is now purple by default --- */}
                        <button className="button-small edit-btn" onClick={() => handleEdit(record)}>
                          Edit
                        </button>
                        <button className="button-small button-danger" onClick={() => handleDelete(record.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '1rem'}}>
                      {isLoading ? "Loading records..." : "No records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;