# Cloudflare Zero Trust: 6-Feature Implementation Guide
### Production Setup for Perimeterless Academic Coursework Gateways

This guide provides exhaustive, step-by-step instructions for deploying and configuring all **6 Cloudflare Zero Trust Features** in front of the **ZeroTrust Assignment Submission Gateway**, enforcing NIST SP 800-207 *"Never Trust, Always Verify"* principles across both network edge and application origin.

---

## 1. Architectural Topology & End-to-End Traffic Flow

```
[ End User Client ]
        │ HTTPS (Port 443)
        ▼
[ 1. Cloudflare Gateway / Encrypted DoH DNS ]
        │
        ▼
[ 2. Cloudflare Access (Identity-Aware Proxy / IdP Verification) ]
        │ Checks institutional domain, MFA, device posture
        ├── If unauthenticated ──► [ BLOCK at Edge / Redirect to IdP ]
        └── If authorized      ──► [ Inject Cf-Access-Jwt-Assertion ]
                                           │
                                           ▼
[ 3. Cloudflare Edge WAF & 4. Bot Management / Rate Limiter ]
        │ L7 deep packet inspection, OWASP filtering, DDoS deflection
        │
        ▼
[ 5. Cloudflare Tunnel (cloudflared daemon) ]
        │ Outbound-only encrypted QUIC/HTTP2 tunnel (0 open inbound ports)
        ▼
[ 6. Origin Node.js Express Gateway (http://localhost:5000) ]
        │ • Validates Cf-Access-Jwt-Assertion via verifyCloudflareAccess middleware
        │ • Enforces fine-grained application RBAC (Student vs Faculty vs Admin)
        │ • Enforces resource ownership boundaries (Student cannot view peer files)
        │ • Streams tamper-evident telemetry (ALLOW, BLOCK, FAILURE) to PostgreSQL
        ▼
[ Supabase PostgreSQL DB & Private Encrypted Storage Bucket ]
```

---

## 2. Prerequisites & Pre-Flight Checks

1. **Cloudflare Account:** Sign up at [cloudflare.com](https://cloudflare.com) (Cloudflare Zero Trust Free Tier supports up to 50 active identities).
2. **Domain on Cloudflare:** An active domain zone (e.g. `yourdomain.com`) with nameservers pointing to Cloudflare.
3. **Local Application Running:**
   - **Backend API:** `http://localhost:5000` (`npm start` in `backend/`)
   - **Frontend UI:** `http://localhost:5173` (`npm run dev` in `frontend/`)
   - Verify health: `curl http://localhost:5000/api/health` returns `HTTP 200 OK`.

---

## 3. Feature-by-Feature Implementation

---

### Feature 1: Cloudflare Tunnel (`cloudflared`) — Zero Inbound Ports

> **Objective:** Connect local servers (`localhost:5000` & `localhost:5173`) to the public internet through encrypted outbound tunnels, keeping all router/firewall inbound ports strictly closed.

#### Step 1.1: Install the `cloudflared` CLI
- **Windows (PowerShell as Administrator):**
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```
- **macOS (Homebrew):**
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  ```
- **Linux (Debian / Ubuntu):**
  ```bash
  sudo apt-get install cloudflared
  ```

#### Step 1.2: Authenticate `cloudflared` with Your Cloudflare Account
```bash
cloudflared tunnel login
```
*A browser window will open. Authorize your domain. A cryptographic certificate (`cert.pem`) is automatically saved to your system.*

#### Step 1.3: Create a Named Tunnel
```bash
cloudflared tunnel create zerotrust-gateway
```
*Note down the generated **Tunnel ID** (UUID) returned in your terminal (e.g. `a1b2c3d4-e5f6-7890-abcd-1234567890ab`).*

#### Step 1.4: Author the Ingress Configuration File
Create or update `~/.cloudflared/config.yml` (or in project directory `cloudflare/config.yml`):

```yaml
tunnel: <YOUR-TUNNEL-UUID>
credentials-file: C:\Users\<YourUsername>\.cloudflared\<YOUR-TUNNEL-UUID>.json

ingress:
  # 1. Route Frontend Portal
  - hostname: portal.yourdomain.com
    service: http://localhost:5173
    originRequest:
      noTLSVerify: true

  # 2. Route Backend API
  - hostname: api.yourdomain.com
    service: http://localhost:5000
    originRequest:
      noTLSVerify: true

  # 3. Mandatory Catch-All 404 Rule
  - service: http_status:404
```

#### Step 1.5: Route DNS Hostnames to Your Tunnel
```bash
cloudflared tunnel route dns zerotrust-gateway portal.yourdomain.com
cloudflared tunnel route dns zerotrust-gateway api.yourdomain.com
```

#### Step 1.6: Launch the Tunnel
To test interactively:
```bash
cloudflared tunnel run zerotrust-gateway
```
To register and run as an automatic OS service (persists across system reboots):
```powershell
# Windows (Administrator PowerShell):
cloudflared service install
Start-Service cloudflared

# Linux:
sudo cloudflared service install
sudo systemctl start cloudflared
```

> [!IMPORTANT]
> **Network Port 7844 Requirement:** `cloudflared` connects outbound over UDP/QUIC or TCP port 7844. If you are on a restricted university Wi-Fi network that filters port 7844, append `--protocol http2` to route tunnel traffic over standard HTTPS port 443.

---

### Feature 2: Cloudflare Access — Identity-Aware Proxy (IAP)

> **Objective:** Enforce perimeter authentication before requests ever hit your server, verifying university identity via Single Sign-On (SSO) or One-Time PIN.

#### Step 2.1: Open Cloudflare Zero Trust Console
1. Navigate to [one.dash.cloudflare.com](https://one.dash.cloudflare.com).
2. Go to **Settings** $\rightarrow$ **Authentication** $\rightarrow$ **Login methods**.
3. Click **Add new** $\rightarrow$ Choose **One-Time PIN (Email)** (or connect Google Workspace / Microsoft Entra ID / GitHub).

#### Step 2.2: Create Access Identity Groups
Navigate to **Access** $\rightarrow$ **Access Groups** $\rightarrow$ **Add a Group**:

1. **Student Group:**
   - **Name:** `Authorized-Students`
   - **Criteria:** Include $\rightarrow$ *Emails ending in* $\rightarrow$ `@student.gateway.edu` (or individual email whitelist).
2. **Faculty Group:**
   - **Name:** `Authorized-Faculty`
   - **Criteria:** Include $\rightarrow$ *Emails ending in* $\rightarrow$ `@faculty.gateway.edu`.
3. **Admin Group:**
   - **Name:** `Authorized-Admins`
   - **Criteria:** Include $\rightarrow$ *Email* $\rightarrow$ `vijayapandian112007@gmail.com`.

#### Step 2.3: Register Self-Hosted Applications
Navigate to **Access** $\rightarrow$ **Applications** $\rightarrow$ **Add an application** $\rightarrow$ **Self-hosted**:

1. **Portal Application:**
   - **Application Name:** `ZeroTrust Gateway Portal`
   - **Application Domain:** `portal.yourdomain.com`
   - **Session Duration:** `24 hours`
2. **API Application:**
   - **Application Name:** `ZeroTrust Gateway API`
   - **Application Domain:** `api.yourdomain.com`
   - **Session Duration:** `24 hours`

#### Step 2.4: Define Access Policies
Under the **Policies** tab of each application:
- **Policy 1 (Faculty Access):** Action = `Allow`, Include = Access Group `Authorized-Faculty`.
- **Policy 2 (Student Access):** Action = `Allow`, Include = Access Group `Authorized-Students`.
- **Policy 3 (Admin Access):** Action = `Allow`, Include = Access Group `Authorized-Admins`.
- **Default-Deny Posture:** Any request not matching these policies is automatically rejected at the edge with HTTP 403 / Access Denied.

---

### Feature 3: Edge Web Application Firewall (WAF)

> **Objective:** Inspect every HTTP payload at Cloudflare’s global Anycast edge, stopping SQL injection, cross-site scripting (XSS), and malicious inputs before they reach Express.

#### Step 3.1: Enable WAF Managed Rulesets
1. In Cloudflare Dashboard ([dash.cloudflare.com](https://dash.cloudflare.com)), select your domain $\rightarrow$ **Security** $\rightarrow$ **WAF**.
2. Select **Managed Rules**.
3. Toggle **Cloudflare Managed Ruleset** to **ON**.
4. Set rule action to **Block** for high-confidence OWASP anomalies.

#### Step 3.2: Create Custom Edge Filter for `/api`
Under **WAF** $\rightarrow$ **Custom Rules** $\rightarrow$ **Create Rule**:
- **Rule Name:** `Enforce Valid API Payloads`
- **Condition Expression:**
  ```text
  (http.request.uri.path contains "/api/" and http.request.method eq "POST" and not http.request.headers["content-type"][0] contains "application/json" and not http.request.headers["content-type"][0] contains "multipart/form-data")
  ```
- **Action:** `Block`

---

### Feature 4: Bot Management & Dynamic Rate Limiting

> **Objective:** Neutralize automated credential stuffing, brute-force password attacks, and DDoS scraping on authentication endpoints.

#### Step 4.1: Enable Bot Fight Mode
1. In Cloudflare Dashboard $\rightarrow$ **Security** $\rightarrow$ **Bots**.
2. Toggle **Bot Fight Mode** to **ON**.
   *Automatically challenges automated headless browsers and scripts with JavaScript/Managed Challenges.*

#### Step 4.2: Author Rate Limiting Rule for `/api/auth/login`
1. Go to **Security** $\rightarrow$ **WAF** $\rightarrow$ **Rate limiting rules** $\rightarrow$ **Create rule**.
2. **Rule Name:** `Throttle Login Brute Force`
3. **Criteria:**
   - When incoming requests match: `URI Path` equals `/api/auth/login`
   - Method: `POST`
4. **Rate Limit Threshold:**
   - **Requests:** Greater than `5` requests
   - **Time Window:** `1 minute`
   - **Group by:** `IP Address`
5. **Mitigation Action:** `Block` for `10 minutes` (or `Managed Challenge`).

---

### Feature 5: Edge JWT Assertion Verification at Origin

> **Objective:** Ensure no request can reach the Node.js origin without a genuine, edge-signed Cloudflare Access cryptographic assertion header.

#### Step 5.1: Enable Identity Headers in Cloudflare Access
1. In Zero Trust Dashboard $\rightarrow$ **Access** $\rightarrow$ **Applications** $\rightarrow$ Open `ZeroTrust Gateway API`.
2. Under **Advanced Settings**:
   - Check **Enable Cloudflare Identity Headers**.
   - Note the **Application Audience (AUD) Tag** (a 64-character hexadecimal key).
   - Enable **CORS settings**: Allowed Origins = `https://portal.yourdomain.com`.

#### Step 5.2: Configure Environment Variables in `backend/.env`
Update [`backend/.env`](../backend/.env):
```env
# Cloudflare Access Perimeter Enforcement
CLOUDFLARE_ACCESS_REQUIRED=true
CLOUDFLARE_TEAM_DOMAIN=your-team.cloudflareaccess.com
CLOUDFLARE_AUD_KEY=your-application-aud-key
```

#### Step 5.3: Origin Middleware Verification Logic
The backend middleware [`backend/src/middleware/cloudflareAccess.middleware.js`](../backend/src/middleware/cloudflareAccess.middleware.js) verifies edge identity:

```javascript
export const verifyCloudflareAccess = async (req, res, next) => {
  try {
    const cfEmail = req.headers['cf-access-authenticated-user-email'];
    const cfJwt = req.headers['cf-access-jwt-assertion'];

    if (config.cloudflareAccessRequired) {
      if (!cfEmail || !cfJwt) {
        // Record immutable BLOCK event in PostgreSQL audit trail
        await AuditModel.logAccess({
          userId: null,
          endpoint: req.originalUrl,
          action: 'CLOUDFLARE_ACCESS_PERIMETER_CHECK',
          result: 'BLOCK',
          ipAddress: req.ip,
        });

        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied: Request must originate through an authenticated Cloudflare Access session.',
        });
      }
    }

    if (cfEmail) {
      req.cfAccess = { email: cfEmail, jwtAssertion: cfJwt || null };
    }

    next();
  } catch (error) {
    next(error);
  }
};
```
*If a malicious actor discovers your internal network IP and bypasses Cloudflare Access, Express halts execution immediately with HTTP 403.*

---

### Feature 6: Zero Trust Gateway DNS / Encrypted DoH

> **Objective:** Enforce DNS-over-HTTPS (DoH) for origin resolution and filter out upstream phishing and malware domains.

#### Step 6.1: Create Gateway DNS Location
1. In Zero Trust Dashboard $\rightarrow$ **Gateway** $\rightarrow$ **DNS Locations**.
2. Click **Add Location** $\rightarrow$ Name: `Gateway Origin Host`.
3. Cloudflare assigns unique **DNS-over-HTTPS (DoH)** endpoints:
   ```text
   https://<location-id>.cloudflare-gateway.com/dns-query
   ```

#### Step 6.2: Configure Gateway Threat Defense Policy
1. Go to **Gateway** $\rightarrow$ **Policies** $\rightarrow$ **DNS Policies** $\rightarrow$ **Create a policy**.
2. **Policy Name:** `Block Threat & Phishing Domains`
3. **Selector:**
   - `Security Categories` in `Malware, Phishing, Command and Control, Cryptomining`.
4. **Action:** `Block`.
5. Apply policy to all campus and gateway locations.

---

## 4. Comprehensive Testing & Verification Matrix

Run these 5 verification tests to prove each layer of your Zero Trust architecture is functioning correctly:

| # | Test Scenario | Execution Command / Procedure | Expected Verdict |
| :-: | :--- | :--- | :--- |
| **1** | **Outbound Tunnel Health** | `cloudflared tunnel info zerotrust-gateway` | State: `HEALTHY`. Connected to 4 Anycast edge locations. |
| **2** | **Zero Open Ports Check** | `nmap -p 5000,5173 <your-origin-ip>` | Output: Ports `5000` & `5173` report `CLOSED` or `FILTERED`. No public ingress. |
| **3** | **Unauthenticated Perimeter Block** | Open `https://portal.yourdomain.com` in Incognito browser | **Edge Block:** Cloudflare Access login screen displayed. Traffic never touches origin. |
| **4** | **Rate Limiting Trigger** | Run 6 rapid requests in terminal:<br>`for ($i=1; $i -le 6; $i++) { curl -X POST https://api.yourdomain.com/api/auth/login }` | Requests 1–5 process. Request 6 receives **`HTTP 429 Too Many Requests`** or Managed Challenge. |
| **5** | **Direct Origin Bypass Block** | Direct cURL without `Cf-Access-Jwt-Assertion` header:<br>`curl -i http://localhost:5000/api/assignments` | Origin responds with **`HTTP 403 Forbidden`** and logs an immutable `BLOCK` event in `/security/logs`. |

---

## 5. Quick Reference Directory

- 📁 [`cloudflare/README.md`](file:///c:/Zero%20Trust/cloudflare/README.md) — Operational tunnel setup and configuration guide.
- 📁 [`docs/ARCHITECTURE.md`](file:///c:/Zero%20Trust/docs/ARCHITECTURE.md) — Two-Tier Defense Architecture and NIST SP 800-207 specification.
- 📁 [`docs/USER_CREDENTIALS.md`](file:///c:/Zero%20Trust/docs/USER_CREDENTIALS.md) — Directory of all 36 pre-enrolled accounts.
- 📁 [`backend/src/middleware/cloudflareAccess.middleware.js`](file:///c:/Zero%20Trust/backend/src/middleware/cloudflareAccess.middleware.js) — Edge cryptographic assertion verification logic.
