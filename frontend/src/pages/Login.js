// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../App.css'; // Using App.css for styles

function Login() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!key) {
      setError('Please enter the Admin Key.');
      return;
    }
    // We just save the key. The API will tell us if it's wrong.
    login(key);
    navigate('/'); // Go to the main app
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1>Admin Access</h1>
        <p>Please enter the Admin Key to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="adminKey">Admin Secret Key</label>
            <input
              type="password"
              id="adminKey"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          {error && <p className="message error-message">{error}</p>}
          <button type="submit" className="button auth-button">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
