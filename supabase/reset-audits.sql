-- ONE-TIME RESET: removes every CRO audit, every audited page, and therefore
-- every user's audit usage count. Firebase login accounts and plan records are
-- intentionally preserved.
--
-- Run this in Supabase Dashboard -> SQL Editor only when you really want to
-- clear the shared audit history for all users.

truncate table public.audits cascade;
