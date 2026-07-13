
-- Global per-guild security settings
CREATE TABLE public.security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL UNIQUE,
  owner_discord_id text NOT NULL,
  log_channel_id text,
  dry_run_global boolean NOT NULL DEFAULT false,
  profile text NOT NULL DEFAULT 'medium',
  raidmode boolean NOT NULL DEFAULT false,
  panicmode boolean NOT NULL DEFAULT false,
  verification_mode text NOT NULL DEFAULT 'off',
  verification_role_id text,
  captcha_difficulty text NOT NULL DEFAULT 'medium',
  quarantine_role_id text,
  quarantine_channel_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.security_settings TO service_role;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON public.security_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_security_settings_updated
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-module configuration
CREATE TABLE public.security_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  module_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  dry_run boolean NOT NULL DEFAULT false,
  punishment text NOT NULL DEFAULT 'strip',
  threshold_count integer NOT NULL DEFAULT 3,
  threshold_seconds integer NOT NULL DEFAULT 60,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, module_key)
);

CREATE INDEX security_modules_guild_idx ON public.security_modules(guild_id);

GRANT ALL ON public.security_modules TO service_role;
ALTER TABLE public.security_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON public.security_modules
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_security_modules_updated
  BEFORE UPDATE ON public.security_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generic list entries: trusted users, whitelist, extra-owners, name filters, scam domains, etc.
CREATE TABLE public.security_list_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  list_type text NOT NULL, -- 'trusted' | 'whitelist' | 'extra_owner' | 'name_filter' | 'link_whitelist' | 'scam_domain'
  entry_type text NOT NULL, -- 'user' | 'role' | 'bot' | 'pattern' | 'domain'
  value text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, list_type, entry_type, value)
);

CREATE INDEX security_list_guild_type_idx ON public.security_list_entries(guild_id, list_type);

GRANT ALL ON public.security_list_entries TO service_role;
ALTER TABLE public.security_list_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON public.security_list_entries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Security event log (bot writes here; dashboard reads for the audit tab)
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  module_key text,
  event_type text NOT NULL,
  actor_id text,
  target_id text,
  dry_run boolean NOT NULL DEFAULT false,
  punishment text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX security_events_guild_created_idx
  ON public.security_events(guild_id, created_at DESC);

GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON public.security_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
