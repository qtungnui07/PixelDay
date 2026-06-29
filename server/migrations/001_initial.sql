create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text not null,
  clerk_user_id text unique,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table users add column if not exists password_hash text;
alter table users add column if not exists clerk_user_id text unique;

create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_sessions_user_idx on auth_sessions(user_id);
create index if not exists auth_sessions_expires_idx on auth_sessions(expires_at);

insert into users (id, email, display_name)
values ('00000000-0000-0000-0000-000000000001', 'an.nhien@pixelday.app', 'An Nhiên')
on conflict (id) do nothing;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  time_label text not null default '',
  status text not null default 'active' check (status in ('active', 'done', 'later')),
  tag text not null default 'Cá nhân',
  priority text not null default 'Trung bình',
  category text not null default 'Cá nhân',
  scope text not null default 'Ngày',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_created_idx on tasks(user_id, created_at desc);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date_key date not null,
  content text not null default '',
  photo_uris text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date_key)
);

create index if not exists diary_entries_user_date_idx on diary_entries(user_id, date_key desc);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  external_id text,
  source text not null default 'local',
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  color text not null default '#88C0D0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table calendar_events add column if not exists external_id text;
alter table calendar_events add column if not exists source text not null default 'local';

create index if not exists calendar_events_user_starts_idx on calendar_events(user_id, starts_at asc);
create unique index if not exists calendar_events_user_source_external_idx
  on calendar_events(user_id, source, external_id)
  where external_id is not null;

create table if not exists google_calendar_connections (
  user_id uuid primary key references users(id) on delete cascade,
  google_user_email text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
