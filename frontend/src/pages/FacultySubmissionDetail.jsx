import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  User,
  CalendarBlank,
  DownloadSimple,
  ArrowsClockwise,
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  CircleNotch,
  Sparkle,
} from '@phosphor-icons/react';
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
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!submission) return;
    setDownloading(true);
    try {
      await downloadSubmissionFile(
        token,
        submission.id,
        `${submission.student_name || 'student'}_solution`
      );
    } catch (err) {
      alert(`Download Error: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header with breadcrumb */}
      <div className="section-header">
        <div>
          <Link to="/faculty/submissions" className="breadcrumb-link">
            <ArrowLeft size={14} weight="bold" />
            <span>Back to Submissions Queue</span>
          </Link>
          <h2>
            <FileText size={28} weight="duotone" color="#fbbf24" />
            <span>Submission Evaluation Inspector</span>
          </h2>
        </div>
        <button onClick={fetchDetail} className="btn-refresh">
          <ArrowsClockwise size={16} weight="bold" />
          <span>Refresh Record</span>
        </button>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <CircleNotch size={32} className="animate-spin" color="#38bdf8" />
          <p>Loading submission details...</p>
        </div>
      ) : !submission ? (
        <div className="card empty-state-box">
          <p className="empty-title">Submission Not Found</p>
          <p className="empty-subtitle">The requested submission record does not exist or has been removed.</p>
          <Link to="/faculty/submissions" className="btn-primary mt-4" style={{ width: 'auto' }}>
            Return to Submissions List
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
          {/* Left Column: Assignment & Submission Details */}
          <div className="detail-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Assignment Details */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <FileText size={18} weight="duotone" color="#38bdf8" />
                  <span>Coursework Prompt</span>
                </h3>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Assignment:</span>
                  <span className="value font-bold">{submission.assignment_title}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Deadline:</span>
                  <span className="value font-mono" style={{ fontSize: '0.82rem' }}>
                    {submission.assignment_deadline
                      ? new Date(submission.assignment_deadline).toLocaleString()
                      : 'No deadline set'}
                  </span>
                </div>
                <div className="prompt-box">
                  <span className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Instructions & Rubric
                  </span>
                  <p className="prompt-text">
                    {submission.assignment_description || 'No prompt description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Metadata */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <User size={18} weight="duotone" color="#38bdf8" />
                  <span>Student Submission Artifact</span>
                </h3>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Student Name:</span>
                  <span className="value font-bold">{submission.student_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Student Email:</span>
                  <span className="value font-mono" style={{ fontSize: '0.82rem' }}>{submission.student_email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span className="value font-mono" style={{ fontSize: '0.82rem' }}>
                    {new Date(submission.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Current Status:</span>
                  <span className={`status-pill status-${submission.status}`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>

                <div className="artifact-download-card">
                  <span className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vault Storage Path
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: '6px 0 10px' }}>
                    {submission.file_url}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn-action primary"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <CircleNotch size={15} className="animate-spin" />
                    ) : (
                      <DownloadSimple size={15} weight="bold" />
                    )}
                    <span>Download & Inspect Solution File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grading & Feedback Panel */}
          <div className="grading-column">
            <div className="card">
              <div className="card-header">
                <h3>
                  <Sparkle size={18} weight="duotone" color="#fbbf24" />
                  <span>Evaluation & Feedback</span>
                </h3>
              </div>
              <form onSubmit={handleGradeSubmit} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {gradingMessage && (
                  <div className={`alert-banner ${gradingMessage.type}`}>
                    {gradingMessage.type === 'success' ? (
                      <CheckCircle size={18} weight="duotone" />
                    ) : (
                      <WarningCircle size={18} weight="duotone" />
                    )}
                    <span>{gradingMessage.text}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="grade-marks">
                    <span>Score (out of 100) *</span>
                    {marks && (
                      <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        Grade: {marks >= 90 ? 'A' : marks >= 80 ? 'B' : marks >= 70 ? 'C' : 'Pass'}
                      </span>
                    )}
                  </label>
                  <input
                    id="grade-marks"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    placeholder="e.g. 95"
                    className="form-input font-mono"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    disabled={saving}
                  />

                  {/* Quick Preset Score Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {[100, 95, 90, 85, 80, 75].map((score) => (
                      <button
                        key={score}
                        type="button"
                        className="btn-action"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                        onClick={() => setMarks(score)}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="grade-feedback">
                    <span>Instructor Commentary & Rubric Remarks</span>
                  </label>
                  <textarea
                    id="grade-feedback"
                    rows={6}
                    placeholder="Provide constructive assessment, rubric breakdown, and commentary..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="grading-action-bar">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <CircleNotch size={16} className="animate-spin" />
                        <span>Recording Evaluation...</span>
                      </>
                    ) : (
                      <>
                        <FloppyDisk size={16} weight="bold" />
                        <span>Save Grade & Publish Feedback</span>
                      </>
                    )}
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
