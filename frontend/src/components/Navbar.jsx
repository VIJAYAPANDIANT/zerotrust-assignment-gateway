import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-brand-section">
        <Link to={user.role === 'student' ? '/student/dashboard' : '/'} className="navbar-brand">
          <span className="brand-shield">🛡️</span>
          <div>
            <h2 className="brand-title">ZeroTrust Gateway</h2>
            <span className="brand-sub">Assignment Platform</span>
          </div>
        </Link>

        {/* Student Navigation Links */}
        {user.role === 'student' && (
          <nav className="nav-links">
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
          </nav>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className={`role-badge role-${user.role}`}>
            {user.role.toUpperCase()}
          </span>
        </div>
        <button onClick={logout} className="btn-logout" title="End Session">
          Sign Out
        </button>
      </div>
    </header>
  );
}
