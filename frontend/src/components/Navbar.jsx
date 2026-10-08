import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldCheck,
  SquaresFour,
  FolderSimple,
  UploadSimple,
  ShieldWarning,
  SignOut,
  List,
  X,
  GraduationCap,
  ChalkboardTeacher,
  UserGear,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const closeMobile = () => setMobileMenuOpen(false);

  const getRoleIcon = () => {
    if (user.role === 'student') return <GraduationCap size={14} weight="bold" />;
    if (user.role === 'faculty') return <ChalkboardTeacher size={14} weight="bold" />;
    return <UserGear size={14} weight="bold" />;
  };

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
            <div className="brand-icon-wrapper">
              <ShieldCheck size={22} weight="duotone" />
            </div>
            <div className="brand-text">
              <span className="brand-title">ZeroTrust Gateway</span>
              <span className="brand-sub">Academic Boundary</span>
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
                  <SquaresFour size={16} weight="duotone" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/student/assignments"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <FolderSimple size={16} weight="duotone" />
                  <span>Assignments</span>
                </NavLink>
                <NavLink
                  to="/student/submissions"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <UploadSimple size={16} weight="duotone" />
                  <span>My Submissions</span>
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <ShieldWarning size={16} weight="duotone" />
                  <span>Security Logs</span>
                </NavLink>
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <NavLink
                  to="/faculty/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <SquaresFour size={16} weight="duotone" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/faculty/assignments"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <FolderSimple size={16} weight="duotone" />
                  <span>Coursework</span>
                </NavLink>
                <NavLink
                  to="/faculty/submissions"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <UploadSimple size={16} weight="duotone" />
                  <span>Submissions</span>
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <ShieldWarning size={16} weight="duotone" />
                  <span>Security Logs</span>
                </NavLink>
              </>
            )}

            {user.role === 'admin' && (
              <NavLink
                to="/security/logs"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <ShieldWarning size={16} weight="duotone" />
                <span>Security Audit Logs</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Section: Telemetry Badge + User Profile & Sign Out */}
        <div className="navbar-actions">
          <div className="perimeter-badge">
            <span className="pulse-dot"></span>
            <span>ZT Perimeter Active</span>
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge role-${user.role}`}>
                {getRoleIcon()}
                <span>{user.role.toUpperCase()}</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="btn-logout"
              title="Terminate Zero Trust Session"
            >
              <SignOut size={15} weight="bold" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
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
                  <SquaresFour size={18} weight="duotone" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/student/assignments"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <FolderSimple size={18} weight="duotone" />
                  <span>Assignments</span>
                </NavLink>
                <NavLink
                  to="/student/submissions"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <UploadSimple size={18} weight="duotone" />
                  <span>My Submissions</span>
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <ShieldWarning size={18} weight="duotone" />
                  <span>Security Logs</span>
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
                  <SquaresFour size={18} weight="duotone" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/faculty/assignments"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <FolderSimple size={18} weight="duotone" />
                  <span>Coursework</span>
                </NavLink>
                <NavLink
                  to="/faculty/submissions"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <UploadSimple size={18} weight="duotone" />
                  <span>Student Submissions</span>
                </NavLink>
                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <ShieldWarning size={18} weight="duotone" />
                  <span>Security Logs</span>
                </NavLink>
              </>
            )}

            {user.role === 'admin' && (
              <NavLink
                to="/security/logs"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <ShieldWarning size={18} weight="duotone" />
                <span>Security Audit Logs</span>
              </NavLink>
            )}

            <div className="mobile-user-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.name}</span>
                <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
              </div>
              <button onClick={logout} className="btn-logout" style={{ width: '100%', justifyContent: 'center' }}>
                <SignOut size={16} weight="bold" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
