# Cloudflare Zero Trust Architecture & Access Configuration Guide

This documentation details the production security architecture and configuration workflow for the **ZeroTrust Assignment Submission Gateway** using **Cloudflare Tunnel** and **Cloudflare Access**.

---

## 1. Research Project Goal: Continuous Verification

> **Core Axiom:** *Never trust, always verify. Every request must be cryptographically and contextually verified before access is granted.*

To achieve true Zero Trust security, this gateway employs a **two-tier defense-in-depth model**:
1. **Tier 1 (Outer Perimeter): Cloudflare Access** enforces identity verification, edge policy evaluation, and device/domain constraints before traffic reaches the host.
2. **Tier 2 (Inner Origin): Node.js Express Backend** enforces fine-grained role-based authorization (RBAC), object ownership boundaries, and tamper-evident access logging.

```
Internet (Student / Faculty Client)
       │
       ▼
Cloudflare Edge Network
       │  (DDoS Mitigation, Global Anycast DNS, TLS 1.3 Termination)
       ▼
Cloudflare Access (Outer Perimeter Gate)
       │  (Identity Verification, IdP / SSO / OTP, Policy Evaluation)
       ▼
Access Policy Decision:
       ├── Unauthenticated User       ──► [ BLOCK at Edge ]
       ├── Unauthorized Identity      ──► [ BLOCK at Edge ]
       └── Authorized Student/Faculty ──► [ ALLOW + Inject Cf-Access Headers ]
                                                   │
                                                   ▼
       ┌───────────────────────────────────────────┴──────────────────────┐
       │ Cloudflare Tunnel (cloudflared daemon)                           │
       │ Encrypted Outbound-Only QUIC/HTTP2 Tunnel (No Inbound Open Ports)│
       └───────────────────────────────────────────┬──────────────────────┘
                                                   │
                                                   ▼
Node.js Express Backend (Inner Origin Gate: http://localhost:5000)
       │
       ├── 1. Edge Header Verification (Cf-Access-Jwt-Assertion validation)
       ├── 2. Application Authentication (requireAuth: JWT Signature & Expiry)
       ├── 3. Fine-Grained Authorization (requireRole: student vs. faculty vs. admin)
       ├── 4. Object Ownership Verification:
       │      ├── Student -> Own Submission                ──► [ ALLOW ]
       │      ├── Student -> Another Student's Submission  ──► [ BLOCK (403) ]
       │      ├── Student -> Faculty Endpoint              ──► [ BLOCK (403) ]
       │      └── Faculty -> Submissions & Grading         ──► [ ALLOW ]
       │
       └── 5. Tamper-Evident Access Logging (access_logs: ALLOW, BLOCK, FAILURE)
                                                   │
                                                   ▼
Supabase Managed Infrastructure
       ├── PostgreSQL Database (Users, Coursework, Submissions, Access Logs)
       └── Supabase Storage Bucket (Private Encrypted Assignment Binaries)
```

---

## 2. Policy Enforcement Matrix: Separation of Responsibilities

A common anti-pattern in edge deployments is either trusting the network or stripping authorization logic from the origin application. In this architecture, both layers collaborate:

| Request Scenario | Cloudflare Access (Edge) | Node.js Backend (Origin) | Final Result |
| :--- | :--- | :--- | :--- |
| **Unauthenticated User** (No identity) | **BLOCK** (Prompts IdP / OTP login) | Never reached | **BLOCKED (Edge)** |
| **Unauthorized Identity** (e.g. `intruder@gmail.com`) | **BLOCK** (Does not match policy) | Never reached | **BLOCKED (Edge)** |
| **Authorized Student** (valid `@univ.edu`) | **ALLOW** (Injects `Cf-Access` headers) | Validates JWT; Enforces student permissions | **ALLOWED** |
| **Authorized Faculty** (valid `@univ.edu`) | **ALLOW** (Injects `Cf-Access` headers) | Validates JWT; Enforces faculty permissions | **ALLOWED** |
| **Student accessing another student's file** | **ALLOW** (Valid academic user) | **BLOCK (403)**: Ownership mismatch | **BLOCKED (Origin)** |
| **Student accessing faculty grading API** | **ALLOW** (Valid academic user) | **BLOCK (403)**: Role mismatch | **BLOCKED (Origin)** |
| **Faculty accessing submissions & grading** | **ALLOW** (Valid academic user) | **ALLOW**: Role permitted | **ALLOWED** |

### Why Retain JWT & RBAC in the Application?
- **Zero Implicit Trust:** The origin server never assumes requests arriving over the tunnel are automatically authorized.
- **Data-Level Ownership:** Cloudflare Access knows the user is a valid university member, but only the application knows whether Student *A* owns Submission *B*.
- **Compartmentalization:** If perimeter credentials are leaked or bypassed, the application-level JWT and RBAC prevent lateral privilege escalation.

---

## 3. Zero-Secrets Commitment

> [!IMPORTANT]
> **No Credentials Stored in Git:**
> - Cloudflare Tunnel tokens, API tokens, account secrets, and credential JSON files are **never** committed to the repository.
> - Credentials reside exclusively on the host system in `~/.cloudflared/<tunnel-id>.json` or via environment variables (`TUNNEL_TOKEN`).
> - The application uses template files ([`backend/.env.example`](file:///c:/Zero%20Trust/backend/.env.example) and [`frontend/.env.example`](file:///c:/Zero%20Trust/frontend/.env.example)) with strict `.gitignore` enforcement.

---

## 4. Cloudflare Access Configuration Steps (Dashboard)

Follow these manual steps in the **Cloudflare Zero Trust Dashboard** ([one.dash.cloudflare.com](https://one.dash.cloudflare.com)):

### Step 1: Create Access Groups
Create reusable identity groups under **Access** $\rightarrow$ **Access Groups**:

1. **Student Group:**
   - **Name:** `Authorized-Students`
   - **Criteria:**
     - Include $\rightarrow$ Selector: *Emails ending in* $\rightarrow$ Value: `@student.univ.edu` (or `@univ.edu`)
2. **Faculty Group:**
   - **Name:** `Authorized-Faculty`
   - **Criteria:**
     - Include $\rightarrow$ Selector: *Emails ending in* $\rightarrow$ Value: `@faculty.univ.edu` (or specific email list)

### Step 2: Register the Self-Hosted Application
1. Navigate to **Access** $\rightarrow$ **Applications** $\rightarrow$ Click **Add an application**.
2. Select **Self-hosted**.
3. **Application Configuration:**
   - **Application Name:** `ZeroTrust Assignment Gateway`
   - **Application Domain:** `api.yourdomain.edu` (pointed to the Cloudflare Tunnel)
   - **Session Duration:** `24 hours`
   - **Identity Providers:** Select your configured IdP (Google Workspace, Microsoft Entra ID, GitHub, or One-Time PIN).

### Step 3: Define Access Policies
Add the following policies under the application's **Policies** tab:

#### Policy A: Authorized Faculty Access
- **Policy Name:** `Faculty Access Policy`
- **Action:** `Allow`
- **Rule Include:** *Access Group* $\rightarrow$ `Authorized-Faculty`

#### Policy B: Authorized Student Access
- **Policy Name:** `Student Access Policy`
- **Action:** `Allow`
- **Rule Include:** *Access Group* $\rightarrow$ `Authorized-Students`

#### Default Deny Rule:
- Cloudflare Access automatically enforces a default-deny posture. Any user who does not match Policy A or Policy B is **BLOCKED** with HTTP 403 / Access Denied.

### Step 4: Configure CORS and Identity Headers
Under **Advanced Settings**:
- **Enable CORS:** Set allowed origins to your frontend URL (e.g. `https://gateway.yourdomain.edu`).
- **Allowed Methods:** `GET, POST, PUT, DELETE, OPTIONS`.
- **Allowed Headers:** `Authorization, Content-Type, Cf-Access-Jwt-Assertion`.
- **Enable Cloudflare Identity Headers:** Ensures Cloudflare injects:
  - `Cf-Access-Authenticated-User-Email`
  - `Cf-Access-Jwt-Assertion`
- Click **Save Application**.

---

## 5. Connecting the Node.js Backend via Cloudflare Tunnel

### Step 1: Install `cloudflared` CLI
- **Windows (PowerShell):**
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```
- **macOS:**
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  ```
- **Linux:**
  ```bash
  sudo apt-get install cloudflared
  ```

### Step 2: Authenticate and Create Tunnel
```bash
# 1. Login to Cloudflare account
cloudflared tunnel login

# 2. Create the tunnel
cloudflared tunnel create zerotrust-gateway

# 3. Route DNS to the tunnel
cloudflared tunnel route dns zerotrust-gateway api.yourdomain.edu
```

### Step 3: Configure Ingress Rules (`~/.cloudflared/config.yml`)
```yaml
tunnel: <YOUR-TUNNEL-UUID>
credentials-file: C:\Users\<Username>\.cloudflared\<YOUR-TUNNEL-UUID>.json

ingress:
  # Route traffic for your gateway API to the local Node.js server
  - hostname: api.yourdomain.edu
    service: http://localhost:5000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false

  # Catch-all rule required by cloudflared
  - service: http_status:404
```

### Step 4: Run the Tunnel
```bash
cloudflared tunnel run zerotrust-gateway
```

---

## 6. Origin Verification & Node.js Middleware

The Node.js backend includes the [`verifyCloudflareAccess`](file:///c:/Zero%20Trust/backend/src/middleware/cloudflareAccess.middleware.js) middleware in [`backend/src/server.js`](file:///c:/Zero%20Trust/backend/src/server.js).

To enforce Cloudflare Access headers in production, set in `backend/.env`:
```env
CLOUDFLARE_ACCESS_REQUIRED=true
CLOUDFLARE_TEAM_DOMAIN=your-team.cloudflareaccess.com
CLOUDFLARE_AUD_KEY=your-application-aud-key
```

When enabled:
- Requests lacking `Cf-Access-Authenticated-User-Email` or `Cf-Access-Jwt-Assertion` are immediately blocked at the origin with `403 Forbidden`.
- Legitimate edge headers attach `req.cfAccess = { email, jwtAssertion }` for downstream audit logging and session correlation.
- In local development mode (`CLOUDFLARE_ACCESS_REQUIRED=false`), the middleware safely allows traffic so test suites run unimpeded.

---

## 7. Verification & Testing Commands

### Test 1: Verify Unauthenticated Edge Request is Blocked
```bash
curl -i https://api.yourdomain.edu/api/assignments
```
**Expected:** HTTP 302 Redirect to Cloudflare Access login screen, or HTTP 403 Forbidden. Request never hits the Node.js server.

### Test 2: Verify Authorized Identity Passes Edge
```bash
curl -i https://api.yourdomain.edu/api/health \
  -H "Cf-Access-Jwt-Assertion: <VALID-CF-JWT>"
```
**Expected:** HTTP 200 OK with health check telemetry.

### Test 3: Verify Origin Enforces Fine-Grained Role Authorization
```bash
# Student attempting faculty-only route
curl -i https://api.yourdomain.edu/api/faculty/assignments \
  -H "Authorization: Bearer <STUDENT-JWT>" \
  -H "Cf-Access-Jwt-Assertion: <VALID-CF-JWT>"
```
**Expected:** HTTP 403 Forbidden: `Access denied. Required role: faculty`. Event logged to `access_logs` with result `BLOCK`.

### Test 4: Verify Origin Enforces Ownership Security
```bash
# Student A requesting Student B's submission
curl -i https://api.yourdomain.edu/api/submissions/<STUDENT-B-SUBMISSION-ID> \
  -H "Authorization: Bearer <STUDENT-A-JWT>" \
  -H "Cf-Access-Jwt-Assertion: <VALID-CF-JWT>"
```
**Expected:** HTTP 403 Forbidden: `Access denied. You can only access your own submissions`. Event logged with result `BLOCK`.
