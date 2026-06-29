import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

export function requireDatabaseUrl() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return env.databaseUrl;
}
