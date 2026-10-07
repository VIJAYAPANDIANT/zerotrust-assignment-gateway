import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-shield">🛡️</span>
        <div>
          <h2 className="brand-title">ZeroTrust Gateway</h2>
          <span className="brand-sub">Assignment Submission Platform</span>
        </div>
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
