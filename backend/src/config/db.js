import pkg from 'pg';
const { Pool } = pkg;
import { config } from './environment.js';
import crypto from 'crypto';

let pool = null;
let isDbConnected = false;

// In-memory development repository for fallback testing
const inMemoryData = {
  users: [],
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
      .then(() => {
        isDbConnected = true;
        console.log('[Database] Connected to PostgreSQL / Supabase successfully.');
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
 * Handle in-memory query simulation for users and access_logs
 */
function handleInMemoryQuery(text, params) {
  const cleanSql = text.trim();

  // 1. SELECT user by email
  if (/SELECT.*FROM users.*WHERE.*email/i.test(cleanSql)) {
    const emailToFind = params[0]?.toLowerCase();
    const user = inMemoryData.users.find(
      (u) => u.email.toLowerCase() === emailToFind
    );
    return { rows: user ? [{ ...user }] : [] };
  }

  // 2. SELECT user by id
  if (/SELECT.*FROM users.*WHERE.*id/i.test(cleanSql)) {
    const idToFind = params[0];
    const user = inMemoryData.users.find((u) => u.id === idToFind);
    if (user) {
      const { password, ...safeUser } = user;
      return { rows: [{ ...safeUser }] };
    }
    return { rows: [] };
  }

  // 3. INSERT INTO users
  if (/INSERT INTO users/i.test(cleanSql)) {
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

  // 4. INSERT INTO access_logs
  if (/INSERT INTO access_logs/i.test(cleanSql)) {
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
 * @param {string} text - SQL query string
 * @param {Array} params - Parameter values
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
