import { useState } from 'react';
import {
  ShieldCheck,
  LockKey,
  EnvelopeSimple,
  Key,
  SignIn,
  ArrowRight,
  WarningCircle,
  CheckCircle,
  Fingerprint,
  Lightning,
  Shield,
  Buildings,
  ArrowCounterClockwise,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { forgotPasswordApi, resetPasswordApi } from '../services/api';

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
          setLocalMsg({ type: 'success', text: 'Password reset successfully! You can now log in.' });
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

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        {/* Left Section: Enterprise Zero Trust Architecture & Telemetry */}
        <div className="auth-hero-panel">
          <div className="auth-hero-top">
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
          </div>

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
                <span>Pre-Enrolled Directory</span>
              </div>
              <p className="telemetry-card-text">
                30 Students, 5 Faculty & 1 System Administrator pre-provisioned by administration.
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

        {/* Right Section: Clean Authentication Terminal */}
        <div className="auth-terminal-card">
          <div className="auth-card-top">
            <div className="auth-card-kicker">Security Terminal</div>
            <h2 className="auth-card-heading">Authenticate Identity</h2>
            <p className="auth-card-subtitle">
              Enter your pre-enrolled institutional credentials to establish an authenticated session.
            </p>
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

          {/* SIGN IN FORM (Clean Login Only) */}
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
                  placeholder="student@univ.edu or faculty@univ.edu"
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

          {/* Bottom Security Assurance Footnote */}
          <div className="terminal-footer-security">
            <div className="security-status-indicator">
              <span className="pulse-dot"></span>
              <span className="security-status-label">Continuous Verification Active</span>
            </div>
            <span className="security-status-desc">
              NIST SP 800-207 Zero Trust Architecture • Role-Isolated Gateway
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL                                    */}
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
    </div>
  );
}
