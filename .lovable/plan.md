## What we're building

1. **Discord OAuth sign-in** (custom, via server routes — Discord isn't a managed Cloud provider)
2. **`/dashboard`** — server picker showing only guilds where the user has `MANAGE_GUILD`
3. **`/dashboard/$guildId/tickets`** — Ticket King/Ticket Tool-style panel editor with live embed preview

## Discord app setup (you do this once)

1. https://discord.com/developers/applications → your Ware app → OAuth2
2. Add redirect URI: `https://id-preview--8c07b575-86b6-4a2f-a21d-8788e908f794.lovable.app/api/public/auth/discord/callback` (and later your published URL's equivalent)
3. Copy **Client ID** and **Client Secret** — I'll ask for them via the secret form after the plan is approved.

## Backend

**Secrets:** `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, plus an auto-generated `SESSION_SECRET` for signing session cookies.

**Tables** (RLS + GRANTs):
- `discord_sessions` — `id`, `user_discord_id`, `username`, `avatar`, `access_token`, `refresh_token`, `expires_at`
- `ticket_panels` — `id`, `guild_id`, `owner_discord_id`, `title`, `description`, `color`, `button_label`, `button_emoji`, `button_style`, `welcome_message`, `updated_at`. Unique on (`guild_id`).

**Server routes** (`src/routes/api/public/auth/discord/`):
- `login.ts` — redirects to Discord OAuth (`identify guilds` scopes)
- `callback.ts` — exchanges code, stores session, sets signed `ware_session` httpOnly cookie
- `logout.ts` — clears cookie

**Server functions** (auth via the session cookie):
- `getCurrentUser()` — returns user + avatar
- `getManagedGuilds()` — calls Discord `/users/@me/guilds`, filters `permissions & 0x20` (MANAGE_GUILD)
- `getTicketPanel(guildId)` / `saveTicketPanel(input)` — verifies caller manages that guild before writing

## Frontend

- **Navbar**: "Dashboard" button → `/dashboard` (redirects to Discord login if no session), shows avatar + logout when signed in
- **`/dashboard`**: grid of manageable guilds (icon, name, member count), Ticket King styling — dark cards, subtle borders, hover glow
- **`/dashboard/$guildId`**: sidebar with "Tickets" (only module for now)
- **`/dashboard/$guildId/tickets`**: two-column layout
  - Left: form (panel title, description textarea, color picker, button label, button emoji, button style dropdown, welcome message)
  - Right: live Discord-style embed preview + button preview
  - Save button persists to `ticket_panels`

## What's out of scope (say so up front)

The dashboard **saves configuration** to the database. Actually posting the ticket panel into a Discord channel requires the Ware bot itself to read this config and send the message — that's a bot-side change, not a website change. I'll structure the schema so the bot can read it directly.

## After you approve

I'll ask for `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` via the secret form, then build everything above.