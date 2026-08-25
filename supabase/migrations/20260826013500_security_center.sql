-- Ware Security Center persistence
create table if not exists public.security_settings (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null unique,
  owner_discord_id text not null,
  log_channel_id text,
  dry_run_global boolean not null default false,
  profile text not null default 'medium',
  raidmode boolean not null default false,
  panicmode boolean not null default false,
  verification_mode text not null default 'off',
  verification_role_id text,
  captcha_difficulty text not null default 'medium',
  quarantine_role_id text,
  quarantine_channel_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.security_modules (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  module_key text not null,
  enabled boolean not null default false,
  dry_run boolean not null default false,
  punishment text not null default 'log',
  threshold_count integer not null default 1,
  threshold_seconds integer not null default 60,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guild_id, module_key)
);

create table if not exists public.security_list_entries (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  list_type text not null,
  entry_type text not null,
  value text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  module_key text,
  event_type text not null,
  actor_id text,
  target_id text,
  dry_run boolean not null default false,
  punishment text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_modules_guild_idx on public.security_modules(guild_id);
create index if not exists security_lists_guild_idx on public.security_list_entries(guild_id);
create index if not exists security_events_guild_created_idx on public.security_events(guild_id, created_at desc);

alter table public.security_settings enable row level security;
alter table public.security_modules enable row level security;
alter table public.security_list_entries enable row level security;
alter table public.security_events enable row level security;
