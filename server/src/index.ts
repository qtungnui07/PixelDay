import cors from '@fastify/cors';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

import { env } from './env.js';
import { pool } from './db.js';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

type UploadedImageBody = {
  data?: string;
  fileName?: string;
  mimeType?: string;
};

const app = Fastify({
  logger: true,
  bodyLimit: 12 * 1024 * 1024,
});

const dataRoot = resolve(process.cwd(), env.dataDir);
const tokenTtlMs = 1000 * 60 * 60 * 24 * 30;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

await app.register(cors, {
  origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((origin) => origin.trim()),
});

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');

  return `pbkdf2_sha256$120000$${salt}$${derived}`;
}

function verifyPassword(password: string, passwordHash: string | null) {
  if (!passwordHash) {
    return false;
  }

  const [algorithm, iterationsValue, salt, expected] = passwordHash.split('$');

  if (algorithm !== 'pbkdf2_sha256' || !iterationsValue || !salt || !expected) {
    return false;
  }

  const actual = pbkdf2Sync(password, salt, Number(iterationsValue), 32, 'sha256');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

function normalizeDisplayName(displayName: string | undefined, email: string) {
  const fallback = email.split('@')[0] || 'PixelDay';
  return displayName?.trim() || fallback;
}

function mapUser(row: { id: string; email: string; display_name: string }): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
  };
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + tokenTtlMs);

  await pool.query(
    `insert into auth_sessions (user_id, token_hash, expires_at)
     values ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt]
  );

  return { token, expiresAt: expiresAt.toISOString() };
}

function getBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const token = getBearerToken(request);

  if (!token) {
    reply.code(401).send({ error: 'authentication required' });
    return null;
  }

  const result = await pool.query(
    `select users.id, users.email, users.display_name
     from auth_sessions
     join users on users.id = auth_sessions.user_id
     where auth_sessions.token_hash = $1 and auth_sessions.expires_at > now()`,
    [hashToken(token)]
  );

  if (!result.rowCount) {
    reply.code(401).send({ error: 'invalid or expired token' });
    return null;
  }

  return mapUser(result.rows[0]);
}

function parseDataUrl(data: string | undefined, fallbackMimeType: string | undefined) {
  if (!data) {
    return null;
  }

  const dataUrlMatch = data.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = dataUrlMatch?.[1] ?? fallbackMimeType ?? 'image/jpeg';
  const base64 = dataUrlMatch?.[2] ?? data;

  if (!allowedImageTypes.has(mimeType)) {
    return null;
  }

  return {
    buffer: Buffer.from(base64, 'base64'),
    extension: mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg',
    mimeType,
  };
}

function formatEventTime(startsAt: string, endsAt?: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return end ? `${formatter.format(start)} - ${formatter.format(end)}` : formatter.format(start);
}

function getDiaryDir(userId: string, dateKey: string) {
  return resolve(dataRoot, 'users', userId, 'diary', dateKey);
}

async function writeDiarySnapshot(input: {
  userId: string;
  dateKey: string;
  content: string;
  photoUris: string[];
  updatedAt?: string;
}) {
  const diaryDir = getDiaryDir(input.userId, input.dateKey);

  await mkdir(diaryDir, { recursive: true });
  await Promise.all([
    writeFile(resolve(diaryDir, 'entry.txt'), input.content || '', 'utf8'),
    writeFile(
      resolve(diaryDir, 'entry.json'),
      `${JSON.stringify(
        {
          dateKey: input.dateKey,
          content: input.content,
          photoUris: input.photoUris,
          updatedAt: input.updatedAt ?? new Date().toISOString(),
        },
        null,
        2
      )}\n`,
      'utf8'
    ),
  ]);
}

app.get('/health', async () => {
  const startedAt = Date.now();
  await pool.query('select 1');

  return {
    ok: true,
    database: 'ok',
    latencyMs: Date.now() - startedAt,
    service: 'pixelday-api',
  };
});

app.post<{
  Body: {
    email?: string;
    password?: string;
    displayName?: string;
  };
}>('/auth/register', async (request, reply) => {
  const email = normalizeEmail(request.body.email);
  const password = request.body.password ?? '';

  if (!email || !email.includes('@')) {
    return reply.code(400).send({ error: 'email is invalid' });
  }

  if (password.length < 8) {
    return reply.code(400).send({ error: 'password must be at least 8 characters' });
  }

  try {
    const result = await pool.query(
      `insert into users (email, display_name, password_hash)
       values ($1, $2, $3)
       returning id, email, display_name`,
      [email, normalizeDisplayName(request.body.displayName, email), hashPassword(password)]
    );
    const user = mapUser(result.rows[0]);
    const session = await createSession(user.id);

    return reply.code(201).send({ user, session });
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      return reply.code(409).send({ error: 'email already exists' });
    }

    throw error;
  }
});

app.post<{
  Body: {
    email?: string;
    password?: string;
  };
}>('/auth/login', async (request, reply) => {
  const email = normalizeEmail(request.body.email);
  const password = request.body.password ?? '';
  const result = await pool.query(
    `select id, email, display_name, password_hash
     from users
     where email = $1`,
    [email]
  );
  const userRow = result.rows[0];

  if (!userRow || !verifyPassword(password, userRow.password_hash)) {
    return reply.code(401).send({ error: 'email or password is incorrect' });
  }

  const user = mapUser(userRow);
  const session = await createSession(user.id);

  return { user, session };
});

app.post('/auth/dev-login', async (request, reply) => {
  if (process.env.NODE_ENV === 'production') {
    return reply.code(404).send({ error: 'not found' });
  }

  const email = 'dev@pixelday.local';
  const result = await pool.query(
    `insert into users (email, display_name, password_hash)
     values ($1, $2, $3)
     on conflict (email)
     do update set display_name = excluded.display_name, updated_at = now()
     returning id, email, display_name`,
    [email, 'PixelDay Dev', hashPassword('Password!1')]
  );
  const user = mapUser(result.rows[0]);
  const session = await createSession(user.id);

  return { user, session };
});

app.post('/auth/personal', async () => {
  const email = process.env.PERSONAL_USER_EMAIL ?? 'me@pixelday.local';
  const displayName = process.env.PERSONAL_USER_NAME ?? 'PixelDay';
  const result = await pool.query(
    `insert into users (email, display_name)
     values ($1, $2)
     on conflict (email)
     do update set display_name = excluded.display_name, updated_at = now()
     returning id, email, display_name`,
    [email, displayName]
  );
  const user = mapUser(result.rows[0]);
  const session = await createSession(user.id);

  return { user, session };
});

app.post<{
  Body: {
    clerkUserId?: string;
    email?: string;
    displayName?: string;
  };
}>('/auth/clerk', async (request, reply) => {
  const clerkUserId = request.body.clerkUserId?.trim();
  const email = normalizeEmail(request.body.email);

  if (!clerkUserId || !email || !email.includes('@')) {
    return reply.code(400).send({ error: 'valid Clerk user and email are required' });
  }

  const result = await pool.query(
    `insert into users (email, display_name, clerk_user_id)
     values ($1, $2, $3)
     on conflict (email)
     do update set
       display_name = excluded.display_name,
       clerk_user_id = coalesce(users.clerk_user_id, excluded.clerk_user_id),
       updated_at = now()
     returning id, email, display_name`,
    [email, normalizeDisplayName(request.body.displayName, email), clerkUserId]
  );
  const user = mapUser(result.rows[0]);
  const session = await createSession(user.id);

  return { user, session };
});

app.get('/auth/me', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  return { user };
});

app.get('/profile/summary', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const nextMonthStart = new Date(monthStart);
  nextMonthStart.setMonth(monthStart.getMonth() + 1);

  const [
    taskStats,
    eventStats,
    diaryStats,
    todayTaskStats,
    todayEventStats,
    heatmapStats,
  ] = await Promise.all([
    pool.query(
      `select count(*) filter (where status = 'done')::int as "doneTasks",
              count(*) filter (where status <> 'done')::int as "openTasks"
       from tasks
       where user_id = $1`,
      [user.id]
    ),
    pool.query(
      `select count(*)::int as "events"
       from calendar_events
       where user_id = $1 and starts_at >= $2 and starts_at < $3`,
      [user.id, monthStart, nextMonthStart]
    ),
    pool.query(
      `select count(*)::int as "diaryCount"
       from diary_entries
       where user_id = $1 and (content <> '' or cardinality(photo_uris) > 0)`,
      [user.id]
    ),
    pool.query(
      `select count(*)::int as "todayOpenTasks"
       from tasks
       where user_id = $1 and status <> 'done'`,
      [user.id]
    ),
    pool.query(
      `select count(*)::int as "todayEvents"
       from calendar_events
       where user_id = $1
         and starts_at >= date_trunc('day', now())
         and starts_at < date_trunc('day', now()) + interval '1 day'`,
      [user.id]
    ),
    pool.query(
      `select date_key::text as "dateKey",
              ((case when content <> '' then 1 else 0 end) + cardinality(photo_uris))::int as count
       from diary_entries
       where user_id = $1 and date_key >= current_date - interval '34 days'
       order by date_key asc`,
      [user.id]
    ),
  ]);

  return {
    user,
    stats: {
      doneTasks: taskStats.rows[0]?.doneTasks ?? 0,
      openTasks: taskStats.rows[0]?.openTasks ?? 0,
      events: eventStats.rows[0]?.events ?? 0,
      diaryCount: diaryStats.rows[0]?.diaryCount ?? 0,
      todayOpenTasks: todayTaskStats.rows[0]?.todayOpenTasks ?? 0,
      todayEvents: todayEventStats.rows[0]?.todayEvents ?? 0,
    },
    heatmap: heatmapStats.rows,
  };
});

app.post('/auth/logout', async (request, reply) => {
  const token = getBearerToken(request);

  if (token) {
    await pool.query('delete from auth_sessions where token_hash = $1', [hashToken(token)]);
  }

  return reply.code(204).send();
});

app.get('/tasks', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const result = await pool.query(
    `select id, title, time_label as "time", status, tag, priority, category, scope, created_at as "createdAt", updated_at as "updatedAt"
     from tasks
     where user_id = $1
     order by created_at desc`,
    [user.id]
  );

  return { tasks: result.rows };
});

app.post<{
  Body: {
    title?: string;
    time?: string;
    tag?: string;
    priority?: string;
    category?: string;
    scope?: string;
  };
}>('/tasks', async (request, reply) => {
  const user = await requireUser(request, reply);
  const title = request.body.title?.trim();

  if (!user) {
    return;
  }

  if (!title) {
    return reply.code(400).send({ error: 'title is required' });
  }

  const result = await pool.query(
    `insert into tasks (user_id, title, time_label, tag, priority, category, scope)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, title, time_label as "time", status, tag, priority, category, scope, created_at as "createdAt", updated_at as "updatedAt"`,
    [
      user.id,
      title,
      request.body.time?.trim() || '--:--',
      request.body.tag?.trim() || request.body.category?.trim() || 'Cá nhân',
      request.body.priority?.trim() || 'Trung bình',
      request.body.category?.trim() || request.body.tag?.trim() || 'Cá nhân',
      request.body.scope?.trim() || 'Ngày',
    ]
  );

  return reply.code(201).send({ task: result.rows[0] });
});

app.patch<{
  Params: { id: string };
  Body: { status?: string };
}>('/tasks/:id', async (request, reply) => {
  const user = await requireUser(request, reply);
  const status = request.body.status?.trim();

  if (!user) {
    return;
  }

  if (!status || !['active', 'done', 'later'].includes(status)) {
    return reply.code(400).send({ error: 'status must be active, done, or later' });
  }

  const result = await pool.query(
    `update tasks
     set status = $1, updated_at = now()
     where id = $2 and user_id = $3
     returning id, title, time_label as "time", status, tag, priority, category, scope, created_at as "createdAt", updated_at as "updatedAt"`,
    [status, request.params.id, user.id]
  );

  if (!result.rowCount) {
    return reply.code(404).send({ error: 'task not found' });
  }

  return { task: result.rows[0] };
});

app.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const result = await pool.query('delete from tasks where id = $1 and user_id = $2', [
    request.params.id,
    user.id,
  ]);

  if (!result.rowCount) {
    return reply.code(404).send({ error: 'task not found' });
  }

  return reply.code(204).send();
});

app.get<{ Params: { dateKey: string } }>('/diary/:dateKey', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const result = await pool.query(
    `select date_key::text as "dateKey", content, photo_uris as "photoUris", updated_at as "updatedAt"
     from diary_entries
     where user_id = $1 and date_key = $2`,
    [user.id, request.params.dateKey]
  );

  return { entry: result.rows[0] ?? null };
});

app.put<{
  Params: { dateKey: string };
  Body: { content?: string; photoUris?: string[] };
}>('/diary/:dateKey', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const result = await pool.query(
    `insert into diary_entries (user_id, date_key, content, photo_uris)
     values ($1, $2, $3, $4)
     on conflict (user_id, date_key)
     do update set content = excluded.content, photo_uris = excluded.photo_uris, updated_at = now()
     returning date_key::text as "dateKey", content, photo_uris as "photoUris", updated_at as "updatedAt"`,
    [user.id, request.params.dateKey, request.body.content ?? '', request.body.photoUris ?? []]
  );
  const entry = result.rows[0];

  await writeDiarySnapshot({
    userId: user.id,
    dateKey: entry.dateKey,
    content: entry.content,
    photoUris: entry.photoUris,
    updatedAt: entry.updatedAt,
  });

  return { entry };
});

app.post<{
  Params: { dateKey: string };
  Body: UploadedImageBody;
}>('/diary/:dateKey/photos', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const parsed = parseDataUrl(request.body.data, request.body.mimeType);

  if (!parsed || parsed.buffer.length === 0) {
    return reply.code(400).send({ error: 'valid image data is required' });
  }

  const dateKey = request.params.dateKey;
  const userUploadDir = getDiaryDir(user.id, dateKey);
  const safeBaseName = (request.body.fileName ?? 'photo')
    .replace(extname(request.body.fileName ?? ''), '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 40) || 'photo';
  const fileName = `${Date.now()}-${safeBaseName}${parsed.extension}`;
  const filePath = resolve(userUploadDir, fileName);

  await mkdir(userUploadDir, { recursive: true });
  await writeFile(filePath, parsed.buffer);

  const photoUri = `${env.publicBaseUrl}/uploads/${user.id}/${dateKey}/${fileName}`;
  const entry = await pool.query(
    `insert into diary_entries (user_id, date_key, content, photo_uris)
     values ($1, $2, '', array[$3]::text[])
     on conflict (user_id, date_key)
     do update set photo_uris = array_append(diary_entries.photo_uris, $3), updated_at = now()
     returning date_key::text as "dateKey", content, photo_uris as "photoUris", updated_at as "updatedAt"`,
    [user.id, dateKey, photoUri]
  );
  const savedEntry = entry.rows[0];

  await writeDiarySnapshot({
    userId: user.id,
    dateKey: savedEntry.dateKey,
    content: savedEntry.content,
    photoUris: savedEntry.photoUris,
    updatedAt: savedEntry.updatedAt,
  });

  return reply.code(201).send({ photoUri, entry: savedEntry });
});

app.get<{ Params: { userId: string; dateKey: string; fileName: string } }>(
  '/uploads/:userId/:dateKey/:fileName',
  async (request, reply) => {
    const { userId, dateKey, fileName } = request.params;

    if (!/^[0-9a-f-]{36}$/.test(userId) || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || fileName.includes('..')) {
      return reply.code(404).send({ error: 'file not found' });
    }

    const filePath = resolve(getDiaryDir(userId, dateKey), fileName);
    const extension = extname(fileName).toLowerCase();
    const mimeType = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg';

    return reply.type(mimeType).send(createReadStream(filePath));
  }
);

app.get<{
  Querystring: { from?: string; to?: string };
}>('/events', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const result = await pool.query(
    `select id, title, starts_at as "startsAt", ends_at as "endsAt", color, source
     from calendar_events
     where user_id = $1
       and ($2::timestamptz is null or starts_at >= $2)
       and ($3::timestamptz is null or starts_at < $3)
     order by starts_at asc`,
    [user.id, request.query.from ?? null, request.query.to ?? null]
  );

  return {
    events: result.rows.map((event) => ({
      ...event,
      time: formatEventTime(event.startsAt, event.endsAt),
    })),
  };
});

app.post<{
  Body: { title?: string; startsAt?: string; endsAt?: string; color?: string };
}>('/events', async (request, reply) => {
  const user = await requireUser(request, reply);
  const title = request.body.title?.trim();

  if (!user) {
    return;
  }

  if (!title || !request.body.startsAt) {
    return reply.code(400).send({ error: 'title and startsAt are required' });
  }

  const result = await pool.query(
    `insert into calendar_events (user_id, title, starts_at, ends_at, color)
     values ($1, $2, $3, $4, $5)
     returning id, title, starts_at as "startsAt", ends_at as "endsAt", color, source`,
    [user.id, title, request.body.startsAt, request.body.endsAt ?? null, request.body.color ?? '#88C0D0']
  );
  const event = result.rows[0];

  return reply.code(201).send({
    event: {
      ...event,
      time: formatEventTime(event.startsAt, event.endsAt),
    },
  });
});

app.get('/calendar/google/status', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  const result = await pool.query(
    `select google_user_email as "googleUserEmail", updated_at as "updatedAt"
     from google_calendar_connections
     where user_id = $1`,
    [user.id]
  );

  return {
    connected: Boolean(result.rowCount),
    connection: result.rows[0] ?? null,
  };
});

app.post('/calendar/google/sync', async (request, reply) => {
  const user = await requireUser(request, reply);

  if (!user) {
    return;
  }

  return reply.code(501).send({
    error: 'google calendar oauth is not configured yet',
    nextStep: 'Add Google OAuth client credentials, then exchange an auth code for Calendar API tokens.',
  });
});

try {
  await mkdir(dataRoot, { recursive: true });
  await app.listen({ host: env.host, port: env.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
