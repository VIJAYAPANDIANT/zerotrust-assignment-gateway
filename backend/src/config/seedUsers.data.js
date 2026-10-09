/**
 * Pre-configured Enterprise User Directory
 * - 1 Main System Admin
 * - 30 Pre-enrolled Students (including primary student Vijay T)
 * - 5 Pre-enrolled Faculty Members
 * Default Password for all accounts: 123456
 * Pre-computed bcrypt hash (10 rounds): $2b$10$T8d5RAe4M6lEYpFK.pi1POiuVtTzvCp2FhyfJt5CDX3OCETXBo9aO
 */

export const BCRYPT_DEFAULT_PASSWORD_HASH =
  '$2b$10$T8d5RAe4M6lEYpFK.pi1POiuVtTzvCp2FhyfJt5CDX3OCETXBo9aO';

export const SEED_USERS = [
  // ==========================================
  // 1. MAIN SYSTEM ADMINISTRATOR
  // ==========================================
  {
    id: 'admin-00000000-0000-4000-8000-000000000001',
    name: 'Vijaypandian T',
    email: 'vijayapandian112007@gmail.com',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'admin',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'admin-00000000-0000-4000-8000-000000000000',
    name: 'Security Administrator',
    email: 'admin@zerotrust.local',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'admin',
    created_at: '2026-10-01T00:00:00.000Z',
  },

  // ==========================================
  // 2. PRIMARY STUDENT (Requested by User)
  // ==========================================
  {
    id: 'student-00000000-0000-4000-8000-000000000001',
    name: 'Vijay T',
    email: 'vijayapandiant07@gmail.com',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },

  // ==========================================
  // 3. 29 PRE-ENROLLED DEMO STUDENTS (Total: 30)
  // ==========================================
  {
    id: 'student-00000000-0000-4000-8000-000000000002',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000003',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000004',
    name: 'Rohit Kumar',
    email: 'rohit.kumar@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000005',
    name: 'Diya Patel',
    email: 'diya.patel@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000006',
    name: 'Siddharth Menon',
    email: 'siddharth.menon@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000007',
    name: 'Kavya Reddy',
    email: 'kavya.reddy@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000008',
    name: 'Aditya Varma',
    email: 'aditya.varma@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000009',
    name: 'Sneha Nair',
    email: 'sneha.nair@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000010',
    name: 'Manoj Pandian',
    email: 'manoj.pandian@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000011',
    name: 'Priya Ramesh',
    email: 'priya.ramesh@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000012',
    name: 'Karthik S',
    email: 'karthik.s@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000013',
    name: 'Meera Nambiar',
    email: 'meera.nambiar@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000014',
    name: 'Arun Prakash',
    email: 'arun.prakash@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000015',
    name: 'Divya Bharathi',
    email: 'divya.bharathi@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000016',
    name: 'Sanjay Kumar',
    email: 'sanjay.kumar@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000017',
    name: 'Pooja Hegde',
    email: 'pooja.hegde@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000018',
    name: 'Naveen Raj',
    email: 'naveen.raj@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000019',
    name: 'Swetha Krishnan',
    email: 'swetha.krishnan@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000020',
    name: 'Harish Raghav',
    email: 'harish.raghav@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000021',
    name: 'Soundarya M',
    email: 'soundarya.m@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000022',
    name: 'Vignesh Waran',
    email: 'vignesh.waran@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000023',
    name: 'Deepika P',
    email: 'deepika.p@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000024',
    name: 'Rahul Dravid',
    email: 'rahul.d@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000025',
    name: 'Keerthi Suresh',
    email: 'keerthi.s@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000026',
    name: 'Ashwin R',
    email: 'ashwin.r@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000027',
    name: 'Anirudh R',
    email: 'anirudh.r@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000028',
    name: 'Samantha Ruth',
    email: 'samantha.r@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000029',
    name: 'Surya Sivakumar',
    email: 'surya.s@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'student-00000000-0000-4000-8000-000000000030',
    name: 'Nithya Menen',
    email: 'nithya.m@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'student',
    created_at: '2026-10-01T00:00:00.000Z',
  },

  // ==========================================
  // 4. 5 PRE-ENROLLED DEMO FACULTY
  // ==========================================
  {
    id: 'faculty-00000000-0000-4000-8000-000000000001',
    name: 'Dr. Alan Vance',
    email: 'faculty.alan@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'faculty',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'faculty-00000000-0000-4000-8000-000000000002',
    name: 'Prof. Sarah Connor',
    email: 'faculty.sarah@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'faculty',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'faculty-00000000-0000-4000-8000-000000000003',
    name: 'Dr. Murugan K',
    email: 'faculty.murugan@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'faculty',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'faculty-00000000-0000-4000-8000-000000000004',
    name: 'Prof. Elena Rostova',
    email: 'faculty.elena@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'faculty',
    created_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'faculty-00000000-0000-4000-8000-000000000005',
    name: 'Dr. Ramanujan S',
    email: 'faculty.ramanujan@gateway.edu',
    password: BCRYPT_DEFAULT_PASSWORD_HASH,
    role: 'faculty',
    created_at: '2026-10-01T00:00:00.000Z',
  },
];
