import pg from 'pg';

import { requireDatabaseUrl } from './env.js';

export const pool = new pg.Pool({
  connectionString: requireDatabaseUrl(),
  max: 10,
});

export async function closePool() {
  await pool.end();
}
