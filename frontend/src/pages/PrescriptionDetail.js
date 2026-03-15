import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { 
  FiArrowLeft, FiPrinter, FiActivity, FiUser, 
  FiCalendar, FiHash, FiClock, FiCheck 
} from "react-icons/fi";

function PrescriptionDetail() {
  const { id } = useParams(); // Gets the #ID from the URL
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSingleRecord = async () => {
      try {
        // We fetch all and filter for the specific ID
        // (Or use a specific GET /prescription/{id} if your backend has it)
        const res = await api.get("/admin/prescriptions/");
        const found = res.data.find(r => r.id === parseInt(id));
        setRecord(found);
      } catch (err) {
        console.error("Error fetching record:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleRecord();
  }, [id]);

  const data = useMemo(() => {
    if (!record) return null;
    try {
      return JSON.parse(record.llm_extracted_info);
    } catch {
      return null;
    }
  }, [record]);

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (!record || !data) return <div className="error-view">Record not found.</div>;

  return (
    <div className="prescription-page">
      <style>{detailStyles}</style>
      
      {/* Navigation Header */}
      <nav className="detail-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className="nav-actions">
          <button onClick={() => window.print()} className="print-btn">
            <FiPrinter /> Print Document
          </button>
        </div>
      </nav>

      <main className="document-container">
        {/* Top Header Section */}
        <header className="doc-header">
          <div className="doc-brand">
            <div className="brand-icon"><FiActivity /></div>
            <div>
              <h2>MedScript OS</h2>
              <p>Neural Extraction Report</p>
            </div>
          </div>
          <div className="doc-id-box">
            <span>REFERENCE ID</span>
            <h1>#{record.id}</h1>
          </div>
        </header>

        {/* Patient & Doctor Info Grid */}
        <section className="info-grid">
          <div className="info-card">
            <label><FiUser /> Patient Name</label>
            <p>{data.patient_name || "N/A"}</p>
          </div>
          <div className="info-card">
            <label><FiCalendar /> Extraction Date</label>
            <p>{data.date || "N/A"}</p>
          </div>
          <div className="info-card">
            <label><FiHash /> Physician</label>
            <p>Dr. {data.doctor_name || "N/A"}</p>
          </div>
        </section>

        {/* Medications Table */}
        <section className="medication-section">
          <div className="section-title">
            <FiCheck /> Prescribed Medications
          </div>
          <div className="med-table">
            <div className="table-head">
              <span>Medicine Name</span>
              <span>Dosage</span>
              <span>Frequency</span>
            </div>
            {data.medicines?.map((med, i) => (
              <div key={i} className="table-row">
                <span className="m-name">{med.name}</span>
                <span className="m-dose">{med.dosage}</span>
                <span className="m-freq">{med.frequency}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Footer */}
        <footer className="doc-footer">
          <div className="verification-tag">
            <FiClock /> Digitized
          </div>
          <p>This document is a digital representation of a physical prescription.</p>
        </footer>
      </main>
    </div>
  );
}

const detailStyles = `
  .prescription-page {
    min-height: 100vh;
    background: #f1f5f9;
    padding: 40px 20px;
    font-family: 'Inter', sans-serif;
  }

  .detail-nav {
    max-width: 850px;
    margin: 0 auto 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .back-btn {
    background: none; border: none; display: flex; align-items: center; gap: 8px;
    color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s;
  }
  .back-btn:hover { color: #4f46e5; }

  .print-btn {
    background: #4f46e5; color: white; border: none; padding: 10px 20px;
    border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;
  }

  .document-container {
    max-width: 850px;
    margin: 0 auto;
    background: white;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);
    padding: 60px;
    min-height: 1000px;
    display: flex;
    flex-direction: column;
  }

  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 40px;
    margin-bottom: 40px;
  }

  .doc-brand { display: flex; gap: 16px; align-items: center; }
  .brand-icon { 
    background: #4f46e5; color: white; width: 44px; height: 44px; 
    border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
  }
  .doc-brand h2 { margin: 0; font-size: 1.25rem; font-weight: 800; }
  .doc-brand p { margin: 0; font-size: 0.8rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

  .doc-id-box { text-align: right; }
  .doc-id-box span { font-size: 0.7rem; font-weight: 800; color: #94a3b8; }
  .doc-id-box h1 { margin: 0; font-size: 2.5rem; color: #4f46e5; letter-spacing: -1px; }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-bottom: 60px;
  }

  .info-card label {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;
  }
  .info-card p { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }

  .medication-section { flex: 1; }
  .section-title { 
    display: flex; align-items: center; gap: 8px; 
    font-weight: 800; color: #4f46e5; margin-bottom: 24px; font-size: 0.9rem;
  }

  .med-table { border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; }
  .table-head { 
    background: #f8fafc; padding: 16px 24px; display: grid; 
    grid-template-columns: 1fr 150px 150px; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;
  }
  .table-row {
    padding: 20px 24px; display: grid; grid-template-columns: 1fr 150px 150px;
    border-top: 1px solid #f1f5f9; align-items: center;
  }
  .m-name { font-weight: 700; color: #1e293b; }
  .m-dose { color: #64748b; font-size: 0.9rem; }
  .m-freq { color: #4f46e5; font-weight: 700; font-size: 0.85rem; }

  .doc-footer {
    margin-top: 60px;
    border-top: 1px solid #f1f5f9;
    padding-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #94a3b8;
  }
  .verification-tag { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 600; }
  .doc-footer p { font-size: 0.7rem; margin: 0; }

  @media print {
    .prescription-page { background: white; padding: 0; }
    .detail-nav { display: none; }
    .document-container { box-shadow: none; border: none; padding: 20px; }
  }

  .loader-container { height: 100vh; display: flex; align-items: center; justify-content: center; }
  .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default PrescriptionDetail;