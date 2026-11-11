-- Paste this whole file into Supabase -> SQL Editor -> New query -> Run
create extension if not exists pgcrypto;

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,              -- Firebase UID
  user_email text,
  url text not null,
  status text not null default 'processing',   -- processing | complete | failed
  overall_score int,
  summary jsonb,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists audits_user_idx on audits(user_id, created_at desc);

-- Subscription state is written only by trusted server-side billing/admin code.
-- Users without a row are treated as Free by the audit API.
create table if not exists user_plans (
  user_id text primary key,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  updated_at timestamptz not null default now()
);

create table if not exists audit_pages (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  position int not null,
  url text not null,
  status text not null default 'pending',      -- pending | processing | done | error
  title text,
  extracted jsonb,
  desktop_path text,
  mobile_path text,
  analysis jsonb,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists audit_pages_audit_idx on audit_pages(audit_id, position);

-- Lock the tables: only our server (service-role key) can read/write.
-- The browser never talks to Supabase directly.
alter table audits enable row level security;
alter table audit_pages enable row level security;
alter table user_plans enable row level security;

-- Private bucket for screenshots
insert into storage.buckets (id, name, public)
values ('cro-screenshots', 'cro-screenshots', false)
on conflict (id) do nothing;
