import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderSimple,
  PlusCircle,
  CalendarBlank,
  UsersThree,
  CheckCircle,
  X,
  CircleNotch,
  ArrowRight,
} from '@phosphor-icons/react';
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
          <h2>
            <FolderSimple size={28} weight="duotone" color="#fbbf24" />
            <span>Coursework Management</span>
          </h2>
          <p className="welcome-sub">
            Author assignments, set deadlines, and monitor submissions across your course roster.
          </p>
        </div>
        <div>
          <button onClick={handleOpenModal} className="btn-primary" style={{ margin: 0 }}>
            <PlusCircle size={16} weight="bold" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {loading ? (
        <div className="loading-card">
          <CircleNotch size={32} className="animate-spin" color="#38bdf8" />
          <p>Loading course assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card empty-state-box">
          <FolderSimple size={44} weight="duotone" className="empty-icon" color="#fbbf24" />
          <p className="empty-title">No Coursework Authored Yet</p>
          <p className="empty-subtitle">
            Create your first assignment prompt for students.
          </p>
          <button onClick={handleOpenModal} className="btn-primary mt-4" style={{ width: 'auto' }}>
            <PlusCircle size={16} weight="bold" />
            <span>Create Assignment</span>
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
                    <CalendarBlank size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Due: {new Date(assignment.deadline).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="status-tags-group">
                  <span className="status-pill status-submitted-pill">
                    <UsersThree size={14} />
                    <span>{assignment.total_submissions || 0} Submissions</span>
                  </span>
                  <span className="status-pill status-verified-faculty">
                    <CheckCircle size={14} />
                    <span>{assignment.graded_submissions || 0} Graded</span>
                  </span>
                </div>
              </div>

              <p className="assignment-desc">{assignment.description}</p>

              <div className="assignment-footer-actions">
                <Link
                  to="/faculty/submissions"
                  className="btn-action primary"
                >
                  <span>Review Submissions Queue</span>
                  <ArrowRight size={14} weight="bold" />
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
              <h3>Create Coursework Assignment</h3>
              <button onClick={handleCloseModal} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="modal-body">
              {modalFeedback && (
                <div className={`alert-banner ${modalFeedback.type}`}>
                  {modalFeedback.text}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="assign-title">
                  <span>Assignment Title *</span>
                </label>
                <input
                  id="assign-title"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Lab 4: Zero Trust Access Token Verification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="assign-desc">
                  <span>Prompt & Instructions</span>
                </label>
                <textarea
                  id="assign-desc"
                  rows={4}
                  className="form-input"
                  placeholder="Provide assignment parameters, evaluation rubric, submission format specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="assign-deadline">
                  <span>Submission Cutoff / Deadline *</span>
                </label>
                <input
                  id="assign-deadline"
                  type="datetime-local"
                  className="form-input"
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
                  style={{ width: 'auto', margin: 0 }}
                  disabled={submitting}
                >
                  {submitting ? 'Publishing Coursework...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
