import React, { useState, useEffect, useMemo } from "react";
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import { 
  FiRefreshCw, FiEdit3, FiTrash2, FiDatabase, 
  FiSearch, FiUser, FiAlertCircle, FiChevronRight, FiShield 
} from "react-icons/fi";

function AdminPanel() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchAllPrescriptions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/prescriptions/`);
      setPrescriptions(res.data);
    } catch (err) {
      setError("System Error: Unable to synchronize with the medical database.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllPrescriptions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`PERMANENT ACTION: Purge record #${id}?`)) return;
    try {
      await api.delete(`/admin/prescriptions/${id}`);
      setPrescriptions(prescriptions.filter((p) => p.id !== id));
    } catch (err) {
      setError("Purge failed. Database integrity lock active.");
    }
  };

  const filteredData = useMemo(() => {
    return prescriptions.filter(p => 
      p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm)
    );
  }, [prescriptions, searchTerm]);

  return (
    <div className="admin-page-content">
      <style>{adminStyledCSS}</style>
      
      {/* --- REFINED HEADING SECTION --- */}
      <div className="admin-heading-section">
        <div className="heading-left">
          <div className="title-icon-box">
            <FiShield />
          </div>
          <div className="title-text-box">
            <h1>Governance Portal</h1>
            <p>Database Management & System Oversight</p>
          </div>
        </div>

        <div className="heading-right">
          <div className="admin-search-pill">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search ID or Patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchAllPrescriptions} 
            className={`btn-sync ${isLoading ? 'spinning' : ''}`}
            disabled={isLoading}
          >
            <FiRefreshCw /> <span>{isLoading ? "Syncing" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* --- REGISTRY TABLE --- */}
      <div className="data-card">
        <table className="registry-table">
          <thead>
            <tr>
              <th>REF ID</th>
              <th>PATIENT IDENTITY</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>MANAGEMENT</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <tr key={record.id} className="reg-row">
                  <td className="id-cell">#{record.id}</td>
                  <td className="name-cell">
                    <div className="avatar-small">{record.patient_name.charAt(0)}</div>
                    <strong>{record.patient_name}</strong>
                  </td>
                  <td>
                    <span className="status-pill">Digitized</span>
                  </td>
                  <td className="actions-cell">
                    <button className="edit-link" onClick={() => navigate(`/admin/edit/${record.id}`)}>
                      <FiEdit3 /> Edit
                    </button>
                    <button className="del-link" onClick={() => handleDelete(record.id)}>
                      <FiTrash2 /> Purge
                    </button>
                    <FiChevronRight className="arrow-hint" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">
                  {isLoading ? "Fetching secure records..." : "No matching results found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- CSS WITH EXPLICIT HEADING STYLING ---
const adminStyledCSS = `
  .admin-page-content { 
    animation: fadeIn 0.4s ease; 
    padding: 10px; 
  }

  /* Heading Styling */
  .admin-heading-section { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 35px;
    padding-bottom: 25px;
    border-bottom: 1px solid #e2e8f0;
  }

  .heading-left { display: flex; align-items: center; gap: 20px; }
  
  .title-icon-box { 
    background: #4f46e5; 
    color: white; 
    width: 52px; 
    height: 52px; 
    border-radius: 14px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1.6rem; 
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
  }

  .title-text-box h1 { 
    margin: 0; 
    font-size: 1.8rem; 
    font-weight: 800; 
    letter-spacing: -0.025em; 
    color: #0f172a; 
    line-height: 1.2;
  }

  .title-text-box p { 
    margin: 4px 0 0; 
    font-size: 0.95rem; 
    color: #64748b; 
    font-weight: 500; 
  }

  /* Search & Sync Actions */
  .heading-right { display: flex; gap: 15px; align-items: center; }
  
  .admin-search-pill { 
    background: white; 
    border: 1px solid #e2e8f0; 
    padding: 12px 20px; 
    border-radius: 100px; 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    color: #94a3b8;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  }
  .admin-search-pill input { border: none; outline: none; font-size: 0.95rem; width: 220px; color: #1e293b; background: transparent; }

  .btn-sync { 
    background: white; 
    border: 1px solid #e2e8f0; 
    padding: 12px 24px; 
    border-radius: 12px; 
    cursor: pointer; 
    font-weight: 700; 
    color: #475569;
    display: flex; 
    align-items: center; 
    gap: 10px; 
    transition: all 0.2s;
    font-size: 0.9rem;
  }
  .btn-sync:hover { border-color: #4f46e5; color: #4f46e5; background: #f8fafc; }

  /* Table Design */
  .data-card { 
    background: white; 
    border-radius: 20px; 
    border: 1px solid #e2e8f0; 
    overflow: hidden; 
    box-shadow: 0 10px 40px rgba(0,0,0,0.03); 
  }

  .registry-table { width: 100%; border-collapse: collapse; }
  .registry-table th { 
    background: #f8fafc; 
    text-align: left; 
    padding: 20px 30px; 
    font-size: 0.75rem; 
    font-weight: 800; 
    text-transform: uppercase; 
    color: #94a3b8; 
    letter-spacing: 0.05em; 
    border-bottom: 1px solid #e2e8f0;
  }
  .registry-table td { padding: 22px 30px; border-bottom: 1px solid #f1f5f9; font-size: 1rem; vertical-align: middle; }
  
  .reg-row { transition: 0.2s; }
  .reg-row:hover { background: #f8fafc; }
  
  .id-cell { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #94a3b8; font-size: 0.9rem; }
  .name-cell { display: flex; align-items: center; gap: 15px; color: #1e293b; }
  .avatar-small { 
    width: 34px; 
    height: 34px; 
    background: #eff6ff; 
    color: #4f46e5; 
    border-radius: 10px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: 800; 
    font-size: 0.85rem;
  }
  
  .status-pill { 
    background: #ecfdf5; 
    color: #059669; 
    padding: 5px 14px; 
    border-radius: 100px; 
    font-size: 0.75rem; 
    font-weight: 800; 
  }

  .actions-cell { display: flex; gap: 12px; justify-content: flex-end; align-items: center; }
  .edit-link, .del-link { 
    border: none; 
    padding: 8px 16px; 
    border-radius: 10px; 
    font-weight: 700; 
    cursor: pointer; 
    font-size: 0.85rem; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    transition: 0.2s; 
  }
  .edit-link { background: #eff6ff; color: #2563eb; }
  .edit-link:hover { background: #2563eb; color: white; }
  .del-link { background: #fff1f2; color: #e11d48; }
  .del-link:hover { background: #e11d48; color: white; }

  .arrow-hint { color: #e2e8f0; margin-left: 5px; }

  .error-banner { background: #fef2f2; color: #ef4444; padding: 16px; border-radius: 12px; margin-bottom: 25px; font-weight: 600; display: flex; align-items: center; gap: 12px; border: 1px solid #fee2e2; }
  .empty-state { text-align: center; padding: 80px; color: #94a3b8; font-weight: 500; font-size: 0.9rem; }
  
  .spinning svg { animation: spin-rotate 1.2s linear infinite; }
  @keyframes spin-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

export default AdminPanel;