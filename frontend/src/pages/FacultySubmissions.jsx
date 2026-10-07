import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFacultySubmissions } from '../services/api';

export default function FacultySubmissions() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'graded'

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
          <h2>Student Coursework Submissions 📥</h2>
          <p className="welcome-sub">
            Review student artifacts, examine integrity, and record evaluation grades.
          </p>
        </div>
        <button onClick={fetchSubmissions} className="btn-refresh">
          🔄 Refresh
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
          Pending Grading ({submissions.filter((s) => s.marks === null).length})
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
          <div className="spinner"></div>
          <p>Retrieving student submissions from gateway...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="card placeholder-box">
          <p className="placeholder-text">
            {filter === 'all'
              ? 'No student submissions have been recorded yet.'
              : `No submissions matching "${filter}" status.`}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="faculty-table-wrapper">
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
                      <div className="sub-text">{sub.student_email}</div>
                    </td>
                    <td>
                      <div className="font-medium">{sub.assignment_title}</div>
                      {sub.assignment_deadline && (
                        <div className="sub-text">
                          Due: {new Date(sub.assignment_deadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>
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
                        Review & Grade →
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
