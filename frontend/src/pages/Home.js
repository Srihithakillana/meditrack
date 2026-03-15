import React, { useState, useMemo } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  FiUpload, FiSearch, FiFileText, FiUser, 
  FiCalendar, FiActivity, FiCheckCircle, FiAlertCircle, 
  FiClock, FiFilter, FiExternalLink 
} from "react-icons/fi";

function Home() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setStatus({ type: "", msg: "" });
    }
  };

  const handleUpload = async () => {
    if (!file || !name) {
      setStatus({ type: "error", msg: "Please enter patient name and select a prescription image." });
      return;
    }

    setStatus({ type: "", msg: "" });
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_name", name);

    try {
      await api.post("/upload/", formData);
      setStatus({ type: "success", msg: `Digitization complete for ${name}` });
      setFile(null);
      setImagePreview(null);
      fetchHistory();
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.detail || "Upload failed. Server connection error." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!name) {
      setStatus({ type: "error", msg: "Enter a Patient Name to retrieve records." });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get(`/history/${name}`);
      setHistory(res.data);
    } catch (err) {
      setStatus({ type: "error", msg: "Could not retrieve history for this patient." });
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: SEARCH EVERYTHING LOGIC ---
  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      let data = {};
      try {
        data = record.llm_extracted_info ? JSON.parse(record.llm_extracted_info) : {};
      } catch (e) {
        data = {};
      }

      // Combine all searchable fields into one string
      const searchableBlob = [
        record.id,
        record.patient_name,
        data.doctor_name,
        data.date,
        // Optional: Include medicine names in search
        ...(data.medicines?.map(m => m.name) || [])
      ].join(" ").toLowerCase();

      return searchableBlob.includes(searchTerm.toLowerCase());
    });
  }, [history, searchTerm]);

  return (
    <div className="dashboard-container">
      <style>{dashboardStyles}</style>

      <div className="main-grid">
        
        {/* Left Side: Actions */}
        <aside className="action-sidebar">
          <div className="glass-card">
            <div className="card-header">
              <FiUpload />
              <h2>New Digitization</h2>
            </div>

            <div className="input-field">
              <label><FiUser /> Patient Identity</label>
              <input
                type="text"
                placeholder="Enter Full Legal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="upload-box">
              <input type="file" accept="image/*" onChange={handleFileChange} id="file-id" />
              <label htmlFor="file-id" className="upload-label">
                {imagePreview ? (
                  <div className="image-wrapper">
                    <img src={imagePreview} alt="preview" />
                    <div className="overlay">Change Image</div>
                  </div>
                ) : (
                  <div className="placeholder">
                    <FiFileText size={40} />
                    <span>Drop prescription here or click</span>
                    <small>Supports PNG, JPEG (Max 10MB)</small>
                  </div>
                )}
              </label>
            </div>

            <div className="button-group">
              <button onClick={handleUpload} className="btn-primary" disabled={isLoading || !file}>
                {isLoading ? "Processing..." : "Analyze & Save"}
              </button>
              <button onClick={fetchHistory} className="btn-secondary" disabled={isLoading || !name}>
                <FiSearch /> View All Records
              </button>
            </div>

            {status.msg && (
              <div className={`status-msg ${status.type}`}>
                {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                {status.msg}
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: History Feed */}
        <main className="history-feed">
          <div className="feed-controls">
            <h2>Patient Timeline</h2>
            <div className="search-pill">
              <FiFilter />
              <input 
                type="text" 
                placeholder="Search by Doctor, Date, ID or Meds..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="scroll-area">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record) => (
                <RecordCard 
                  key={record.id} 
                  record={record} 
                  onClick={() => {
                    const slug = record.patient_name.replace(/\s+/g, '-');
                    navigate(`/prescription/${slug}/${record.id}`);
                  }}
                />
              ))
            ) : (
              <div className="empty-state">
                <FiClock size={48} />
                <p>No records match your search criteria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const RecordCard = ({ record, onClick }) => {
  const data = useMemo(() => {
    try { return JSON.parse(record.llm_extracted_info); }
    catch { return { error: true }; }
  }, [record]);

  if (data.error) return <div className="glass-card error-card">Data parsing error for Record {record.id}</div>;

  return (
    <div className="glass-card record-card" onClick={onClick} style={{cursor: 'pointer'}}>
      <div className="record-sidebar">
        <div className="date-badge">
          <FiCalendar />
          <span>{data.date || "N/A"}</span>
        </div>
        <div className="id-tag">#{record.id}</div>
      </div>
      
      <div className="record-body">
        <div className="record-header">
          <h3>{data.doctor_name || "Unknown Doctor"}</h3>
          <span className="patient-name"><FiUser /> {record.patient_name}</span>
        </div>

        <div className="med-grid">
          {data.medicines?.map((med, i) => (
            <div key={i} className="med-pill">
              <span className="med-title">{med.name}</span>
              <span className="med-meta">{med.dosage} • {med.frequency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- CSS Architecture (Design Unchanged) ---
const dashboardStyles = `
  :root {
    --primary: #4f46e5;
    --primary-light: #eff6ff;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --glass: rgba(255, 255, 255, 0.7);
    --border: #e2e8f0;
  }

  .dashboard-container {
    min-height: 100vh;
    background: radial-gradient(at top left, #f8fafc, #f1f5f9);
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--text-main);
  }

  .main-grid {
    max-width: 1400px;
    margin: 40px auto;
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 30px;
    padding: 0 5%;
  }

  .glass-card {
    background: var(--glass);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  }

  .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; font-size: 1.25rem; font-weight: 700; }

  .input-field { margin-bottom: 20px; }
  .input-field label { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-muted); }
  input[type="text"] { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: white; outline: none; transition: 0.2s; box-sizing: border-box;}
  input[type="text"]:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

  .upload-box { position: relative; border: 2px dashed var(--border); border-radius: 16px; background: white; transition: 0.2s; overflow: hidden; margin-bottom: 24px;}
  .upload-box:hover { border-color: var(--primary); background: var(--primary-light); }
  .upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .upload-label .placeholder { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text-muted); }
  .image-wrapper { position: relative; height: 180px; }
  .image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
  .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; font-weight: 700; }
  .image-wrapper:hover .overlay { opacity: 1; }

  .button-group { display: flex; flex-direction: column; gap: 12px; }
  .btn-primary, .btn-secondary { padding: 14px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2); }
  .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; box-shadow: none;}
  .btn-secondary { background: white; color: var(--text-main); border: 1px solid var(--border); }

  .feed-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .search-pill { background: white; border: 1px solid var(--border); border-radius: 100px; padding: 10px 20px; display: flex; align-items: center; gap: 12px; width: 350px; }
  .search-pill input { border: none; outline: none; font-size: 0.9rem; width: 100%; }

  .scroll-area { display: flex; flex-direction: column; gap: 16px; }

  .record-card { display: flex; gap: 24px; padding: 20px; border-left: 6px solid var(--primary); transition: 0.2s; }
  .record-card:hover { transform: translateX(5px); }
  .record-sidebar { display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 100px; padding-right: 20px; border-right: 1px solid var(--border); }
  .date-badge { display: flex; flex-direction: column; align-items: center; font-weight: 800; color: var(--text-muted); font-size: 0.75rem; }
  .id-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 100px; font-size: 0.7rem; font-weight: 700; }

  .record-body { flex: 1; }
  .record-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .record-header h3 { margin: 0; font-size: 1.1rem; }
  .patient-name { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }

  .med-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .med-pill { background: white; border: 1px solid var(--border); padding: 8px 14px; border-radius: 10px; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
  .med-title { font-weight: 800; font-size: 0.85rem; color: var(--primary); }
  .med-meta { font-size: 0.7rem; color: var(--text-muted); }

  .status-msg { margin-top: 15px; padding: 10px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; }
  .status-msg.success { background: #ecfdf5; color: #10b981; }
  .status-msg.error { background: #fef2f2; color: #ef4444; }

  .empty-state { text-align: center; padding: 100px 0; color: var(--text-muted); }

  @media (max-width: 1000px) {
    .main-grid { grid-template-columns: 1fr; }
  }
`;

export default Home;