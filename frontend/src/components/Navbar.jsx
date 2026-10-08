import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Section */}
        <div className="navbar-brand-section">
          <Link
            to={
              user.role === 'student'
                ? '/student/dashboard'
                : user.role === 'admin'
                ? '/security/logs'
                : '/faculty/dashboard'
            }
            className="navbar-brand"
            onClick={closeMobile}
          >
            <span className="brand-shield" aria-hidden="true">🛡️</span>
            <div className="brand-text">
              <span className="brand-title">ZeroTrust Gateway</span>
              <span className="brand-sub">Academic Submission Security</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links desktop-nav">
            {user.role === 'student' && (
              <>
                <NavLink
                  to="/student/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/student/assignments"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Assignments
                </NavLink>
                <NavLink
                  to="/student/submissions"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  My Submissions
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  🛡️ Security Logs
                </NavLink>
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <NavLink
                  to="/faculty/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/faculty/assignments"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Coursework
                </NavLink>
                <NavLink
                  to="/faculty/submissions"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Student Submissions
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  🛡️ Security Logs
                </NavLink>
              </>
            )}

            {user.role === 'admin' && (
              <NavLink
                to="/security/logs"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                🛡️ Security Audit Logs
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Section: User & Logout + Hamburger */}
        <div className="navbar-actions">
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge role-${user.role}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <button
              onClick={logout}
              className="btn-logout"
              title="End Zero Trust Session"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-links">
            {user.role === 'student' && (
              <>
                <NavLink
                  to="/student/dashboard"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  📊 Dashboard
                </NavLink>
                <NavLink
                  to="/student/assignments"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  📖 Assignments
                </NavLink>
                <NavLink
                  to="/student/submissions"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  📁 My Submissions
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  🛡️ Security Audit Logs
                </NavLink>
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <NavLink
                  to="/faculty/dashboard"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  🏛️ Dashboard
                </NavLink>
                <NavLink
                  to="/faculty/assignments"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  📝 Coursework
                </NavLink>
                <NavLink
                  to="/faculty/submissions"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  📥 Student Submissions
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  🛡️ Security Audit Logs
                </NavLink>
              </>
            )}

            {user.role === 'admin' && (
              <NavLink
                to="/security/logs"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                🛡️ Security Audit Logs
              </NavLink>
            )}

            <div className="mobile-user-footer">
              <div className="mobile-user-details">
                <span>Signed in as <strong>{user.name}</strong></span>
                <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
              </div>
              <button onClick={logout} className="btn-logout w-full">
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
