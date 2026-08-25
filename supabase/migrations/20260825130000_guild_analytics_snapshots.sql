CREATE TABLE IF NOT EXISTS public.guild_analytics_snapshots (
  guild_id text PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guild_analytics_snapshots_updated_at_idx
  ON public.guild_analytics_snapshots(updated_at DESC);

GRANT ALL ON public.guild_analytics_snapshots TO service_role;
ALTER TABLE public.guild_analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access" ON public.guild_analytics_snapshots;
CREATE POLICY "service role full access" ON public.guild_analytics_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);
