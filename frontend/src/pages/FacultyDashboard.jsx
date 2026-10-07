import { useAuth } from '../context/AuthContext';

export default function FacultyDashboard() {
  const { user, token } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="welcome-banner faculty-banner">
        <div>
          <h2>Welcome, {user?.name} 🏛️</h2>
          <p className="welcome-sub">Faculty & Instructor Portal • Academic Year 2026</p>
        </div>
        <div className="status-pill status-verified-faculty">
          <span className="dot"></span> Evaluator Identity Verified
        </div>
      </div>

      <div className="grid-cards">
        {/* Identity & Session Card */}
        <div className="card">
          <div className="card-header">
            <h3>🔒 Faculty Authorization Session</h3>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Instructor Name:</span>
              <span className="value">{user?.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Faculty Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Authorization Role:</span>
              <span className="value badge-faculty">{user?.role}</span>
            </div>
            <div className="detail-row">
              <span className="label">Faculty UUID:</span>
              <span className="value code">{user?.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Active JWT:</span>
              <span className="value code-token">
                {token ? `${token.substring(0, 24)}...` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Policy Card */}
        <div className="card">
          <div className="card-header">
            <h3>🛡️ Faculty Access Privileges</h3>
          </div>
          <div className="card-body">
            <ul className="policy-list">
              <li>
                <strong>Assignment Authoring:</strong> Create and modify coursework prompts and deadlines.
              </li>
              <li>
                <strong>Evaluation & Grading:</strong> Review submissions, assign marks, and write student feedback.
              </li>
              <li>
                <strong>Audit Compliance:</strong> Evaluator actions are logged into <code>access_logs</code>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Assignment Management Placeholder */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>📝 Coursework Management</h3>
        </div>
        <div className="card-body placeholder-box">
          <p className="placeholder-text">
            Course creation, rubric management, and student grading will be activated in the next development phase.
          </p>
        </div>
      </div>
    </div>
  );
}
