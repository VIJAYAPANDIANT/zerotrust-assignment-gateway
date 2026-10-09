# Institutional User Credentials Directory

This document contains the complete pre-enrolled user directory for the **ZeroTrust Assignment Submission Gateway**. 

The system operates on an **Enterprise Closed-Enrollment Model**: public self-registration is permanently disabled, and all authorized student, faculty, and administrative accounts are pre-provisioned in the database.

---

## 1. Directory Overview & Authentication Policy

* **Total Pre-Provisioned Accounts:** 36 Active Academic Identities
  * **System Administrators:** 1 Primary Admin (`vijayapandian112007@gmail.com`) + 1 Fallback Test Admin
  * **Faculty Evaluators:** 5 Pre-Enrolled Evaluators
  * **Enrolled Students:** 30 Pre-Enrolled Coursework Candidates
* **Default Initial Password:** `123456` *(Bcrypt 10-round salted hash)*
* **Authentication Method:** Email & Password with JWT Session Issuance (`24h` expiration)
* **Self-Service Recovery:** Integrated **Forgot Password** feature allows users to verify their registered email and update their credentials independently.

---

## 2. System Administrator Directory

Administrators possess global system visibility, access to tamper-evident audit logs (`/security/logs`), and telemetry monitoring across edge and origin layers.

| # | Full Name | Username / Identifier | Registered Email | Default Password | Role | Access Scope |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Vijaypandian T** | `admin.vijaypandian` | `vijayapandian112007@gmail.com` | `123456` | `admin` | **Global Administration & Security Audits** |
| **2** | Security Administrator | `admin.secops` | `admin@zerotrust.local` | `123456` | `admin` | Local Fallback / Automated Test Suite |

---

## 3. Faculty Evaluator Directory (5 Accounts)

Faculty evaluators have authority to view student submissions, evaluate uploaded binary artifacts, assign marks (0–100), and return qualitative feedback. Faculty members are strictly prohibited from submitting coursework or accessing administrative configuration endpoints.

| # | Full Name | Academic Title | Registered Email | Default Password | Role | Assigned Coursework |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Dr. Alan Vance** | Lead Professor | `faculty.alan@gateway.edu` | `123456` | `faculty` | CS-801: Zero Trust Architecture & Microsegmentation |
| **2** | **Prof. Sarah Connor** | Associate Professor | `faculty.sarah@gateway.edu` | `123456` | `faculty` | CS-802: Cloudflare Access & Outbound Tunnel Ingress |
| **3** | **Dr. Murugan K** | Assistant Professor | `faculty.murugan@gateway.edu` | `123456` | `faculty` | CS-803: Cryptographic Verification of Edge Identity |
| **4** | **Prof. Elena Rostova** | Senior Evaluator | `faculty.elena@gateway.edu` | `123456` | `faculty` | CS-804: Continuous Authorization & NIST SP 800-207 |
| **5** | **Dr. Ramanujan S** | Research Chair | `faculty.ramanujan@gateway.edu` | `123456` | `faculty` | CS-805: Distributed Systems & Cryptographic Primitives |

---

## 4. Student Directory (30 Pre-Enrolled Students)

Students have permission to view active coursework, submit assignment files, view their own evaluation reports, and download their own historical submissions. Under Zero Trust rules, **students can never access another student's submission files or evaluate coursework**.

| # | Student Full Name | Student Roll ID | Registered Email Address | Default Password | Role |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Vijay T** *(Primary)* | `STU-2026-0001` | `vijayapandiant07@gmail.com` | `123456` | `student` |
| **2** | Aarav Sharma | `STU-2026-0002` | `aarav.sharma@gateway.edu` | `123456` | `student` |
| **3** | Ananya Iyer | `STU-2026-0003` | `ananya.iyer@gateway.edu` | `123456` | `student` |
| **4** | Rohit Kumar | `STU-2026-0004` | `rohit.kumar@gateway.edu` | `123456` | `student` |
| **5** | Diya Patel | `STU-2026-0005` | `diya.patel@gateway.edu` | `123456` | `student` |
| **6** | Siddharth Menon | `STU-2026-0006` | `siddharth.menon@gateway.edu` | `123456` | `student` |
| **7** | Kavya Reddy | `STU-2026-0007` | `kavya.reddy@gateway.edu` | `123456` | `student` |
| **8** | Aditya Varma | `STU-2026-0008` | `aditya.varma@gateway.edu` | `123456` | `student` |
| **9** | Sneha Nair | `STU-2026-0009` | `sneha.nair@gateway.edu` | `123456` | `student` |
| **10** | Manoj Pandian | `STU-2026-0010` | `manoj.pandian@gateway.edu` | `123456` | `student` |
| **11** | Priya Ramesh | `STU-2026-0011` | `priya.ramesh@gateway.edu` | `123456` | `student` |
| **12** | Karthik S | `STU-2026-0012` | `karthik.s@gateway.edu` | `123456` | `student` |
| **13** | Meera Nambiar | `STU-2026-0013` | `meera.nambiar@gateway.edu` | `123456` | `student` |
| **14** | Arun Prakash | `STU-2026-0014` | `arun.prakash@gateway.edu` | `123456` | `student` |
| **15** | Divya Bharathi | `STU-2026-0015` | `divya.bharathi@gateway.edu` | `123456` | `student` |
| **16** | Sanjay Kumar | `STU-2026-0016` | `sanjay.kumar@gateway.edu` | `123456` | `student` |
| **17** | Pooja Hegde | `STU-2026-0017` | `pooja.hegde@gateway.edu` | `123456` | `student` |
| **18** | Naveen Raj | `STU-2026-0018` | `naveen.raj@gateway.edu` | `123456` | `student` |
| **19** | Swetha Krishnan | `STU-2026-0019` | `swetha.krishnan@gateway.edu` | `123456` | `student` |
| **20** | Harish Raghav | `STU-2026-0020` | `harish.raghav@gateway.edu` | `123456` | `student` |
| **21** | Soundarya M | `STU-2026-0021` | `soundarya.m@gateway.edu` | `123456` | `student` |
| **22** | Vignesh Waran | `STU-2026-0022` | `vignesh.waran@gateway.edu` | `123456` | `student` |
| **23** | Deepika P | `STU-2026-0023` | `deepika.p@gateway.edu` | `123456` | `student` |
| **24** | Rahul D | `STU-2026-0024` | `rahul.d@gateway.edu` | `123456` | `student` |
| **25** | Keerthi Suresh | `STU-2026-0025` | `keerthi.s@gateway.edu` | `123456` | `student` |
| **26** | Ashwin R | `STU-2026-0026` | `ashwin.r@gateway.edu` | `123456` | `student` |
| **27** | Anirudh R | `STU-2026-0027` | `anirudh.r@gateway.edu` | `123456` | `student` |
| **28** | Samantha R | `STU-2026-0028` | `samantha.r@gateway.edu` | `123456` | `student` |
| **29** | Surya S | `STU-2026-0029` | `surya.s@gateway.edu` | `123456` | `student` |
| **30** | Nithya Menen | `STU-2026-0030` | `nithya.m@gateway.edu` | `123456` | `student` |

---

## 5. Database Seeding & Resetting

All 36 accounts are pre-loaded in memory and in the PostgreSQL database. If you ever need to re-seed or synchronize the user directory:

```bash
cd backend
node scripts/seedUsers.js
```

### Script Execution Output:
```text
===========================================================
 ZeroTrust Institutional User Pre-Provisioning Script
 Target Users to Provision: 37
===========================================================
[OK] [ADMIN] Vijaypandian T <vijayapandian112007@gmail.com>
[OK] [ADMIN] Security Administrator <admin@zerotrust.local>
[OK] [STUDENT] Vijay T <vijayapandiant07@gmail.com>
[OK] [STUDENT] Aarav Sharma <aarav.sharma@gateway.edu>
...
[OK] [FACULTY] Dr. Alan Vance <faculty.alan@gateway.edu>
...
===========================================================
 Successfully provisioned 37/37 accounts.
 Default credentials: Password = 123456
===========================================================
```

---

## 6. Password Recovery (Forgot Password Workflow)

In compliance with self-service academic recovery:
1. Navigate to the login portal at **[http://localhost:5173](http://localhost:5173)**.
2. Click **Forgot Password?** beside the password field.
3. Enter your pre-enrolled institutional email address.
4. The system validates account registration against the directory.
5. Enter and confirm your new password (minimum 6 characters).
6. Password hash is immediately updated with salted bcrypt in the database, allowing instant sign-in.
