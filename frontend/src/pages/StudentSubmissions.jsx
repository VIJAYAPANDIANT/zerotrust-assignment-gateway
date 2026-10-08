import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySubmissions, downloadSubmissionFile } from '../services/api';

export default function StudentSubmissions() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMySubmissions(token);
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>My Submission History 📁</h2>
          <p className="welcome-sub">
            Track evaluation status, submitted artifacts, marks, and faculty remarks.
          </p>
        </div>
        <button onClick={fetchSubmissions} className="btn-refresh" title="Reload submissions">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Retrieving your submission records...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="card empty-state-box">
          <span className="empty-icon" aria-hidden="true">📤</span>
          <p className="empty-title">No Submissions Recorded Yet</p>
          <p className="empty-subtitle">
            You haven't submitted any coursework solutions yet.
          </p>
          <Link to="/student/assignments" className="btn-primary mt-4">
            Browse Available Assignments →
          </Link>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map((sub) => {
            const hasMarks = sub.marks !== null && sub.marks !== undefined;
            const hasFeedback = Boolean(sub.feedback);

            return (
              <div key={sub.id} className="card submission-card">
                <div className="submission-card-header">
                  <div>
                    <h3 className="submission-title">{sub.assignment_title}</h3>
                    <div className="submission-submeta">
                      <span>
                        ⏰ Submitted on:{' '}
                        {new Date(sub.submitted_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {sub.assignment_deadline && (
                        <span>
                          {' '}• Deadline was:{' '}
                          {new Date(sub.assignment_deadline).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`status-pill status-${sub.status}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>

                <div className="submission-card-body">
                  {/* File Artifact Row */}
                  <div className="detail-row">
                    <span className="label">Submitted Artifact:</span>
                    <button
                      type="button"
                      onClick={() =>
                        downloadSubmissionFile(
                          token,
                          sub.id,
                          `${sub.assignment_title || 'assignment'}_solution`
                        )
                      }
                      className="btn-secure-download"
                    >
                      🔒 Download Solution Artifact
                    </button>
                  </div>

                  {/* Marks / Grading */}
                  <div className="detail-row">
                    <span className="label">Evaluation Grade:</span>
                    <span className={hasMarks ? 'grade-score' : 'grade-pending'}>
                      {hasMarks ? `${sub.marks} / 100` : 'Pending Evaluation'}
                    </span>
                  </div>

                  {/* Feedback Panel */}
                  <div className="feedback-section">
                    <span className="label">Instructor Feedback:</span>
                    <div className={`feedback-box ${hasFeedback ? 'has-text' : 'empty'}`}>
                      {hasFeedback ? (
                        <p>{sub.feedback}</p>
                      ) : (
                        <p className="italic">
                          No feedback has been published by the evaluator yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
