import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAssignments, getMySubmissions } from '../services/api';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    gradedCount: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!token) return;
      try {
        const [assignRes, subRes] = await Promise.all([
          getAssignments(token),
          getMySubmissions(token),
        ]);

        const assignments = assignRes.data || [];
        const submissions = subRes.data || [];
        const graded = submissions.filter((s) => s.marks !== null).length;

        setStats({
          totalAssignments: assignments.length,
          totalSubmissions: submissions.length,
          gradedCount: graded,
        });

        setRecentAssignments(assignments.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [token]);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {user?.name} 🎓</h2>
          <p className="welcome-sub">Student Portal • Academic Year 2026</p>
        </div>
        <div className="status-pill status-verified">
          <span className="dot"></span> Identity Verified (Zero Trust)
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalAssignments}</span>
            <span className="stat-label">Available Coursework</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📤</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalSubmissions}</span>
            <span className="stat-label">Submitted Assignments</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.gradedCount}</span>
            <span className="stat-label">Evaluated / Graded</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🛡️</span>
          <div className="stat-info">
            <span className="stat-value text-green">Active</span>
            <span className="stat-label">Zero Trust Boundary</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Action & Security Detail */}
      <div className="grid-cards">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>⚡ Quick Navigation</h3>
          </div>
          <div className="card-body">
            <p className="card-description">
              Browse newly published coursework, view deadlines, or check evaluation marks and faculty feedback.
            </p>
            <div className="action-buttons-group">
              <Link to="/student/assignments" className="btn-action primary">
                📖 Browse Available Assignments
              </Link>
              <Link to="/student/submissions" className="btn-action secondary">
                📁 Review My Submissions
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Access Posture */}
        <div className="card">
          <div className="card-header">
            <h3>🔒 Zero Trust Session Credentials</h3>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Verified Identity:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Authorization Tier:</span>
              <span className="value badge-student">{user?.role}</span>
            </div>
            <div className="detail-row">
              <span className="label">Continuous Verification:</span>
              <span className="value text-green">Enforced via requireAuth</span>
            </div>
            <div className="detail-row">
              <span className="label">Data Isolation:</span>
              <span className="value">Strict Student-Only Scope</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Coursework Snapshot */}
      <div className="card mt-4">
        <div className="card-header flex-between">
          <h3>📅 Active Coursework Deadlines</h3>
          <Link to="/student/assignments" className="link-button">
            View All ({stats.totalAssignments}) →
          </Link>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="placeholder-box">Loading assignments...</div>
          ) : recentAssignments.length === 0 ? (
            <div className="placeholder-box">No assignments currently scheduled.</div>
          ) : (
            <div className="assignment-mini-list">
              {recentAssignments.map((a) => (
                <div key={a.id} className="mini-assignment-row">
                  <div>
                    <h4 className="mini-title">{a.title}</h4>
                    <span className="mini-deadline">
                      ⏰ Deadline: {new Date(a.deadline).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`status-tag ${
                        a.submission_status === 'not_submitted'
                          ? 'status-pending'
                          : 'status-done'
                      }`}
                    >
                      {a.submission_status === 'not_submitted'
                        ? 'Pending Submission'
                        : 'Submitted'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
