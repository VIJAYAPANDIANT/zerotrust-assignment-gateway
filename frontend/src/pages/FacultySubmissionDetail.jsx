import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFacultySubmissionById, gradeSubmission, downloadSubmissionFile } from '../services/api';

export default function FacultySubmissionDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Grading form state
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [gradingMessage, setGradingMessage] = useState(null);

  const fetchDetail = async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getFacultySubmissionById(token, id);
      const subData = res.data;
      setSubmission(subData);
      if (subData) {
        setMarks(subData.marks !== null && subData.marks !== undefined ? subData.marks : '');
        setFeedback(subData.feedback || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch submission details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [token, id]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (marks === '' || isNaN(marks)) {
      setGradingMessage({
        type: 'error',
        text: 'Please provide a valid numeric score (0 - 100).',
      });
      return;
    }

    const numMarks = parseFloat(marks);
    if (numMarks < 0 || numMarks > 100) {
      setGradingMessage({
        type: 'error',
        text: 'Marks must be between 0 and 100.',
      });
      return;
    }

    setSaving(true);
    setGradingMessage(null);

    try {
      const res = await gradeSubmission(token, id, {
        marks: numMarks,
        feedback: feedback.trim(),
      });

      setGradingMessage({
        type: 'success',
        text: res.message || 'Evaluation and marks recorded successfully!',
      });

      // Update local view
      setSubmission((prev) => ({
        ...prev,
        marks: numMarks,
        feedback: feedback.trim(),
        status: 'graded',
      }));
    } catch (err) {
      setGradingMessage({
        type: 'error',
        text: err.message || 'Failed to submit grade.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header with breadcrumb */}
      <div className="section-header">
        <div>
          <Link to="/faculty/submissions" className="breadcrumb-link">
            ← Back to Submissions
          </Link>
          <h2>Submission Evaluation 🔍</h2>
        </div>
        <button onClick={fetchDetail} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading submission details...</p>
        </div>
      ) : !submission ? (
        <div className="card placeholder-box">
          <p className="placeholder-text">Submission record could not be found.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {/* Left Column: Assignment & Submission Details */}
          <div className="detail-column">
            {/* Assignment Details */}
            <div className="card">
              <div className="card-header">
                <h3>📖 Assignment Prompt Details</h3>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Assignment:</span>
                  <span className="value font-bold">{submission.assignment_title}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Deadline:</span>
                  <span className="value">
                    {submission.assignment_deadline
                      ? new Date(submission.assignment_deadline).toLocaleString()
                      : 'No deadline set'}
                  </span>
                </div>
                <div className="prompt-box mt-2">
                  <span className="label">Prompt & Rubric:</span>
                  <p className="prompt-text">
                    {submission.assignment_description || 'No prompt description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Metadata */}
            <div className="card mt-4">
              <div className="card-header">
                <h3>👤 Student Submission Artifact</h3>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Student Name:</span>
                  <span className="value font-bold">{submission.student_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Student Email:</span>
                  <span className="value">{submission.student_email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Submitted Timestamp:</span>
                  <span className="value">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-pill status-${submission.status}`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>
                <div className="artifact-download-card mt-2">
                  <span className="label">Artifact Storage Reference:</span>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>
                    {submission.file_url}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      downloadSubmissionFile(
                        token,
                        submission.id,
                        `${submission.student_name || 'student'}_solution`
                      )
                    }
                    className="btn-download-artifact"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  >
                    🔒 Inspect / Download Student Solution ({submission.file_url.split('/').pop()})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grading & Feedback Panel */}
          <div className="grading-column">
            <div className="card">
              <div className="card-header">
                <h3>📝 Evaluation & Grading</h3>
              </div>
              <form onSubmit={handleGradeSubmit} className="card-body">
                {gradingMessage && (
                  <div className={`alert-banner ${gradingMessage.type}`}>
                    {gradingMessage.text}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="grade-marks">
                    Score / Marks (out of 100) *
                  </label>
                  <input
                    id="grade-marks"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    placeholder="e.g., 95"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    disabled={saving}
                  />
                  <span className="field-hint">
                    Numerical grade reflected on student dashboard.
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="grade-feedback">
                    Instructor Remarks & Feedback
                  </label>
                  <textarea
                    id="grade-feedback"
                    rows={6}
                    placeholder="Provide constructive assessment, rubric breakdown, and commentary on the student's solution..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="grading-action-bar">
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={saving}
                  >
                    {saving ? 'Recording Evaluation...' : '💾 Save Grade & Publish Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
