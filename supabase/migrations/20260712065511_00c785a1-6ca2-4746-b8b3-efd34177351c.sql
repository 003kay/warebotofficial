
ALTER TABLE public.ticket_panels
  ADD COLUMN IF NOT EXISTS panel_type text NOT NULL DEFAULT 'button',
  ADD COLUMN IF NOT EXISTS dropdown_placeholder text NOT NULL DEFAULT 'Select a ticket category…';

CREATE TABLE IF NOT EXISTS public.ticket_panel_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL REFERENCES public.ticket_panels(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT 'Support',
  description text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '🎫',
  category_id text,
  support_role_ids text[] NOT NULL DEFAULT '{}',
  welcome_message text NOT NULL DEFAULT 'Thanks for opening a ticket! Support will be with you shortly.',
  ticket_name_format text NOT NULL DEFAULT 'ticket-{number}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.ticket_panel_options TO service_role;

ALTER TABLE public.ticket_panel_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON public.ticket_panel_options
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS ticket_panel_options_panel_id_idx
  ON public.ticket_panel_options(panel_id);

CREATE TRIGGER update_ticket_panel_options_updated_at
  BEFORE UPDATE ON public.ticket_panel_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
