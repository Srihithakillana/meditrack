import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiHome, FiDatabase, FiLogOut, FiActivity, 
  FiShield, FiChevronRight, FiCheckCircle 
} from "react-icons/fi";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      <style>{finalLayoutCSS}</style>

      {/* --- THE SIDEBAR --- */}
      <aside className="app-sidebar">
        {/* Top Branding */}
        <div className="sb-header">
          <div className="sb-logo-icon"><FiActivity /></div>
          <div className="sb-logo-text">
            <h1>MediTrack</h1>
            <span>Clinical Systems</span>
          </div>
        </div>

        {/* Middle Navigation (Scrollable if links overflow) */}
        <nav className="sb-nav-links">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            <FiHome /> <span>Dashboard</span>
            {isActive("/") && <FiChevronRight className="active-marker" />}
          </Link>

          <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
            <FiDatabase /> <span>Registry</span>
            {isActive("/admin") && <FiChevronRight className="active-marker" />}
          </Link>
        </nav>

        {/* Bottom Section (Pinned to very bottom) */}
        <div className="sb-footer">
          <div className="sb-user-card">
            <div className="sb-avatar">A</div>
            <div className="sb-user-details">
              <p>Admin</p>
              <small><FiCheckCircle /> Verified Admin</small>
            </div>
          </div>
          <button onClick={handleLogout} className="sb-logout-btn">
            <FiLogOut /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- THE MAIN VIEWPORT --- */}
      <main className="app-content">
        <header className="content-header">
          <div className="header-status">
            <div className="online-pulse"></div>
            <span>System: Active</span>
          </div>
          <div className="header-security">
            <FiShield /> <span>256-Bit Encrypted</span>
          </div>
        </header>

        <div className="content-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const finalLayoutCSS = `
  .app-container {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden; /* Stops the main screen from scrolling the sidebar */
    background: #f1f5f9;
  }

  /* SIDEBAR: ABSOLUTE PINNING */
  .app-sidebar {
    width: 270px;
    background: #0f172a;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 30px 20px;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 100%; /* Explicitly the full height of the container */
  }

  .sb-header { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; }
  .sb-logo-icon { background: #4f46e5; padding: 10px; border-radius: 12px; display: flex; font-size: 1.4rem; }
  .sb-logo-text h1 { margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.5px; }
  .sb-logo-text span { font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; }

  /* NAVIGATION SECTION: SCROLLS INDEPENDENTLY */
  .sb-nav-links {
    flex-grow: 1; /* Pushes the footer down */
    overflow-y: auto;
    margin-bottom: 20px;
  }

  .sb-nav-links a {
    display: flex; align-items: center; gap: 12px; color: #94a3b8;
    text-decoration: none; padding: 14px 18px; border-radius: 12px;
    font-weight: 600; font-size: 0.95rem; margin-bottom: 8px; transition: 0.2s;
  }
  .sb-nav-links a:hover, .sb-nav-links a.active { background: #4f46e5; color: white; }
  .active-marker { margin-left: auto; font-size: 0.8rem; }

  /* FOOTER SECTION: FIXED TO BOTTOM */
  .sb-footer {
    padding-top: 25px;
    border-top: 1px solid #1e293b;
    margin-top: auto; /* Absolute push to bottom */
  }

  .sb-user-card { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .sb-avatar { width: 36px; height: 36px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
  .sb-user-details p { margin: 0; font-size: 0.85rem; font-weight: 700; }
  .sb-user-details small { color: #10b981; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; gap: 5px; }

  .sb-logout-btn {
    width: 100%; background: #1e293b; border: 1.5px solid #334155;
    color: #ef4444; padding: 12px; border-radius: 10px; cursor: pointer;
    font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: 0.2s;
  }
  .sb-logout-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }

  /* CONTENT AREA: ALIGNS NEXT TO SIDEBAR */
  .app-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevents layout breakage */
  }

  .content-header {
    height: 70px; background: white; border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: space-between; padding: 0 40px;
    flex-shrink: 0;
  }

  .online-pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: blink 2s infinite; }
  .header-status { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 700; color: #64748b; }
  .header-security { color: #94a3b8; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }

  .content-scroll {
    flex-grow: 1;
    overflow-y: auto;
    padding: 40px;
  }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
`;

export default Layout;