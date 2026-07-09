
CREATE TABLE public.discord_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_discord_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.discord_sessions TO service_role;
ALTER TABLE public.discord_sessions ENABLE ROW LEVEL SECURITY;
-- No policies: table is only accessed server-side via service_role.

CREATE TABLE public.ticket_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT NOT NULL UNIQUE,
  owner_discord_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Support',
  description TEXT NOT NULL DEFAULT 'Click the button below to open a ticket.',
  color TEXT NOT NULL DEFAULT '#5865F2',
  button_label TEXT NOT NULL DEFAULT 'Open Ticket',
  button_emoji TEXT NOT NULL DEFAULT '🎫',
  button_style TEXT NOT NULL DEFAULT 'primary',
  welcome_message TEXT NOT NULL DEFAULT 'Thanks for opening a ticket! Support will be with you shortly.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ticket_panels TO service_role;
ALTER TABLE public.ticket_panels ENABLE ROW LEVEL SECURITY;
-- Access mediated server-side; server verifies Discord MANAGE_GUILD before writes.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_discord_sessions_updated_at
  BEFORE UPDATE ON public.discord_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_panels_updated_at
  BEFORE UPDATE ON public.ticket_panels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
