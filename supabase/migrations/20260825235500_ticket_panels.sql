CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.ticket_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL UNIQUE,
  owner_discord_id text NOT NULL,
  title text NOT NULL DEFAULT 'Support Tickets',
  description text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#5865F2',
  panel_type text NOT NULL DEFAULT 'button' CHECK (panel_type IN ('button','dropdown')),
  dropdown_placeholder text NOT NULL DEFAULT 'Select a ticket category…',
  button_label text NOT NULL DEFAULT 'Open Ticket',
  button_emoji text NOT NULL DEFAULT '🎫',
  button_style text NOT NULL DEFAULT 'secondary',
  close_button_label text NOT NULL DEFAULT 'Close',
  close_button_emoji text NOT NULL DEFAULT '🔒',
  close_button_style text NOT NULL DEFAULT 'secondary',
  claim_button_label text NOT NULL DEFAULT 'Claim',
  claim_button_emoji text NOT NULL DEFAULT '📌',
  claim_button_style text NOT NULL DEFAULT 'secondary',
  command_prefix text NOT NULL DEFAULT ',',
  close_command text NOT NULL DEFAULT 'close',
  reopen_command text NOT NULL DEFAULT 'reopen',
  delete_command text NOT NULL DEFAULT 'delete',
  welcome_message text NOT NULL DEFAULT '',
  channel_id text,
  category_id text,
  log_channel_id text,
  support_role_ids text[] NOT NULL DEFAULT '{}'::text[],
  panel_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ticket_panel_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL REFERENCES public.ticket_panels(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '🎫',
  category_id text,
  support_role_ids text[] NOT NULL DEFAULT '{}'::text[],
  welcome_message text NOT NULL DEFAULT '',
  ticket_name_format text NOT NULL DEFAULT 'ticket-{number}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_panel_options_panel_id_idx
  ON public.ticket_panel_options(panel_id, position);

GRANT ALL ON public.ticket_panels TO service_role;
GRANT ALL ON public.ticket_panel_options TO service_role;

ALTER TABLE public.ticket_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_panel_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access" ON public.ticket_panels;
CREATE POLICY "service role full access" ON public.ticket_panels
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role full access" ON public.ticket_panel_options;
CREATE POLICY "service role full access" ON public.ticket_panel_options
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_ticket_panels_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_ticket_panels_updated_at ON public.ticket_panels;
CREATE TRIGGER set_ticket_panels_updated_at
BEFORE UPDATE ON public.ticket_panels
FOR EACH ROW EXECUTE FUNCTION public.set_ticket_panels_updated_at();
