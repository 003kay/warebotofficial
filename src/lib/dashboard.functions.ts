import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

async function getDashboardSession() {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const req = getRequest();
  return readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
}

async function requireGuildManager(guildId: string) {
  const { userManagesGuild } = await import("@/lib/discord.server");
  const session = await getDashboardSession();
  if (!session) throw new Error("Not signed in");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { userId: session.discordUserId, guild, session };
}

async function assertGuildChannel(guildId: string, channelId: string | null, allowedTypes: number[]) {
  if (!channelId) return;
  const { fetchGuildChannels } = await import("@/lib/discord-bot.server");
  const channels = await fetchGuildChannels(guildId);
  if (!channels) throw new Error("Stained is not currently in this server.");
  const channel = channels.find((entry) => entry.id === channelId);
  if (!channel || !allowedTypes.includes(channel.type)) {
    throw new Error("That channel does not belong to the server you are managing.");
  }
}

async function assertGuildRoleIds(guildId: string, roleIds: string[]) {
  if (!roleIds.length) return;
  const { fetchGuildRoles } = await import("@/lib/discord-bot.server");
  const roles = await fetchGuildRoles(guildId);
  if (!roles) throw new Error("Stained is not currently in this server.");
  const valid = new Set(roles.map((role) => role.id));
  if (roleIds.some((roleId) => !valid.has(roleId))) {
    throw new Error("One or more selected roles do not belong to this server.");
  }
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getDashboardSession();
  if (!session) return null;
  return {
    id: session.discordUserId,
    username: session.username,
    avatar: session.avatar,
    avatarUrl: session.avatar
      ? `https://cdn.discordapp.com/avatars/${session.discordUserId}/${session.avatar}.png?size=128`
      : null,
  };
});

export const getManagedGuildsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getManagedGuilds } = await import("@/lib/discord.server");
  const session = await getDashboardSession();
  if (!session) return { authenticated: false as const, guilds: [] };

  try {
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
  } catch (error) {
    console.error("Failed to load managed Discord guilds", error);
    return { authenticated: false as const, guilds: [] };
  }
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

export type PanelOptionInput = {
  position: number;
  label: string;
  description: string;
  emoji: string;
  category_id: string | null;
  support_role_ids: string[];
  welcome_message: string;
  ticket_name_format: string;
};

const panelInputSchema = (d: {
  guildId: string;
  title: string;
  description: string;
  color: string;
  panel_type: string;
  dropdown_placeholder: string;
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
  options: PanelOptionInput[];
}) => d;

export const saveTicketPanel = createServerFn({ method: "POST" })
  .inputValidator(panelInputSchema)
  .handler(async ({ data }) => {
    const { userId } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.command_prefix || /[a-zA-Z]/.test(data.command_prefix)) {
      throw new Error("Command prefix must not contain letters (e.g. $, !, ?, .)");
    }
    if (data.panel_type !== "button" && data.panel_type !== "dropdown") {
      throw new Error("Invalid panel type");
    }
    if (data.options.length === 0) {
      throw new Error("Add at least one ticket option before saving.");
    }
    if (data.options.length > 10) {
      throw new Error("A ticket panel can have up to 10 options.");
    }

    await Promise.all([
      assertGuildChannel(data.guildId, data.channel_id, [0, 5]),
      assertGuildChannel(data.guildId, data.log_channel_id, [0, 5]),
      assertGuildChannel(data.guildId, data.category_id, [4]),
      assertGuildRoleIds(data.guildId, data.support_role_ids),
      ...data.options.map(async (option) => {
        await assertGuildChannel(data.guildId, option.category_id, [4]);
        await assertGuildRoleIds(data.guildId, option.support_role_ids);
      }),
    ]);

    const { data: upserted, error } = await supabaseAdmin
      .from("ticket_panels")
      .upsert(
        {
          guild_id: data.guildId,
          owner_discord_id: userId,
          title: data.title.slice(0, 256),
          description: data.description.slice(0, 4000),
          color: data.color,
          panel_type: data.panel_type,
          dropdown_placeholder: data.dropdown_placeholder.slice(0, 150),
          button_label: data.button_label.slice(0, 80),
          button_emoji: data.button_emoji.slice(0, 100),
          button_style: data.button_style,
          close_button_label: data.close_button_label.slice(0, 80),
          close_button_emoji: data.close_button_emoji.slice(0, 100),
          close_button_style: data.close_button_style,
          claim_button_label: data.claim_button_label.slice(0, 80),
          claim_button_emoji: data.claim_button_emoji.slice(0, 100),
          claim_button_style: data.claim_button_style,
          command_prefix: data.command_prefix.slice(0, 5),
          close_command: data.close_command.slice(0, 32),
          reopen_command: data.reopen_command.slice(0, 32),
          delete_command: data.delete_command.slice(0, 32),
          welcome_message: data.welcome_message.slice(0, 4000),
          channel_id: data.channel_id,
          category_id: data.category_id,
          log_channel_id: data.log_channel_id,
          support_role_ids: data.support_role_ids,
        },
        { onConflict: "guild_id" },
      )
      .select("id")
      .single();

    if (error || !upserted) throw new Error(error?.message ?? "Failed to save panel");

    await supabaseAdmin.from("ticket_panel_options").delete().eq("panel_id", upserted.id);
    const rows = data.options.slice(0, 10).map((option, index) => ({
      panel_id: upserted.id,
      position: index,
      label: option.label.slice(0, 100),
      description: option.description.slice(0, 100),
      emoji: option.emoji.slice(0, 100),
      category_id: option.category_id,
      support_role_ids: option.support_role_ids,
      welcome_message: option.welcome_message.slice(0, 4000),
      ticket_name_format: option.ticket_name_format.slice(0, 100),
    }));

    const { error: optionError } = await supabaseAdmin.from("ticket_panel_options").insert(rows);
    if (optionError) throw new Error(optionError.message);

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

    await assertGuildChannel(data.guildId, panel.channel_id, [0, 5]);

    const { data: options } = await supabaseAdmin
      .from("ticket_panel_options")
      .select("id, position, label, description, emoji")
      .eq("panel_id", panel.id)
      .order("position", { ascending: true });

    const { messageId } = await publishPanelMessage(
      panel.channel_id,
      panel,
      panel.panel_message_id,
      (options ?? []) as {
        id: string;
        position: number;
        label: string;
        description: string;
        emoji: string;
      }[],
    );

    await supabaseAdmin
      .from("ticket_panels")
      .update({ panel_message_id: messageId })
      .eq("guild_id", data.guildId);

    return { ok: true, messageId };
  });

