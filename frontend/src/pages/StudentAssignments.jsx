import { useState, useEffect } from 'react';
import {
  FolderSimple,
  ArrowsClockwise,
  CalendarBlank,
  UploadSimple,
  CheckCircle,
  FileText,
  DownloadSimple,
  X,
  CircleNotch,
  ArrowRight,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { getAssignments, submitAssignment, downloadSubmissionFile } from '../services/api';

export default function StudentAssignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active submission modal state
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customFileUrl, setCustomFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

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

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedFile && !customFileUrl.trim()) {
      setSubmitFeedback({
        type: 'error',
        text: 'Please choose a file or specify a repository artifact URL.',
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

      await fetchAssignments();

      setTimeout(() => {
        handleCloseSubmit();
      }, 1500);
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        text: err.message || 'Failed to submit assignment. Please retry.',
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
          <h2>
            <FolderSimple size={28} weight="duotone" color="#38bdf8" />
            <span>Available Coursework Assignments</span>
          </h2>
          <p className="welcome-sub">
            Review coursework prompts, verify submission deadlines, and upload your academic solutions.
          </p>
        </div>
        <button onClick={fetchAssignments} className="btn-refresh">
          <ArrowsClockwise size={16} weight="bold" />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <CircleNotch size={32} className="animate-spin" color="#38bdf8" />
          <p>Retrieving assignments from secure gateway...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card empty-state-box">
          <FolderSimple size={44} weight="duotone" className="empty-icon" color="#38bdf8" />
          <p className="empty-title">No Coursework Published Yet</p>
          <p className="empty-subtitle">
            Your instructors have not published coursework assignments yet. Please check back later.
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
                    {isSubmitted ? `SUBMITTED (${sub?.status?.toUpperCase()})` : 'NOT SUBMITTED'}
                  </span>
                </div>

                <p className="assignment-desc">{assignment.description}</p>

                <div className="assignment-meta-bar">
                  <div className="meta-item">
                    <CalendarBlank size={16} color="var(--text-muted)" />
                    <span className="meta-label">Deadline:</span>
                    <span className={`meta-value ${deadlinePassed && !isSubmitted ? 'text-late' : ''}`}>
                      {new Date(assignment.deadline).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {deadlinePassed && !isSubmitted && ' (Passed)'}
                    </span>
                  </div>

                  {isSubmitted && sub && (
                    <div className="meta-item">
                      <CheckCircle size={16} color="#34d399" />
                      <span className="meta-label">Submitted On:</span>
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
                        {sub.marks !== null ? `Score: ${sub.marks} / 100` : 'Pending Evaluation'}
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
                        <DownloadSimple size={14} weight="bold" />
                        <span>Download Solution File</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="assignment-footer-actions">
                  <button
                    onClick={() => handleOpenSubmit(assignment)}
                    className={`btn-submit-action ${isSubmitted ? 'btn-resubmit' : 'btn-submit-new'}`}
                  >
                    <UploadSimple size={15} weight="bold" />
                    <span>{isSubmitted ? 'Resubmit Solution' : 'Submit Coursework'}</span>
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
              <h3>Upload: {activeAssignment.title}</h3>
              <button onClick={handleCloseSubmit} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="modal-body">
              <p className="modal-info">
                Deposit your solution file (<strong>PDF, DOC, DOCX</strong> — Max 15MB) into private Supabase Storage.
              </p>

              {submitFeedback && (
                <div className={`alert-banner ${submitFeedback.type}`}>
                  {submitFeedback.text}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="modal-file-input">
                  <span>Select Solution Document</span>
                </label>
                <input
                  id="modal-file-input"
                  type="file"
                  className="form-input"
                  accept=".pdf,.doc,.docx"
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
                <label className="form-label" htmlFor="custom-url">
                  <span>Artifact URL</span>
                </label>
                <input
                  id="custom-url"
                  type="url"
                  className="form-input"
                  placeholder="https://storage.supabase.co/submissions/solution.pdf"
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
                  style={{ width: 'auto', margin: 0 }}
                  disabled={submitting}
                >
                  {submitting ? 'Uploading...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
