import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DISCORD_API = "https://discord.com/api/v10";
const MANAGE_GUILD = 0x20n;
const ADMINISTRATOR = 0x8n;

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

export function getRedirectUri(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}/api/public/auth/discord/callback`;
}

export function buildAuthorizeUrl(request: Request, state: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "identify guilds",
    redirect_uri: getRedirectUri(request),
    state,
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code: string, request: Request) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(request),
    }),
  });
  if (!res.ok) throw new Error(`Discord token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };
}

export async function refreshToken(refresh: string) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refresh,
    }),
  });
  if (!res.ok) throw new Error("Discord refresh failed");
  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export async function fetchDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Discord user");
  return (await res.json()) as { id: string; username: string; global_name?: string; avatar: string | null };
}

async function fetchGuildsRaw(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch guilds: ${res.status}`);
  return (await res.json()) as DiscordGuild[];
}

export async function getValidAccessToken(discordUserId: string): Promise<{ accessToken: string; username: string; avatar: string | null } | null> {
  const { data } = await supabaseAdmin
    .from("discord_sessions")
    .select("access_token, refresh_token, expires_at, username, avatar")
    .eq("user_discord_id", discordUserId)
    .maybeSingle();
  if (!data) return null;

  const expires = new Date(data.expires_at).getTime();
  if (expires > Date.now() + 60_000) {
    return { accessToken: data.access_token, username: data.username, avatar: data.avatar };
  }

  try {
    const refreshed = await refreshToken(data.refresh_token);
    const newExpires = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await supabaseAdmin
      .from("discord_sessions")
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: newExpires,
      })
      .eq("user_discord_id", discordUserId);
    return { accessToken: refreshed.access_token, username: data.username, avatar: data.avatar };
  } catch {
    return null;
  }
}

export async function getManagedGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const guilds = await fetchGuildsRaw(accessToken);
  return guilds.filter((g) => {
    const perms = BigInt(g.permissions);
    return g.owner || (perms & MANAGE_GUILD) === MANAGE_GUILD || (perms & ADMINISTRATOR) === ADMINISTRATOR;
  });
}

export async function userManagesGuild(accessToken: string, guildId: string): Promise<DiscordGuild | null> {
  const managed = await getManagedGuilds(accessToken);
  return managed.find((g) => g.id === guildId) ?? null;
}
