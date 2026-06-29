import cors from '@fastify/cors';
import Fastify from 'fastify';

import { env } from './env.js';
import { pool } from './db.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((origin) => origin.trim()),
});

function getUserId(headers: Record<string, unknown>) {
  const headerValue = headers['x-user-id'];

  if (typeof headerValue === 'string' && headerValue.trim()) {
    return headerValue.trim();
  }

  return '00000000-0000-0000-0000-000000000001';
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

app.get('/tasks', async (request) => {
  const userId = getUserId(request.headers);
  const result = await pool.query(
    `select id, title, time_label as "time", status, tag, priority, category, scope, created_at as "createdAt", updated_at as "updatedAt"
     from tasks
     where user_id = $1
     order by created_at desc`,
    [userId]
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
  const userId = getUserId(request.headers);
  const title = request.body.title?.trim();

  if (!title) {
    return reply.code(400).send({ error: 'title is required' });
  }

  const result = await pool.query(
    `insert into tasks (user_id, title, time_label, tag, priority, category, scope)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, title, time_label as "time", status, tag, priority, category, scope, created_at as "createdAt", updated_at as "updatedAt"`,
    [
      userId,
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
  const userId = getUserId(request.headers);
  const status = request.body.status?.trim();

  if (!status || !['active', 'done', 'later'].includes(status)) {
    return reply.code(400).send({ error: 'status must be active, done, or later' });
  }

  const result = await pool.query(
    `update tasks
     set status = $1, updated_at = now()
     where id = $2 and user_id = $3
     returning id, title, time_label as "time", status, tag, priority, category, scope, created_at as "createdAt", updated_at as "updatedAt"`,
    [status, request.params.id, userId]
  );

  if (!result.rowCount) {
    return reply.code(404).send({ error: 'task not found' });
  }

  return { task: result.rows[0] };
});

app.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
  const userId = getUserId(request.headers);
  const result = await pool.query('delete from tasks where id = $1 and user_id = $2', [
    request.params.id,
    userId,
  ]);

  if (!result.rowCount) {
    return reply.code(404).send({ error: 'task not found' });
  }

  return reply.code(204).send();
});

app.get<{ Params: { dateKey: string } }>('/diary/:dateKey', async (request) => {
  const userId = getUserId(request.headers);
  const result = await pool.query(
    `select date_key as "dateKey", content, photo_uris as "photoUris", updated_at as "updatedAt"
     from diary_entries
     where user_id = $1 and date_key = $2`,
    [userId, request.params.dateKey]
  );

  return { entry: result.rows[0] ?? null };
});

app.put<{
  Params: { dateKey: string };
  Body: { content?: string; photoUris?: string[] };
}>('/diary/:dateKey', async (request) => {
  const userId = getUserId(request.headers);
  const result = await pool.query(
    `insert into diary_entries (user_id, date_key, content, photo_uris)
     values ($1, $2, $3, $4)
     on conflict (user_id, date_key)
     do update set content = excluded.content, photo_uris = excluded.photo_uris, updated_at = now()
     returning date_key as "dateKey", content, photo_uris as "photoUris", updated_at as "updatedAt"`,
    [userId, request.params.dateKey, request.body.content ?? '', request.body.photoUris ?? []]
  );

  return { entry: result.rows[0] };
});

app.get('/events', async (request) => {
  const userId = getUserId(request.headers);
  const result = await pool.query(
    `select id, title, starts_at as "startsAt", ends_at as "endsAt", color
     from calendar_events
     where user_id = $1
     order by starts_at asc`,
    [userId]
  );

  return { events: result.rows };
});

try {
  await app.listen({ host: env.host, port: env.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
