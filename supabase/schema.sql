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

-- Enquiries submitted through the public website contact form. The public
-- browser never accesses this table directly; the server validates and writes.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text check (company is null or char_length(company) <= 160),
  service text check (service is null or service in ('Shopify website', 'AI automation', 'Product advertising', 'Digital marketing')),
  budget text check (budget is null or char_length(budget) <= 100),
  message text not null check (char_length(message) between 10 and 5000),
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
create index if not exists enquiries_email_idx on public.enquiries(email, created_at desc);

-- Atomic enquiry throttling. The server sends HMAC hashes only; raw IP
-- addresses and rate-limit email identifiers are never stored.
create table if not exists public.enquiry_rate_limits (
  identifier_hash text not null check (identifier_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  attempts integer not null default 1 check (attempts > 0),
  primary key (identifier_hash, window_started_at)
);
create index if not exists enquiry_rate_limits_cleanup_idx
  on public.enquiry_rate_limits(window_started_at);

create or replace function public.consume_enquiry_rate_limit(
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_attempts integer;
begin
  if p_identifier_hash !~ '^[a-f0-9]{64}$'
     or p_limit not between 1 and 100
     or p_window_seconds not between 60 and 86400 then
    raise exception 'Invalid rate-limit parameters';
  end if;

  v_window_started_at := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.enquiry_rate_limits (
    identifier_hash,
    window_started_at,
    attempts
  )
  values (p_identifier_hash, v_window_started_at, 1)
  on conflict (identifier_hash, window_started_at)
  do update set attempts = public.enquiry_rate_limits.attempts + 1
  returning attempts into v_attempts;

  delete from public.enquiry_rate_limits
  where window_started_at < clock_timestamp() - interval '2 days';

  return v_attempts <= p_limit;
end;
$$;

-- Lock the tables: only our server (service-role key) can read/write.
-- The browser never talks to Supabase directly.
alter table audits enable row level security;
alter table audit_pages enable row level security;
alter table user_plans enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_rate_limits enable row level security;

revoke all on table public.enquiries from anon, authenticated;
revoke all on table public.enquiry_rate_limits from anon, authenticated;
grant select, insert on table public.enquiries to service_role;
revoke all on function public.consume_enquiry_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_enquiry_rate_limit(text, integer, integer) to service_role;

-- Private bucket for screenshots
insert into storage.buckets (id, name, public)
values ('cro-screenshots', 'cro-screenshots', false)
on conflict (id) do nothing;
