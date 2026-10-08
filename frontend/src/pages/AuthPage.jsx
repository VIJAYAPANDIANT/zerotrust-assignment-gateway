import { useState } from 'react';
import {
  ShieldCheck,
  LockKey,
  EnvelopeSimple,
  User,
  SignIn,
  UserPlus,
  ArrowRight,
  WarningCircle,
  CheckCircle,
  GraduationCap,
  ChalkboardTeacher,
  Fingerprint,
  Lightning,
  Shield,
  Key,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const { login, register, error, clearError } = useAuth();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');

  // Local UI State
  const [submitting, setSubmitting] = useState(false);
  const [localMsg, setLocalMsg] = useState(null);

  const handleTabSwitch = (isLogin) => {
    setIsLoginTab(isLogin);
    clearError();
    setLocalMsg(null);
  };

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalMsg(null);

    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
    });
    setSubmitting(false);
    if (!res.success) {
      setLocalMsg({ type: 'error', text: res.message });
    }
  };

  const fillTestCredentials = (email, password) => {
    setIsLoginTab(true);
    setLoginEmail(email);
    setLoginPassword(password);
    clearError();
    setLocalMsg(null);
  };

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
            for students and faculty.
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
                <LockKey size={18} weight="duotone" className="telemetry-card-icon" />
                <span>Encrypted Storage Vault</span>
              </div>
              <p className="telemetry-card-text">
                Assignment binaries are securely deposited in Supabase Storage with signed token delivery.
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
            <h2 className="auth-card-heading">
              {isLoginTab ? 'Authenticate Identity' : 'Enroll Identity'}
            </h2>
            <p className="auth-card-subtitle">
              {isLoginTab
                ? 'Enter your institutional credentials to establish an authenticated session.'
                : 'Create an authorized student or evaluator profile.'}
            </p>
          </div>

          {/* Tactical Segmented Tab Switcher */}
          <div className="auth-segmented-tabs">
            <button
              type="button"
              className={`segmented-tab ${isLoginTab ? 'active' : ''}`}
              onClick={() => handleTabSwitch(true)}
            >
              <SignIn size={17} weight="duotone" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`segmented-tab ${!isLoginTab ? 'active' : ''}`}
              onClick={() => handleTabSwitch(false)}
            >
              <UserPlus size={17} weight="duotone" />
              <span>Create Account</span>
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

          {/* SIGN IN FORM */}
          {isLoginTab ? (
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
                <label className="form-label" htmlFor="login-password">
                  <span>Secret Key / Password</span>
                </label>
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
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  <span>Full Legal Name</span>
                </label>
                <div className="input-container">
                  <span className="input-icon-adornment">
                    <User size={16} weight="duotone" />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input input-has-icon"
                    required
                    autoComplete="name"
                    placeholder="e.g. Alex Chen"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  <span>Academic Email</span>
                </label>
                <div className="input-container">
                  <span className="input-icon-adornment">
                    <EnvelopeSimple size={16} weight="duotone" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input input-has-icon"
                    required
                    autoComplete="email"
                    placeholder="e.g. alex@univ.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  <span>Password (Min. 6 chars)</span>
                </label>
                <div className="input-container">
                  <span className="input-icon-adornment">
                    <Key size={16} weight="duotone" />
                  </span>
                  <input
                    id="reg-password"
                    type="password"
                    className="form-input input-has-icon"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Create secure passphrase"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Role Selector Radio Group */}
              <div className="form-group">
                <label className="form-label">
                  <span>Authorized Role</span>
                </label>
                <div className="role-radio-group">
                  <div
                    className={`role-radio-chip ${regRole === 'student' ? 'selected' : ''}`}
                    onClick={() => setRegRole('student')}
                  >
                    <GraduationCap size={20} weight="duotone" color={regRole === 'student' ? '#38bdf8' : '#64748b'} />
                    <div className="role-chip-text">
                      <span className="role-chip-title">Student</span>
                      <span className="role-chip-subtitle">Submit Coursework</span>
                    </div>
                  </div>

                  <div
                    className={`role-radio-chip ${regRole === 'faculty' ? 'selected' : ''}`}
                    onClick={() => setRegRole('faculty')}
                  >
                    <ChalkboardTeacher size={20} weight="duotone" color={regRole === 'faculty' ? '#fbbf24' : '#64748b'} />
                    <div className="role-chip-text">
                      <span className="role-chip-title">Faculty</span>
                      <span className="role-chip-subtitle">Evaluate & Grade</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <span>Registering Identity...</span>
                ) : (
                  <>
                    <span>Complete Enrollment</span>
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Test Identities Box */}
          <div className="quick-test-section">
            <div className="quick-test-header">
              <span className="quick-test-title-text">
                <ShieldCheck size={14} weight="duotone" />
                <span>Test Credentials</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>1-Click Fill</span>
            </div>
            <div className="quick-test-grid">
              <button
                type="button"
                className="quick-pill-btn"
                onClick={() => fillTestCredentials('student@univ.edu', 'Password123!')}
                title="Fill Student Credentials"
              >
                <span className="quick-pill-role" style={{ color: '#38bdf8' }}>STUDENT</span>
                <span className="quick-pill-email">student@univ.edu</span>
              </button>

              <button
                type="button"
                className="quick-pill-btn"
                onClick={() => fillTestCredentials('faculty@univ.edu', 'Password123!')}
                title="Fill Faculty Credentials"
              >
                <span className="quick-pill-role" style={{ color: '#fbbf24' }}>FACULTY</span>
                <span className="quick-pill-email">faculty@univ.edu</span>
              </button>

              <button
                type="button"
                className="quick-pill-btn"
                onClick={() => fillTestCredentials('admin@zerotrust.local', 'AdminPassword123!')}
                title="Fill Admin Credentials"
              >
                <span className="quick-pill-role" style={{ color: '#c084fc' }}>ADMIN</span>
                <span className="quick-pill-email">admin@zerotrust</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
