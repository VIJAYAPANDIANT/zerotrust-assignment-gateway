import { query } from '../src/config/db.js';
import { SEED_USERS } from '../src/config/seedUsers.data.js';

async function seed() {
  console.log('===========================================================');
  console.log(' ZeroTrust Institutional User Pre-Provisioning Script');
  console.log(` Target Users to Provision: ${SEED_USERS.length}`);
  console.log('===========================================================');

  let successCount = 0;
  for (const user of SEED_USERS) {
    try {
      await query(
        `INSERT INTO users (id, name, email, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE 
         SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role`,
        [user.id, user.name, user.email, user.password, user.role, user.created_at]
      );
      successCount++;
      console.log(`[OK] [${user.role.toUpperCase()}] ${user.name} <${user.email}>`);
    } catch (err) {
      console.error(`[ERR] Failed to seed ${user.email}:`, err.message);
    }
  }

  console.log('===========================================================');
  console.log(` Successfully provisioned ${successCount}/${SEED_USERS.length} accounts.`);
  console.log(' Default credentials: Password = 123456');
  console.log('===========================================================');
  process.exit(0);
}

seed();
