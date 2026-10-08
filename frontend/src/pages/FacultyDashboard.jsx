import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChalkboardTeacher,
  FolderSimple,
  UploadSimple,
  Hourglass,
  CheckCircle,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  CircleNotch,
} from '@phosphor-icons/react';
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
      <div className="welcome-banner">
        <div>
          <h2>
            <ChalkboardTeacher size={28} weight="duotone" color="#fbbf24" />
            <span>Faculty Command Portal • {user?.name}</span>
          </h2>
          <p className="welcome-sub">
            Coursework Governance & Student Evaluation • Zero Trust Enforced
          </p>
        </div>
        <div className="perimeter-badge" style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.08)' }}>
          <span className="pulse-dot" style={{ backgroundColor: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}></span>
          <span>Faculty Role Verified</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.08)', borderColor: 'rgba(251, 191, 36, 0.2)' }}>
            <FolderSimple size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '—' : stats.totalAssignments}</span>
            <span className="stat-label">Active Coursework</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <UploadSimple size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '—' : stats.totalSubmissions}</span>
            <span className="stat-label">Total Student Submissions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper failure">
            <Hourglass size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value text-orange">{loading ? '—' : stats.pendingGrading}</span>
            <span className="stat-label">Pending Evaluation</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper allow">
            <CheckCircle size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value text-green">{loading ? '—' : stats.gradedCount}</span>
            <span className="stat-label">Graded & Recorded</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Security Context */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-header">
            <h3>
              <PlusCircle size={20} weight="duotone" color="#38bdf8" />
              <span>Evaluator Fast Actions</span>
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Author coursework prompts, set cutoffs, or inspect student artifacts awaiting marks and rubric feedback.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/faculty/assignments" className="btn-action primary">
                <PlusCircle size={16} weight="bold" />
                <span>Author Coursework Assignment</span>
              </Link>
              <Link to="/faculty/submissions" className="btn-action">
                <UploadSimple size={16} weight="bold" />
                <span>Review Submissions Queue</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>
              <ShieldCheck size={20} weight="duotone" color="#fbbf24" />
              <span>Zero Trust Evaluator Assertion</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Evaluator Identity:</span>
              <span className="value font-mono" style={{ fontSize: '0.82rem' }}>{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Gateway Tier:</span>
              <span className="role-badge role-faculty">FACULTY</span>
            </div>
            <div className="detail-row">
              <span className="label">Evaluation Scope:</span>
              <span className="value text-green" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Authorized for Grading</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Queue */}
      <div className="card">
        <div className="card-header">
          <h3>
            <UploadSimple size={20} weight="duotone" color="#38bdf8" />
            <span>Recent Student Submissions</span>
          </h3>
          <Link to="/faculty/submissions" className="btn-action">
            <span>View All Queue</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <CircleNotch size={28} className="animate-spin" color="#38bdf8" />
              <p className="empty-state-desc">Loading submissions queue...</p>
            </div>
          ) : recentSubmissions.length === 0 ? (
            <div className="empty-state">
              <UploadSimple size={36} weight="duotone" className="empty-state-icon" />
              <h4 className="empty-state-title">No submissions in queue</h4>
              <p className="empty-state-desc">When students submit solutions, they will appear here for grading.</p>
            </div>
          ) : (
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="font-bold">{sub.student_name}</div>
                      <div className="sub-text font-mono">{sub.student_email}</div>
                    </td>
                    <td>
                      <div className="font-medium">{sub.assignment_title}</div>
                    </td>
                    <td>
                      <span className="timestamp" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      {sub.marks !== null ? (
                        <span className="status-pill status-graded">GRADED</span>
                      ) : (
                        <span className="status-pill status-pending">PENDING</span>
                      )}
                    </td>
                    <td>
                      {sub.marks !== null ? (
                        <span className="badge-grade-done">{sub.marks} / 100</span>
                      ) : (
                        <span className="badge-grade-pending">Unchecked</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/faculty/submissions/${sub.id}`} className="btn-table-action">
                        <span>Evaluate</span>
                        <ArrowRight size={13} weight="bold" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
