import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFacultyAssignments, getFacultySubmissions } from '../services/api';

export default function FacultyDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    pendingGrading: 0,
    gradedCount: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacultyData() {
      if (!token) return;
      try {
        const [assignRes, subRes] = await Promise.all([
          getFacultyAssignments(token),
          getFacultySubmissions(token),
        ]);

        const assignments = assignRes.data || [];
        const submissions = subRes.data || [];
        const pending = submissions.filter((s) => s.marks === null || s.marks === undefined).length;
        const graded = submissions.length - pending;

        setStats({
          totalAssignments: assignments.length,
          totalSubmissions: submissions.length,
          pendingGrading: pending,
          gradedCount: graded,
        });

        setRecentSubmissions(submissions.slice(0, 5));
      } catch (err) {
        console.error('Error fetching faculty dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFacultyData();
  }, [token]);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner faculty-banner">
        <div>
          <h2>Instructor Dashboard 🏛️</h2>
          <p className="welcome-sub">
            Welcome, {user?.name} • Course Management & Evaluation Portal
          </p>
        </div>
        <div className="status-pill status-verified-faculty">
          <span className="dot"></span> Evaluator Identity Verified
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalAssignments}</span>
            <span className="stat-label">Active Assignments</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📥</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalSubmissions}</span>
            <span className="stat-label">Student Submissions</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-value text-orange">
              {loading ? '...' : stats.pendingGrading}
            </span>
            <span className="stat-label">Pending Evaluation</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value text-green">
              {loading ? '...' : stats.gradedCount}
            </span>
            <span className="stat-label">Graded & Evaluated</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Security Context */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-header">
            <h3>⚡ Evaluator Quick Actions</h3>
          </div>
          <div className="card-body">
            <p className="card-description">
              Create new assignment prompts with custom deadlines or review student artifacts awaiting your evaluation.
            </p>
            <div className="action-buttons-group">
              <Link to="/faculty/assignments" className="btn-action primary">
                ➕ Publish New Coursework Assignment
              </Link>
              <Link to="/faculty/submissions" className="btn-action secondary">
                📋 Review All Student Submissions
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🛡️ Zero Trust Evaluator Role Boundary</h3>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Instructor Identity:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Gateway Tier:</span>
              <span className="value badge-faculty">{user?.role}</span>
            </div>
            <div className="detail-row">
              <span className="label">Evaluation Authority:</span>
              <span className="value text-green">Authorized for Grading</span>
            </div>
            <div className="detail-row">
              <span className="label">Admin Boundary:</span>
              <span className="value">Separated from System Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Snapshot */}
      <div className="card mt-4">
        <div className="card-header flex-between">
          <h3>📥 Recent Coursework Submissions</h3>
          <Link to="/faculty/submissions" className="link-button">
            View All ({stats.totalSubmissions}) →
          </Link>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="placeholder-box">Loading student submissions...</div>
          ) : recentSubmissions.length === 0 ? (
            <div className="placeholder-box">No student submissions recorded yet.</div>
          ) : (
            <div className="faculty-table-wrapper">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment</th>
                    <th>Submitted On</th>
                    <th>Status</th>
                    <th>Marks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <strong>{sub.student_name}</strong>
                        <div className="sub-text">{sub.student_email}</div>
                      </td>
                      <td>{sub.assignment_title}</td>
                      <td>
                        {new Date(sub.submitted_at).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td>
                        <span className={`status-pill status-${sub.status}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {sub.marks !== null ? (
                          <span className="text-green font-bold">{sub.marks} / 100</span>
                        ) : (
                          <span className="text-muted">Unchecked</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/faculty/submissions/${sub.id}`}
                          className="btn-table-action"
                        >
                          Review & Grade →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
