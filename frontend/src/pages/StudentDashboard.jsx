import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, token } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <div>
          <h2>Welcome, {user?.name} 🎓</h2>
          <p className="welcome-sub">Student Portal • Academic Year 2026</p>
        </div>
        <div className="status-pill status-verified">
          <span className="dot"></span> Identity Verified (Zero Trust)
        </div>
      </div>

      <div className="grid-cards">
        {/* Identity & Session Card */}
        <div className="card">
          <div className="card-header">
            <h3>🔒 Zero Trust Session Details</h3>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Full Name:</span>
              <span className="value">{user?.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Institutional Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Assigned Role:</span>
              <span className="value badge-student">{user?.role}</span>
            </div>
            <div className="detail-row">
              <span className="label">User UUID:</span>
              <span className="value code">{user?.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">JWT Assertion:</span>
              <span className="value code-token">
                {token ? `${token.substring(0, 24)}...` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Policy Card */}
        <div className="card">
          <div className="card-header">
            <h3>🛡️ Access Boundary Policies</h3>
          </div>
          <div className="card-body">
            <ul className="policy-list">
              <li>
                <strong>Least Privilege:</strong> Read assignments and submit coursework only.
              </li>
              <li>
                <strong>Audit Logging:</strong> Every request is continuously logged into <code>access_logs</code>.
              </li>
              <li>
                <strong>Storage Isolation:</strong> Submissions are secured via Supabase Storage policies.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Coursework Section Placeholder */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>📚 Coursework Submissions</h3>
        </div>
        <div className="card-body placeholder-box">
          <p className="placeholder-text">
            No submissions yet. Assignment viewing and secure artifact upload will be enabled in the upcoming milestone.
          </p>
        </div>
      </div>
    </div>
  );
}
