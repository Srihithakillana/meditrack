import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../App.css'; // Using App.css for styles
import { FiLock } from 'react-icons/fi'; // Import the icon

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
        
        {/* --- NEW: Icon --- */}
        <div className="auth-icon">
          <FiLock size={24} />
        </div>

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
          
          {/* --- NEW: "Extra Features" --- */}
          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          {error && <p className="message error-message">{error}</p>}
          <button type="submit" className="button auth-button">
            Unlock
          </button>
        </form>
        {/* --- No Register Link, as requested --- */}
      </div>
    </div>
  );
}

export default Login;