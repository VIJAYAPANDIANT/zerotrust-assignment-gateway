# Zero Trust Gateway — Production & Local Deployment Guide

This guide provides step-by-step instructions for deploying the **ZeroTrust Assignment Submission Gateway** across local development environments, Supabase Cloud databases, and Cloudflare Zero Trust edge infrastructure.

---

## 1. System Requirements & Architecture Overview

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **npm**: v9.0.0 or higher
- **Git**: v2.30+
- **Cloudflare Account**: Zero Trust tier (Free tier supports up to 50 users)
- **cloudflared CLI**: Cloudflare Tunnel daemon installed locally or on server
- **Supabase Account**: (Optional, for persistent cloud DB and storage; gateway operates in fallback mode without it)

### Two-Tier Runtime Architecture
```
[ User Browser / Device ]
           │ HTTPS (Port 443)
           ▼
[ Cloudflare Global Edge ]
   ├── Cloudflare Access (IdP Authentication & MFA)
   ├── Cloudflare WAF & DDoS Shield
   └── Ingress Routing
           │ Outbound Encrypted Tunnel (No open inbound ports)
           ▼
[ Local / Cloud Server (cloudflared daemon) ]
   ├── Frontend (Vite Static / Port 5173)
   └── Backend API (Node.js Express / Port 5000)
           │ SSL / HTTPS
           ▼
[ Supabase Cloud (PostgreSQL DB + Private Storage) ]
```

---

## 2. Local Development Deployment

### Step 1: Clone Repository & Setup Backend
```bash
git clone https://github.com/VIJAY-T-07/ZeroTrust-Assignment-Gateway.git
cd ZeroTrust-Assignment-Gateway/backend
npm install
```

Create `backend/.env` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=super_secret_enterprise_zerotrust_key_min_32_chars!
# Optional Supabase credentials (gateway uses high-performance memory store if omitted):
# DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
# SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
# SUPABASE_STORAGE_BUCKET=assignments
```

Start the backend API server:
```bash
npm start
# Output confirms:
# [Seed] 36 users seeded into authentication store.
# [Server] Running on port 5000 in development mode.
```

Verify backend health:
```bash
curl http://localhost:5000/api/health
# Returns HTTP 200: {"success":true,"message":"ZeroTrust Assignment Gateway API is running",...}
```

### Step 2: Setup & Launch Frontend
In a separate terminal:
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
# Output confirms:
# VITE v6.x ready in ... ms
# Local: http://localhost:5173/
```

Access the portal in your browser: `http://localhost:5173`

---

## 3. Database Deployment (Supabase PostgreSQL)

When connecting the gateway to persistent PostgreSQL in Supabase:

1. **Create Supabase Project**: Sign in at [https://supabase.com](https://supabase.com) and create a project.
2. **Execute Database Schema**:
   - Open **SQL Editor** in the Supabase dashboard.
   - Open [`database/schema.sql`](../database/schema.sql).
   - Paste the contents and click **Run**.
   - This creates tables: `users`, `assignments`, `submissions`, and `access_logs` with all indexes and constraints.
3. **Configure Storage Bucket**:
   - Navigate to **Storage** > **New Bucket**.
   - Bucket name: `assignments`.
   - Set **Public Bucket** to **OFF** (strictly private bucket for Zero Trust file access).
   - Create bucket.
4. **Acquire Connection String & API Keys**:
   - Navigate to **Project Settings** > **Database** > Copy the URI connection string.
   - Navigate to **Project Settings** > **API** > Copy `service_role` secret (used for secure server uploads).
   - Paste these into `backend/.env`.

---

## 4. Cloudflare Zero Trust Edge Deployment

Cloudflare Zero Trust sits in front of the origin server, ensuring that **zero traffic reaches port 5000 or 5173 without prior authentication**.

### Phase A: Install `cloudflared` CLI
- **Windows**:
  ```powershell
  winget install --id Cloudflare.cloudflared
  # Or download executable from https://github.com/cloudflare/cloudflared/releases
  ```
- **Linux (Ubuntu/Debian)**:
  ```bash
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i cloudflared.deb
  ```
- **macOS**:
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  ```

### Phase B: Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
This opens a browser window prompting you to select your domain zone. Once selected, a certificate (`cert.pem`) is written to your system.

### Phase C: Create Named Tunnel
```bash
cloudflared tunnel create zerotrust-portal
```
This generates a Tunnel ID (UUID) and creates `<TUNNEL_ID>.json` credentials file.

### Phase D: Tunnel Ingress Configuration
Create a configuration file at `~/.cloudflared/config.yml` or within `cloudflare/config.yml`:

```yaml
tunnel: <YOUR-TUNNEL-UUID>
credentials-file: C:\Users\<USER>\.cloudflared\<YOUR-TUNNEL-UUID>.json

ingress:
  # Public API routing
  - hostname: api.yourdomain.com
    service: http://localhost:5000
    originRequest:
      noTLSVerify: true
  # Frontend portal routing
  - hostname: portal.yourdomain.com
    service: http://localhost:5173
    originRequest:
      noTLSVerify: true
  # Catch-all rule (required)
  - service: http_status:404
```

### Phase E: Route DNS Records
Link your hostnames to the tunnel:
```bash
cloudflared tunnel route dns zerotrust-portal portal.yourdomain.com
cloudflared tunnel route dns zerotrust-portal api.yourdomain.com
```

### Phase F: Run Tunnel as a Service
To run interactively for testing:
```bash
cloudflared tunnel run zerotrust-portal
```
To install as a background OS daemon (survives reboots):
```bash
# Windows (Administrator PowerShell):
cloudflared service install
Start-Service cloudflared

# Linux:
sudo cloudflared service install
sudo systemctl start cloudflared
```

> [!IMPORTANT]
> **Network Port 7844 Requirement:** Cloudflare Tunnel uses the **QUIC / UDP port 7844** or **TCP 7844** protocol for control plane connections. Ensure your firewall or Wi-Fi network does not block outbound port 7844. If running on restricted campus networks, switch to a mobile hotspot or configure `--protocol http2`.

---

## 5. Cloudflare Access Policy Configuration

In the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com):

1. **Navigate to Access > Applications**:
   - Click **Add an Application** > Select **Self-hosted**.
   - Application Name: `ZeroTrust Gateway Portal`
   - Application Domain: `portal.yourdomain.com`
   - Session Duration: `24 hours`

2. **Add Access Policies**:
   - **Student Policy**:
     - Name: `Student Institutional Login`
     - Action: `Allow`
     - Rule: Include emails ending in `@student.gateway.edu` or specific email whitelist.
   - **Faculty Policy**:
     - Name: `Faculty Evaluator Access`
     - Action: `Allow`
     - Rule: Include emails ending in `@faculty.gateway.edu`.
   - **Administrator Policy**:
     - Name: `Admin Console Isolation`
     - Action: `Allow`
     - Rule: Exact email `vijayapandian112007@gmail.com` + Require Hardware Security Key / OTP MFA.

3. **CORS & JWT Headers**:
   - Under application settings, enable **CORS settings**.
   - Cloudflare automatically injects the `Cf-Access-Jwt-Assertion` header on every request passing through Access.
   - The backend validates this assertion at middleware layer (`src/middleware/cloudflareAccess.middleware.js`).

---

## 6. Pre-Enrolled User Verification

The gateway implements a closed-enrollment security directory initialized with **36 enterprise identities**:
- **1 Master Administrator**: `vijayapandian112007@gmail.com`
- **5 Faculty Evaluators**: `faculty.alan@gateway.edu`, `faculty.ada@gateway.edu`, etc.
- **30 Students**: Primary student `vijayapandiant07@gmail.com` + 29 enrolled demo students.

For the exhaustive list of credentials, roles, and roll IDs, see [`USER_CREDENTIALS.md`](USER_CREDENTIALS.md).

All accounts are pre-seeded with initial default password:
```
123456
```
Upon initial authentication, users can utilize the self-service **Forgot Password** recovery feature to establish personal passwords.

---

## 7. Production Hardening Checklist

| Security Control | Verification Procedure | Status |
| :--- | :--- | :---: |
| **Inbound Ports Closed** | Port scan host machine (`nmap -p- <host-ip>`). Confirm ports 5000 & 5173 are not exposed externally. |  Verified |
| **Environment Masking** | Set `NODE_ENV=production` in backend. Confirm 500 stack traces are masked. |  Verified |
| **High Entropy JWT** | Confirm `JWT_SECRET` is at least 32 high-entropy characters. |  Verified |
| **CORS Whitelisting** | Confirm only authorized production client origin is accepted. |  Verified |
| **Edge JWT Assertion** | Confirm `Cf-Access-Jwt-Assertion` public key matches Cloudflare certs endpoint. |  Verified |
| **Private Cloud Storage** | Confirm Supabase bucket `assignments` has public read/write disabled. |  Verified |
| **Rate Limiting** | Cloudflare WAF / Express rate limiter prevents brute-force login attempts. |  Verified |
| **Audit Logging** | Verify all `ALLOW`, `BLOCK`, and `FAILURE` events appear in `/security/logs`. |  Verified |
