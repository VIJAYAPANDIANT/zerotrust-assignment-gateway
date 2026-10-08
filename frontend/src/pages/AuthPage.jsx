import { useState } from 'react';
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
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Security Shield Header */}
        <div className="auth-header">
          <div className="auth-shield-badge">
            <span className="auth-icon" aria-hidden="true">🛡️</span>
          </div>
          <h2>ZeroTrust Gateway</h2>
          <span className="auth-tagline">Assignment Submission Platform</span>
          <p className="auth-subtitle">
            Continuous identity verification & fine-grained authorization
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(true)}
          >
            🔒 Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(false)}
          >
            📝 Create Account
          </button>
        </div>

        {/* Alerts / Error feedback */}
        {(localMsg || error) && (
          <div className={`alert-banner ${localMsg?.type || 'error'}`}>
            <span>{localMsg?.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{localMsg?.text || error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Academic Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="student@univ.edu or faculty@univ.edu"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={submitting}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="btn-loading-flex">
                  <span className="spinner-sm" aria-hidden="true"></span>
                  <span>Authenticating Identity...</span>
                </span>
              ) : (
                'Sign In with Zero Trust'
              )}
            </button>

            <div className="auth-footer-hint">
              <span>Need an account? </span>
              <button
                type="button"
                className="link-button"
                onClick={() => handleTabSwitch(false)}
              >
                Register here
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g., Alice Smith or Dr. Bob Jones"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Institutional Email</label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                placeholder="e.g., student@univ.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password (Minimum 6 characters)</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Create secure password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Account Role</label>
              <select
                id="reg-role"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                disabled={submitting}
              >
                <option value="student">🎓 Student (Submit Assignments)</option>
                <option value="faculty">🏛️ Faculty (Evaluate & Grade Coursework)</option>
              </select>
              <span className="field-hint">
                Administrator access is restricted to predefined security principals.
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="btn-loading-flex">
                  <span className="spinner-sm" aria-hidden="true"></span>
                  <span>Registering Identity...</span>
                </span>
              ) : (
                'Complete Registration'
              )}
            </button>

            <div className="auth-footer-hint">
              <span>Already registered? </span>
              <button
                type="button"
                className="link-button"
                onClick={() => handleTabSwitch(true)}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security Credentials Quick-Test Reference Card */}
        <div className="quick-test-box">
          <div className="quick-test-title">
            <span>🛡️ Quick Test Identities</span>
          </div>
          <div className="quick-test-grid">
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => fillTestCredentials('admin@zerotrust.local', 'AdminPassword123!')}
              title="Click to fill Admin credentials"
            >
              <span className="quick-role-badge role-admin">ADMIN</span>
              <code>admin@zerotrust.local</code>
            </button>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => fillTestCredentials('student@univ.edu', 'Password123!')}
              title="Click to fill Student credentials"
            >
              <span className="quick-role-badge role-student">STUDENT</span>
              <code>student@univ.edu</code>
            </button>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => fillTestCredentials('faculty@univ.edu', 'Password123!')}
              title="Click to fill Faculty credentials"
            >
              <span className="quick-role-badge role-faculty">FACULTY</span>
              <code>faculty@univ.edu</code>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
