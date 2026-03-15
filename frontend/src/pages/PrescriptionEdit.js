import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { FiSave, FiArrowLeft, FiCode, FiUser, FiInfo, FiActivity } from "react-icons/fi";

function PrescriptionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState({ patient_name: "", llm_extracted_info: "" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await api.get(`/admin/prescriptions/`);
        const found = res.data.find(r => r.id === parseInt(id));
        if (found) {
          const parsed = JSON.parse(found.llm_extracted_info);
          setRecord({ ...found, llm_extracted_info: JSON.stringify(parsed, null, 2) });
        }
      } catch (err) { console.error("Editor Fetch Error:", err); }
      finally { setLoading(false); }
    };
    fetchRecord();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      JSON.parse(record.llm_extracted_info); // Syntax validation
      await api.put(`/admin/prescriptions/${id}`, {
        patient_name: record.patient_name,
        llm_extracted_info: record.llm_extracted_info
      });
      navigate("/admin");
    } catch (err) { alert("JSON syntax error. Please check your data format."); }
    finally { setIsSaving(false); }
  };

  if (loading) return <div className="loading-screen">Authenticating Record...</div>;

  return (
    <div className="integrated-edit-page">
      <style>{editStyles}</style>
      
      <div className="edit-top-strip">
        <button onClick={() => navigate("/admin")} className="btn-return">
          <FiArrowLeft /> Registry
        </button>
        <div className="title-wrap">
          <FiActivity className="icon-mod" />
          <h2>Clinical Modification Portal</h2>
        </div>
      </div>

      <div className="form-card-main">
        <div className="form-identity-badge">Record Reference: #{id}</div>
        
        <form onSubmit={handleUpdate}>
          <div className="form-section">
            <label><FiUser /> Patient Identity</label>
            <input 
              type="text" 
              value={record.patient_name} 
              onChange={e => setRecord({...record, patient_name: e.target.value})} 
            />
          </div>

          <div className="form-section">
            <label><FiCode /> Extracted Intelligence (JSON)</label>
            <textarea 
              rows="18" 
              value={record.llm_extracted_info}
              onChange={e => setRecord({...record, llm_extracted_info: e.target.value})}
            />
          </div>

          <div className="form-actions-bar">
            <button type="button" onClick={() => navigate("/admin")} className="btn-cancel">Cancel changes</button>
            <button type="submit" className="btn-commit" disabled={isSaving}>
              <FiSave /> {isSaving ? "Syncing..." : "Update Registry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const editStyles = `
  .integrated-edit-page { animation: slideIn 0.3s ease-out; max-width: 900px; }
  
  .edit-top-strip { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
  .btn-return { background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  
  .title-wrap { display: flex; align-items: center; gap: 12px; }
  .icon-mod { color: #4f46e5; font-size: 1.5rem; }
  .title-wrap h2 { margin: 0; font-size: 1.6rem; font-weight: 800; color: #0f172a; }

  .form-card-main { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
  .form-identity-badge { background: #f1f5f9; color: #4f46e5; display: inline-block; padding: 5px 15px; border-radius: 100px; font-weight: 800; font-size: 0.75rem; margin-bottom: 30px; }

  .form-section { margin-bottom: 25px; }
  .form-section label { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
  .form-section input, .form-section textarea { width: 100%; border: 1.5px solid #f1f5f9; background: #f8fafc; border-radius: 12px; padding: 15px; font-size: 1rem; color: #1e293b; outline: none; box-sizing: border-box; }
  .form-section textarea { font-family: 'JetBrains Mono', monospace; line-height: 1.6; }
  .form-section input:focus, .form-section textarea:focus { border-color: #4f46e5; background: white; }

  .form-actions-bar { display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #f1f5f9; padding-top: 30px; margin-top: 10px; }
  .btn-cancel { background: none; border: none; font-weight: 700; color: #94a3b8; cursor: pointer; }
  .btn-commit { background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

  @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
`;

export default PrescriptionEdit;