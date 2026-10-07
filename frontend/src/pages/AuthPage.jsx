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

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🛡️</div>
          <h2>ZeroTrust Gateway</h2>
          <p className="auth-subtitle">
            Continuous identity verification for secure academic submissions
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(false)}
          >
            Create Account
          </button>
        </div>

        {/* Alerts / Error feedback */}
        {(localMsg || error) && (
          <div className={`alert-banner ${localMsg?.type || 'error'}`}>
            {localMsg?.text || error}
          </div>
        )}

        {/* LOGIN FORM */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Academic Email</label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="student@univ.edu or faculty@univ.edu"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Sign In with Zero Trust'}
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
                placeholder="e.g., Alice Smith or Dr. Bob Jones"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Institutional Email</label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="e.g., alice@univ.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="student">Student (Assignment Submitter)</option>
                <option value="faculty">Faculty (Course Evaluator)</option>
              </select>
              <span className="field-hint">
                Admin registration is restricted and cannot be self-selected.
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Complete Registration'}
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
      </div>
    </div>
  );
}
