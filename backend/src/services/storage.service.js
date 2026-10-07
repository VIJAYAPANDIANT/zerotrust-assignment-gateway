import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { config } from '../config/environment.js';

let supabaseClient = null;

/**
 * Initialize or retrieve the Supabase client
 */
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (config.supabaseUrl && config.supabaseServiceRoleKey) {
    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('[StorageService] Initialized Supabase Storage Client successfully.');
    } catch (err) {
      console.warn('[StorageService] Failed to initialize Supabase client:', err.message);
    }
  }

  return supabaseClient;
}

/**
 * Sanitize filename to prevent directory traversal or special character issues
 */
function sanitizeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);
  return `${baseName}${ext}`;
}

/**
 * Local secure storage directory path (private, not statically exposed)
 */
const LOCAL_STORAGE_ROOT = path.resolve(process.cwd(), 'storage');

export const storageService = {
  /**
   * Check if live Supabase Storage is configured
   */
  isSupabaseConfigured() {
    return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
  },

  /**
   * Upload an assignment file buffer to Supabase Storage (or secure dev fallback)
   *
   * @param {Object} params
   * @param {string} params.studentId
   * @param {string} params.assignmentId
   * @param {Buffer} params.fileBuffer
   * @param {string} params.originalName
   * @param {string} params.mimeType
   * @returns {Promise<{ storagePath: string, provider: 'supabase' | 'local' }>}
   */
  async uploadSubmissionFile({ studentId, assignmentId, fileBuffer, originalName, mimeType }) {
    const cleanName = sanitizeFilename(originalName);
    const timestamp = Date.now();
    const relativeKey = `${studentId}/${assignmentId}/${timestamp}-${cleanName}`;
    const bucketName = config.supabaseBucket || 'assignments';

    const client = getSupabaseClient();

    if (client) {
      try {
        console.log(`[StorageService] Uploading artifact to Supabase Storage bucket "${bucketName}" at key: ${relativeKey}`);

        const { data, error } = await client.storage
          .from(bucketName)
          .upload(relativeKey, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) {
          console.warn('[StorageService] Supabase upload returned error:', error.message);
          throw error;
        }

        console.log('[StorageService] Upload succeeded on Supabase Storage:', data?.path || relativeKey);
        return {
          storagePath: `${bucketName}/${relativeKey}`,
          provider: 'supabase',
        };
      } catch (err) {
        console.warn(`[StorageService] Supabase upload failed (${err.message}). Using secure local store fallback.`);
      }
    }

    // Local Secure Storage Fallback (Offline / Development Mode)
    const targetDir = path.join(LOCAL_STORAGE_ROOT, bucketName, studentId, assignmentId);
    fs.mkdirSync(targetDir, { recursive: true });

    const localFilePath = path.join(targetDir, `${timestamp}-${cleanName}`);
    fs.writeFileSync(localFilePath, fileBuffer);

    console.log(`[StorageService] Saved file securely to local private storage: ${localFilePath}`);
    return {
      storagePath: `${bucketName}/${relativeKey}`,
      provider: 'local',
    };
  },

  /**
   * Generate secure access to an assignment artifact (via signed URL or stream)
   * Enforces Zero Trust: Never returns raw public URLs without authorization
   *
   * @param {Object} params
   * @param {string} params.filePath
   * @param {number} [params.expiresInSeconds=300]
   * @returns {Promise<{ type: 'signed_url' | 'local_file' | 'redirect', url?: string, absolutePath?: string, expiresIn?: number }>}
   */
  async getFileAccess({ filePath, expiresInSeconds = 300 }) {
    if (!filePath) {
      throw new Error('File path is required for file retrieval.');
    }

    // Direct HTTP(S) external URL fallback
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return { type: 'redirect', url: filePath };
    }

    const bucketName = config.supabaseBucket || 'assignments';
    let cleanKey = filePath;

    // Remove bucket prefix if present
    if (cleanKey.startsWith(`${bucketName}/`)) {
      cleanKey = cleanKey.substring(bucketName.length + 1);
    }

    const client = getSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client.storage
          .from(bucketName)
          .createSignedUrl(cleanKey, expiresInSeconds);

        if (!error && data?.signedUrl) {
          return {
            type: 'signed_url',
            url: data.signedUrl,
            expiresIn: expiresInSeconds,
            provider: 'supabase',
          };
        }
      } catch (err) {
        console.warn('[StorageService] Supabase signed URL generation failed:', err.message);
      }
    }

    // Check if local file exists
    const localCandidate = path.join(LOCAL_STORAGE_ROOT, bucketName, cleanKey);
    if (fs.existsSync(localCandidate)) {
      return {
        type: 'local_file',
        absolutePath: localCandidate,
        expiresIn: expiresInSeconds,
        provider: 'local',
      };
    }

    throw new Error('Requested submission artifact could not be found in storage.');
  },
};
