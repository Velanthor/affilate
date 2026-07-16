-- Atomic counters to avoid read-then-write race conditions under concurrent traffic.

create or replace function public.increment_affiliate_clicks(p_affiliate_id uuid)
returns void language sql as $$
  update public.affiliates set total_clicks = total_clicks + 1 where id = p_affiliate_id;
$$;

create or replace function public.increment_affiliate_clicks(p_affiliate_id uuid, p_amount int)
returns void language sql as $$
  update public.affiliates set total_clicks = total_clicks + p_amount where id = p_affiliate_id;
$$;
