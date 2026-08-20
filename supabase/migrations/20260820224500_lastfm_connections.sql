CREATE TABLE IF NOT EXISTS public.lastfm_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_user_id text NOT NULL UNIQUE,
  lastfm_username text NOT NULL,
  session_key text NOT NULL,
  subscriber boolean NOT NULL DEFAULT false,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lastfm_connections_discord_user_idx
  ON public.lastfm_connections(discord_user_id);

GRANT ALL ON public.lastfm_connections TO service_role;
ALTER TABLE public.lastfm_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access" ON public.lastfm_connections;
CREATE POLICY "service role full access" ON public.lastfm_connections
  FOR ALL TO service_role USING (true) WITH CHECK (true);
