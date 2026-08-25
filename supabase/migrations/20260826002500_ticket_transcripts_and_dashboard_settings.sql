CREATE TABLE IF NOT EXISTS public.ticket_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  ticket_id text NOT NULL,
  channel_id text,
  channel_name text,
  opener_id text NOT NULL,
  opener_name text,
  closer_id text,
  closer_name text,
  claimer_id text,
  claimer_name text,
  reason text,
  opened_at timestamptz,
  closed_at timestamptz NOT NULL DEFAULT now(),
  message_count integer NOT NULL DEFAULT 0,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, ticket_id)
);

CREATE INDEX IF NOT EXISTS ticket_transcripts_guild_closed_idx
  ON public.ticket_transcripts(guild_id, closed_at DESC);
CREATE INDEX IF NOT EXISTS ticket_transcripts_opener_idx
  ON public.ticket_transcripts(opener_id, closed_at DESC);

CREATE TABLE IF NOT EXISTS public.guild_dashboard_settings (
  guild_id text PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.ticket_transcripts TO service_role;
GRANT ALL ON public.guild_dashboard_settings TO service_role;
ALTER TABLE public.ticket_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_dashboard_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role transcripts" ON public.ticket_transcripts;
CREATE POLICY "service role transcripts" ON public.ticket_transcripts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service role dashboard settings" ON public.guild_dashboard_settings;
CREATE POLICY "service role dashboard settings" ON public.guild_dashboard_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
