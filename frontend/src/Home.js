// src/Home.js
import React, { useState } from "react";
import axios from "axios";
import { FiUpload, FiSearch, FiFileText, FiLoader } from "react-icons/fi";
import "./App.css";

function Home() { // <-- Renamed from App
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !name) {
      setError("Please provide a Patient Name and select a file.");
      return;
    }
    setError("");
    setUploadSuccess("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_name", name);

    try {
      await axios.post("http://127.0.0.1:8000/upload/", formData);
      setUploadSuccess(`Prescription uploaded successfully for Patient: ${name}`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Upload failed. Please check the server.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!name) {
      setError("Please enter a Patient Name to fetch history.");
      return;
    }
    setError("");
    setUploadSuccess("");
    setIsLoading(true);
    setHistory([]);

    try {
      const res = await axios.get(`http://127.0.0.1:8000/history/${name}`);
      setHistory(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Could not fetch history.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Prescription and Patient History Automation System</h1>
        <p>Harnessing AI to digitize and understand medical data instantly.</p>
      </header>

      <div className="upload-grid">
        <div className="card upload-section">
          <h2>Upload New Prescription</h2>
          <div className="form-group">
            <label htmlFor="patientName">Patient Name</label>
            <input
              type="text"
              id="patientName"
              placeholder="Enter Patient Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="file">Prescription Image</label>
            <div className="file-input-wrapper">
              <button className="file-input-button">
                <FiFileText />
                <span>{file ? "Change file" : "Select a file"}</span>
              </button>
              <input
                type="file"
                id="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </div>
            {file && <p className="file-name">{file.name}</p>}
          </div>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Prescription preview" />
            </div>
          )}
        </div>
        
        <div className="card actions-section">
          <h2>Actions</h2>
          <p>Upload the selected image or view the history for the entered Patient Name.</p>
          <button onClick={handleUpload} className="button" disabled={isLoading || !file || !name}>
            {isLoading ? <div className="loader"></div> : <FiUpload />}
            <span>Upload</span>
          </button>
          <div style={{height: '1rem'}}></div>
          <button onClick={fetchHistory} className="button" disabled={isLoading || !name}>
            {isLoading ? <div className="loader"></div> : <FiSearch />}
            <span>View History</span>
          </button>
        </div>
      </div>

      {error && <p className="message error-message">{error}</p>}
      {uploadSuccess && <p className="message success-message">{uploadSuccess}</p>}

      <div className="history-section">
        <h2>History</h2>
        {isLoading && history.length === 0 && <p style={{textAlign: 'center'}}>Loading history...</p>}
        {!isLoading && history.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-secondary-color)'}}>No history found for this Patient Name.</p>}
        
        <div className="history-list">
          {history.map((record) => {
            let extractedData = {};
            try {
              if (record.llm_extracted_info) {
                extractedData = JSON.parse(record.llm_extracted_info);
              }
            } catch (e) {
              console.error("Could not parse JSON:", record.llm_extracted_info);
              extractedData = { patient_name: "Error parsing data" };
            }

            return (
              <div key={record.id} className="card history-item">
                <div className="history-item-header">
                    <h3>Record ID: {record.id}</h3>
                    <span>Date: {extractedData.date || 'N/A'}</span>
                </div>
                <div className="history-item-body">
                    <p><strong>Patient Name (from scan):</strong> {extractedData.patient_name || 'N/A'}</p>
                    <p><strong>Doctor Name:</strong> {extractedData.doctor_name || 'N/A'}</p>
                    <h5>Medicines</h5>
                    <ul>
                      {(extractedData.medicines && extractedData.medicines.length > 0) ? (
                        extractedData.medicines.map((med, medIndex) => (
                          <li key={medIndex}>
                            {med.name} ({med.dosage}) - {med.frequency}
                          </li>
                        ))
                      ) : (
                        <li>No medicines were extracted.</li>
                      )}
                    </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home; // <-- Renamed