import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { closePool, pool } from './db.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(currentDir, '../migrations/001_initial.sql');

async function main() {
  const sql = await readFile(migrationPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log('PixelDay database migrated');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
