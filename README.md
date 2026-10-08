# ZeroTrust Assignment Submission Gateway

An academic research project demonstrating the implementation and benefits of a **Zero Trust Architecture (ZTA)** applied to an institutional assignment submission platform.

**Repository:** `zerotrust-assignment-gateway`

---

## 1. Project Objective

Traditional higher-education assignment portals typically depend on standard perimeter security or application-level authentication alone. In this model, once a request reaches the application perimeter, it is often treated with implicit trust.

The **ZeroTrust Assignment Submission Gateway** redesigns academic submission pipelines based on the core tenet: **"Never trust, always verify."** Every access request—whether submitting coursework, managing grading rubrics, or viewing submission archives—is authenticated, authorized, and cryptographically validated at the network edge before traffic reaches the application origin.

### Key Research Goals
- **Perimeterless Security:** Eliminate public-facing open ports at the origin host by leveraging outbound-only reverse tunnels.
- **Continuous Edge Verification:** Ensure every request is inspected for identity, device posture, and context before origin routing.
- **Cryptographic Assertion Validation:** Verify edge-signed JSON Web Tokens (JWT) at the application middleware layer to eliminate spoofing and bypass attacks.
- **Role-Based Least Privilege:** Enforce strict granular access policies between students, teaching assistants, instructors, and administrators.

---

## 2. Technology Stack

### Frontend
- **Framework:** [React](https://react.dev/) (v19)
- **Tooling & Bundler:** [Vite](https://vite.dev/)
- **Language:** JavaScript (ES Modules)
- **State Management:** React Context API (`AuthContext`)
- **Styling:** CSS3 (Zero-trust status cards, role badges, tabbed auth)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (LTS / v24+)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Architecture:** Modular MVC (Controllers, Routes, Middleware, Models, Config)
- **Authentication:** `bcryptjs` password hashing + `jsonwebtoken` (JWT)
- **Database Driver:** `pg` (PostgreSQL client pool for Supabase)
- **API Protocol:** RESTful JSON

### Database & Storage
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL 15+ / UUID Primary Keys / Constraints & Indexes)
- **Object Storage:** [Supabase Storage](https://supabase.com/storage) (Encrypted buckets for submitted student artifacts)

### Security & Gateway (Planned Integration)
- **Edge Access Proxy:** Cloudflare Access
- **Secure Origin Ingress:** Cloudflare Tunnel (`cloudflared`)
- **Access Policies:** Least-privilege rules based on corporate/institutional IdP, email domain, and session posture

---

## 3. Planned Zero Trust Architecture

```
                  ┌─────────────────────────────────────┐
                  │          End User Client            │
                  │   (Student / Faculty Browser)       │
                  └──────────────────┬──────────────────┘
                                     │ HTTPS
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       Cloudflare Zero Trust         │
                  │  ┌───────────────────────────────┐  │
                  │  │ Cloudflare Access Gateway     │  │
                  │  │ - Institutional IdP SSO Auth  │  │
                  │  │ - Contextual Device Posture   │  │
                  │  │ - Role-Based Access Policies  │  │
                  │  │ - JWT Assertion Injection     │  │
                  │  └───────────────┬───────────────┘  │
                  └──────────────────┼──────────────────┘
                                     │ Encrypted Outbound Tunnel
                                     ▼
                  ┌─────────────────────────────────────┐
                  │          Origin Server              │
                  │  ┌───────────────────────────────┐  │
                  │  │ cloudflared Tunnel Daemon     │  │
                  │  └───────────────┬───────────────┘  │
                  │                  │                  │
                  │        ┌─────────┴─────────┐        │
                  │        ▼                   ▼        │
                  │  Frontend UI          Backend API   │
                  │  (React/Vite)      (Express / 5000) │
                  │                            │        │
                  │                            ▼        │
                  │                 Cloudflare JWT Val. │
                  └────────────────────────────┬────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────┐
                              │        Supabase Services        │
                              │  - PostgreSQL DB (RLS)          │
                              │  - Encrypted Storage Buckets    │
                              └─────────────────────────────────┘
```

---

## 4. Development Stages

| Stage | Focus Area | Description | Status |
| :---: | :--- | :--- | :--- |
| **Phase 1** | **Foundational Architecture** | Baseline repository structure, React + Vite frontend, Express API server, and `/api/health` validation. | **Complete** |
| **Phase 2** | **Backend Modularization & DB Schema** | Clean Express architecture, environment handling, CORS, and Supabase PostgreSQL schema (`users`, `assignments`, `submissions`, `access_logs`). | **Complete** |
| **Phase 3** | **Application Authentication** | Registration, login, bcrypt password hashing, JWT assertion tokens, `requireAuth` middleware, and role dashboards. | **Complete** |
| **Phase 4** | **Student Dashboard & Submissions** | Assignment browsing, assignment details, multipart coursework upload, student submission history, and RBAC isolation. | **Complete** |
| **Phase 5** | **Faculty Evaluation Dashboard** | Coursework authoring, student submission grading, marks assignment, and evaluator feedback workflows. | **Complete** |
| **Phase 6** | **Supabase Storage & Zero Trust File Access** | Private bucket (`assignments`), PDF/DOC/DOCX validation, 15MB size limits, student isolation, signed URLs, and audit logging. | **Complete** |
| **Phase 7** | **Application-Level Authorization & Ownership** | Reusable `requireRole(...roles)` middleware, strict ownership checks, Student/Faculty/Admin boundaries, and 401/403 standardization. | **Complete** |
| **Phase 8** | **Cloudflare Zero Trust Setup** | Deploy `cloudflared` tunnel, configure Cloudflare Access policies, and implement backend JWT assertion verification middleware. | *Upcoming* |
| **Phase 9** | **Security Auditing & Evaluation** | Penetration testing, attack vector simulation (direct IP bypass, token replay), and comparative academic evaluation. | *Upcoming* |

---

## 5. Database Architecture (Supabase PostgreSQL)

The relational schema is defined in [`database/schema.sql`](file:///c:/Zero%20Trust/database/schema.sql) and enforces data integrity, role-based boundaries, and comprehensive auditability for Zero Trust compliance.

### Entity-Relationship Diagram

```
┌────────────────────────┐             ┌────────────────────────┐
│         users          │ 1         * │      assignments       │
├────────────────────────┤────────────<├────────────────────────┤
│ id (PK, UUID)          │             │ id (PK, UUID)          │
│ name                   │             │ title                  │
│ email (UNIQUE)         │             │ description            │
│ password (bcrypt hash) │             │ deadline               │
│ role (CHECK)           │             │ created_by (FK -> users│
│ created_at             │             │ created_at             │
└───────────┬────────────┘             └───────────┬────────────┘
            │ 1                                    │ 1
            │                                      │
            │ *                                    │ *
┌───────────▼────────────┐             ┌───────────▼────────────┐
│      access_logs       │             │      submissions       │
├────────────────────────┤             ├────────────────────────┤
│ id (PK, UUID)          │             │ id (PK, UUID)          │
│ user_id (FK -> users)  │             │ assignment_id (FK)     │
│ endpoint               │             │ student_id (FK -> users│
│ action                 │             │ file_url               │
│ result (CHECK)         │             │ submitted_at           │
│ ip_address             │             │ status (CHECK)         │
│ created_at             │             │ marks (CHECK)          │
└────────────────────────┘             │ feedback               │
                                       │ UNIQUE(assign, student)│
                                       └────────────────────────┘
```

### Table Definitions & Constraints

1. **`users`**:
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `name`: `VARCHAR(255) NOT NULL`
   - `email`: `VARCHAR(255) NOT NULL UNIQUE`
   - `password`: `VARCHAR(255) NOT NULL` (Salted bcrypt hash)
   - `role`: `VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin'))`
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
   - **Indexes:** `idx_users_email`, `idx_users_role`

2. **`assignments`**:
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `title`: `VARCHAR(255) NOT NULL`
   - `description`: `TEXT`
   - `deadline`: `TIMESTAMPTZ NOT NULL`
   - `created_by`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
   - **Indexes:** `idx_assignments_created_by`, `idx_assignments_deadline`

3. **`submissions`**:
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `assignment_id`: `UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE`
   - `student_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `file_url`: `TEXT NOT NULL` (Supabase Storage reference / local uploads)
   - `submitted_at`: `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
   - **Unique Constraint:** `uq_assignment_student UNIQUE (assignment_id, student_id)`
   - **Indexes:** `idx_submissions_assignment_id`, `idx_submissions_student_id`, `idx_submissions_status`

4. **`access_logs`**:
   - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id`: `UUID REFERENCES users(id) ON DELETE SET NULL`
   - `endpoint`: `VARCHAR(255) NOT NULL`
   - `action`: `VARCHAR(50) NOT NULL`
   - `result`: `VARCHAR(50) NOT NULL CHECK (result IN ('ALLOW', 'BLOCK', 'FAILURE'))`
   - `ip_address`: `VARCHAR(45) NOT NULL` (captures IPv4 / IPv6 addresses)
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
   - **Indexes:** `idx_access_logs_user_id`, `idx_access_logs_created_at`, `idx_access_logs_endpoint`

---

## 6. Authentication & API Endpoints

### Authentication Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a `student` or `faculty`. Self-registration as `admin` is blocked (403). |
| `POST` | `/api/auth/login` | Public | Authenticates credentials with bcrypt and returns a signed JWT. |
| `POST` | `/api/auth/logout` | Public | Terminates session and logs logout audit event. |
| `GET` | `/api/auth/me` | Protected (`requireAuth`) | Retrieves the authenticated profile from the decoded JWT. |

### Student & Coursework Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Authenticated | Lists all available coursework assignments with deadline and submission status. |
| `GET` | `/api/assignments/:id` | Authenticated | Retrieves specific assignment details, prompt, and student submission status. |
| `GET` | `/api/submissions/my` | `requireAuth` + `Student` | Retrieves all submissions authored by the calling student with evaluation marks and feedback. |
| `POST` | `/api/submissions` | `requireAuth` + `Student` | Submits assignment artifact via multipart file upload or custom artifact URL. |

### Faculty Evaluation Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/assignments` | `requireAuth` + `Faculty` | Authors a new coursework prompt with deadline. |
| `GET` | `/api/faculty/assignments` | `requireAuth` + `Faculty` | Lists assignments created by this instructor with submission & grading metrics. |
| `GET` | `/api/faculty/submissions` | `requireAuth` + `Faculty` | Retrieves all student submissions across courses evaluated by this faculty. |
| `GET` | `/api/faculty/submissions/:id` | `requireAuth` + `Faculty` | Retrieves complete evaluation details for a specific student submission. |
| `POST` | `/api/faculty/submissions/:id/grade` | `requireAuth` + `Faculty` | Evaluates a student submission, assigning marks (0-100) and instructor feedback remarks. |

### Administrative & Security Auditing Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/security/logs` | `requireAuth` + `Admin` (Dev enabled) | Retrieves system audit logs and computed KPI metrics (Total Requests, Allowed, Blocked, Auth Failures). |

### JWT Specification
Tokens are signed with `JWT_SECRET` using HMAC-SHA256:
```json
{
  "id": "759be4c4-af8a-468e-9208-47b0f0710323",
  "email": "student@univ.edu",
  "role": "student",
  "iat": 1791369747,
  "exp": 1791456147
}
```

### Reusable Middleware (`requireAuth`)
- Extracts Bearer token from `Authorization: Bearer <token>`.
- Cryptographically verifies signature against `JWT_SECRET`.
- Validates user existence in the database.
- Populates `req.user` with `{ id, name, email, role }`.
- Rejects missing, invalid, or expired tokens with `401 Unauthorized`.

---

## 7. How to Run `schema.sql` in Supabase

1. **Log in to Supabase:** Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **Select or Create Project:** Open your project dashboard (e.g., `zerotrust-gateway`).
3. **Open SQL Editor:** In the left sidebar, click the **SQL Editor** icon (`>_`).
4. **Create a New Query:** Click **+ New query**.
5. **Paste Schema:** Copy the contents of [`database/schema.sql`](file:///c:/Zero%20Trust/database/schema.sql) and paste them into the editor.
6. **Execute Script:** Click the green **Run** button (or press `Ctrl + Enter`).
7. **Verify Table Creation:** Navigate to **Table Editor** to confirm that `users`, `assignments`, `submissions`, and `access_logs` are created.

---

## 8. Supabase Storage Architecture & Zero Trust File Security

Student coursework artifacts are stored in a private **Supabase Storage** bucket (`assignments`). To adhere strictly to Zero Trust principles ("never trust, always verify"), files are **never** exposed publicly or served statically without continuous authentication and least-privilege authorization.

### Security & Operational Specifications:
- **Storage Bucket:** `assignments` (strictly private, non-public).
- **Permitted File Formats:** PDF (`.pdf`), Microsoft Word (`.doc`, `.docx`).
- **File Size Validation:** Strict 15 MB limit per upload, enforced at both frontend client and Multer backend middleware.
- **Upload Pipeline (`POST /api/submissions`):**
  1. Validate JWT session via `requireAuth`.
  2. Validate role via `requireStudent` (`req.user.role === 'student'`).
  3. Validate assignment exists in database (`AssignmentModel.findById`).
  4. Stream file buffer to Supabase Storage private bucket `assignments`.
  5. Store relative storage path in `submissions.file_url`.
  6. Upsert submission record with status `submitted` or `resubmitted`.
  7. Record an immutable audit log entry in `access_logs` (`SUBMIT_ASSIGNMENT_STORAGE_UPLOAD`).
- **Secure File Retrieval (`GET /api/submissions/:id/file`):**
  - Continuous identity validation via `requireAuth`.
  - Zero Trust boundary check: If caller is a student, verifies `submission.student_id === req.user.id`.
  - Unauthorized cross-student access is blocked immediately with `HTTP 403 Forbidden` and logged as a security violation.
  - Faculty evaluators have verified access for grading and feedback.
  - Returns a time-limited signed URL (300-second TTL) or streams authenticated bytes.
- **Resilient Fallback Mode:** Operates with a private local filesystem store (`backend/storage/assignments/...`) when running in offline or local test environments, maintaining identical Zero Trust authorization policies.

---

## 9. Application-Level Authorization & Ownership Control

To ensure deep defense-in-depth, the gateway enforces strict application-level authorization and continuous least-privilege verification prior to edge Cloudflare tunnel integration.

### Core Architecture & Reusable Middleware: `requireRole(...roles)`

```javascript
// Reusable role-based authorization middleware
requireRole("student")
requireRole("faculty")
requireRole("admin")
requireRole("student", "faculty") // Multi-role support
```

### Authorization Matrix

| User Role | View Assignments | Submit Coursework | View Own Submissions | Access Faculty APIs | Access Admin APIs | Inspect Another Student's Work |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Student** |  ALLOWED |  ALLOWED |  ALLOWED | ⛔ **403 Forbidden** | ⛔ **403 Forbidden** | ⛔ **403 Forbidden** |
| **Faculty** |  ALLOWED | ⛔ **403 Forbidden** | N/A |  ALLOWED (Create/Grade) | ⛔ **403 Forbidden** |  ALLOWED (Evaluation only) |
| **Admin** |  ALLOWED | N/A | N/A | N/A |  ALLOWED (Audit & System) |  ALLOWED (Auditing) |
| **Unauthenticated** | ⛔ **401 Unauthorized** | ⛔ **401 Unauthorized** | ⛔ **401 Unauthorized** | ⛔ **401 Unauthorized** | ⛔ **401 Unauthorized** | ⛔ **401 Unauthorized** |

### Fine-Grained Ownership Checks

When a student queries or downloads an assignment submission:
- **Rule:** `submission.student_id === req.user.id`
- **Violation:** Student A requests Student B's submission (`GET /api/submissions/:idB` or `GET /api/submissions/:idB/file`).
- **Response:**
  ```json
  {
    "success": false,
    "error": "Forbidden",
    "message": "Forbidden: You do not have permission to access another student's submission."
  }
  ```
- **Audit Logging:** Every authorization decision and violation attempt is persistently recorded in the `access_logs` PostgreSQL table.

---

## 10. Application-Level Security & Access Logging (Security Dashboard)

The application implements immutable, granular security logging for every sensitive operation on the origin server. These logs record all access evaluations directly within the PostgreSQL `access_logs` table.

> [!NOTE]
> These are **application-level security audit logs** captured by Express.js middleware and controllers on the origin server. They are distinct from edge-level Cloudflare Access / Cloudflare Tunnel logs (which will be integrated in subsequent phases).

### Audited Actions & Decision Results

Every entry in `access_logs` records:
- `user_id`: UUID of the authenticated actor (`NULL` for unauthenticated or failed identity attempts)
- `endpoint`: Target HTTP path requested (e.g., `/api/auth/login`, `/api/submissions`)
- `action`: Specific operation performed
- `result`: Strict decision classification — `ALLOW`, `BLOCK`, or `FAILURE`
- `ip_address`: Client remote IP address (IPv4 / IPv6)
- `created_at`: UTC timestamp of the request

| Protected Action | Result | Trigger Condition |
| :--- | :---: | :--- |
| `LOGIN_SUCCESS` | `ALLOW` | Valid credentials submitted; JWT generated and issued. |
| `LOGIN_FAILURE` | `FAILURE` | Invalid username/password combination or nonexistent user. |
| `ASSIGNMENT_UPLOAD` | `ALLOW` | Student successfully uploaded assignment artifact to storage. |
| `SUBMISSION_ACCESS` | `ALLOW` | Authorized student accessing own work, or faculty reviewing coursework. |
| `UNAUTHORIZED_API_ATTEMPT` | `BLOCK` | Role violation (e.g., student calling faculty API) or cross-student resource access. |
| `UNAUTHORIZED_API_ATTEMPT` | `FAILURE` | Unauthenticated request to protected endpoint (missing/invalid token). |
| `FACULTY_GRADING` | `ALLOW` | Faculty assigned marks and feedback remarks to student submission. |
| `LOGOUT` | `ALLOW` | User session terminated and logged out. |

### Security Dashboard (`/security/logs`)

A centralized, responsive UI is provided to inspect real-time application security logs and key performance indicators:
- **Total Requests:** Cumulative audited request volume.
- **Allowed (`ALLOW`):** Successfully authorized operations passing Zero Trust policy checks.
- **Blocked (`BLOCK`):** Requests intercepted and rejected due to least-privilege or ownership violations (`403 Forbidden`).
- **Authentication Failures (`FAILURE`):** Failed logins, missing tokens, or expired sessions (`401 Unauthorized`).
- **Interactive Activity Table:** Searchable by user, endpoint, action, and filterable by decision result (`ALLOW`, `BLOCK`, `FAILURE`).

---

## 11. Repository Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, ProtectedRoute)
│   │   ├── pages/            # Views (AuthPage, StudentDashboard, FacultyDashboard, SecurityDashboard)
│   │   ├── services/         # API fetch client (api.js)
│   │   ├── context/          # Authentication State Context (AuthContext.jsx)
│   │   ├── App.jsx           # Root application router (/security/logs)
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Baseline global styles & security badge pills
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite build and development configuration
│
├── backend/
│   ├── .env                  # Environment variables (ignored by Git)
│   ├── .env.example          # Environment template
│   ├── src/
│   │   ├── config/           # Database (db.js), Environment, CORS
│   │   ├── controllers/      # auth, assignment, faculty, submission, security controllers
│   │   ├── middleware/       # auth.middleware.js, role.middleware.js, upload.js, errorHandler.js
│   │   ├── models/           # user.model.js, assignment.model.js, submission.model.js, audit.model.js
│   │   ├── routes/           # auth, assignment, faculty, submission, security routes, index.js
│   │   └── server.js         # Express HTTP listener and graceful shutdown
│   └── package.json          # Backend dependencies and scripts
│
├── database/
│   └── schema.sql            # PostgreSQL schema definitions, constraints, and indexes
│
├── cloudflare/
│   └── README.md             # Cloudflare Zero Trust setup & tunnel reference
│
├── README.md                 # Project documentation
└── .gitignore                # Version control exclusions
```

---

## 12. Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher, LTS recommended)
- npm (v9.0.0 or higher)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy from template):
   ```bash
   cp .env.example .env
   ```
   Configure `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ALLOWED_ORIGINS=http://localhost:5173
   JWT_SECRET=your_jwt_secret_key_here
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   SUPABASE_STORAGE_BUCKET=assignments
   ```
4. Start the Express server:
   ```bash
   npm run dev
   # or for production
   npm start
   ```
5. Verify the health endpoint at `http://localhost:5000/api/health`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (copy from template):
   ```bash
   cp .env.example .env
   ```
   Configure `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open the development URL in your browser (`http://localhost:5173`).

---

## 13. Production Deployment Guide & Specifications

The gateway is built for production deployment across separated cloud infrastructure (or unified reverse proxies) with Zero Trust defense-in-depth principles.

### 1. Environment Variables Matrix

| Component | Variable | Required in Prod | Description / Example |
| :--- | :--- | :---: | :--- |
| **Frontend** | `VITE_API_BASE_URL` | Optional | Target API endpoint (e.g. `https://api.gateway.edu/api`). Defaults to `/api` if deployed behind a unified reverse proxy. |
| **Backend** | `NODE_ENV` | **Yes** | Set to `production` (masks internal stack traces and server errors). |
| **Backend** | `PORT` | **Yes** | Port for Express listener (default: `5000` or assigned by PaaS container). |
| **Backend** | `CLIENT_URL` | **Yes** | Primary frontend domain for CORS headers (e.g. `https://gateway.edu`). |
| **Backend** | `ALLOWED_ORIGINS` | Optional | Comma-separated list of authorized client origins for multi-domain deployments. |
| **Backend** | `JWT_SECRET` | **Yes** | High-entropy secret key (min 32 chars) for cryptographic token signing. Required in `production`. |
| **Backend** | `DATABASE_URL` | Optional | PostgreSQL URI for Supabase connection pool. (Falls back to in-memory store in dev). |
| **Backend** | `SUPABASE_URL` | Optional | Supabase Project URL (`https://[PROJECT-REF].supabase.co`). |
| **Backend** | `SUPABASE_SERVICE_ROLE_KEY` | Optional | Service role API key for authenticated server storage operations. |
| **Backend** | `SUPABASE_STORAGE_BUCKET` | Optional | Private storage bucket name (default: `assignments`). |

> [!CAUTION]
> **Zero-Secrets Policy:** Real `.env` files are strictly excluded by `.gitignore` across all subdirectories and must **never** be committed to version control. Always provide configuration via container environment variables or CI/CD secrets management.

### 2. Production Build & Execution

#### Frontend (Static Hosting / CDN)
```bash
cd frontend
npm install
npm run build
```
- Outputs optimized, minified bundle to `frontend/dist/`.
- Ready for deployment on static hosting platforms (Cloudflare Pages, Vercel, Netlify, AWS S3/CloudFront).
- Test production build locally using `npm run preview`.

#### Backend (Container / Node.js Runtime)
```bash
cd backend
npm install --omit=dev
npm start
```
- Executes `node src/server.js`.
- Automatically activates:
  - Strict production CORS validation (unauthorized origins blocked with HTTP 403).
  - Centralized error masking (500 internal errors masked to prevent leaking database details).
  - Signal listeners for graceful termination (`SIGTERM`, `SIGINT`) with connection drain timeouts.
  - Runtime exception handlers (`unhandledRejection`, `uncaughtException`).

### 3. Health & Readiness Monitoring Probe

The backend exposes a lightweight, unauthenticated health endpoint for load balancers and orchestrators:

```http
GET /api/health
```

**Production Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "ZeroTrust Assignment Gateway API is running",
  "environment": "production",
  "uptime": 14208,
  "timestamp": "2026-10-08T06:15:00.000Z"
}
```

