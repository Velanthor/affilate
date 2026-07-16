-- =====================================================================
-- RATE LIMITING — works on serverless/Vercel without Redis.
-- Simple sliding-window counter backed by Postgres (Supabase Free Tier).
-- =====================================================================

create table public.rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- No public policies: only accessible via service-role key from API routes.

create or replace function public.check_rate_limit(
  p_key text,
  p_max_attempts int,
  p_window_seconds int
) returns boolean
language plpgsql security definer as $$
declare
  v_row public.rate_limits%rowtype;
begin
  select * into v_row from public.rate_limits where key = p_key for update;

  if v_row is null then
    insert into public.rate_limits (key, count, window_start) values (p_key, 1, now());
    return true;
  end if;

  if now() - v_row.window_start > (p_window_seconds || ' seconds')::interval then
    update public.rate_limits set count = 1, window_start = now() where key = p_key;
    return true;
  end if;

  if v_row.count >= p_max_attempts then
    return false;
  end if;

  update public.rate_limits set count = count + 1 where key = p_key;
  return true;
end;
$$;

-- Housekeeping: drop rows older than 1 day (call periodically via cron or on-demand)
create or replace function public.cleanup_rate_limits()
returns void language sql as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;
