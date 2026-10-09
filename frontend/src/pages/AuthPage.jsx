import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LockKey,
  EnvelopeSimple,
  User,
  SignIn,
  ArrowRight,
  WarningCircle,
  CheckCircle,
  GraduationCap,
  ChalkboardTeacher,
  Fingerprint,
  Lightning,
  Shield,
  Key,
  UsersThree,
  MagnifyingGlass,
  ArrowCounterClockwise,
  X,
  Buildings,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import {
  forgotPasswordApi,
  resetPasswordApi,
  getDirectoryApi,
} from '../services/api';

export default function AuthPage() {
  const { login, error, clearError } = useAuth();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localMsg, setLocalMsg] = useState(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Pre-enrolled Accounts Directory Modal State
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [directoryData, setDirectoryData] = useState({ students: [], faculty: [], admins: [] });
  const [directoryFilter, setDirectoryFilter] = useState('');
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState('all');

  // Load Directory on Mount (for quick selection)
  useEffect(() => {
    getDirectoryApi()
      .then((res) => {
        if (res?.data) {
          setDirectoryData(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch public directory:', err.message);
      });
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalMsg(null);

    const res = await login(loginEmail, loginPassword);
    setSubmitting(false);
    if (!res.success) {
      setLocalMsg({ type: 'error', text: res.message });
    }
  };

  const fillCredentials = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    clearError();
    setLocalMsg(null);
    setShowDirectoryModal(false);
  };

  // Forgot Password Handlers
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg(null);

    try {
      const res = await forgotPasswordApi(forgotEmail);
      setForgotLoading(false);
      if (res.success) {
        setForgotStep(2);
        setForgotMsg({ type: 'success', text: res.message });
      }
    } catch (err) {
      setForgotLoading(false);
      setForgotMsg({ type: 'error', text: err.message || 'Verification failed.' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setForgotMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setForgotMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setForgotLoading(true);
    setForgotMsg(null);

    try {
      const res = await resetPasswordApi({ email: forgotEmail, newPassword });
      setForgotLoading(false);
      if (res.success) {
        setForgotMsg({ type: 'success', text: res.message });
        setTimeout(() => {
          setShowForgotModal(false);
          setLoginEmail(forgotEmail);
          setLoginPassword(newPassword);
          setForgotStep(1);
          setForgotMsg(null);
          setLocalMsg({ type: 'success', text: 'Password reset! Credentials filled for instant login.' });
        }, 1200);
      }
    } catch (err) {
      setForgotLoading(false);
      setForgotMsg({ type: 'error', text: err.message || 'Password reset failed.' });
    }
  };

  const openForgotModal = () => {
    setForgotEmail(loginEmail || '');
    setNewPassword('');
    setConfirmPassword('');
    setForgotStep(1);
    setForgotMsg(null);
    setShowForgotModal(true);
  };

  // Filter Directory List
  const allUsersList = [
    ...(directoryData.admins || []),
    ...(directoryData.faculty || []),
    ...(directoryData.students || []),
  ];

  const filteredUsers = allUsersList.filter((u) => {
    const matchesRole = directoryRoleFilter === 'all' || u.role === directoryRoleFilter;
    const query = directoryFilter.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        {/* Left Section: Enterprise Zero Trust Architecture & Telemetry */}
        <div className="auth-hero-panel">
          <div className="auth-badge-kicker">
            <ShieldCheck size={16} weight="duotone" />
            <span>Zero Trust Boundary • Enforced</span>
          </div>

          <h1 className="auth-hero-title">
            Academic Coursework <span>Submission Gateway</span>
          </h1>

          <p className="auth-desc">
            Continuous cryptographic verification, role-based boundaries, and private object isolation
            for pre-enrolled students and faculty.
          </p>

          <div className="telemetry-features">
            <div className="telemetry-card">
              <div className="telemetry-card-header">
                <Fingerprint size={18} weight="duotone" className="telemetry-card-icon" />
                <span>Continuous Verification</span>
              </div>
              <p className="telemetry-card-text">
                Every request re-evaluates signed JWT identity claims and cryptographic validity.
              </p>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-card-header">
                <Shield size={18} weight="duotone" className="telemetry-card-icon" />
                <span>Zero Implicit Trust</span>
              </div>
              <p className="telemetry-card-text">
                Strict compartmentalization: students only access their own submissions; faculty evaluate coursework.
              </p>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-card-header">
                <Buildings size={18} weight="duotone" className="telemetry-card-icon" />
                <span>Closed Enrollment Boundary</span>
              </div>
              <p className="telemetry-card-text">
                30 Students, 5 Faculty & 1 System Administrator pre-provisioned. Self-registration is restricted.
              </p>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-card-header">
                <Lightning size={18} weight="duotone" className="telemetry-card-icon" />
                <span>Audit & Access Logging</span>
              </div>
              <p className="telemetry-card-text">
                ALLOW, BLOCK, and FAILURE access events are streamed to tamper-evident access logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Authentication Terminal */}
        <div className="auth-terminal-card">
          <div className="auth-card-top">
            <div className="auth-card-kicker">Security Terminal</div>
            <h2 className="auth-card-heading">Authenticate Identity</h2>
            <p className="auth-card-subtitle">
              Enter your pre-enrolled institutional credentials to establish an authenticated session.
            </p>
          </div>

          {/* Institutional Closed Registration Notice */}
          <div className="closed-enrollment-banner">
            <div className="closed-banner-left">
              <LockKey size={16} weight="duotone" className="closed-banner-icon" />
              <span>Closed Enrollment (35 Pre-Registered Members)</span>
            </div>
            <button
              type="button"
              className="btn-view-directory"
              onClick={() => setShowDirectoryModal(true)}
              title="Browse pre-registered accounts"
            >
              <UsersThree size={15} weight="bold" />
              <span>Directory</span>
            </button>
          </div>

          {/* Alerts / Error feedback */}
          {(localMsg || error) && (
            <div className={`alert-banner ${localMsg?.type || 'error'}`}>
              {localMsg?.type === 'success' ? (
                <CheckCircle size={18} weight="duotone" style={{ flexShrink: 0 }} />
              ) : (
                <WarningCircle size={18} weight="duotone" style={{ flexShrink: 0 }} />
              )}
              <span>{localMsg?.text || error}</span>
            </div>
          )}

          {/* SIGN IN FORM (Login Only) */}
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                <span>Institutional Email Address</span>
              </label>
              <div className="input-container">
                <span className="input-icon-adornment">
                  <EnvelopeSimple size={16} weight="duotone" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="form-input input-has-icon"
                  required
                  autoComplete="email"
                  placeholder="vijayapandiant07@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label className="form-label" htmlFor="login-password">
                  <span>Secret Key / Password</span>
                </label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={openForgotModal}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-container">
                <span className="input-icon-adornment">
                  <Key size={16} weight="duotone" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  className="form-input input-has-icon"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span>Authenticating Identity...</span>
              ) : (
                <>
                  <span>Sign In With Zero Trust</span>
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-Enrolled Identities Box */}
          <div className="quick-test-section">
            <div className="quick-test-header">
              <span className="quick-test-title-text">
                <ShieldCheck size={14} weight="duotone" />
                <span>Pre-Enrolled Credentials (Password: 123456)</span>
              </span>
              <button
                type="button"
                className="btn-text-link"
                onClick={() => setShowDirectoryModal(true)}
              >
                Browse All (36)
              </button>
            </div>

            <div className="quick-test-grid">
              {/* Primary Student */}
              <button
                type="button"
                className="quick-pill-btn"
                onClick={() => fillCredentials('vijayapandiant07@gmail.com', '123456')}
                title="Fill Primary Student (Vijay T)"
              >
                <span className="quick-pill-role" style={{ color: '#38bdf8' }}>STUDENT</span>
                <span className="quick-pill-name">Vijay T</span>
                <span className="quick-pill-email">vijayapandiant07@gmail.com</span>
              </button>

              {/* Faculty Demo */}
              <button
                type="button"
                className="quick-pill-btn"
                onClick={() => fillCredentials('faculty.alan@gateway.edu', '123456')}
                title="Fill Faculty (Dr. Alan Vance)"
              >
                <span className="quick-pill-role" style={{ color: '#fbbf24' }}>FACULTY</span>
                <span className="quick-pill-name">Dr. Alan Vance</span>
                <span className="quick-pill-email">faculty.alan@gateway.edu</span>
              </button>

              {/* Main Admin */}
              <button
                type="button"
                className="quick-pill-btn"
                onClick={() => fillCredentials('vijayapandian112007@gmail.com', '123456')}
                title="Fill Main Administrator (Vijaypandian T)"
              >
                <span className="quick-pill-role" style={{ color: '#c084fc' }}>ADMIN</span>
                <span className="quick-pill-name">Vijaypandian T</span>
                <span className="quick-pill-email">vijayapandian112007@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. FORGOT PASSWORD MODAL                                 */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <ArrowCounterClockwise size={20} weight="duotone" className="text-cyan" />
                <h3>Institutional Password Recovery</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowForgotModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-desc">
              Recover access to your pre-enrolled academic account with continuous identity verification.
            </p>

            {forgotMsg && (
              <div className={`alert-banner ${forgotMsg.type}`} style={{ marginBottom: '1.25rem' }}>
                {forgotMsg.type === 'success' ? (
                  <CheckCircle size={18} weight="duotone" />
                ) : (
                  <WarningCircle size={18} weight="duotone" />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              /* Step 1: Verify Email */
              <form onSubmit={handleVerifyEmail} className="auth-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">
                    <span>Registered Institutional Email</span>
                  </label>
                  <div className="input-container">
                    <span className="input-icon-adornment">
                      <EnvelopeSimple size={16} weight="duotone" />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      className="form-input input-has-icon"
                      required
                      placeholder="e.g. vijayapandiant07@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={forgotLoading}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForgotModal(false)}
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? 'Verifying Account...' : 'Verify Identity'}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Set New Password */
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label className="form-label">
                    <span>Verified Account</span>
                  </label>
                  <div className="verified-email-pill">
                    <CheckCircle size={16} weight="duotone" color="#34d399" />
                    <span>{forgotEmail}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-pass">
                    <span>New Password (Min. 6 chars)</span>
                  </label>
                  <div className="input-container">
                    <span className="input-icon-adornment">
                      <Key size={16} weight="duotone" />
                    </span>
                    <input
                      id="new-pass"
                      type="password"
                      className="form-input input-has-icon"
                      required
                      minLength={6}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={forgotLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-pass">
                    <span>Confirm New Password</span>
                  </label>
                  <div className="input-container">
                    <span className="input-icon-adornment">
                      <LockKey size={16} weight="duotone" />
                    </span>
                    <input
                      id="confirm-pass"
                      type="password"
                      className="form-input input-has-icon"
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={forgotLoading}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setForgotStep(1)}
                    disabled={forgotLoading}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PRE-ENROLLED DIRECTORY MODAL (30 Students + 5 Faculty) */}
      {/* ======================================================== */}
      {showDirectoryModal && (
        <div className="modal-backdrop" onClick={() => setShowDirectoryModal(false)}>
          <div
            className="modal-content directory-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <UsersThree size={22} weight="duotone" className="text-cyan" />
                <div>
                  <h3>Institutional User Directory</h3>
                  <span className="directory-sub">
                    30 Students • 5 Faculty • 1 Main Admin (Password: 123456)
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDirectoryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="directory-controls">
              <div className="directory-search-box">
                <MagnifyingGlass size={16} />
                <input
                  type="text"
                  placeholder="Search student, faculty name or email..."
                  value={directoryFilter}
                  onChange={(e) => setDirectoryFilter(e.target.value)}
                />
              </div>

              <div className="directory-role-filters">
                <button
                  type="button"
                  className={`role-filter-btn ${directoryRoleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setDirectoryRoleFilter('all')}
                >
                  All ({allUsersList.length})
                </button>
                <button
                  type="button"
                  className={`role-filter-btn ${directoryRoleFilter === 'student' ? 'active' : ''}`}
                  onClick={() => setDirectoryRoleFilter('student')}
                >
                  Students ({directoryData.students?.length || 0})
                </button>
                <button
                  type="button"
                  className={`role-filter-btn ${directoryRoleFilter === 'faculty' ? 'active' : ''}`}
                  onClick={() => setDirectoryRoleFilter('faculty')}
                >
                  Faculty ({directoryData.faculty?.length || 0})
                </button>
                <button
                  type="button"
                  className={`role-filter-btn ${directoryRoleFilter === 'admin' ? 'active' : ''}`}
                  onClick={() => setDirectoryRoleFilter('admin')}
                >
                  Admin ({directoryData.admins?.length || 0})
                </button>
              </div>
            </div>

            {/* User Directory Grid */}
            <div className="directory-list-container">
              {filteredUsers.length === 0 ? (
                <div className="directory-empty">No matching pre-enrolled accounts found.</div>
              ) : (
                <div className="directory-grid">
                  {filteredUsers.map((item) => (
                    <div
                      key={item.id}
                      className="directory-user-card"
                      onClick={() => fillCredentials(item.email, '123456')}
                      title="Click to 1-Click Login with this account"
                    >
                      <div className="dir-user-top">
                        <span className={`role-badge role-${item.role}`}>
                          {item.role === 'student' ? (
                            <GraduationCap size={13} weight="bold" />
                          ) : item.role === 'faculty' ? (
                            <ChalkboardTeacher size={13} weight="bold" />
                          ) : (
                            <ShieldCheck size={13} weight="bold" />
                          )}
                          <span>{item.role.toUpperCase()}</span>
                        </span>
                        <span className="dir-pwd-tag">Pass: 123456</span>
                      </div>
                      <div className="dir-user-name">{item.name}</div>
                      <div className="dir-user-email">{item.email}</div>
                      <button type="button" className="dir-select-btn">
                        <span>Select Account</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <span className="directory-hint-text">
                💡 Click any user card to instantly populate login credentials and sign in.
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDirectoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
