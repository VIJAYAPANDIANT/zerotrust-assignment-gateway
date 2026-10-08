# ZeroTrust Assignment Gateway - Comprehensive Security Testing Report

This document records the empirical security verification and test results for the **ZeroTrust Assignment Submission Gateway**. 

The test suite validates the core research goal of **Zero Trust Architecture (ZTA)**:
> *"Never trust, always verify. Every request must be authenticated, authorized, and validated for data ownership at both the perimeter and application layers."*

---

## 1. Executive Summary

| Total Scenarios Tested | Passed | Failed | Defense-in-Depth Status |
| :---: | :---: | :---: | :---: |
| **10 / 10** | **10** | **0** | **100% Verified** |

- **Authentication Boundaries:** Enforced via cryptographic JWT verification at the application layer and Cloudflare Access at the network edge.
- **Role-Based Authorization (RBAC):** Strict compartmentalization ensures students and faculty cannot access endpoints beyond their operational scope.
- **Resource Ownership:** Object-level access control guarantees students can never inspect or download submission artifacts belonging to other students.
- **Administrative Isolation:** Faculty and student identities are strictly blocked from sensitive administrative endpoints.

---

## 2. Architecture & Enforcement Layers

```
User (Student / Faculty / Anonymous)
       │
       ▼
Cloudflare Access (Perimeter Identity Gate)
       │  (SSO / Institutional IdP Authentication)
       ▼
Access Policy
       │  (Edge Rules: Allowed University Domains, Device Posture)
       ▼
Cloudflare Tunnel (cloudflared daemon)
       │  (Encrypted Outbound-Only QUIC/HTTP2 Connection — No Open Inbound Ports)
       ▼
Node.js Express Backend
       │  (Edge Header Corroboration & Cryptographic JWT Verification)
       ▼
Application RBAC & Ownership Engine
       │  (Fine-Grained Permissions: Student vs. Faculty vs. Admin)
       │  (Object-Level Ownership: Student ID matching submission record)
       ▼
Supabase Managed Infrastructure
       ├── PostgreSQL Database (Users, Coursework, Submissions, Access Logs)
       └── Supabase Storage Bucket (Private Encrypted Coursework Binaries)
```

---

## 3. Detailed Security Test Matrix

---

### TEST 1: Unauthenticated User Access Attempt
- **Scenario:** An unauthenticated visitor attempts to access protected coursework without providing identity credentials.
- **User:** `Anonymous` (Unauthenticated Principal)
- **Request:** `GET /api/assignments` *(Header: None)*
- **Endpoint:** `/api/assignments`
- **Expected Result:** HTTP 401 Unauthorized (BLOCK)
- **Actual Result:** `HTTP 401 Unauthorized` — `{"success": false, "error": "Unauthorized", "message": "Authentication required. No token provided."}`
- **Decision:** **BLOCK**
- **Security Layer Responsible:** Node.js Authentication Middleware (`requireAuth`) & Cloudflare Access (Edge Perimeter Gate)

---

### TEST 2: Authenticated Student Accesses Student Dashboard
- **Scenario:** A valid student presents a cryptographically signed JWT to browse assigned coursework.
- **User:** `Student Alice` (`student@univ.edu`) — Role: `student`
- **Request:** `GET /api/assignments` *(Header: `Authorization: Bearer <STUDENT-A-JWT>`)*
- **Endpoint:** `/api/assignments`
- **Expected Result:** HTTP 200 OK (ALLOW)
- **Actual Result:** `HTTP 200 OK` — Returns active assignments array and submission statuses.
- **Decision:** **ALLOW**
- **Security Layer Responsible:** Node.js Authentication (`requireAuth`) & RBAC (`requireRole('student')`)

---

### TEST 3: Student Uploads Own Assignment Coursework
- **Scenario:** An authenticated student uploads their coursework solution artifact to the private cloud storage vault.
- **User:** `Student Alice` (`student@univ.edu`) — Role: `student`
- **Request:** `POST /api/submissions` *(Multipart Form: `assignment_id`, `file: student_a_solution.pdf`, Header: `Authorization: Bearer <STUDENT-A-JWT>`)*
- **Endpoint:** `/api/submissions`
- **Expected Result:** HTTP 201 Created (ALLOW)
- **Actual Result:** `HTTP 201 Created` — `{"success": true, "message": "Assignment coursework submitted successfully to Supabase Storage."}`
- **Decision:** **ALLOW**
- **Security Layer Responsible:** Node.js Role Authorization (`requireRole('student')`) & Supabase Storage Service

---

### TEST 4: Student Attempts to Access Another Student's Submission (Ownership Breach)
- **Scenario:** Student Bob attempts to inspect or download the submission artifact submitted by Student Alice.
- **User:** `Student Bob` (`student_b@univ.edu`) targeting Student Alice's submission artifact
- **Request:** `GET /api/submissions/9ce536ec-5556-403d-96cc-444fc77f3402` *(Header: `Authorization: Bearer <STUDENT-B-JWT>`)*
- **Endpoint:** `/api/submissions/:id` (and `/api/submissions/:id/file`)
- **Expected Result:** HTTP 403 Forbidden (BLOCK)
- **Actual Result:** `HTTP 403 Forbidden` — `{"success": false, "error": "Forbidden", "message": "Forbidden: You do not have permission to access another student's submission."}`
- **Decision:** **BLOCK**
- **Security Layer Responsible:** Node.js Object Ownership Engine (`submission.student_id !== req.user.id` in `submission.controller.js`)

---

### TEST 5: Student Attempts to Access Faculty Management Endpoint
- **Scenario:** A student attempts to call an instructor endpoint to publish or modify coursework assignments.
- **User:** `Student Alice` (`student@univ.edu`) — Role: `student`
- **Request:** `POST /api/assignments` *(Header: `Authorization: Bearer <STUDENT-A-JWT>`, Body: `{"title": "Unauthorized Assignment"}`)*
- **Endpoint:** `/api/assignments`
- **Expected Result:** HTTP 403 Forbidden (BLOCK)
- **Actual Result:** `HTTP 403 Forbidden` — `{"success": false, "error": "Forbidden", "message": "Forbidden: Access requires [faculty] role. Current role: 'student'."}`
- **Decision:** **BLOCK**
- **Security Layer Responsible:** Node.js Role-Based Access Control (`requireRole('faculty')`)

---

### TEST 6: Authenticated Faculty Accesses Faculty Dashboard Data
- **Scenario:** An instructor accesses the faculty coursework dashboard to view active assignments.
- **User:** `Dr. Faculty Carol` (`faculty@univ.edu`) — Role: `faculty`
- **Request:** `GET /api/faculty/assignments` *(Header: `Authorization: Bearer <FACULTY-JWT>`)*
- **Endpoint:** `/api/faculty/assignments`
- **Expected Result:** HTTP 200 OK (ALLOW)
- **Actual Result:** `HTTP 200 OK` — Returns authored assignments with submission counts.
- **Decision:** **ALLOW**
- **Security Layer Responsible:** Node.js Role-Based Access Control (`requireRole('faculty')`)

---

### TEST 7: Faculty Views Student Coursework Submissions Queue
- **Scenario:** An instructor views the submission queue to inspect student work for evaluation.
- **User:** `Dr. Faculty Carol` (`faculty@univ.edu`) — Role: `faculty`
- **Request:** `GET /api/faculty/submissions` *(Header: `Authorization: Bearer <FACULTY-JWT>`)*
- **Endpoint:** `/api/faculty/submissions`
- **Expected Result:** HTTP 200 OK (ALLOW)
- **Actual Result:** `HTTP 200 OK` — Returns student submissions array awaiting grading.
- **Decision:** **ALLOW**
- **Security Layer Responsible:** Node.js Role-Based Access Control (`requireRole('faculty')`)

---

### TEST 8: Faculty Attempts to Access Admin-Only Security Endpoint
- **Scenario:** An instructor attempts to query administrative telemetry and user governance records.
- **User:** `Dr. Faculty Carol` (`faculty@univ.edu`) — Role: `faculty`
- **Request:** `GET /api/admin/overview` *(Header: `Authorization: Bearer <FACULTY-JWT>`)*
- **Endpoint:** `/api/admin/overview`
- **Expected Result:** HTTP 403 Forbidden (BLOCK)
- **Actual Result:** `HTTP 403 Forbidden` — `{"success": false, "error": "Forbidden", "message": "Forbidden: Access requires [admin] role. Current role: 'faculty'."}`
- **Decision:** **BLOCK**
- **Security Layer Responsible:** Node.js Administrative Least Privilege (`requireRole('admin')`)

---

### TEST 9: Tampered / Invalid Cryptographic JWT Bearer Token
- **Scenario:** An attacker submits an altered or forged token with an invalid cryptographic signature.
- **User:** `Adversary / Forged Principal`
- **Request:** `GET /api/assignments` *(Header: `Authorization: Bearer eyJhbGciOiJIUzI1Ni...corruptedSignatureXYZ123`)*
- **Endpoint:** `/api/assignments`
- **Expected Result:** HTTP 401 Unauthorized (BLOCK)
- **Actual Result:** `HTTP 401 Unauthorized` — `{"success": false, "error": "Unauthorized", "message": "Invalid authentication token."}`
- **Decision:** **BLOCK**
- **Security Layer Responsible:** Node.js Cryptographic Signature Verification (`jwt.verify` in `requireAuth`)

---

### TEST 10: Valid JWT with Unauthorized Role Attempts Privilege Escalation
- **Scenario:** A student holding a valid, unexpired token attempts to post a grade to a submission endpoint.
- **User:** `Student Alice` (`student@univ.edu`) — Role: `student` attempting grading API
- **Request:** `POST /api/faculty/submissions/9ce536ec-5556-403d-96cc-444fc77f3402/grade` *(Header: `Authorization: Bearer <STUDENT-A-JWT>`, Body: `{"marks": 100, "feedback": "Self-grade"}`)*
- **Endpoint:** `/api/faculty/submissions/:id/grade`
- **Expected Result:** HTTP 403 Forbidden (BLOCK)
- **Actual Result:** `HTTP 403 Forbidden` — `{"success": false, "error": "Forbidden", "message": "Forbidden: Access requires [faculty] role. Current role: 'student'."}`
- **Decision:** **BLOCK**
- **Security Layer Responsible:** Node.js Role-Based Access Control (`requireRole('faculty')`)

---

## 4. Verification Summary Table

| Test ID | Test Scenario | Request & Principal | Endpoint | Expected | Actual | Decision | Security Layer |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **TEST 1** | Unauthenticated Access | Anonymous visitor | `GET /api/assignments` | 401 | 401 | **BLOCK** | `requireAuth` / Cloudflare Access |
| **TEST 2** | Student Dashboard Access | Student Alice | `GET /api/assignments` | 200 | 200 | **ALLOW** | `requireAuth` + `requireRole` |
| **TEST 3** | Student Upload Own Work | Student Alice | `POST /api/submissions` | 201 | 201 | **ALLOW** | `requireRole('student')` + Storage |
| **TEST 4** | Cross-Student Access Attempt | Student Bob $\rightarrow$ Alice's work | `GET /api/submissions/:id` | 403 | 403 | **BLOCK** | Object Ownership Check |
| **TEST 5** | Student $\rightarrow$ Faculty API | Student Alice $\rightarrow$ Create Coursework | `POST /api/assignments` | 403 | 403 | **BLOCK** | `requireRole('faculty')` |
| **TEST 6** | Faculty Dashboard Access | Dr. Faculty Carol | `GET /api/faculty/assignments` | 200 | 200 | **ALLOW** | `requireRole('faculty')` |
| **TEST 7** | Faculty View Submissions | Dr. Faculty Carol | `GET /api/faculty/submissions` | 200 | 200 | **ALLOW** | `requireRole('faculty')` |
| **TEST 8** | Faculty $\rightarrow$ Admin API | Dr. Faculty Carol $\rightarrow$ Admin Overview | `GET /api/admin/overview` | 403 | 403 | **BLOCK** | `requireRole('admin')` |
| **TEST 9** | Tampered / Corrupt JWT | Forged Signature Token | `GET /api/assignments` | 401 | 401 | **BLOCK** | Cryptographic `jwt.verify` |
| **TEST 10** | Privilege Escalation (Grade) | Student Alice $\rightarrow$ Grade API | `POST /api/faculty/submissions/:id/grade` | 403 | 403 | **BLOCK** | `requireRole('faculty')` |

---

## 5. Automated Audit Trail & Telemetry Evidence

Every access decision evaluated above was simultaneously captured in the application's `access_logs` table:
- **ALLOW actions recorded:** `LOGIN_SUCCESS`, `COURSEWORK_RETRIEVAL`, `ASSIGNMENT_UPLOAD`, `FACULTY_EVALUATION`.
- **BLOCK actions recorded:** `UNAUTHORIZED_API_ATTEMPT`, `OWNERSHIP_MISMATCH_DENIAL`, `PRIVILEGE_ESCALATION_BLOCKED`.
- **FAILURE actions recorded:** `AUTH_CREDENTIAL_FAILURE`, `TOKEN_SIGNATURE_TAMPERED`.

This confirms the system satisfies all requirements for **continuous verification**, **fine-grained authorization**, and **non-repudiable audit logging** under the Zero Trust security model.
