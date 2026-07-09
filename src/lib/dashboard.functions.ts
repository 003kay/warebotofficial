import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

async function requireGuildManager(guildId: string) {
  const { readSessionFromCookie } = await import("@/lib/session.server");
  const { getValidAccessToken, userManagesGuild } = await import("@/lib/discord.server");
  const req = getRequest();
  const userId = readSessionFromCookie(req?.headers.get("cookie") ?? null);
  if (!userId) throw new Error("Not signed in");
  const session = await getValidAccessToken(userId);
  if (!session) throw new Error("Session expired");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { userId, guild };
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { readSessionFromCookie } = await import("@/lib/session.server");
  const { getValidAccessToken } = await import("@/lib/discord.server");
  const req = getRequest();
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
  const req = getRequest();
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
    const { guild } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchGuildChannels, fetchGuildRoles } = await import("@/lib/discord-bot.server");

    const [panelRes, channels, roles] = await Promise.all([
      supabaseAdmin.from("ticket_panels").select("*").eq("guild_id", data.guildId).maybeSingle(),
      fetchGuildChannels(data.guildId).catch(() => null),
      fetchGuildRoles(data.guildId).catch(() => null),
    ]);

    const botInGuild = channels !== null;

    return {
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
          : null,
      },
      panel: panelRes.data ?? null,
      botInGuild,
      textChannels: (channels ?? [])
        .filter((c) => c.type === 0 || c.type === 5)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, name: c.name, parent_id: c.parent_id })),
      categories: (channels ?? [])
        .filter((c) => c.type === 4)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, name: c.name })),
      roles: (roles ?? [])
        .filter((r) => r.name !== "@everyone" && !r.managed)
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name, color: r.color })),
    };
  });

const panelInputSchema = (d: {
  guildId: string;
  title: string;
  description: string;
  color: string;
  button_label: string;
  button_emoji: string;
  button_style: string;
  welcome_message: string;
  channel_id: string | null;
  category_id: string | null;
  support_role_ids: string[];
}) => d;

export const saveTicketPanel = createServerFn({ method: "POST" })
  .inputValidator(panelInputSchema)
  .handler(async ({ data }) => {
    const { userId } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
        channel_id: data.channel_id,
        category_id: data.category_id,
        support_role_ids: data.support_role_ids,
      },
      { onConflict: "guild_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const publishTicketPanel = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { publishPanelMessage } = await import("@/lib/discord-bot.server");

    const { data: panel } = await supabaseAdmin
      .from("ticket_panels")
      .select("*")
      .eq("guild_id", data.guildId)
      .maybeSingle();

    if (!panel) throw new Error("Save the panel before publishing.");
    if (!panel.channel_id) throw new Error("Pick a channel to post the panel in first.");

    const { messageId } = await publishPanelMessage(panel.channel_id, panel, panel.panel_message_id);

    await supabaseAdmin
      .from("ticket_panels")
      .update({ panel_message_id: messageId })
      .eq("guild_id", data.guildId);

    return { ok: true, messageId };
  });
