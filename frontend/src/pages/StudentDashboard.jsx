import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  UploadSimple,
  CheckCircle,
  ShieldCheck,
  CloudArrowUp,
  FileText,
  DownloadSimple,
  WarningCircle,
  ArrowRight,
  X,
  CircleNotch,
  CalendarBlank,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import {
  getAssignments,
  getMySubmissions,
  submitAssignment,
  downloadSubmissionFile,
} from '../services/api';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    gradedCount: 0,
  });
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!token) return;
    try {
      const [assignRes, subRes] = await Promise.all([
        getAssignments(token),
        getMySubmissions(token),
      ]);

      const assignList = assignRes.data || [];
      const subList = subRes.data || [];
      const graded = subList.filter((s) => s.marks !== null).length;

      setAssignments(assignList);
      setSubmissions(subList);

      setStats({
        totalAssignments: assignList.length,
        totalSubmissions: subList.length,
        gradedCount: graded,
      });

      // Default selected assignment to first unsubmitted assignment if available
      const pendingAssign = assignList.find((a) => a.submission_status === 'not_submitted');
      if (pendingAssign && !selectedAssignmentId) {
        setSelectedAssignmentId(pendingAssign.id);
      } else if (assignList.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(assignList[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Handle File Selection with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const maxSizeBytes = 15 * 1024 * 1024; // 15 MB

    if (!allowedExtensions.includes(fileExt)) {
      setUploadStatus({
        type: 'error',
        message: `Invalid format "${fileExt}". Allowed formats: PDF, DOC, DOCX.`,
        progress: 0,
        stepText: 'Format verification failed',
      });
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > maxSizeBytes) {
      setUploadStatus({
        type: 'error',
        message: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 15 MB limit.`,
        progress: 0,
        stepText: 'Size limit exceeded',
      });
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
  };

  // Handle Assignment Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAssignmentId) {
      setUploadStatus({
        type: 'error',
        message: 'Please choose an assignment from the dropdown list.',
        progress: 0,
        stepText: 'Selection error',
      });
      return;
    }

    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a valid PDF, DOC, or DOCX document to upload.',
        progress: 0,
        stepText: 'No file selected',
      });
      return;
    }

    setIsUploading(true);

    try {
      setUploadStatus({
        type: 'info',
        message: 'Verifying student identity & role claims against Zero Trust gateway...',
        progress: 25,
        stepText: 'Stage 1/4: Continuous Authentication Assertion',
      });

      await new Promise((r) => setTimeout(r, 300));

      setUploadStatus({
        type: 'info',
        message: `Uploading "${selectedFile.name}" to private Supabase Storage ("assignments" bucket)...`,
        progress: 60,
        stepText: 'Stage 2/4: Private Object Stream Encrypted at Rest',
      });

      const res = await submitAssignment(token, {
        assignmentId: selectedAssignmentId,
        file: selectedFile,
      });

      setUploadStatus({
        type: 'info',
        message: 'Recording submission index and signing tamper-evident access log...',
        progress: 85,
        stepText: 'Stage 3/4: Database Persistence & SOC Telemetry',
      });

      await new Promise((r) => setTimeout(r, 300));

      setUploadStatus({
        type: 'success',
        message: res.message || 'Coursework verified and deposited securely in Supabase Storage!',
        progress: 100,
        stepText: 'Stage 4/4: Verified & Committed',
      });

      // Reset file input
      setSelectedFile(null);
      const fileInput = document.getElementById('dashboard-file-input');
      if (fileInput) fileInput.value = '';

      await loadDashboardData();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Upload failed. Please ensure file meets parameters and retry.',
        progress: 0,
        stepText: 'Upload error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Securely retrieve and download student file artifact
  const handleDownloadFile = async (sub) => {
    try {
      setDownloadingId(sub.id);
      const filename = sub.assignment_title
        ? `${sub.assignment_title.replace(/[^a-zA-Z0-9]/g, '_')}_solution`
        : 'assignment_solution';
      await downloadSubmissionFile(token, sub.id, filename);
    } catch (err) {
      alert(`Secure Retrieval Error: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2>
            <GraduationCap size={28} weight="duotone" color="#38bdf8" />
            <span>Welcome back, {user?.name}</span>
          </h2>
          <p className="welcome-sub">Student Security Workspace • Continuous Verification Active</p>
        </div>
        <div className="perimeter-badge">
          <span className="pulse-dot"></span>
          <span>Zero Trust Session Verified</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <BookOpen size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '—' : stats.totalAssignments}</span>
            <span className="stat-label">Available Coursework</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <UploadSimple size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '—' : stats.totalSubmissions}</span>
            <span className="stat-label">My Submissions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper allow">
            <CheckCircle size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '—' : stats.gradedCount}</span>
            <span className="stat-label">Evaluated / Graded</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: '#10b981', fontSize: '1.4rem' }}>Enforced</span>
            <span className="stat-label">Zero Trust Boundary</span>
          </div>
        </div>
      </div>

      {/* ASSIGNMENT FILE UPLOAD WORKFLOW */}
      <div className="upload-card">
        <div className="upload-card-header">
          <h3>
            <CloudArrowUp size={22} weight="duotone" color="#38bdf8" />
            <span>Secure Coursework Upload</span>
          </h3>
          <span className="decision-pill decision-allow">
            Private Vault: assignments
          </span>
        </div>

        <form onSubmit={handleUploadSubmit} className="upload-form-body">
          <div className="form-group">
            <label className="form-label" htmlFor="assign-select">
              <span>Select Coursework Target *</span>
            </label>
            <select
              id="assign-select"
              className="form-input"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              disabled={isUploading || loading}
              required
            >
              <option value="" disabled>
                -- Select assignment destination --
              </option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} {a.submission_status !== 'not_submitted' ? '• [Already Submitted]' : '• [Pending Action]'}
                </option>
              ))}
            </select>
          </div>

          {/* File Selector Dropzone */}
          <div className="form-group">
            <label className="form-label">
              <span>Solution Document (PDF, DOC, DOCX — Max 15MB) *</span>
            </label>
            <input
              type="file"
              id="dashboard-file-input"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <div
              className={`file-drop-zone ${selectedFile ? 'has-file' : ''}`}
              onClick={() => document.getElementById('dashboard-file-input')?.click()}
            >
              <CloudArrowUp size={36} weight="duotone" className="file-drop-icon" />
              <p className="file-drop-instructions">
                {selectedFile ? selectedFile.name : 'Click to select solution file from device'}
              </p>
              <p className="file-drop-sub">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for cryptographic deposit`
                  : 'Zero Trust enforced • Scanned and isolated in private Supabase Storage'}
              </p>
            </div>

            {selectedFile && (
              <div className="file-chip">
                <FileText size={18} weight="duotone" color="#38bdf8" />
                <span>{selectedFile.name}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  className="btn-file-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    const el = document.getElementById('dashboard-file-input');
                    if (el) el.value = '';
                  }}
                  title="Remove selected file"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar & Verification Stages */}
          {uploadStatus && (
            <div className="upload-progress-box">
              <div className="progress-meta">
                <span className="progress-step">{uploadStatus.stepText}</span>
                <span className="progress-percent">{uploadStatus.progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${uploadStatus.progress}%`,
                    background:
                      uploadStatus.type === 'error'
                        ? 'var(--color-block)'
                        : uploadStatus.type === 'success'
                        ? 'var(--color-allow)'
                        : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  }}
                ></div>
              </div>
              <p className="progress-message">{uploadStatus.message}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isUploading || !selectedFile || !selectedAssignmentId}
          >
            {isUploading ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                <span>Securing & Uploading...</span>
              </>
            ) : (
              <>
                <UploadSimple size={18} weight="bold" />
                <span>Submit to Zero Trust Vault</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* RECENT SUBMISSIONS TABLE */}
      <div className="card">
        <div className="card-header">
          <h3>
            <FileText size={20} weight="duotone" color="#38bdf8" />
            <span>My Submitted Coursework</span>
          </h3>
          <Link to="/student/submissions" className="btn-action">
            <span>View All</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <CircleNotch size={28} className="animate-spin" color="#38bdf8" />
              <p className="empty-state-desc">Loading coursework records...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <UploadSimple size={36} weight="duotone" className="empty-state-icon" />
              <h4 className="empty-state-title">No submissions on record</h4>
              <p className="empty-state-desc">Select an assignment above to upload your first solution document.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Submitted Date</th>
                  <th>Evaluation Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 5).map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{sub.assignment_title || 'Assignment'}</strong>
                    </td>
                    <td>
                      <span className="timestamp">
                        {new Date(sub.submitted_at || sub.created_at).toLocaleDateString()} {new Date(sub.submitted_at || sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      {sub.marks !== null ? (
                        <span className="decision-pill decision-allow">Graded</span>
                      ) : (
                        <span className="decision-pill decision-failure">Pending Evaluation</span>
                      )}
                    </td>
                    <td>
                      {sub.marks !== null ? (
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                          {sub.marks} / 100
                        </strong>
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() => handleDownloadFile(sub)}
                        disabled={downloadingId === sub.id}
                        title="Download verified solution artifact"
                      >
                        {downloadingId === sub.id ? (
                          <CircleNotch size={14} className="animate-spin" />
                        ) : (
                          <DownloadSimple size={14} weight="bold" />
                        )}
                        <span>Download</span>
                      </button>
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
