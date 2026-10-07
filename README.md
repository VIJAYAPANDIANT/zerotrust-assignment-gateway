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
- **Styling:** CSS3

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (LTS / v24+)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Architecture:** Modular MVC (Controllers, Routes, Middleware, Config)
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
| **Phase 3** | **Core Application Services & Auth** | User authentication, assignment creation, submission processing, and audit logging. | *Upcoming* |
| **Phase 4** | **Cloudflare Zero Trust Setup** | Deploy `cloudflared` tunnel, configure Cloudflare Access policies, and implement backend JWT assertion verification middleware. | *Upcoming* |
| **Phase 5** | **Security Auditing & Evaluation** | Penetration testing, attack vector simulation (direct IP bypass, token replay), and comparative academic evaluation. | *Upcoming* |

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
│ password               │             │ deadline               │
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
   - `password`: `VARCHAR(255) NOT NULL` (salted hash)
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
   - `file_url`: `TEXT NOT NULL` (Supabase Storage reference)
   - `submitted_at`: `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
   - `status`: `VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmitted', 'late'))`
   - `marks`: `NUMERIC(5, 2) DEFAULT NULL CHECK (marks IS NULL OR marks >= 0)`
   - `feedback`: `TEXT DEFAULT NULL`
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

## 6. How to Run `schema.sql` in Supabase

1. **Log in to Supabase:** Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **Select or Create Project:** Open your existing project or create a new project (e.g., `zerotrust-gateway`).
3. **Open SQL Editor:** In the left-hand navigation sidebar, click on the **SQL Editor** icon (represented by the `>_` terminal icon).
4. **Create a New Query:** Click **+ New query**.
5. **Paste Schema:** Open [`database/schema.sql`](file:///c:/Zero%20Trust/database/schema.sql) in your code editor, copy the entire SQL script, and paste it into the Supabase SQL Editor.
6. **Execute Script:** Click the green **Run** button (or press `Ctrl + Enter` / `Cmd + Enter`).
7. **Verify Table Creation:** Navigate to the **Table Editor** icon in the sidebar. You should see all 4 tables: `users`, `assignments`, `submissions`, and `access_logs`.

---

## 7. Repository Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application views (Student, Faculty dashboards)
│   │   ├── services/         # API and client network services
│   │   ├── context/          # React application state and contexts
│   │   ├── App.jsx           # Root application component
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Baseline global styles
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite build and development configuration
│
├── backend/
│   ├── .env                  # Local environment configuration
│   ├── .env.example          # Environment template
│   ├── src/
│   │   ├── config/           # Centralized environment & CORS configuration
│   │   ├── controllers/      # Health check and operational controllers
│   │   ├── middleware/       # 404 handler and centralized error middleware
│   │   ├── models/           # Models placeholder
│   │   ├── routes/           # Modular route registry and health router
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

## 8. Getting Started

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
3. Start the Express server:
   ```bash
   npm run dev
   # or
   npm start
   ```
4. Verify the health endpoint at `http://localhost:5000/api/health`.

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
4. Open the development URL in your browser (defaults to `http://localhost:5173`).
