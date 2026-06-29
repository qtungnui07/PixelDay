create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  color text not null default '#88C0D0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calendar_events_user_starts_idx on calendar_events(user_id, starts_at asc);
