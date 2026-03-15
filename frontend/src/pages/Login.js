import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FiLock, FiActivity, FiShield, 
  FiAlertCircle, FiEye, FiEyeOff 
} from 'react-icons/fi';

function Login() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  
  // State for toggling eye icon
  const [showKey, setShowKey] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!key) {
      setError('Administrative key is required.');
      return;
    }
    login(key); 
    navigate('/'); 
  };

  return (
    <div className="auth-viewport">
      <style>{authStyles}</style>
      
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo"><FiActivity /></div>
          <h1>MediTrack</h1>
          <p>Clinical Intelligence System</p>
        </div>

        <div className="auth-header">
          <div className="lock-circle"><FiLock /></div>
          <h2>Admin Access</h2>
          <span>Enter your secure secret key to unlock the terminal.</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="adminKey">Admin Secret Key</label>
            <div className="input-wrapper">
              <input
                type={showKey ? "text" : "password"}
                id="adminKey"
                placeholder="••••••••••••"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if(error) setError('');
                }}
                required
              />
              {/* Eye Toggle Icon inside the input */}
              <button 
                type="button" 
                className="eye-toggle"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="auth-meta">
            {/* Trust Device removed; Keeping only the help link */}
            <button type="button" className="link-btn" onClick={() => alert("Contact System Admin for key recovery.")}>
              Need Help?
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <button type="submit" className="btn-unlock">
            Unlock Terminal
          </button>
        </form>

        <footer className="auth-footer">
          <FiShield /> <span>AES-256 Encrypted Connection</span>
        </footer>
      </div>
    </div>
  );
}

const authStyles = `
  .auth-viewport {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top left, #1e293b, #0f172a);
    font-family: 'Inter', sans-serif;
    padding: 20px;
  }

  .auth-card {
    background: white;
    width: 100%;
    max-width: 420px;
    border-radius: 28px;
    padding: 50px 40px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    text-align: center;
  }

  .auth-brand { margin-bottom: 40px; }
  .brand-logo { 
    background: #4f46e5; color: white; width: 44px; height: 44px; 
    border-radius: 12px; display: flex; align-items: center; 
    justify-content: center; margin: 0 auto 15px; font-size: 1.5rem;
  }
  .auth-brand h1 { margin: 0; font-size: 1.5rem; font-weight: 900; color: #0f172a; letter-spacing: -1px; }
  .auth-brand p { margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }

  .auth-header { margin-bottom: 30px; }
  .lock-circle { 
    width: 50px; height: 50px; background: #f1f5f9; color: #4f46e5; 
    border-radius: 50%; display: flex; align-items: center; 
    justify-content: center; margin: 0 auto 15px; font-size: 1.2rem;
  }
  .auth-header h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
  .auth-header span { display: block; margin-top: 8px; font-size: 0.85rem; color: #64748b; line-height: 1.5; }

  .auth-form { text-align: left; }
  .input-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px; }
  
  .input-wrapper { position: relative; display: flex; align-items: center; }
  .input-wrapper input {
    width: 100%; padding: 14px 50px 14px 18px; background: #f8fafc; border: 1.5px solid #e2e8f0; 
    border-radius: 12px; font-size: 1rem; color: #0f172a; outline: none; transition: 0.2s; box-sizing: border-box;
  }
  .input-wrapper input:focus { border-color: #4f46e5; background: white; }

  .eye-toggle {
    position: absolute; right: 15px; background: none; border: none; 
    color: #94a3b8; cursor: pointer; display: flex; align-items: center; 
    font-size: 1.2rem; padding: 0;
  }
  .eye-toggle:hover { color: #4f46e5; }

  .auth-meta { display: flex; justify-content: flex-end; align-items: center; margin-top: 15px; }
  .link-btn { background: none; border: none; color: #4f46e5; font-size: 0.8rem; font-weight: 700; cursor: pointer; }

  .auth-error { 
    margin-top: 20px; background: #fef2f2; color: #ef4444; 
    padding: 12px; border-radius: 10px; display: flex; 
    align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; 
  }

  .btn-unlock {
    width: 100%; background: #0f172a; color: white; border: none; 
    padding: 15px; border-radius: 12px; font-weight: 700; font-size: 1rem; 
    cursor: pointer; margin-top: 25px; transition: 0.2s;
  }
  .btn-unlock:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2); }

  .auth-footer { 
    margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; 
    display: flex; align-items: center; justify-content: center; 
    gap: 8px; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; 
  }
`;

export default Login;