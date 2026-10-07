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
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Foundational Architecture** | Baseline repository structure, React + Vite frontend, Express API server, and `/api/health` validation. | **Complete** |
| **Phase 2** | **Backend Modularization & DB Schema** | Clean Express architecture, environment handling, CORS, and Supabase PostgreSQL schema (`users`, `assignments`, `submissions`, `access_logs`). | **Complete** |
| **Phase 3** | **Application Authentication** | Registration, login, bcrypt password hashing, JWT assertion tokens, `requireAuth` middleware, and role dashboards. | **Complete** |
| **Phase 4** | **Student Dashboard & Submissions** | Assignment browsing, assignment details, multipart coursework upload, student submission history, and RBAC isolation. | **Complete** |
| **Phase 5** | **Faculty Evaluation Dashboard** | Coursework authoring, student submission grading, marks assignment, and evaluator feedback workflows. | *Upcoming* |
| **Phase 6** | **Cloudflare Zero Trust Setup** | Deploy `cloudflared` tunnel, configure Cloudflare Access policies, and implement backend JWT assertion verification middleware. | *Upcoming* |
| **Phase 7** | **Security Auditing & Evaluation** | Penetration testing, attack vector simulation (direct IP bypass, token replay), and comparative academic evaluation. | *Upcoming* |

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
   - `result`: `VARCHAR(50) NOT NULL CHECK (result IN ('success', 'failure', 'denied', 'error'))`
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

## 8. Repository Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, ProtectedRoute)
│   │   ├── pages/            # Views (AuthPage, StudentDashboard, FacultyDashboard)
│   │   ├── services/         # API fetch client (api.js)
│   │   ├── context/          # Authentication State Context (AuthContext.jsx)
│   │   ├── App.jsx           # Root application router
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Baseline global styles
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite build and development configuration
│
├── backend/
│   ├── .env                  # Environment variables (ignored by Git)
│   ├── .env.example          # Environment template
│   ├── src/
│   │   ├── config/           # Database (db.js), Environment, CORS
│   │   ├── controllers/      # auth.controller.js, health.controller.js
│   │   ├── middleware/       # auth.middleware.js, errorHandler.js
│   │   ├── models/           # user.model.js, audit.model.js
│   │   ├── routes/           # auth.routes.js, health.routes.js, index.js
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

## 9. Getting Started

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
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your_jwt_secret_key_here
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
   ```
4. Start the Express server:
   ```bash
   npm run dev
   # or
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
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the development URL in your browser (`http://localhost:5173`).
