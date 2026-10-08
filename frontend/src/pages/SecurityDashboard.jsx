import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowsClockwise,
  Pulse,
  CheckCircle,
  Prohibit,
  WarningOctagon,
  MagnifyingGlass,
  FunnelSimple,
  Globe,
  CircleNotch,
} from '@phosphor-icons/react';
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
          <h2>
            <ShieldCheck size={28} weight="duotone" color="#38bdf8" />
            <span>Security Operations Telemetry (SOC)</span>
          </h2>
          <p className="welcome-sub">
            Real-time audit log stream of continuous authentication, authorization checks, and access decisions.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-refresh" title="Reload audit activity">
          <ArrowsClockwise size={16} weight="bold" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Scope Disclaimer / Zero Trust Notice */}
      <div className="alert-banner info">
        <Pulse size={18} weight="duotone" style={{ flexShrink: 0 }} />
        <div>
          <strong>Application Origin Telemetry:</strong> Access decisions are evaluated at each route by the Zero Trust enforcement gateway.
        </div>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Pulse size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '—' : stats.totalRequests}</span>
            <span className="stat-label">Total Audited Requests</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper allow">
            <CheckCircle size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value text-green">{loading ? '—' : stats.allowed}</span>
            <span className="stat-label">Authorized (ALLOW)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper block">
            <Prohibit size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value text-red">{loading ? '—' : stats.blocked}</span>
            <span className="stat-label">Enforced Denials (BLOCK)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper failure">
            <WarningOctagon size={22} weight="duotone" />
          </div>
          <div className="stat-info">
            <span className="stat-value text-amber">{loading ? '—' : stats.authFailures}</span>
            <span className="stat-label">Auth Failures (FAILURE)</span>
          </div>
        </div>
      </div>

      {/* Activity Table Card */}
      <div className="card mt-4">
        <div className="card-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>
              <ShieldCheck size={20} weight="duotone" color="#38bdf8" />
              <span>Continuous Access Activity Log</span>
            </h3>
            <span className="sub-text">
              Displaying {filteredLogs.length} of {logs.length} logged boundary transactions
            </span>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="input-container" style={{ width: 260 }}>
              <span className="input-icon-adornment">
                <MagnifyingGlass size={15} />
              </span>
              <input
                type="text"
                placeholder="Search action, route, email, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input input-has-icon"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem 0.45rem 2.2rem' }}
              />
            </div>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', width: 'auto' }}
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOW Only</option>
              <option value="BLOCK">BLOCK Only</option>
              <option value="FAILURE">FAILURE Only</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-card" style={{ padding: '3.5rem' }}>
              <CircleNotch size={32} className="animate-spin" color="#38bdf8" />
              <p>Streaming security records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state-box" style={{ margin: '2.5rem' }}>
              <ShieldCheck size={36} weight="duotone" className="empty-state-icon" />
              <p className="empty-title">No Audit Logs Match Criteria</p>
              <p className="empty-subtitle">
                No recorded transaction matches the search query or decision filter.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User Identity</th>
                    <th>Action</th>
                    <th>Endpoint Route</th>
                    <th>Boundary Decision</th>
                    <th>Client Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const resultUpper = log.result?.toUpperCase() || 'ALLOW';
                    const isAllow = resultUpper === 'ALLOW' || resultUpper === 'SUCCESS';
                    const isBlock = resultUpper === 'BLOCK' || resultUpper === 'DENIED';

                    return (
                      <tr key={log.id}>
                        <td>
                          <span className="timestamp" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </td>
                        <td>
                          {log.user_email ? (
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                {log.user_name || log.user_email}
                              </strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {log.user_email} {log.user_role && `• [${log.user_role.toUpperCase()}]`}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                              Anonymous Principal
                            </span>
                          )}
                        </td>
                        <td>
                          <code className="action-code-tag">{log.action}</code>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
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
                            {isAllow ? 'ALLOW' : isBlock ? 'BLOCK' : 'FAILURE'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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
