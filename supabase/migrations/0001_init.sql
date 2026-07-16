-- =====================================================================
-- VELANTHOR AFFILIATE SYSTEM — INITIAL SCHEMA
-- Postgres / Supabase. Multi-Tier ready. RLS enforced. GDPR-conscious.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
create type user_role as enum ('affiliate', 'admin', 'super_admin');
create type affiliate_status as enum ('pending', 'active', 'suspended', 'banned');
create type commission_type as enum ('percentage', 'fixed', 'lifetime', 'one_time');
create type commission_status as enum ('pending', 'approved', 'rejected', 'paid');
create type payout_status as enum ('open', 'approved', 'rejected', 'paid');
create type payout_method as enum ('paypal', 'sepa', 'crypto');
create type device_type as enum ('desktop', 'mobile', 'tablet', 'other');

-- ---------------------------------------------------------------------
-- USERS  (extends Supabase auth.users 1:1)
-- ---------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  role user_role not null default 'affiliate',
  email_verified boolean not null default false,
  two_factor_enabled boolean not null default false,
  two_factor_secret text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AFFILIATES
-- ---------------------------------------------------------------------
create table public.affiliates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  referral_code text not null unique,
  status affiliate_status not null default 'pending',

  -- Multi-tier support: an affiliate can have a parent (the affiliate who referred them)
  parent_affiliate_id uuid references public.affiliates(id) on delete set null,
  tier_level int not null default 1 check (tier_level between 1 and 5),

  country text,
  paypal_email text,
  iban text,
  bic text,
  bank_account_holder text,
  crypto_wallet_address text,
  preferred_payout_method payout_method default 'paypal',
  tax_id text,
  tax_country text,

  default_commission_rate numeric(6,3) not null default 20.000, -- percentage
  default_commission_type commission_type not null default 'percentage',

  total_clicks bigint not null default 0,
  total_conversions bigint not null default 0,
  total_revenue_generated numeric(14,2) not null default 0,
  total_commission_earned numeric(14,2) not null default 0,
  total_commission_paid numeric(14,2) not null default 0,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_affiliates_parent on public.affiliates(parent_affiliate_id);
create index idx_affiliates_status on public.affiliates(status);
create index idx_affiliates_referral_code on public.affiliates(referral_code);

-- ---------------------------------------------------------------------
-- CAMPAIGNS  (for UTM / marketing material grouping)
-- ---------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- COMMISSION PLANS  (multiple tariffs, tier-aware)
-- ---------------------------------------------------------------------
create table public.commission_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  type commission_type not null default 'percentage',
  tier_1_rate numeric(6,3) not null default 20.000,
  tier_2_rate numeric(6,3) not null default 5.000,
  tier_3_rate numeric(6,3) not null default 2.000,
  fixed_amount numeric(10,2),
  is_lifetime boolean not null default false,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.affiliates
  add column commission_plan_id uuid references public.commission_plans(id);

-- ---------------------------------------------------------------------
-- CLICKS  (GDPR-conscious: IP is hashed, not stored raw)
-- ---------------------------------------------------------------------
create table public.clicks (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,

  ip_hash text not null,               -- sha256(ip + daily_salt), never raw IP
  country_code text,
  device_type device_type default 'other',
  browser text,
  os text,
  referrer text,
  landing_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  session_id uuid not null,
  converted boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_clicks_affiliate on public.clicks(affiliate_id);
create index idx_clicks_session on public.clicks(session_id);
create index idx_clicks_created on public.clicks(created_at);
create index idx_clicks_campaign on public.clicks(campaign_id);

-- ---------------------------------------------------------------------
-- SESSIONS  (tracking session -> user identity resolution, 90-day cookie)
-- ---------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  click_id uuid references public.clicks(id) on delete set null,
  fingerprint text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_sessions_affiliate on public.sessions(affiliate_id);
create index idx_sessions_expires on public.sessions(expires_at);

-- ---------------------------------------------------------------------
-- REFERRALS  (a converted customer attributed to an affiliate)
-- ---------------------------------------------------------------------
create table public.referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  click_id uuid references public.clicks(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,

  customer_email text not null,
  customer_external_id text,          -- ID in the VELANTHOR core platform

  order_value numeric(14,2) not null default 0,
  is_recurring boolean not null default false,

  created_at timestamptz not null default now()
);

create index idx_referrals_affiliate on public.referrals(affiliate_id);
create index idx_referrals_customer on public.referrals(customer_external_id);

-- ---------------------------------------------------------------------
-- COMMISSIONS  (one row per referral per tier — supports multi-tier payout)
-- ---------------------------------------------------------------------
create table public.commissions (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referral_id uuid not null references public.referrals(id) on delete cascade,

  tier_level int not null default 1,          -- 1 = direct, 2 = sub-affiliate, ...
  type commission_type not null default 'percentage',
  rate numeric(6,3),
  base_amount numeric(14,2) not null,
  commission_amount numeric(14,2) not null,

  status commission_status not null default 'pending',
  approved_by uuid references public.users(id),
  approved_at timestamptz,
  paid_at timestamptz,

  notes text,
  created_at timestamptz not null default now()
);

create index idx_commissions_affiliate on public.commissions(affiliate_id);
create index idx_commissions_status on public.commissions(status);
create index idx_commissions_referral on public.commissions(referral_id);

-- ---------------------------------------------------------------------
-- PAYOUTS
-- ---------------------------------------------------------------------
create table public.payouts (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,

  amount numeric(14,2) not null,
  currency text not null default 'EUR',
  method payout_method not null,
  destination text not null,           -- paypal email / IBAN / wallet address (snapshot)

  status payout_status not null default 'open',
  requested_at timestamptz not null default now(),
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  paid_at timestamptz,
  rejection_reason text,
  transaction_reference text,

  commission_ids uuid[] not null default '{}'
);

create index idx_payouts_affiliate on public.payouts(affiliate_id);
create index idx_payouts_status on public.payouts(status);

-- ---------------------------------------------------------------------
-- MARKETING ASSETS
-- ---------------------------------------------------------------------
create table public.marketing_assets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text not null check (type in ('banner','logo','screenshot','social','video','text','email_template')),
  file_url text,
  content text,
  dimensions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SETTINGS  (single-row key/value store for platform-wide config)
-- ---------------------------------------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.users(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- LOGS  (audit trail)
-- ---------------------------------------------------------------------
create table public.logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index idx_logs_actor on public.logs(actor_id);
create index idx_logs_entity on public.logs(entity_type, entity_id);
create index idx_logs_created on public.logs(created_at);

-- =====================================================================
-- TRIGGERS: updated_at auto-touch
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_touch before update on public.users
  for each row execute function public.touch_updated_at();
create trigger trg_affiliates_touch before update on public.affiliates
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- TRIGGER: auto-create public.users row on auth signup
-- =====================================================================
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- =====================================================================
-- TRIGGER: keep affiliate aggregate stats in sync on new commission
-- =====================================================================
create or replace function public.on_commission_change()
returns trigger language plpgsql as $$
begin
  update public.affiliates
  set total_commission_earned = (
        select coalesce(sum(commission_amount), 0)
        from public.commissions
        where affiliate_id = new.affiliate_id and status in ('approved','paid')
      ),
      total_commission_paid = (
        select coalesce(sum(commission_amount), 0)
        from public.commissions
        where affiliate_id = new.affiliate_id and status = 'paid'
      )
  where id = new.affiliate_id;
  return new;
end;
$$;

create trigger trg_commission_change
  after insert or update on public.commissions
  for each row execute function public.on_commission_change();

-- =====================================================================
-- TRIGGER: auto-generate multi-tier commissions up the parent chain
-- Fires when a referral is inserted (i.e. a conversion happened).
-- =====================================================================
create or replace function public.generate_tiered_commissions()
returns trigger language plpgsql as $$
declare
  v_plan record;
  v_current_affiliate uuid := new.affiliate_id;
  v_tier int := 1;
  v_rate numeric;
  v_amount numeric;
begin
  select cp.* into v_plan
  from public.affiliates a
  join public.commission_plans cp on cp.id = a.commission_plan_id
  where a.id = new.affiliate_id;

  if v_plan is null then
    select * into v_plan from public.commission_plans where is_default = true limit 1;
  end if;

  while v_current_affiliate is not null and v_tier <= 3 loop
    v_rate := case v_tier
      when 1 then coalesce(v_plan.tier_1_rate, 20)
      when 2 then coalesce(v_plan.tier_2_rate, 5)
      when 3 then coalesce(v_plan.tier_3_rate, 2)
    end;

    if v_plan.type = 'fixed' and v_tier = 1 then
      v_amount := coalesce(v_plan.fixed_amount, 0);
    else
      v_amount := round(new.order_value * (v_rate / 100.0), 2);
    end if;

    if v_amount > 0 then
      insert into public.commissions
        (affiliate_id, referral_id, tier_level, type, rate, base_amount, commission_amount, status)
      values
        (v_current_affiliate, new.id, v_tier, v_plan.type, v_rate, new.order_value, v_amount, 'pending');
    end if;

    select parent_affiliate_id into v_current_affiliate
    from public.affiliates where id = v_current_affiliate;

    v_tier := v_tier + 1;
  end loop;

  update public.affiliates
  set total_conversions = total_conversions + 1,
      total_revenue_generated = total_revenue_generated + new.order_value
  where id = new.affiliate_id;

  return new;
end;
$$;

create trigger trg_referral_generate_commissions
  after insert on public.referrals
  for each row execute function public.generate_tiered_commissions();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.users enable row level security;
alter table public.affiliates enable row level security;
alter table public.clicks enable row level security;
alter table public.sessions enable row level security;
alter table public.referrals enable row level security;
alter table public.commissions enable row level security;
alter table public.payouts enable row level security;
alter table public.marketing_assets enable row level security;
alter table public.campaigns enable row level security;
alter table public.commission_plans enable row level security;
alter table public.settings enable row level security;
alter table public.logs enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','super_admin')
  );
$$;

-- USERS: user sees/edits own row; admins see all
create policy users_select_own on public.users for select
  using (id = auth.uid() or public.is_admin());
create policy users_update_own on public.users for update
  using (id = auth.uid() or public.is_admin());

-- AFFILIATES: affiliate sees own row; admins see all
create policy affiliates_select on public.affiliates for select
  using (user_id = auth.uid() or public.is_admin());
create policy affiliates_update_own on public.affiliates for update
  using (user_id = auth.uid() or public.is_admin());
create policy affiliates_insert_admin on public.affiliates for insert
  with check (user_id = auth.uid() or public.is_admin());

-- CLICKS / SESSIONS: affiliate sees own; write via service role only (API routes)
create policy clicks_select_own on public.clicks for select
  using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()) or public.is_admin());
create policy sessions_select_own on public.sessions for select
  using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()) or public.is_admin());

-- REFERRALS / COMMISSIONS: affiliate sees own
create policy referrals_select_own on public.referrals for select
  using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()) or public.is_admin());
create policy commissions_select_own on public.commissions for select
  using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()) or public.is_admin());

-- PAYOUTS: affiliate manages own requests; admin manages all
create policy payouts_select_own on public.payouts for select
  using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()) or public.is_admin());
create policy payouts_insert_own on public.payouts for insert
  with check (affiliate_id in (select id from public.affiliates where user_id = auth.uid()));
create policy payouts_update_admin on public.payouts for update
  using (public.is_admin());

-- MARKETING ASSETS / CAMPAIGNS: everyone authenticated can read active items
create policy marketing_assets_select on public.marketing_assets for select
  using (is_active = true or public.is_admin());
create policy marketing_assets_admin_write on public.marketing_assets for all
  using (public.is_admin()) with check (public.is_admin());

create policy campaigns_select on public.campaigns for select using (true);
create policy campaigns_admin_write on public.campaigns for all
  using (public.is_admin()) with check (public.is_admin());

create policy commission_plans_select on public.commission_plans for select using (true);
create policy commission_plans_admin_write on public.commission_plans for all
  using (public.is_admin()) with check (public.is_admin());

-- SETTINGS / LOGS: admin only
create policy settings_admin_only on public.settings for all
  using (public.is_admin()) with check (public.is_admin());
create policy logs_admin_only on public.logs for select
  using (public.is_admin());

-- =====================================================================
-- SEED: default commission plan
-- =====================================================================
insert into public.commission_plans (name, description, type, tier_1_rate, tier_2_rate, tier_3_rate, is_lifetime, is_default)
values ('Standard', 'Standard-Tarif für alle neuen Affiliates', 'percentage', 20, 5, 2, true, true);

insert into public.settings (key, value) values
  ('payout_minimum_amount', '25'),
  ('cookie_duration_days', '90'),
  ('platform_name', '"VELANTHOR"'),
  ('support_email', '"partner@velanthor.org"');
