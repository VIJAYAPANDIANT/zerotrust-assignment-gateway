# Cloudflare Zero Trust Architecture & Tunnel Deployment Guide

This documentation details the production security architecture and manual deployment workflow for exposing the **ZeroTrust Assignment Submission Gateway** through **Cloudflare Tunnel** and **Cloudflare Access**.

---

## 1. Architectural Overview & Request Flow

The Node.js Express backend (running locally on port `5000`) is never exposed directly to the public internet. Instead, it relies on an outbound-only encrypted tunnel established by the `cloudflared` daemon to Cloudflare's global edge network.

### Complete End-to-End Traffic Flow

```
Internet (Student / Faculty Client)
       │
       ▼
Cloudflare Edge Network
       │  (DDoS Mitigation, Global Anycast DNS, TLS Termination)
       ▼
Cloudflare Access
       │  (Identity Verification, SSO / IdP Authentication, Device Posture)
       ▼
Access Policy Evaluation
       │  (RBAC Rules, Institutional Email Restrictions: @univ.edu)
       ▼
Cloudflare Tunnel (cloudflared daemon)
       │  (Encrypted Outbound-Only QUIC/HTTP2 Tunnel — No Inbound Open Ports)
       ▼
Node.js Express Backend (http://localhost:5000)
       │  (Application Authentication, Role Authorization, Access Logging)
       ▼
Supabase Infrastructure
       ├── PostgreSQL (Database & Row-Level Security)
       └── Storage Bucket (Encrypted Assignment Artifacts)
```

---

## 2. Core Security Pillars

### A. Zero Inbound Exposure
- **No Open Ports:** The local server firewall blocks all incoming WAN traffic on port `5000`. The server requires no public IP address, port forwarding, or NAT traversal.
- **Outbound-Only Tunnel:** The `cloudflared` daemon opens persistent, encrypted outbound connections (over port `7844` via QUIC / HTTP/2) to Cloudflare Anycast edge servers.

### B. Identity-Driven Edge Boundary (Cloudflare Access)
- Every incoming HTTP request must first authenticate at the Cloudflare edge before a TCP connection or byte stream reaches the Express origin.
- Cloudflare Access evaluates identity providers (e.g. Google Workspace, Microsoft Entra ID, GitHub, or One-Time PIN) and checks policy rules.
- Once authenticated, Cloudflare signs and forwards cryptographic JWT assertion headers (`Cf-Access-Jwt-Assertion`, `Cf-Access-Authenticated-User-Email`) to the origin.

### C. Automated HTTPS & Anycast DNS
- Cloudflare automatically provisions and renews SSL/TLS certificates for the designated domain/subdomain.
- DNS CNAME records resolve through Cloudflare's global Anycast network, mitigating DDoS and volumetric floods.

---

## 3. Zero-Secrets Commitment

> [!IMPORTANT]
> **No Secrets in Repository:** Cloudflare Account IDs, Tunnel Secrets, API Tokens, and Credentials JSON files must **never** be committed to Git.
> - Tunnel credentials reside locally on the host machine in `~/.cloudflared/<tunnel-uuid>.json` or are injected via environment variable `TUNNEL_TOKEN`.
> - Repository `.gitignore` rules strictly prevent accidental commits of `.env`, `*.json`, `*.pem`, or `*.key` credential files.

---

## 4. Manual Cloudflare Configuration Walkthrough

Follow these steps manually using the Cloudflare Dashboard and Cloudflare CLI (`cloudflared`).

---

### Phase 1: Prerequisites
1. A registered domain active on Cloudflare (with nameservers pointing to Cloudflare).
2. A Cloudflare Zero Trust account (available on the Free plan).
3. The Node.js Express backend running locally on port `5000`:
   ```bash
   cd backend
   npm start
   ```

---

### Phase 2: Install and Authenticate `cloudflared` CLI

#### 1. Install `cloudflared`
- **Windows (PowerShell with Winget or Chocolatey):**
  ```powershell
  winget install --id Cloudflare.cloudflared
  # or
  choco install cloudflared
  ```
- **macOS (Homebrew):**
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  ```
- **Linux (Debian/Ubuntu):**
  ```bash
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
  echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
  sudo apt-get update && sudo apt-get install cloudflared
  ```

#### 2. Authenticate CLI with your Cloudflare Account
Run:
```bash
cloudflared tunnel login
```
- A browser window will open prompting you to select your domain.
- Once selected, Cloudflare downloads an origin certificate to `~/.cloudflared/cert.pem` on your local system.

---

### Phase 3: Create the Tunnel & Route DNS

#### 1. Create the Tunnel
Choose a descriptive tunnel name (e.g. `zerotrust-gateway`):
```bash
cloudflared tunnel create zerotrust-gateway
```
*Output will display a unique Tunnel UUID and generate a credentials file:*
```
Created tunnel zerotrust-gateway with id <TUNNEL-UUID>
```

#### 2. Route DNS to the Tunnel
Point your chosen subdomain (e.g., `api.yourdomain.com`) to the newly created tunnel:
```bash
cloudflared tunnel route dns zerotrust-gateway api.yourdomain.com
```
*This automatically creates a CNAME DNS record in Cloudflare pointing `api.yourdomain.com` to `<TUNNEL-UUID>.cfargotunnel.com`.*

---

### Phase 4: Configure Local Ingress Rules

Create a configuration file `~/.cloudflared/config.yml` (or in your deployment directory outside version control):

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /path/to/.cloudflared/<TUNNEL-UUID>.json

ingress:
  # Route traffic for your API subdomain to the local Express backend on port 5000
  - hostname: api.yourdomain.com
    service: http://localhost:5000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false

  # Fallback catch-all rule (required by cloudflared)
  - service: http_status:404
```

---

### Phase 5: Start and Test the Tunnel

#### 1. Test Run the Tunnel
```bash
cloudflared tunnel run zerotrust-gateway
```
*Verify console logs confirm healthy connections across multiple edge locations.*

#### 2. Test Origin Reachability
From any external browser or terminal:
```bash
curl -i https://api.yourdomain.com/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "ZeroTrust Assignment Gateway API is running",
  "environment": "production",
  "uptime": 45,
  "timestamp": "2026-10-08T06:20:00.000Z"
}
```

#### 3. (Optional) Run `cloudflared` as a System Service
To run continuously in the background on startup:
```bash
# Windows (Run PowerShell as Administrator):
cloudflared service install
Start-Service cloudflared

# Linux:
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

---

### Phase 6: Cloudflare Access Policy Configuration (Dashboard)

To secure the backend with Cloudflare Access policies:

1. Open the **Cloudflare One / Zero Trust Dashboard** ([one.dash.cloudflare.com](https://one.dash.cloudflare.com)).
2. Navigate to **Access** $\rightarrow$ **Applications**.
3. Click **Add an application** $\rightarrow$ Select **Self-hosted**.
4. Configure Application Details:
   - **Application Name:** `ZeroTrust Assignment Gateway API`
   - **Session Duration:** `24 Hours` (or as required by security policy)
   - **Application Domain:** `api.yourdomain.com`
5. Configure Policy Rules:
   - **Policy Name:** `Academic Institutional Access`
   - **Action:** `Allow`
   - **Rule Criterion:**
     - **Emails ending in:** `@univ.edu` (or your academic institution domain)
     - *(Optional)* **Identity Provider:** Select Google Workspace, Entra ID, or One-Time PIN.
6. Advanced Settings:
   - **CORS Settings:** Enable CORS and specify allowed origins (e.g. `https://gateway.yourdomain.edu`).
   - **JWT Validation:** Cloudflare Access generates signed assertions with public key validation via `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/certs`.
7. Click **Save application**.

---

## 5. Verification Checklist

| Step | Check | Verification Command |
| :--- | :--- | :--- |
| 1 | Backend running on port 5000 | `curl http://localhost:5000/api/health` |
| 2 | `cloudflared` installed & authenticated | `cloudflared --version` |
| 3 | Tunnel created with DNS routed | `cloudflared tunnel list` |
| 4 | HTTPS traffic proxied over tunnel | `curl https://api.yourdomain.com/api/health` |
| 5 | Cloudflare Access policy enforces authentication | Unauthorized request prompts Access login screen or returns 302/403 |
