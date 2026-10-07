# Cloudflare Zero Trust Architecture & Configuration Guide

This directory documents the planned security boundary and integration architecture for the **ZeroTrust Assignment Submission Gateway**.

> **Status:** Architecture definition phase. Active Cloudflare configurations, tunnel tokens, and access policies will be deployed in a future milestone.

---

## 1. Architectural Overview

Traditional assignment submission systems rely solely on application-layer login credentials or internal networks (VPNs). The Zero Trust architecture replaces implicit network trust with continuous, identity-driven verification:

```
[Student / Faculty Device]
            │
            ▼
┌──────────────────────────────────────────────┐
│       Cloudflare Edge & Access Layer         │
│  - Identity Provider (IdP) Authentication    │
│  - Device Posture Checks                     │
│  - Access Policies (Least-Privilege RBAC)    │
│  - Cloudflare Access JWT Issuance (Cf-Ray)   │
└──────────────────────┬───────────────────────┘
                       │
       Encrypted Outbound-Only Tunnel
                 (cloudflared)
                       │
                       ▼
┌──────────────────────────────────────────────┐
│           Origin Infrastructure              │
│  - Frontend (React + Vite)                   │
│  - Backend (Node.js + Express)               │
│  - JWT Verification Middleware               │
└──────────────────────────────────────────────┘
```

---

## 2. Planned Components

### A. Cloudflare Access
- **Identity Enforcement:** Gate incoming web traffic before it ever reaches the application origin.
- **Identity Provider (IdP):** Integration with institutional email authentication (Google Workspace, Microsoft Entra ID, or GitHub SSO).
- **Session Policies:** Short-lived access sessions with MFA verification for privileged instructor/admin endpoints.

### B. Cloudflare Tunnel (`cloudflared`)
- **No Inbound Open Ports:** The origin host does not expose public IP addresses or listen on open ingress ports (e.g., 80/443).
- **Outbound WireGuard/HTTP2 Connections:** Origin connects outward to Cloudflare's global edge network, neutralizing DDoS and direct IP attacks.

### C. Access Policies & Mutual Verification
- **Header Propagation:** Cloudflare Access injects signed assertion headers into proxied requests:
  - `Cf-Access-Jwt-Assertion`
  - `Cf-Access-Authenticated-User-Email`
- **Origin Verification Middleware:** Express backend validates the Cloudflare Access JWT using Cloudflare public keys (`certs.cloudflareaccess.com`) ensuring requests cannot bypass the Zero Trust edge.

---

## 3. Deployment Roadmap

1. **Local Development (Current Phase):** Verified local baseline API and frontend services.
2. **Tunnel Provisioning:** Install and authenticate `cloudflared` daemon on origin server/container.
3. **Application Routing:** Configure ingress rules mapping hostname routes to local services (`frontend:5173`, `backend:5000`).
4. **Policy Enforcement:** Define student submission policies and instructor grading policies in Cloudflare Zero Trust Dashboard.
5. **Backend Assertion Middleware:** Implement cryptographic verification of Cloudflare identity tokens in Express.
