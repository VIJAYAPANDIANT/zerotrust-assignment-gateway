import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadSimple,
  ArrowsClockwise,
  MagnifyingGlass,
  CheckCircle,
  Hourglass,
  ArrowRight,
  CircleNotch,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { getFacultySubmissions } from '../services/api';

export default function FacultySubmissions() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchSubmissions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getFacultySubmissions(token);
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch student submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'pending') return sub.marks === null || sub.marks === undefined;
    if (filter === 'graded') return sub.marks !== null && sub.marks !== undefined;
    return true;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>
            <UploadSimple size={28} weight="duotone" color="#fbbf24" />
            <span>Student Coursework Submissions</span>
          </h2>
          <p className="welcome-sub">
            Review student artifacts, examine integrity, and record evaluation grades.
          </p>
        </div>
        <button onClick={fetchSubmissions} className="btn-refresh">
          <ArrowsClockwise size={16} weight="bold" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Submissions ({submissions.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Evaluation ({submissions.filter((s) => s.marks === null).length})
        </button>
        <button
          className={`filter-btn ${filter === 'graded' ? 'active' : ''}`}
          onClick={() => setFilter('graded')}
        >
          Evaluated ({submissions.filter((s) => s.marks !== null).length})
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <CircleNotch size={32} className="animate-spin" color="#38bdf8" />
          <p>Retrieving student submissions from gateway...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="card empty-state-box">
          <MagnifyingGlass size={40} weight="duotone" className="empty-icon" />
          <p className="empty-title">No Submissions Found</p>
          <p className="empty-subtitle">
            {filter === 'all'
              ? 'No student submissions have been recorded yet.'
              : `No submissions matching "${filter}" status filter.`}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
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
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="font-bold">{sub.student_name}</div>
                      <div className="sub-text font-mono">{sub.student_email}</div>
                    </td>
                    <td>
                      <div className="font-medium">{sub.assignment_title}</div>
                      {sub.assignment_deadline && (
                        <div className="sub-text font-mono">
                          Due: {new Date(sub.assignment_deadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="timestamp" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${sub.status}`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {sub.marks !== null ? (
                        <span className="badge-grade-done">{sub.marks} / 100</span>
                      ) : (
                        <span className="badge-grade-pending">Unchecked</span>
                      )}
                    </td>
                    <td>
                      <Link
                        to={`/faculty/submissions/${sub.id}`}
                        className="btn-table-action"
                      >
                        <span>Review & Grade</span>
                        <ArrowRight size={13} weight="bold" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
