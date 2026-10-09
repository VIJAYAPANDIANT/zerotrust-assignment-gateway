# ZeroTrust Assignment Submission Gateway
### Enterprise-Grade Zero Trust Architecture for Academic & Institutional Submissions

[![Architecture](https://img.shields.io/badge/Architecture-NIST%20SP%20800--207-blue.svg)](docs/ARCHITECTURE.md)
[![Edge Protection](https://img.shields.io/badge/Edge-Cloudflare%20Access%20%26%20Tunnel-orange.svg)](docs/DEPLOYMENT_GUIDE.md)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2020%2B%20%7C%20Express-green.svg)](docs/API_DOCUMENTATION.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-cyan.svg)](frontend/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Supabase-3ECF8E.svg)](database/schema.sql)
[![Directory](https://img.shields.io/badge/Identities-36%20Pre--Enrolled%20Accounts-purple.svg)](docs/USER_CREDENTIALS.md)
[![Audit](https://img.shields.io/badge/Security%20Audit-10%2F10%20Tests%20Passing-brightgreen.svg)](#7-security-audit--threat-verification)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## Executive Summary

Traditional institutional web portals rely on perimeter-based security ("castle-and-moat"). Once an actor breaches the outer network boundary or acquires valid network ingress, lateral movement and cross-tenant data snooping are commonplace.

The **ZeroTrust Assignment Submission Gateway** is an academic research and production-ready reference platform engineered around the strict doctrine: **"Never Trust, Always Verify."** Built in adherence with **NIST SP 800-207 Zero Trust Architecture (ZTA)** standards, every request is inspected, authenticated, authorized, and cryptographically verified at both the network edge (Cloudflare Zero Trust) and the origin application middleware (Express.js RBAC).

The origin server exposes **zero inbound listening ports** to the public internet, operating exclusively via an encrypted, outbound-only Cloudflare reverse tunnel (`cloudflared`).

---

## 📑 Complete Documentation Suite

For exhaustive technical references, consult the dedicated documentation files in [`docs/`](docs/):

| Documentation Document | Primary Focus |
| :--- | :--- |
| 🔑 **[`docs/USER_CREDENTIALS.md`](docs/USER_CREDENTIALS.md)** | Complete credentials directory for all **36 pre-enrolled accounts** (1 Admin, 5 Faculty, 30 Students) with Roll IDs, password reset workflow, and seed instructions. |
| 🏛️ **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** | Deep-dive into NIST SP 800-207 tenets, Two-Tier defense topology, Mermaid sequence diagrams, and threat mitigation models. |
| 🔌 **[`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)** | Full REST API specification (`/api/auth`, `/api/assignments`, `/api/submissions`, `/api/faculty`, `/api/security`, `/api/health`) with payloads and responses. |
| 🚀 **[`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)** | Operational deployment manual for local development, Supabase PostgreSQL configuration, Cloudflare Tunnel CLI setup, and production hardening. |
| 🗄️ **[`database/schema.sql`](database/schema.sql)** | Production PostgreSQL schema with foreign keys, cascading rules, unique composite constraints, and B-tree indexes. |

---

## 1. Zero Trust Principles & Core Architecture

The gateway implements the core tenets of the **NIST SP 800-207** framework:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. UNTRUSTED USER AGENT                            │
│           (Student / Faculty / Administrator Browser or REST Client)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS (Port 443)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         2. CLOUDFLARE ZERO TRUST EDGE                       │
│  ┌────────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐  │
│  │ Cloudflare Access IdP  │ │ Cloudflare WAF / L7  │ │ Bot Management    │  │
│  │ Contextual Auth & MFA  │ │ DDoS Rate Limiting   │ │ Anomaly Detection │  │
│  └───────────┬────────────┘ └──────────┬───────────┘ └─────────┬─────────┘  │
│              └─────────────────────────┼───────────────────────┘            │
│                                        ▼                                    │
│                 Cryptographic Assertion Injection (JWT)                     │
│                       `Cf-Access-Jwt-Assertion`                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Outbound Encrypted Tunnel
                                       │ (Zero Inbound Open Ports)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         3. ORIGIN APPLICATION RUNTIME                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     cloudflared Ingress Daemon                        │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                 Dual-Layer Zero Trust Middleware                      │  │
│  │   • Edge Assertion Validation (`verifyCloudflareAccess`)              │  │
│  │   • HMAC-SHA256 Token Validation (`requireAuth`)                      │  │
│  │   • Role-Based Access Control (`requireRole('faculty', 'admin')`)     │  │
│  │   • Resource Ownership Check (`student_id === req.user.id`)           │  │
│  │   • Immutable Audit Telemetry (`logAuditEvent` -> `access_logs`)      │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│  ┌─────────────────────────┐                   ┌─────────────────────────┐  │
│  │   Frontend Client UI    │                   │   Backend API Runtime   │  │
│  │   React 19 / Vite :5173 │                   │   Node.js / Express :5000│ │
│  └─────────────────────────┘                   └────────────┬────────────┘  │
└─────────────────────────────────────────────────────────────┼───────────────┘
                                                              │ SSL (Pooled)
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            4. DATA & STORAGE TIER                           │
│  ┌──────────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │      Supabase PostgreSQL 15+         │ │   Private Supabase Storage   │  │
│  │  • Foreign Key Cascades & Uniques    │ │   • Bucket: `assignments`    │  │
│  │  • Granular Audit Trail Indexes      │ │   • Signed Ephemeral URLs    │  │
│  └──────────────────────────────────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets:
1. **Perimeterless Ingress**: No firewall exceptions or public NAT port forwardings required. Origin operates invisibly behind Cloudflare reverse tunnels.
2. **Continuous Verification**: Every API invocation verifies identity validity, authorization role, and resource ownership. No persistent implicit sessions.
3. **Defense-in-Depth**: If edge authentication were compromised, origin application middleware blocks unauthorized access.
4. **Least Privilege**: Students cannot access faculty grading tools; faculty cannot upload on behalf of students; students cannot view peers' submissions.
5. **Assume Breach**: Every access decision (`ALLOW`, `BLOCK`, `FAILURE`) is immutably logged with remote IP, user identifier, action, and timestamp.

---

## 2. Pre-Enrolled Directory (Quick Access)

The platform enforces a **closed-enrollment model**. Public registration is disabled to ensure only verified institutional identities enter the gateway. 

The platform is pre-loaded with **36 verified accounts**:

| Role | Total Count | Account Identifier / Primary Email | Initial Password | Access Scope |
| :--- | :---: | :--- | :---: | :--- |
| **Administrator** | `1` | `vijayapandian112007@gmail.com` | `123456` | Full administrative control, system audit logs, global security analytics. |
| **Faculty Lead** | `1` | `faculty.alan@gateway.edu` | `123456` | Advanced Systems instructor; assignment creation & grading. |
| **Faculty Members** | `4` | `faculty.ada@gateway.edu`<br>`faculty.linus@gateway.edu`<br>`faculty.grace@gateway.edu`<br>`faculty.tim@gateway.edu` | `123456` | Distributed Computing, Cybersecurity, Applied AI, and Cloud Architecture faculty evaluators. |
| **Primary Student** | `1` | `vijayapandiant07@gmail.com` *(Vijay T - Roll: `STU-2026-001`)* | `123456` | Full student coursework portal; assignment submissions; personal grade inspection. |
| **Demo Students** | `29` | `student.alexandra@gateway.edu` through `student.zoe@gateway.edu` *(Rolls: `STU-2026-002` to `STU-2026-030`)* | `123456` | Multi-tenant student accounts for load testing, peer isolation tests, and cohort evaluation. |

> [!TIP]
> **Complete Credential Directory:** For the complete 36-account table including student roll numbers and department mappings, see **[`docs/USER_CREDENTIALS.md`](docs/USER_CREDENTIALS.md)**.
> 
> **Password Recovery:** Users can change their password at any time via the self-service **Forgot Password** portal on the authentication screen.

---

## 3. Technology Stack

### Frontend Architecture
- **Framework:** [React 19](https://react.dev/)
- **Build Engine:** [Vite 6](https://vite.dev/)
- **State Management:** React Context API (`AuthContext.jsx`) with persistent session recovery
- **Routing:** React Router v7 (`App.jsx`) with strict role-guarded routes (`ProtectedRoute.jsx`)
- **Styling:** Modern, cyber-grade dark theme with balanced 50/50 glassmorphic auth cards, glowing cyan accents, and mobile-responsive viewport breakpoints.

### Backend Architecture
- **Runtime:** [Node.js](https://nodejs.org/) (v20+ LTS / v24)
- **Framework:** [Express.js](https://expressjs.com/) (Modular MVC pattern)
- **Cryptography:** `bcryptjs` (Salt factor 10) + `jsonwebtoken` (HMAC-SHA256)
- **Multipart Upload:** `multer` with strict MIME-type inspection (PDF/DOC/DOCX) and 15MB file cap
- **Database Driver:** `pg` (PostgreSQL client pool for Supabase) with in-memory resilient fallback

### Cloud & Edge Infrastructure
- **Zero Trust Ingress:** Cloudflare Tunnel (`cloudflared`)
- **Identity Proxy:** Cloudflare Access (IdP Assertion Header validation)
- **Database & Storage:** Supabase PostgreSQL 15+ and private encrypted object storage buckets

---

## 4. Cloudflare Zero Trust Feature Matrix

The platform integrates 6 core Cloudflare capabilities:

| Cloudflare Capability | Architectural Role in Gateway | Security Impact |
| :--- | :--- | :--- |
| **1. Cloudflare Tunnels (`cloudflared`)** | Establishes outbound-only encrypted connection to Cloudflare edge. | Eliminates all open inbound firewall ports (Port 80/443 closed on origin host). Prevents direct-to-IP scanning and DDoS attacks. |
| **2. Cloudflare Access** | Enforces identity-aware proxying before requests reach the origin tunnel. | Authenticates institutional identities and injects edge-signed cryptographic JWT assertions (`Cf-Access-Jwt-Assertion`). |
| **3. Cloudflare Web Application Firewall (WAF)** | Edge inspection of HTTP payloads before tunnel transit. | Blocks OWASP Top 10 exploits, SQLi, XSS, and malformed HTTP request headers at the edge. |
| **4. Cloudflare Bot Management & Rate Limiting** | Rate limits brute-force attempts against `/api/auth/login`. | Mitigates credential-stuffing attacks and anomalous automated traffic scrapers. |
| **5. Edge JWT Assertion Verification** | Origin Express middleware validates cryptographic signatures against Cloudflare public keys. | Prevents man-in-the-middle header spoofing or unauthorized proxy bypasses. |
| **6. Zero Trust DNS (Gateway)** | Resolves and routes institutional subdomains (`portal.domain.com`, `api.domain.com`). | Encrypted DNS-over-HTTPS (DoH) routing with malware domain filtering. |

---

## 5. Security Model & Authorization Matrix

The application implements defense-in-depth authorization across all endpoints:

```
                          ┌───────────────────────────┐
                          │   Incoming HTTP Request   │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  requireAuth Middleware   │
                          │   (Validates Bearer JWT)  │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼ Valid JWT                                   ▼ Missing / Invalid
    ┌───────────────────────────┐                ┌───────────────────────────┐
    │ Populate req.user context │                │ HTTP 401 Unauthorized     │
    └────────────┬──────────────┘                │ Log audit `FAILURE`       │
                 │                               └───────────────────────────┘
                 ▼
    ┌───────────────────────────┐
    │   requireRole Middleware  │
    │ (Checks student / faculty)│
    └────────────┬──────────────┘
                 │
   ┌─────────────┴─────────────┐
   ▼ Authorized Role           ▼ Role Mismatch
┌───────────────────────────┐ ┌───────────────────────────┐
│ Resource Ownership Check  │ │ HTTP 403 Forbidden        │
│ (`student_id === user.id`)│ │ Log audit `BLOCK`         │
└────────────┬──────────────┘ └───────────────────────────┘
             │
   ┌─────────┴─────────┐
   ▼ Owner Match       ▼ Cross-Tenant Breach Attempt
┌──────────────────┐ ┌───────────────────────────┐
│ Execute Handler  │ │ HTTP 403 Forbidden        │
│ Log audit `ALLOW`│ │ Log audit `BLOCK`         │
└──────────────────┘ └───────────────────────────┘
```

### Granular Authorization Matrix

| Action / Endpoint | Student | Faculty | Administrator | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Assignments** (`GET /api/assignments`) |  ALLOW |  ALLOW |  ALLOW | ⛔ 401 Unauthorized |
| **Submit Coursework** (`POST /api/submissions`) |  ALLOW | ⛔ 403 Forbidden | ⛔ 403 Forbidden | ⛔ 401 Unauthorized |
| **View Own Submissions** (`GET /api/submissions/my`) |  ALLOW | ⛔ 403 Forbidden | ⛔ 403 Forbidden | ⛔ 401 Unauthorized |
| **Inspect Peer's Submission** (`GET /api/submissions/:id`) | ⛔ 403 Forbidden |  ALLOW (Eval only) |  ALLOW (Audit) | ⛔ 401 Unauthorized |
| **Download Own Submission File** (`GET /api/submissions/:id/file`) |  ALLOW |  ALLOW |  ALLOW | ⛔ 401 Unauthorized |
| **Download Peer's File** (`GET /api/submissions/:other/file`) | ⛔ 403 Forbidden |  ALLOW (Eval only) |  ALLOW (Audit) | ⛔ 401 Unauthorized |
| **Create Assignment** (`POST /api/assignments`) | ⛔ 403 Forbidden |  ALLOW | ⛔ 403 Forbidden | ⛔ 401 Unauthorized |
| **Grade Submission** (`POST /api/faculty/submissions/:id/grade`) | ⛔ 403 Forbidden |  ALLOW | ⛔ 403 Forbidden | ⛔ 401 Unauthorized |
| **Inspect Security Logs** (`GET /api/security/logs`) | ⛔ 403 Forbidden | ⛔ 403 Forbidden |  ALLOW | ⛔ 401 Unauthorized |

---

## 6. Real-Time Immutable Security Audit Logging

All access decisions are evaluated and written to the `access_logs` audit repository:

- **ALLOW**: Legitimate, authenticated operation passing all role and ownership bounds.
- **BLOCK**: Explicit security violation intercepted by middleware (e.g. horizontal privilege escalation attempt or unauthorized role access).
- **FAILURE**: Authentication failure (e.g. invalid password, missing token, tampered JWT signature).

### SIEM Security Dashboard UI (`/security/logs`)
The administrator dashboard visualizes:
1. **Total Requests**: Real-time traffic volume counter.
2. **Allowed Operations**: Requests passing Zero Trust policies.
3. **Blocked Attacks**: Intercepted privilege escalations and unauthorized role violations.
4. **Authentication Failures**: Rejected login attempts and credential anomalies.
5. **Interactive Audit Log**: Searchable table with filtering by action, decision result, user ID, and IP address.

---

## 7. Security Audit & Threat Verification

The gateway underwent rigorous automated penetration testing (`backend/tests/security-audit.test.js`) verifying 10 critical threat vectors:

| # | Test Scenario & Attack Vector | Expected Defense | Observed Result | Status |
| :-: | :--- | :--- | :--- | :---: |
| **1** | Unauthenticated access to `/api/assignments` | Block with HTTP 401 | 401 Unauthorized | **PASS** |
| **2** | Student attempts to author coursework via `POST /api/assignments` | Block with HTTP 403 | 403 Forbidden | **PASS** |
| **3** | Student attempts horizontal breach on peer's submission (`GET /api/submissions/:id`) | Block with HTTP 403 | 403 Forbidden | **PASS** |
| **4** | Tampered JWT signature payload injection | Block with HTTP 401 | 401 Unauthorized | **PASS** |
| **5** | Self-registration privilege escalation to `role: admin` | Reject with HTTP 403 | 403 Forbidden | **PASS** |
| **6** | Student attempts to grade peer's assignment | Block with HTTP 403 | 403 Forbidden | **PASS** |
| **7** | Unauthorized download of private storage coursework | Block with HTTP 403 | 403 Forbidden | **PASS** |
| **8** | Malformed / invalid file format upload (e.g. `.exe`, `.sh`) | Reject with HTTP 400 | 400 Bad Request | **PASS** |
| **9** | Unauthenticated inspection of security audit logs | Block with HTTP 401 | 401 Unauthorized | **PASS** |
| **10** | Student inspection of administrative telemetry | Block with HTTP 403 | 403 Forbidden | **PASS** |

**Audit Verdict:** `10 / 10 Tests Passing (100% Security Coverage)`.

---

## 8. Quickstart & Installation

### Prerequisites
- Node.js v18.0.0+ (v20+ recommended)
- npm v9.0.0+

### 1. Clone & Configure Backend
```bash
git clone https://github.com/VIJAY-T-07/ZeroTrust-Assignment-Gateway.git
cd ZeroTrust-Assignment-Gateway/backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=super_secret_enterprise_zerotrust_key_min_32_chars!
```

Start the API server:
```bash
npm start
```
*The server automatically boots on port 5000 and seeds the 36 institutional identities.*

### 2. Configure & Start Frontend
In a new terminal window:
```bash
cd ZeroTrust-Assignment-Gateway/frontend
npm install
npm run dev
```
*The frontend development server launches at `http://localhost:5173`.*

### 3. Verify System Health
```bash
curl http://localhost:5000/api/health
```
```json
{
  "success": true,
  "message": "ZeroTrust Assignment Gateway API is running",
  "environment": "development",
  "timestamp": "2026-10-09T10:45:00.000Z"
}
```

---

## 9. Repository Structure

```
c:\Zero Trust\
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                     # PostgreSQL connection pool & resilient memory fallback
│   │   │   ├── seedUsers.data.js         # Pre-enrolled 36 identities (Admin, Faculty, Students)
│   │   │   └── supabase.js               # Supabase Client SDK initialization
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Authentication & self-service password reset
│   │   │   ├── assignment.controller.js  # Coursework authoring & listing
│   │   │   ├── submission.controller.js  # Secure multipart upload & ownership verification
│   │   │   ├── faculty.controller.js     # Faculty grading & rubric evaluation
│   │   │   └── security.controller.js    # Immutable SIEM audit log retrieval & KPIs
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        # HMAC-SHA256 JWT verification
│   │   │   ├── role.middleware.js        # Granular RBAC role validation
│   │   │   ├── cloudflareAccess.middleware.js # Edge JWT assertion validation
│   │   │   ├── upload.js                 # Multer MIME filter & 15MB file cap
│   │   │   └── errorHandler.js           # Centralized exception masking
│   │   ├── models/                       # Data persistence layers (User, Assignment, Submission, Audit)
│   │   ├── routes/                       # Express router definitions
│   │   └── server.js                     # Express HTTP server & graceful shutdown hooks
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Responsive navigation with role indicators & logout
│   │   │   └── ProtectedRoute.jsx        # Client-side route isolation & redirect logic
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global authentication state, JWT decoding & session storage
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx              # Symmetrical split login & password recovery portal
│   │   │   ├── StudentDashboard.jsx      # Assignment browsing, submission upload & grade viewing
│   │   │   ├── FacultyDashboard.jsx      # Assignment creation & submission evaluation
│   │   │   └── SecurityDashboard.jsx     # SIEM audit log inspection & Zero Trust KPI telemetry
│   │   ├── services/
│   │   │   └── api.js                    # Axios/Fetch HTTP client with Bearer token injection
│   │   ├── App.jsx                       # Application router
│   │   ├── main.jsx                      # DOM mount point
│   │   └── index.css                     # Custom glassmorphic cyber styling & symmetric CSS
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql                        # PostgreSQL production DDL schema & indexes
│
├── docs/
│   ├── USER_CREDENTIALS.md               # 36 pre-enrolled user credentials directory
│   ├── ARCHITECTURE.md                   # Formal NIST SP 800-207 architecture specifications
│   ├── API_DOCUMENTATION.md              # REST API technical reference
│   └── DEPLOYMENT_GUIDE.md               # Cloudflare Tunnel, Supabase & production guide
│
├── cloudflare/
│   └── README.md                         # Edge setup & cloudflared daemon instructions
│
├── README.md                             # Primary repository documentation
└── .gitignore                            # Exclusion rules for secrets, builds, and node_modules
```

---

## 10. Research Contribution & Academic Impact

This platform demonstrates the practical feasibility of deploying **Zero Trust Architecture (NIST SP 800-207)** within higher education and research environments. Key academic insights demonstrated:

1. **Zero Open Ports in Higher Education:** Demonstrating how universities can completely eliminate public IPv4 exposure for academic portals by adopting reverse edge tunnels, neutralizing automated port scanning and vulnerability probing.
2. **Context-Aware Dynamic Access Control:** Combining network-level edge assertions with fine-grained application-level ownership controls to resolve horizontal privilege escalation vulnerabilities commonly found in student portals.
3. **Auditable Integrity:** Establishing continuous cryptographic verification and real-time auditability without sacrificing end-user simplicity for students and faculty.

---

## 11. Authors & Institutional Attribution

- **Lead Cybersecurity Architect & Developer:** [Vijaypandian T](https://github.com/VIJAY-T-07)
  - Primary Contact: `vijayapandian112007@gmail.com`
- **Academic Project:** ZeroTrust Assignment Submission Gateway
- **Repository:** [`https://github.com/VIJAY-T-07/ZeroTrust-Assignment-Gateway`](https://github.com/VIJAY-T-07/ZeroTrust-Assignment-Gateway)

---

## 12. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full terms.
