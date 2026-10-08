import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadSimple,
  ArrowsClockwise,
  CalendarBlank,
  DownloadSimple,
  CircleNotch,
  FolderSimple,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { getMySubmissions, downloadSubmissionFile } from '../services/api';

export default function StudentSubmissions() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleDownload = async (sub) => {
    setDownloadingId(sub.id);
    try {
      await downloadSubmissionFile(
        token,
        sub.id,
        `${sub.assignment_title || 'assignment'}_solution`
      );
    } catch (err) {
      alert(`Download Error: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>
            <UploadSimple size={28} weight="duotone" color="#38bdf8" />
            <span>My Submission History</span>
          </h2>
          <p className="welcome-sub">
            Track evaluation status, download submitted solution artifacts, view marks and faculty remarks.
          </p>
        </div>
        <button onClick={fetchSubmissions} className="btn-refresh">
          <ArrowsClockwise size={16} weight="bold" />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <CircleNotch size={32} className="animate-spin" color="#38bdf8" />
          <p>Retrieving your submission records...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="card empty-state-box">
          <UploadSimple size={44} weight="duotone" className="empty-icon" color="#38bdf8" />
          <p className="empty-title">No Submissions Recorded Yet</p>
          <p className="empty-subtitle">
            You haven't submitted any coursework solutions yet.
          </p>
          <Link to="/student/assignments" className="btn-primary mt-4" style={{ width: 'auto' }}>
            <FolderSimple size={16} weight="bold" />
            <span>Browse Available Assignments</span>
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
                        Submitted:{' '}
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

                <div className="submission-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* File Artifact Row */}
                  <div className="detail-row">
                    <span className="label">Submitted Artifact:</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(sub)}
                      className="btn-secure-download"
                      disabled={downloadingId === sub.id}
                    >
                      {downloadingId === sub.id ? (
                        <CircleNotch size={14} className="animate-spin" />
                      ) : (
                        <DownloadSimple size={14} weight="bold" />
                      )}
                      <span>Download Solution Artifact</span>
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
                    <span className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Instructor Feedback
                    </span>
                    <div className="prompt-box" style={{ marginTop: '0.4rem' }}>
                      {hasFeedback ? (
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{sub.feedback}</p>
                      ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No instructor remarks published yet.
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
