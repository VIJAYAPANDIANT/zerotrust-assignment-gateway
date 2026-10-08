import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSecurityLogs } from '../services/api';

export default function SecurityDashboard() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    allowed: 0,
    blocked: 0,
    authFailures: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSecurityLogs(token, 150);
      setLogs(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve application security logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  // Filter logs based on search and result dropdown
  const filteredLogs = logs.filter((log) => {
    const matchesResult =
      filterResult === 'ALL' ||
      log.result?.toUpperCase() === filterResult.toUpperCase();

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      log.endpoint?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.result?.toLowerCase().includes(term) ||
      log.ip_address?.toLowerCase().includes(term) ||
      (log.user_email && log.user_email.toLowerCase().includes(term)) ||
      (log.user_name && log.user_name.toLowerCase().includes(term));

    return matchesResult && matchesSearch;
  });

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="section-header">
        <div>
          <h2>Application Security Audit Logs 🛡️</h2>
          <p className="welcome-sub">
            Real-time inspection of application-level authentication, authorization, and ownership decisions.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-refresh" title="Reload audit logs">
          🔄 Refresh Activity
        </button>
      </div>

      {/* Scope Disclaimer / Zero Trust Notice */}
      <div className="alert-banner info" style={{ marginBottom: '1.5rem' }}>
        <strong>ℹ️ Application-Level Security Logs:</strong> These records are evaluated and stored directly by the
        Node.js Express application origin server for internal Zero Trust verification. <em>(Note: These are not Cloudflare edge logs; Cloudflare tunnel protection will be layered in subsequent phases).</em>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalRequests}</span>
            <span className="stat-label">Total Requests</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value text-green">{loading ? '...' : stats.allowed}</span>
            <span className="stat-label">Allowed (ALLOW)</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⛔</span>
          <div className="stat-info">
            <span className="stat-value text-red">{loading ? '...' : stats.blocked}</span>
            <span className="stat-label">Blocked (BLOCK)</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <div className="stat-info">
            <span className="stat-value text-amber">{loading ? '...' : stats.authFailures}</span>
            <span className="stat-label">Authentication Failures</span>
          </div>
        </div>
      </div>

      {/* Activity Table Card */}
      <div className="card mt-4">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>📋 Recent Security & Access Activity</h3>
            <span className="field-hint">
              Displaying {filteredLogs.length} of {logs.length} logged events
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search action, endpoint, email, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: 6, border: '1px solid #cbd5e1', width: 250 }}
            />
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOWED</option>
              <option value="BLOCK">BLOCKED</option>
              <option value="FAILURE">FAILURES</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-card" style={{ padding: '3rem' }}>
              <div className="spinner"></div>
              <p>Retrieving origin security audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="placeholder-box" style={{ margin: '2rem' }}>
              No access logs matching your filter criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User Identity</th>
                    <th>Action</th>
                    <th>Endpoint</th>
                    <th>Security Decision</th>
                    <th>Client IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const resultUpper = log.result?.toUpperCase() || 'ALLOW';
                    const isAllow = resultUpper === 'ALLOW' || resultUpper === 'SUCCESS';
                    const isBlock = resultUpper === 'BLOCK' || resultUpper === 'DENIED';
                    const isFailure = resultUpper === 'FAILURE';

                    return (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#64748b' }}>
                          {new Date(log.created_at).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>
                        <td>
                          {log.user_email ? (
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                                {log.user_name || log.user_email}
                              </strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {log.user_email} {log.user_role && `(${log.user_role})`}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              Unauthenticated (Anonymous)
                            </span>
                          )}
                        </td>
                        <td>
                          <code className="action-code-tag">{log.action}</code>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#334155' }}>
                            {log.endpoint}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`result-pill ${
                              isAllow
                                ? 'result-allow'
                                : isBlock
                                ? 'result-block'
                                : 'result-failure'
                            }`}
                          >
                            {isAllow ? '✓ ALLOW' : isBlock ? '⛔ BLOCK' : '⚠️ FAILURE'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {log.ip_address}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
