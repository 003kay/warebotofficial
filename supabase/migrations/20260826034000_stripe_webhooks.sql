create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  customer_id text,
  subscription_id text,
  payment_intent_id text,
  discord_user_id text,
  guild_id text,
  plan text,
  livemode boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_type_idx
  on public.stripe_webhook_events(event_type);
create index if not exists stripe_webhook_events_discord_idx
  on public.stripe_webhook_events(discord_user_id);
create index if not exists stripe_webhook_events_created_idx
  on public.stripe_webhook_events(created_at desc);

create table if not exists public.stripe_entitlements (
  id uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  guild_id text,
  plan text not null default 'unknown',
  status text not null default 'pending',
  customer_id text,
  subscription_id text,
  checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists stripe_entitlements_identity_idx
  on public.stripe_entitlements(discord_user_id, coalesce(guild_id, ''));
create index if not exists stripe_entitlements_subscription_idx
  on public.stripe_entitlements(subscription_id);
create index if not exists stripe_entitlements_customer_idx
  on public.stripe_entitlements(customer_id);

alter table public.stripe_webhook_events enable row level security;
alter table public.stripe_entitlements enable row level security;
