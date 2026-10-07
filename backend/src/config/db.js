import pkg from 'pg';
const { Pool } = pkg;
import { config } from './environment.js';
import crypto from 'crypto';

let pool = null;
let isDbConnected = false;

// Seed sample assignments for student testing
const defaultAssignments = [
  {
    id: 'a1111111-1111-4111-8111-111111111111',
    title: 'Zero Trust Architecture & Microsegmentation',
    description:
      'Analyze core Zero Trust principles (NIST SP 800-207) and explain how microsegmentation and continuous verification mitigate lateral movement in enterprise networks.',
    deadline: '2026-10-25T23:59:59.000Z',
    created_by: 'faculty-evaluator-uuid',
    faculty_name: 'Dr. Alan Vance',
    created_at: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'a2222222-2222-4222-8222-222222222222',
    title: 'Cloudflare Access & Outbound Tunnel Implementation',
    description:
      'Document the deployment of an outbound-only reverse tunnel using cloudflared. Evaluate the security posture differences between legacy VPNs and edge identity assertions.',
    deadline: '2026-11-05T23:59:59.000Z',
    created_by: 'faculty-evaluator-uuid',
    faculty_name: 'Dr. Alan Vance',
    created_at: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333',
    title: 'Cryptographic Verification of Edge Identity JWTs',
    description:
      'Implement an Express verification handler that parses Cf-Access-Jwt-Assertion headers and validates them using Cloudflare JWKS public keys.',
    deadline: '2026-11-20T23:59:59.000Z',
    created_by: 'faculty-evaluator-uuid',
    faculty_name: 'Dr. Alan Vance',
    created_at: '2026-10-03T10:00:00.000Z',
  },
];

// In-memory development repository for fallback testing
export const inMemoryData = {
  users: [],
  assignments: [...defaultAssignments],
  submissions: [],
  access_logs: [],
};

if (config.databaseUrl) {
  try {
    const isSupabaseOrRemote =
      config.databaseUrl.includes('supabase') ||
      config.databaseUrl.includes('sslmode=require') ||
      config.databaseUrl.includes('pooler');

    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: isSupabaseOrRemote ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });

    pool
      .query('SELECT NOW()')
      .then(async () => {
        isDbConnected = true;
        console.log('[Database] Connected to PostgreSQL / Supabase successfully.');

        // Optionally seed sample assignments if empty
        try {
          const countRes = await pool.query('SELECT COUNT(*) FROM assignments');
          if (parseInt(countRes.rows[0].count, 10) === 0) {
            console.log('[Database] Seeding initial sample assignments...');
            // Check if a faculty user exists to attach to
            const facRes = await pool.query("SELECT id FROM users WHERE role = 'faculty' LIMIT 1");
            const facultyId = facRes.rows[0]?.id;
            if (facultyId) {
              for (const a of defaultAssignments) {
                await pool.query(
                  'INSERT INTO assignments (id, title, description, deadline, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
                  [a.id, a.title, a.description, a.deadline, facultyId, a.created_at]
                );
              }
            }
          }
        } catch (seedErr) {
          console.warn('[Database] Seed check notice:', seedErr.message);
        }
      })
      .catch((err) => {
        console.warn(`[Database] PostgreSQL connection failed (${err.message}). Using in-memory fallback.`);
      });
  } catch (err) {
    console.warn(`[Database] Pool initialization error (${err.message}). Using in-memory fallback.`);
  }
} else {
  console.log('[Database] No DATABASE_URL specified. Running with in-memory development store.');
}

/**
 * Handle in-memory query simulation
 */
function handleInMemoryQuery(text, params) {
  const cleanSql = text.trim();

  // 1. SELECT user by email
  if (/SELECT.*FROM users.*WHERE.*email/is.test(cleanSql)) {
    const emailToFind = params[0]?.toLowerCase();
    const user = inMemoryData.users.find(
      (u) => u.email.toLowerCase() === emailToFind
    );
    return { rows: user ? [{ ...user }] : [] };
  }

  // 2. SELECT user by id
  if (/SELECT.*FROM users.*WHERE.*id/is.test(cleanSql)) {
    const idToFind = params[0];
    const user = inMemoryData.users.find((u) => u.id === idToFind);
    if (user) {
      const { password, ...safeUser } = user;
      return { rows: [{ ...safeUser }] };
    }
    return { rows: [] };
  }

  // 3. INSERT INTO users
  if (/INSERT INTO users/is.test(cleanSql)) {
    const [id, name, email, password, role] = params;
    const record = {
      id: id || crypto.randomUUID(),
      name,
      email,
      password,
      role,
      created_at: new Date().toISOString(),
    };
    inMemoryData.users.push(record);
    const { password: _, ...safeRecord } = record;
    return { rows: [safeRecord] };
  }

  // 4. SELECT assignment by id
  if (/SELECT.*FROM assignments.*WHERE.*id = \$1/is.test(cleanSql)) {
    const idToFind = params[0];
    const assignment = inMemoryData.assignments.find((a) => a.id === idToFind);
    return { rows: assignment ? [{ ...assignment }] : [] };
  }

  // 5. SELECT all assignments
  if (/SELECT.*FROM assignments/is.test(cleanSql)) {
    return { rows: [...inMemoryData.assignments] };
  }

  // 6. SELECT submissions for a student (with assignment JOIN)
  if (/SELECT.*FROM submissions.*WHERE.*student_id/is.test(cleanSql)) {
    const studentId = params[0];
    const studentSubmissions = inMemoryData.submissions
      .filter((s) => s.student_id === studentId)
      .map((s) => {
        const assignment = inMemoryData.assignments.find(
          (a) => a.id === s.assignment_id
        );
        return {
          ...s,
          assignment_title: assignment ? assignment.title : 'Assignment',
          assignment_deadline: assignment ? assignment.deadline : null,
        };
      });
    return { rows: studentSubmissions };
  }

  // 7. SELECT submission by assignment_id AND student_id
  if (/SELECT.*FROM submissions.*WHERE.*assignment_id.*student_id/is.test(cleanSql)) {
    const [assignmentId, studentId] = params;
    const sub = inMemoryData.submissions.find(
      (s) => s.assignment_id === assignmentId && s.student_id === studentId
    );
    return { rows: sub ? [{ ...sub }] : [] };
  }

  // 8. INSERT INTO submissions
  if (/INSERT INTO submissions/is.test(cleanSql)) {
    const [id, assignmentId, studentId, fileUrl] = params;
    // Check if duplicate
    const existingIndex = inMemoryData.submissions.findIndex(
      (s) => s.assignment_id === assignmentId && s.student_id === studentId
    );
    const record = {
      id: id || crypto.randomUUID(),
      assignment_id: assignmentId,
      student_id: studentId,
      file_url: fileUrl,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
      marks: null,
      feedback: null,
    };
    if (existingIndex >= 0) {
      inMemoryData.submissions[existingIndex] = {
        ...inMemoryData.submissions[existingIndex],
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
        status: 'resubmitted',
      };
      return { rows: [inMemoryData.submissions[existingIndex]] };
    } else {
      inMemoryData.submissions.push(record);
      return { rows: [record] };
    }
  }

  // 9. INSERT INTO access_logs
  if (/INSERT INTO access_logs/is.test(cleanSql)) {
    const [userId, endpoint, action, result, ipAddress] = params;
    const record = {
      id: crypto.randomUUID(),
      user_id: userId || null,
      endpoint,
      action,
      result,
      ip_address: ipAddress || '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    inMemoryData.access_logs.push(record);
    return { rows: [record] };
  }

  return { rows: [] };
}

/**
 * Executes a parameterized SQL query
 */
export const query = async (text, params = []) => {
  if (pool && isDbConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn(`[Database Query Fallback] ${err.message}`);
      return handleInMemoryQuery(text, params);
    }
  }

  if (pool) {
    try {
      const res = await pool.query(text, params);
      isDbConnected = true;
      return res;
    } catch (err) {
      // Fallback
    }
  }

  return handleInMemoryQuery(text, params);
};

export default { query };
