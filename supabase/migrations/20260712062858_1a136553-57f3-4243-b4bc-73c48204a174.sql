
ALTER TABLE public.ticket_panels
  ADD COLUMN IF NOT EXISTS close_button_label text NOT NULL DEFAULT 'Close',
  ADD COLUMN IF NOT EXISTS close_button_emoji text NOT NULL DEFAULT '🔒',
  ADD COLUMN IF NOT EXISTS close_button_style text NOT NULL DEFAULT 'danger',
  ADD COLUMN IF NOT EXISTS claim_button_label text NOT NULL DEFAULT 'Claim',
  ADD COLUMN IF NOT EXISTS claim_button_emoji text NOT NULL DEFAULT '✋',
  ADD COLUMN IF NOT EXISTS claim_button_style text NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS command_prefix text NOT NULL DEFAULT '$',
  ADD COLUMN IF NOT EXISTS close_command text NOT NULL DEFAULT 'close',
  ADD COLUMN IF NOT EXISTS reopen_command text NOT NULL DEFAULT 'reopen',
  ADD COLUMN IF NOT EXISTS delete_command text NOT NULL DEFAULT 'delete';
