import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'info'|'success'|'error', message: '', progress: number, stepText: '' }
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
        message: `Invalid file format "${fileExt}". Only PDF, DOC, and DOCX documents are accepted.`,
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
        message: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit (15 MB).`,
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
      // Step 1: Verification
      setUploadStatus({
        type: 'info',
        message: 'Verifying student identity and session authorization...',
        progress: 25,
        stepText: 'Step 1 of 4: Continuous Zero Trust verification',
      });

      await new Promise((r) => setTimeout(r, 350));

      // Step 2: Storage Upload
      setUploadStatus({
        type: 'info',
        message: `Uploading "${selectedFile.name}" to Supabase Storage ("assignments" bucket)...`,
        progress: 60,
        stepText: 'Step 2 of 4: Streaming buffer to private cloud storage',
      });

      const res = await submitAssignment(token, {
        assignmentId: selectedAssignmentId,
        file: selectedFile,
      });

      // Step 3: Database & Access Log
      setUploadStatus({
        type: 'info',
        message: 'Recording submission record and writing to Zero Trust access log...',
        progress: 85,
        stepText: 'Step 3 of 4: Updating submissions table and access_logs',
      });

      await new Promise((r) => setTimeout(r, 350));

      // Step 4: Completion
      setUploadStatus({
        type: 'success',
        message: res.message || 'Coursework uploaded successfully to Supabase Storage!',
        progress: 100,
        stepText: 'Step 4 of 4: Completed & verified',
      });

      // Reset file input
      setSelectedFile(null);
      const fileInput = document.getElementById('dashboard-file-input');
      if (fileInput) fileInput.value = '';

      // Refresh data to update submission status
      await loadDashboardData();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.message || 'Upload failed. Please ensure file is valid and try again.',
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
          <h2>Welcome back, {user?.name} 🎓</h2>
          <p className="welcome-sub">Student Portal • Academic Year 2026</p>
        </div>
        <div className="status-pill status-verified">
          <span className="dot"></span> Identity Verified (Zero Trust)
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalAssignments}</span>
            <span className="stat-label">Available Coursework</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📤</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalSubmissions}</span>
            <span className="stat-label">Submitted Assignments</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.gradedCount}</span>
            <span className="stat-label">Evaluated / Graded</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🛡️</span>
          <div className="stat-info">
            <span className="stat-value text-green">Active</span>
            <span className="stat-label">Zero Trust Boundary</span>
          </div>
        </div>
      </div>

      {/* ASSIGNMENT FILE UPLOAD SECTION (SUPABASE STORAGE) */}
      <div className="upload-card">
        <div className="upload-card-header">
          <h3>
            <span>☁️</span> Upload Assignment (Supabase Storage)
          </h3>
          <span className="status-pill status-submitted-pill">
            Bucket: assignments (Private)
          </span>
        </div>

        <form onSubmit={handleUploadSubmit} className="upload-form-body">
          <div className="form-group">
            <label htmlFor="assign-select">
              <strong>Select Assignment Coursework *</strong>
            </label>
            <select
              id="assign-select"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              disabled={isUploading || loading}
              required
            >
              <option value="" disabled>
                -- Choose an assignment to submit --
              </option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} {a.submission_status !== 'not_submitted' ? '(Already Submitted)' : '(Pending)'}
                </option>
              ))}
            </select>
          </div>

          {/* File Selector */}
          <div className="form-group">
            <label htmlFor="dashboard-file-input">
              <strong>Select Solution File (PDF, DOC, DOCX - Max 15MB) *</strong>
            </label>
            <div
              className="file-drop-zone"
              onClick={() => document.getElementById('dashboard-file-input')?.click()}
            >
              <span className="file-drop-icon">📁</span>
              <p className="file-drop-instructions">
                {selectedFile ? 'Click or tap to choose a different file' : 'Click to select solution file from your device'}
              </p>
              <p className="file-drop-hint">
                Accepted: <strong>PDF (.pdf), Microsoft Word (.doc, .docx)</strong> • Up to 15 MB
              </p>

              <input
                id="dashboard-file-input"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />

              {selectedFile && (
                <div className="selected-file-badge">
                  <span>📄 {selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress & Status */}
          {uploadStatus && (
            <div className="upload-progress-box">
              <div className="progress-header">
                <span>{uploadStatus.stepText}</span>
                <span>{uploadStatus.progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
              <div className="progress-status-sub">
                <span>
                  {uploadStatus.type === 'error' ? '❌' : uploadStatus.type === 'success' ? '✅' : '⏳'}
                </span>
                <span>{uploadStatus.message}</span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn-upload-submit"
              disabled={isUploading || !selectedFile || !selectedAssignmentId}
            >
              {isUploading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  <span>Uploading to Supabase Storage...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Upload & Submit Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SUBMISSION STATUS SUMMARY */}
      <div className="card mt-4">
        <div className="card-header flex-between">
          <h3>📋 Submission Status & Evaluation History</h3>
          <button onClick={loadDashboardData} className="btn-refresh" title="Reload list">
            🔄 Refresh
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-card" style={{ padding: '2.5rem' }}>
              <div className="spinner"></div>
              <p>Retrieving your coursework submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-state-box">
              <span className="empty-icon" aria-hidden="true">📁</span>
              <p className="empty-title">No Coursework Submissions Yet</p>
              <p className="empty-subtitle">
                Select an assignment above, upload your PDF or Word document, and submit through the secure gateway.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>Assignment Title</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Score / Marks</th>
                    <th>Secure Artifact Access</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <strong>{sub.assignment_title}</strong>
                      </td>
                      <td>
                        {new Date(sub.submitted_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
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
                          <span className="marks-badge">{sub.marks} / 100</span>
                        ) : (
                          <span className="feedback-pending">Pending Grading</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDownloadFile(sub)}
                          className="btn-secure-download"
                          disabled={downloadingId === sub.id}
                        >
                          {downloadingId === sub.id ? 'Retrieving...' : '🔒 Retrieve File'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Security & Access Posture */}
      <div className="grid-cards mt-4">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>⚡ Quick Navigation</h3>
          </div>
          <div className="card-body">
            <p className="card-description">
              Browse detailed coursework prompts, view instructor guidelines, or inspect grading feedback.
            </p>
            <div className="action-buttons-group">
              <Link to="/student/assignments" className="btn-action primary">
                📖 Browse All Assignments
              </Link>
              <Link to="/student/submissions" className="btn-action secondary">
                📁 Full Submission History
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Storage Posture */}
        <div className="card">
          <div className="card-header">
            <h3>🔒 Zero Trust Storage Protection</h3>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Storage Backend:</span>
              <span className="value">Supabase Storage</span>
            </div>
            <div className="detail-row">
              <span className="label">Bucket Isolation:</span>
              <span className="value badge-student">assignments (Private)</span>
            </div>
            <div className="detail-row">
              <span className="label">Access Control:</span>
              <span className="value text-green">Least-Privilege Signed URLs</span>
            </div>
            <div className="detail-row">
              <span className="label">Ownership Verification:</span>
              <span className="value">Strict Student-Only Isolation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
