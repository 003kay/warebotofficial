import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { dashboardFields } from "@/lib/dashboard-contract";
import { normalizeLevelingSettings } from "@/lib/leveling-settings";

type DashboardJson = null | boolean | number | string | DashboardJson[] | DashboardJsonObject;
type DashboardJsonObject = { [key: string]: DashboardJson };

async function requireGuildManager(guildId: string) {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const { userManagesGuild } = await import("@/lib/discord.server");
  const req = getRequest();
  const session = readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
  if (!session) throw new Error("Not signed in");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { session, guild };
}

export const getBotSyncStatus = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [runtime, settings] = await Promise.all([
      (supabaseAdmin as any).from("guild_bot_runtime").select("snapshot,applied,errors,command_count,version,updated_at").eq("guild_id", data.guildId).maybeSingle(),
      (supabaseAdmin as any).from("guild_dashboard_settings").select("settings").eq("guild_id", data.guildId).maybeSingle(),
    ]);
    if (runtime.error || settings.error) throw new Error("Bot status is unavailable.");
    const row = runtime.data;
    return row ? { updatedAt: row.updated_at, applied: row.applied, errors: row.errors,
      commandCount: row.command_count, version: row.version, revisions: settings.data?.settings?._revisions ?? {},
      modules: row.snapshot?.modules ?? {} } : null;
  });

export const getDashboardSettings = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    const { guild } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchGuildChannels, fetchGuildRoles, fetchGuildEmojis } =
      await import("@/lib/discord-bot.server");

    const [{ data: row, error }, channels, roles, emojis] = await Promise.all([
      (supabaseAdmin as any)
        .from("guild_dashboard_settings")
        .select("settings,updated_at")
        .eq("guild_id", data.guildId)
        .maybeSingle(),
      fetchGuildChannels(data.guildId).catch(() => null),
      fetchGuildRoles(data.guildId).catch(() => null),
      fetchGuildEmojis(data.guildId).catch(() => null),
    ]);

    if (error) throw new Error("Could not load dashboard settings. Please try again.");
    const { data: runtime, error: runtimeError } = await (supabaseAdmin as any)
      .from("guild_bot_runtime").select("snapshot,applied,errors,command_count,version,updated_at")
      .eq("guild_id", data.guildId).maybeSingle();
    if (runtimeError) throw new Error("Could not load bot connection status.");
    const desired = row?.settings ?? {};
    const merged = { ...desired };
    for (const [section, value] of Object.entries(runtime?.snapshot?.settings ?? {})) {
      const revision = desired._revisions?.[section] ?? 0;
      if (!desired[section] || (runtime?.applied?.[section] ?? -1) >= revision) merged[section] = value;
    }

    const textChannels = (channels ?? [])
      .filter((channel) => channel.type === 0 || channel.type === 5)
      .sort((a, b) => a.position - b.position)
      .map((channel) => ({
        id: String(channel.id),
        name: String(channel.name),
        parentId: channel.parent_id ? String(channel.parent_id) : null,
      }));

    const assignableRoles = (roles ?? [])
      .filter((role) => role.name !== "@everyone" && !role.managed)
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        id: String(role.id),
        name: String(role.name),
        color: Number(role.color || 0),
        position: Number(role.position || 0),
      }));

    return {
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
          : null,
      },
      settings: merged as DashboardJsonObject,
      sync: runtime ? { updatedAt: runtime.updated_at, applied: runtime.applied, errors: runtime.errors,
        commandCount: runtime.command_count, version: runtime.version, revisions: desired._revisions ?? {},
        modules: runtime.snapshot?.modules ?? {} } : null,
      updatedAt: row?.updated_at ? String(row.updated_at) : null,
      botInGuild: channels !== null,
      textChannels,
      roles: assignableRoles,
      emojis: (emojis ?? [])
        .filter((emoji) => emoji.available !== false && emoji.name)
        .map((emoji) => ({
          id: String(emoji.id),
          name: String(emoji.name),
          animated: Boolean(emoji.animated),
        })),
    };
  });

export const saveDashboardSettings = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; section: string; values: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const { session, guild } = await requireGuildManager(data.guildId);
    if (!data.values || typeof data.values !== "object" || Array.isArray(data.values) || JSON.stringify(data.values).length > 64000)
      throw new Error("Settings must be an object smaller than 64 KB.");
    if (data.section in dashboardFields) {
      const allowed = dashboardFields[data.section];
      if (Object.keys(data.values).some(key => !allowed.includes(key))) throw new Error("Unknown setting for this section.");
    } else if (!["leveling", "verification"].includes(data.section)) throw new Error("Configure this feature using its Discord commands.");
    if (["permissions", "joinGate"].includes(data.section) && !guild.owner && !(BigInt(guild.permissions || "0") & 8n))
      throw new Error("Administrator permission is required for these security settings.");
    if (!/^[a-z0-9_-]{1,40}$/i.test(data.section)) throw new Error("Invalid settings section");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let nextValues = data.values as DashboardJsonObject;
    if (data.section === "leveling") {
      const { fetchGuildChannels, fetchGuildRoles, fetchGuildEmojis } =
        await import("@/lib/discord-bot.server");
      const [channels, roles, emojis] = await Promise.all([
        fetchGuildChannels(data.guildId),
        fetchGuildRoles(data.guildId),
        fetchGuildEmojis(data.guildId),
      ]);
      const channelIds = new Set((channels ?? []).map((channel) => String(channel.id)));
      const roleIds = new Set(
        (roles ?? [])
          .filter((role) => role.name !== "@everyone" && !role.managed && !(BigInt(role.permissions || "0") & (8n | 32n | 268435456n | 4n | 2n)))
          .map((role) => String(role.id)),
      );
      const emojiIds = new Set(
        (emojis ?? [])
          .filter((emoji) => emoji.available !== false)
          .map((emoji) => String(emoji.id)),
      );
      const normalized = normalizeLevelingSettings(data.values);
      const invalidEmoji = [
        ...normalized.levelupMessage.matchAll(/<a?:[A-Za-z0-9_]{2,32}:(\d{15,22})>/g),
      ].find((match) => !emojiIds.has(match[1]));
      if (invalidEmoji)
        throw new Error(
          "That level-up message contains a custom emoji that is not available in this server.",
        );
      const validChannel = (id: string) => (id && channelIds.has(id) ? id : "");
      const validRole = (id: string) => (id && roleIds.has(id) ? id : "");
      normalized.levelupChannelId = validChannel(normalized.levelupChannelId);
      normalized.weeklyChannelId = validChannel(normalized.weeklyChannelId);
      normalized.monthlyChannelId = validChannel(normalized.monthlyChannelId);
      normalized.restrictedChannelIds = normalized.restrictedChannelIds.filter((id) =>
        channelIds.has(id),
      );
      normalized.restrictedRoleIds = normalized.restrictedRoleIds.filter((id) => roleIds.has(id));
      normalized.firstPlaceRoleId = validRole(normalized.firstPlaceRoleId);
      normalized.roleRewards = normalized.roleRewards.filter((entry) => roleIds.has(entry.roleId));
      normalized.roleBoosters = normalized.roleBoosters.filter(
        (entry) => entry.roleId && roleIds.has(entry.roleId),
      );
      normalized.channelBoosters = normalized.channelBoosters.filter(
        (entry) => entry.channelId && channelIds.has(entry.channelId),
      );
      if (!/^[a-z0-9-]{0,48}$/.test(normalized.leaderboardVanity))
        throw new Error(
          "Leaderboard vanity may only contain lowercase letters, numbers, and hyphens.",
        );
      nextValues = normalized;
    }

    const { data: settings, error } = await (supabaseAdmin as any).rpc("save_stained_dashboard_section", {
      p_guild_id: data.guildId, p_section: data.section, p_values: nextValues, p_user_id: session.discordUserId,
    });
    if (error) throw new Error(error.message);
    return { ok: true, settings };
  });

export const testLevelupMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; channelId: string; values: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const settings = normalizeLevelingSettings(data.values);
    const { fetchGuildChannels, fetchGuildEmojis, publishLevelupTestMessage } =
      await import("@/lib/discord-bot.server");
    const [channels, emojis] = await Promise.all([
      fetchGuildChannels(data.guildId),
      fetchGuildEmojis(data.guildId),
    ]);
    if (
      !(channels ?? []).some(
        (channel) =>
          String(channel.id) === data.channelId && (channel.type === 0 || channel.type === 5),
      )
    )
      throw new Error("Choose a text channel Stained can access.");
    const emojiIds = new Set(
      (emojis ?? []).filter((emoji) => emoji.available !== false).map((emoji) => String(emoji.id)),
    );
    if (
      [...settings.levelupMessage.matchAll(/<a?:[A-Za-z0-9_]{2,32}:(\d{15,22})>/g)].some(
        (match) => !emojiIds.has(match[1]),
      )
    )
      throw new Error("That message contains a custom emoji from another server.");
    return publishLevelupTestMessage(
      data.channelId,
      settings.levelupMessage,
      settings.levelupImage,
    );
  });

export const publishVerificationPanel = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; channelId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { fetchGuildChannels, publishVerificationPanelMessage } =
      await import("@/lib/discord-bot.server");
    const channels = await fetchGuildChannels(data.guildId);
    if (
      !channels?.some(
        (channel) =>
          String(channel.id) === data.channelId && (channel.type === 0 || channel.type === 5),
      )
    )
      throw new Error("Choose a text channel Stained can access.");
    return publishVerificationPanelMessage(data.channelId);
  });
