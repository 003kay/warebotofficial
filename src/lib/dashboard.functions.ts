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

    type OptionRow = {
      id: string;
      panel_id: string;
      position: number;
      label: string;
      description: string;
      emoji: string;
      category_id: string | null;
      support_role_ids: string[];
      welcome_message: string;
      ticket_name_format: string;
    };
    let options: OptionRow[] = [];
    if (panelRes.data) {
      const optRes = await supabaseAdmin
        .from("ticket_panel_options")
        .select("*")
        .eq("panel_id", panelRes.data.id)
        .order("position", { ascending: true });
      options = (optRes.data ?? []) as OptionRow[];
    }


    return {
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
          : null,
      },
      panel: panelRes.data ?? null,
      options,
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
  close_button_label: string;
  close_button_emoji: string;
  close_button_style: string;
  claim_button_label: string;
  claim_button_emoji: string;
  claim_button_style: string;
  command_prefix: string;
  close_command: string;
  reopen_command: string;
  delete_command: string;
  welcome_message: string;
  channel_id: string | null;
  category_id: string | null;
  log_channel_id: string | null;
  support_role_ids: string[];
}) => d;

export const saveTicketPanel = createServerFn({ method: "POST" })
  .inputValidator(panelInputSchema)
  .handler(async ({ data }) => {
    const { userId } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Validate prefix: must be non-empty and contain no letters
    if (!data.command_prefix || /[a-zA-Z]/.test(data.command_prefix)) {
      throw new Error("Command prefix must not contain letters (e.g. $, !, ?, .)");
    }

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
        close_button_label: data.close_button_label,
        close_button_emoji: data.close_button_emoji,
        close_button_style: data.close_button_style,
        claim_button_label: data.claim_button_label,
        claim_button_emoji: data.claim_button_emoji,
        claim_button_style: data.claim_button_style,
        command_prefix: data.command_prefix,
        close_command: data.close_command,
        reopen_command: data.reopen_command,
        delete_command: data.delete_command,
        welcome_message: data.welcome_message,
        channel_id: data.channel_id,
        category_id: data.category_id,
        log_channel_id: data.log_channel_id,
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
