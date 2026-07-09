import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { readSessionFromCookie } = await import("@/lib/session.server");
  const { getValidAccessToken } = await import("@/lib/discord.server");
  const req = getWebRequest();
  const userId = readSessionFromCookie(req?.headers.get("cookie") ?? null);
  if (!userId) return null;
  const session = await getValidAccessToken(userId);
  if (!session) return null;
  return {
    id: userId,
    username: session.username,
    avatar: session.avatar,
    avatarUrl: session.avatar
      ? `https://cdn.discordapp.com/avatars/${userId}/${session.avatar}.png?size=128`
      : null,
  };
});

export const getManagedGuildsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { readSessionFromCookie } = await import("@/lib/session.server");
  const { getValidAccessToken, getManagedGuilds } = await import("@/lib/discord.server");
  const req = getWebRequest();
  const userId = readSessionFromCookie(req?.headers.get("cookie") ?? null);
  if (!userId) return { authenticated: false as const, guilds: [] };
  const session = await getValidAccessToken(userId);
  if (!session) return { authenticated: false as const, guilds: [] };
  const guilds = await getManagedGuilds(session.accessToken);
  return {
    authenticated: true as const,
    guilds: guilds.map((g) => ({
      id: g.id,
      name: g.name,
      iconUrl: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
      owner: g.owner,
    })),
  };
});

export const getTicketPanel = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    const { readSessionFromCookie } = await import("@/lib/session.server");
    const { getValidAccessToken, userManagesGuild } = await import("@/lib/discord.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const req = getWebRequest();
    const userId = readSessionFromCookie(req?.headers.get("cookie") ?? null);
    if (!userId) throw new Error("Not signed in");
    const session = await getValidAccessToken(userId);
    if (!session) throw new Error("Session expired");
    const guild = await userManagesGuild(session.accessToken, data.guildId);
    if (!guild) throw new Error("You don't manage this server");

    const { data: panel } = await supabaseAdmin
      .from("ticket_panels")
      .select("*")
      .eq("guild_id", data.guildId)
      .maybeSingle();

    return {
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
          : null,
      },
      panel: panel ?? null,
    };
  });

export const saveTicketPanel = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      guildId: string;
      title: string;
      description: string;
      color: string;
      button_label: string;
      button_emoji: string;
      button_style: string;
      welcome_message: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { readSessionFromCookie } = await import("@/lib/session.server");
    const { getValidAccessToken, userManagesGuild } = await import("@/lib/discord.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const req = getWebRequest();
    const userId = readSessionFromCookie(req?.headers.get("cookie") ?? null);
    if (!userId) throw new Error("Not signed in");
    const session = await getValidAccessToken(userId);
    if (!session) throw new Error("Session expired");
    const guild = await userManagesGuild(session.accessToken, data.guildId);
    if (!guild) throw new Error("You don't manage this server");

    const { error } = await supabaseAdmin.from("ticket_panels").upsert(
      {
        guild_id: data.guildId,
        owner_discord_id: userId,
        title: data.title,
        description: data.description,
        color: data.color,
        button_label: data.button_label,
        button_emoji: data.button_emoji,
        button_style: data.button_style,
        welcome_message: data.welcome_message,
      },
      { onConflict: "guild_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
