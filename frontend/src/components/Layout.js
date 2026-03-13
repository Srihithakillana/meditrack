import React, { useContext } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiHome, FiShield, FiLogOut, FiMoon } from 'react-icons/fi';

function Layout() {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/login'; // Redirect to login
  };

  return (
    <div className="page-layout">
      
      <header className="page-header">
        <nav className="navbar">
          
          {/* --- Column 1: Left --- */}
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <FiMoon size={24} />
              <h1>MediTrack</h1>
            </Link>
          </div>

          {/* --- Column 2: Center --- */}
          <div className="navbar-center">
            <div className="navbar-nav">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                <FiHome size={16} />
                <span>Home (Upload)</span>
              </NavLink>
              <NavLink 
                to="/admin"
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                <FiShield size={16} />
                <span>Admin Panel</span>
              </NavLink>
            </div>
          </div>

          {/* --- Column 3: Right (This forces Logout to the end) --- */}
          <div className="navbar-right">
            {/* --- MODIFIED: This is now a styled "danger" button --- */}
            <button onClick={handleLogout} className="button-small button-danger">
              <FiLogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main content area (renders Home or AdminPanel) */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;