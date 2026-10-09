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
  Circle,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const closeMobile = () => setMobileOpen(false);

  const getRoleIcon = () => {
    if (user.role === 'student') return <GraduationCap size={14} weight="bold" />;
    if (user.role === 'faculty') return <ChalkboardTeacher size={14} weight="bold" />;
    return <UserGear size={14} weight="bold" />;
  };

  const getRootDashboard = () => {
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'admin') return '/security/logs';
    return '/faculty/dashboard';
  };

  return (
    <>
      {/* Mobile Top Header Bar (visible only on mobile/tablet screens < 1024px) */}
      <header className="mobile-topbar">
        <Link to={getRootDashboard()} className="mobile-brand" onClick={closeMobile}>
          <div className="brand-icon-wrapper-sm">
            <ShieldCheck size={18} weight="duotone" />
          </div>
          <span className="mobile-brand-title">ZeroTrust Gateway</span>
        </Link>

        <div className="mobile-topbar-actions">
          <span className={`role-badge role-${user.role}`}>
            {getRoleIcon()}
            <span>{user.role.toUpperCase()}</span>
          </span>
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop fixed/sticky, Mobile slide-in drawer) */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* 1. Sidebar Brand Section */}
        <div className="sidebar-brand-wrapper">
          <Link to={getRootDashboard()} className="sidebar-brand" onClick={closeMobile}>
            <div className="brand-icon-wrapper">
              <ShieldCheck size={24} weight="duotone" />
            </div>
            <div className="brand-text">
              <span className="brand-title">ZeroTrust Gateway</span>
              <span className="brand-sub">Academic Boundary</span>
            </div>
          </Link>
        </div>

        {/* 2. Zero Trust Perimeter Telemetry Pill */}
        <div className="sidebar-telemetry">
          <div className="perimeter-badge sidebar-perimeter-pill">
            <span className="pulse-dot"></span>
            <span className="perimeter-text">ZT Perimeter Active</span>
          </div>
        </div>

        {/* 3. Navigation Links List */}
        <div className="sidebar-nav-container">
          <div className="sidebar-nav-section-title">PORTAL NAVIGATION</div>
          <nav className="sidebar-nav-menu">
            {/* Student Navigation Items */}
            {user.role === 'student' && (
              <>
                <NavLink
                  to="/student/dashboard"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <SquaresFour size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Dashboard</span>
                </NavLink>

                <NavLink
                  to="/student/assignments"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <FolderSimple size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Assignments</span>
                </NavLink>

                <NavLink
                  to="/student/submissions"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <UploadSimple size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">My Submissions</span>
                </NavLink>

                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <ShieldWarning size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Security Logs</span>
                </NavLink>
              </>
            )}

            {/* Faculty Navigation Items */}
            {user.role === 'faculty' && (
              <>
                <NavLink
                  to="/faculty/dashboard"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <SquaresFour size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Dashboard</span>
                </NavLink>

                <NavLink
                  to="/faculty/assignments"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <FolderSimple size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Coursework</span>
                </NavLink>

                <NavLink
                  to="/faculty/submissions"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <UploadSimple size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Submissions</span>
                </NavLink>

                <NavLink
                  to="/security/logs"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                >
                  <div className="nav-item-icon">
                    <ShieldWarning size={18} weight="duotone" />
                  </div>
                  <span className="nav-item-label">Security Logs</span>
                </NavLink>
              </>
            )}

            {/* Admin Navigation Items */}
            {user.role === 'admin' && (
              <NavLink
                to="/security/logs"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <div className="nav-item-icon">
                  <ShieldWarning size={18} weight="duotone" />
                </div>
                <span className="nav-item-label">Security Audit Logs</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* 4. Bottom User Profile & Sign Out Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {getRoleIcon()}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name" title={user.name}>{user.name}</span>
              <span className={`role-badge role-${user.role}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="btn-logout sidebar-logout-btn"
            title="Terminate Zero Trust Session"
          >
            <SignOut size={16} weight="bold" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
