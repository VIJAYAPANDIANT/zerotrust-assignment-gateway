# REST API Specification & Endpoint Documentation

The **ZeroTrust Assignment Submission Gateway** exposes a secure RESTful API. Every endpoint enforces strict identity boundaries, role constraints, and continuous verification.

---

## 1. General Request Standards

* **Base URL:** `http://localhost:5000/api` (Local) or `https://<tunnel-domain>/api` (Edge)
* **Content-Type:** `application/json` (or `multipart/form-data` for file uploads)
* **Authentication Header:**
  ```http
  Authorization: Bearer <application_jwt_token>
  ```
* **Cloudflare Edge Assertion Headers (When reaching via Cloudflare Access):**
  ```http
  Cf-Access-Jwt-Assertion: <edge_signed_jwt>
  Cf-Access-Authenticated-User-Email: <verified_user_email>
  ```

---

## 2. Authentication & Identity Endpoints

### 2.1 Authenticate Identity (Login)
* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Access:** Public (Pre-enrolled users only)
* **Request Body:**
  ```json
  {
    "email": "vijayapandiant07@gmail.com",
    "password": "123456"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "student-00000000-0000-4000-8000-000000000001",
        "name": "Vijay T",
        "email": "vijayapandiant07@gmail.com",
        "role": "student"
      }
    }
  }
  ```

---

### 2.2 Verify Account (Forgot Password)
* **Method:** `POST`
* **Endpoint:** `/api/auth/forgot-password`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "vijayapandiant07@gmail.com"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Identity verified for Vijay T (STUDENT). You may now reset your password.",
    "data": {
      "email": "vijayapandiant07@gmail.com",
      "name": "Vijay T",
      "role": "student"
    }
  }
  ```

---

### 2.3 Reset Password
* **Method:** `POST`
* **Endpoint:** `/api/auth/reset-password`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "vijayapandiant07@gmail.com",
    "newPassword": "newpassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password successfully updated. You may now log in."
  }
  ```

---

### 2.4 User Directory
* **Method:** `GET`
* **Endpoint:** `/api/auth/directory`
* **Access:** Public / Demonstrator
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "counts": {
        "total": 37,
        "students": 30,
        "faculty": 5,
        "admins": 2
      },
      "students": [...],
      "faculty": [...],
      "admins": [...]
    }
  }
  ```

---

### 2.5 Current Profile
* **Method:** `GET`
* **Endpoint:** `/api/auth/me`
* **Access:** Authenticated (Student, Faculty, Admin)
* **Header:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully.",
    "data": {
      "user": {
        "id": "student-00000000-0000-4000-8000-000000000001",
        "name": "Vijay T",
        "email": "vijayapandiant07@gmail.com",
        "role": "student"
      }
    }
  }
  ```

---

## 3. Coursework Endpoints

### 3.1 List All Coursework
* **Method:** `GET`
* **Endpoint:** `/api/assignments`
* **Access:** Authenticated (Student, Faculty)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "a1111111-1111-4111-8111-111111111111",
        "title": "Zero Trust Architecture & Microsegmentation",
        "description": "Analyze core Zero Trust principles (NIST SP 800-207)...",
        "deadline": "2026-10-25T23:59:59.000Z",
        "created_by": "faculty-00000000-0000-4000-8000-000000000001",
        "faculty_name": "Dr. Alan Vance"
      }
    ]
  }
  ```

### 3.2 Create Coursework (Faculty Only)
* **Method:** `POST`
* **Endpoint:** `/api/assignments`
* **Access:** Faculty Only (`role == 'faculty'`)
* **Request Body:**
  ```json
  {
    "title": "Network Microsegmentation Lab",
    "description": "Implement firewall rules separating web and DB tiers.",
    "deadline": "2026-11-15T23:59:59.000Z"
  }
  ```

---

## 4. Submission Endpoints (Student Scope)

### 4.1 Upload Assignment Submission
* **Method:** `POST`
* **Endpoint:** `/api/submissions`
* **Access:** Student Only (`role == 'student'`)
* **Content-Type:** `multipart/form-data`
* **Fields:**
  * `assignment_id`: `a1111111-1111-4111-8111-111111111111`
  * `file`: `[Binary Upload: PDF, ZIP, DOCX, TXT - Max 25MB]`

---

### 4.2 View My Submissions
* **Method:** `GET`
* **Endpoint:** `/api/submissions/my`
* **Access:** Student Only (`role == 'student'`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "sub-12345",
        "assignment_id": "a1111111-1111-4111-8111-111111111111",
        "assignment_title": "Zero Trust Architecture & Microsegmentation",
        "file_name": "vijay_zt_report.pdf",
        "marks": 95,
        "feedback": "Outstanding evaluation of NIST tenets.",
        "submitted_at": "2026-10-09T08:00:00.000Z"
      }
    ]
  }
  ```

---

### 4.3 Download Submission Artifact
* **Method:** `GET`
* **Endpoint:** `/api/submissions/:id/file`
* **Access:** Authenticated (Owner Student OR Any Faculty)
* **Zero Trust Rule:** If a student attempts to download a submission belonging to another student, the backend responds with **403 Forbidden**:
  ```json
  {
    "success": false,
    "error": "Forbidden",
    "message": "Access denied: You do not have permission to view or download this submission."
  }
  ```

---

## 5. Faculty Evaluation Endpoints

### 5.1 Review Submissions Across Coursework
* **Method:** `GET`
* **Endpoint:** `/api/faculty/submissions`
* **Access:** Faculty Only (`role == 'faculty'`)

---

### 5.2 Grade Student Submission
* **Method:** `PUT`
* **Endpoint:** `/api/faculty/submissions/:id/grade`
* **Access:** Faculty Only (`role == 'faculty'`)
* **Request Body:**
  ```json
  {
    "marks": 92,
    "feedback": "Exceptional cryptographic proof and analysis."
  }
  ```

---

## 6. Security Audit Endpoints

### 6.1 View Tamper-Evident Access Logs
* **Method:** `GET`
* **Endpoint:** `/api/security/logs`
* **Access:** Authenticated
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "audit-uuid",
        "user_id": "student-uuid",
        "user_name": "Vijay T",
        "endpoint": "/api/submissions",
        "action": "SUBMISSION_CREATE",
        "result": "ALLOW",
        "ip_address": "127.0.0.1",
        "timestamp": "2026-10-09T08:15:32.100Z"
      }
    ]
  }
  ```

---

## 7. System Health Check

### 7.1 Origin Health Status
* **Method:** `GET`
* **Endpoint:** `/api/health`
* **Access:** Public
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "ZeroTrust Assignment Gateway API is running",
    "environment": "development",
    "uptime": 124,
    "timestamp": "2026-10-09T05:00:00.000Z"
  }
  ```
