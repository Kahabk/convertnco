-- Run this once in Supabase -> SQL Editor for an existing deployment.
-- All reads and writes go through the server-side service role; no public
-- table policies are intentionally created.
create extension if not exists pgcrypto;

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

alter table public.enquiries enable row level security;

-- Atomic, privacy-preserving counters. This rate-limit table stores only HMAC
-- hashes, never raw visitor IP addresses or raw email identifiers.
create table if not exists public.enquiry_rate_limits (
  identifier_hash text not null check (identifier_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  attempts integer not null default 1 check (attempts > 0),
  primary key (identifier_hash, window_started_at)
);
create index if not exists enquiry_rate_limits_cleanup_idx
  on public.enquiry_rate_limits(window_started_at);

alter table public.enquiry_rate_limits enable row level security;

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

-- Even a browser with a publishable key receives no table/function access.
revoke all on table public.enquiries from anon, authenticated;
revoke all on table public.enquiry_rate_limits from anon, authenticated;
grant select, insert on table public.enquiries to service_role;
revoke all on function public.consume_enquiry_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_enquiry_rate_limit(text, integer, integer) to service_role;
