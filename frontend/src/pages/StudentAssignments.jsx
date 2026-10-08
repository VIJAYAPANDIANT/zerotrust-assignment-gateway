import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAssignments, submitAssignment, downloadSubmissionFile } from '../services/api';

export default function StudentAssignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active submission modal / panel state
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customFileUrl, setCustomFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  // Load assignments
  const fetchAssignments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAssignments(token);
      setAssignments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  // Open submission dialog
  const handleOpenSubmit = (assignment) => {
    setActiveAssignment(assignment);
    setSelectedFile(null);
    setCustomFileUrl('');
    setSubmitFeedback(null);
  };

  const handleCloseSubmit = () => {
    setActiveAssignment(null);
    setSelectedFile(null);
    setCustomFileUrl('');
    setSubmitFeedback(null);
  };

  // Submit coursework
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedFile && !customFileUrl.trim()) {
      setSubmitFeedback({
        type: 'error',
        text: 'Please select a file to upload or enter a repository/artifact URL.',
      });
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await submitAssignment(token, {
        assignmentId: activeAssignment.id,
        file: selectedFile,
        fileUrl: customFileUrl.trim() || undefined,
      });

      setSubmitFeedback({
        type: 'success',
        text: res.message || 'Assignment submitted successfully!',
      });

      // Refresh assignments list to reflect new status
      await fetchAssignments();

      setTimeout(() => {
        handleCloseSubmit();
      }, 1500);
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        text: err.message || 'Failed to submit assignment. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Available Coursework Assignments 📖</h2>
          <p className="welcome-sub">
            Review assignment prompts, verify submission deadlines, and upload your academic solutions.
          </p>
        </div>
        <button onClick={fetchAssignments} className="btn-refresh" title="Reload list">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Retrieving assignments from secure gateway...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card empty-state-box">
          <span className="empty-icon" aria-hidden="true">📚</span>
          <p className="empty-title">No Coursework Published Yet</p>
          <p className="empty-subtitle">
            Your instructors have not published any coursework assignments yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="assignment-cards-list">
          {assignments.map((assignment) => {
            const isSubmitted = assignment.submission_status !== 'not_submitted';
            const sub = assignment.my_submission;
            const deadlinePassed = new Date(assignment.deadline) < new Date();

            return (
              <div key={assignment.id} className="card assignment-detail-card">
                {/* Header */}
                <div className="assignment-card-top">
                  <div>
                    <h3 className="assignment-title">{assignment.title}</h3>
                    <span className="instructor-name">
                      Instructor: {assignment.faculty_name || 'Academic Faculty'}
                    </span>
                  </div>

                  <span
                    className={`status-pill ${
                      isSubmitted ? 'status-submitted-pill' : 'status-pending-pill'
                    }`}
                  >
                    {isSubmitted
                      ? `✓ ${sub?.status.toUpperCase() || 'SUBMITTED'}`
                      : 'NOT SUBMITTED'}
                  </span>
                </div>

                {/* Description */}
                <p className="assignment-desc">{assignment.description}</p>

                {/* Deadline & Meta */}
                <div className="assignment-meta-bar">
                  <div className="meta-item">
                    <span className="meta-label">📅 Deadline:</span>
                    <span
                      className={`meta-value ${
                        deadlinePassed && !isSubmitted ? 'text-late' : ''
                      }`}
                    >
                      {new Date(assignment.deadline).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {deadlinePassed && !isSubmitted && ' (Passed)'}
                    </span>
                  </div>

                  {isSubmitted && sub && (
                    <div className="meta-item">
                      <span className="meta-label">📤 Submitted On:</span>
                      <span className="meta-value">
                        {new Date(sub.submitted_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Evaluation Marks & Feedback if available */}
                {isSubmitted && sub && (
                  <div className="grading-panel">
                    <div className="grading-header">
                      <span>Evaluation Status:</span>
                      <span className="marks-badge">
                        {sub.marks !== null ? `Score: ${sub.marks} / 100` : 'Pending Grading'}
                      </span>
                    </div>
                    {sub.feedback ? (
                      <p className="feedback-text">
                        <strong>Faculty Feedback:</strong> {sub.feedback}
                      </p>
                    ) : (
                      <p className="feedback-pending">No instructor remarks recorded yet.</p>
                    )}
                    <div className="artifact-link-row">
                      <span className="meta-label">Submitted Artifact:</span>
                      <button
                        type="button"
                        onClick={() => downloadSubmissionFile(token, sub.id, `${assignment.title}_solution`)}
                        className="btn-secure-download"
                      >
                        🔒 Download Solution File
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="assignment-footer-actions">
                  <button
                    onClick={() => handleOpenSubmit(assignment)}
                    className={`btn-submit-action ${isSubmitted ? 'btn-resubmit' : 'btn-submit-new'}`}
                  >
                    {isSubmitted ? '🔄 Resubmit Solution' : '🚀 Upload Submission'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD / SUBMISSION MODAL */}
      {activeAssignment && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Upload Assignment: {activeAssignment.title}</h3>
              <button onClick={handleCloseSubmit} className="btn-close-modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="modal-body">
              <p className="modal-info">
                Please upload your solution file (<strong>PDF, DOC, DOCX</strong> - Max 15MB) to Supabase Storage.
              </p>

              {submitFeedback && (
                <div className={`alert-banner ${submitFeedback.type}`}>
                  {submitFeedback.text}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="file-upload">Choose Solution File (PDF, DOC, DOCX - Max 15MB)</label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  disabled={submitting}
                />
                {selectedFile && (
                  <span className="file-chosen-tag">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <div className="divider-text">
                <span>OR PROVIDE DIRECT STORAGE URL</span>
              </div>

              <div className="form-group">
                <label htmlFor="custom-url">Storage / Repository Artifact URL</label>
                <input
                  id="custom-url"
                  type="url"
                  placeholder="https://storage.supabase.co/submissions/my-assignment.pdf"
                  value={customFileUrl}
                  onChange={(e) => setCustomFileUrl(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseSubmit}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Uploading to Gateway...' : 'Submit Coursework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
