function App() {
  return (
    <div className="container">
      <div className="badge">Academic Research Project</div>
      <h1>ZeroTrust Assignment Submission Gateway</h1>
      <p className="subtitle">
        A secure assignment submission platform designed to demonstrate zero-trust
        architecture principles for academic workflows.
      </p>

      <div className="status-card">
        <span className="status-indicator"></span>
        <span>Frontend Application Initialized Successfully</span>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <h3>Environment</h3>
          <p>React + Vite</p>
        </div>
        <div className="info-item">
          <h3>Backend Target</h3>
          <p>http://localhost:5000</p>
        </div>
        <div className="info-item">
          <h3>Security Layer</h3>
          <p>Cloudflare Zero Trust (Planned)</p>
        </div>
      </div>
    </div>
  )
}

export default App
