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
- **API Protocol:** RESTful JSON

### Database & Storage
- **Database:** [Supabase](https://supabase.com/) (Managed PostgreSQL with Row Level Security)
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
| **Phase 2** | **Database & Storage Modeling** | Define Supabase PostgreSQL schema, migrations, Row Level Security (RLS) policies, and storage bucket quotas. | *Upcoming* |
| **Phase 3** | **Core Application Services** | Assignment creation, submission processing, file validation, and audit logging. | *Upcoming* |
| **Phase 4** | **Cloudflare Zero Trust Setup** | Deploy `cloudflared` tunnel, configure Cloudflare Access policies, and implement backend JWT assertion verification middleware. | *Upcoming* |
| **Phase 5** | **Security Auditing & Evaluation** | Penetration testing, attack vector simulation (direct IP bypass, token replay), and comparative academic evaluation. | *Upcoming* |

---

## 5. Repository Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application views (Student, Instructor dashboards)
│   │   ├── services/         # API and client network services
│   │   ├── context/          # React application state and contexts
│   │   ├── App.jsx           # Root application component
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Baseline global styles
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite build and development configuration
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers and response formatting
│   │   ├── routes/           # Express router definitions
│   │   ├── middleware/       # JWT verification, error handling, rate limiting
│   │   ├── models/           # Data transfer objects and schema models
│   │   ├── config/           # Environment configuration and service clients
│   │   └── server.js         # Express HTTP application entry point
│   └── package.json          # Backend dependencies and scripts
│
├── database/
│   └── schema.sql            # PostgreSQL schema definitions and RLS policies
│
├── cloudflare/
│   └── README.md             # Cloudflare Zero Trust setup & tunnel reference
│
├── README.md                 # Project documentation
└── .gitignore                # Version control exclusions
```

---

## 6. Getting Started

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
