import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFacultyAssignments, createAssignment } from '../services/api';

export default function FacultyAssignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for creating new assignment
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  const fetchAssignments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getFacultyAssignments(token);
      setAssignments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  const handleOpenModal = () => {
    setTitle('');
    setDescription('');
    // Default deadline to 14 days from now
    const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    setDeadline(defaultDate.toISOString().slice(0, 16));
    setModalFeedback(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalFeedback(null);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) {
      setModalFeedback({
        type: 'error',
        text: 'Title and deadline are required.',
      });
      return;
    }

    setSubmitting(true);
    setModalFeedback(null);

    try {
      const res = await createAssignment(token, {
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline).toISOString(),
      });

      setModalFeedback({
        type: 'success',
        text: res.message || 'Assignment created successfully!',
      });

      await fetchAssignments();

      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err) {
      setModalFeedback({
        type: 'error',
        text: err.message || 'Failed to create assignment.',
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
          <h2>Coursework Assignments Management 📝</h2>
          <p className="welcome-sub">
            Author coursework prompts, set submission cutoffs, and monitor student completion.
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleOpenModal} className="btn-primary">
            ➕ Create New Assignment
          </button>
        </div>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading course assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card empty-state-box">
          <span className="empty-icon" aria-hidden="true">📝</span>
          <p className="empty-title">No Coursework Authored Yet</p>
          <p className="empty-subtitle">
            You haven't authored any assignments yet. Create your first coursework prompt for students.
          </p>
          <button onClick={handleOpenModal} className="btn-primary mt-4">
            ➕ Create Your First Assignment
          </button>
        </div>
      ) : (
        <div className="assignment-cards-list">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="card assignment-detail-card">
              <div className="assignment-card-top">
                <div>
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <span className="mini-deadline">
                    📅 Due: {new Date(assignment.deadline).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="status-tags-group">
                  <span className="status-pill status-submitted-pill">
                    {assignment.total_submissions || 0} Submissions
                  </span>
                  <span className="status-pill status-verified-faculty">
                    {assignment.graded_submissions || 0} Graded
                  </span>
                </div>
              </div>

              <p className="assignment-desc">{assignment.description}</p>

              <div className="assignment-footer-actions">
                <Link
                  to="/faculty/submissions"
                  className="btn-action secondary text-sm"
                >
                  Review Student Submissions →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header">
              <h3>Create New Coursework Assignment</h3>
              <button onClick={handleCloseModal} className="btn-close-modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="modal-body">
              {modalFeedback && (
                <div className={`alert-banner ${modalFeedback.type}`}>
                  {modalFeedback.text}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="assign-title">Assignment Title *</label>
                <input
                  id="assign-title"
                  type="text"
                  required
                  placeholder="e.g., Lab 5: Cloudflare Tunnel & JWT Assertion Validation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="assign-desc">Prompt & Instructions</label>
                <textarea
                  id="assign-desc"
                  rows={4}
                  placeholder="Detail the submission requirements, rubric guidelines, and deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="assign-deadline">Submission Deadline *</label>
                <input
                  id="assign-deadline"
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {submitting ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
