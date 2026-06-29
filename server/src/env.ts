import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? 8787}`,
  dataDir: process.env.DATA_DIR ?? process.env.UPLOAD_DIR ?? 'server-data',
  personalUserEmail: process.env.PERSONAL_USER_EMAIL ?? 'me@pixelday.local',
  personalUserName: process.env.PERSONAL_USER_NAME ?? 'PixelDay',
};

export function requireDatabaseUrl() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return env.databaseUrl;
}
