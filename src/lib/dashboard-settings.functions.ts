import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

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

export const getDashboardSettings = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    const { guild } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchGuildChannels } = await import("@/lib/discord-bot.server");

    const [{ data: row, error }, channels] = await Promise.all([
      (supabaseAdmin as any)
        .from("guild_dashboard_settings")
        .select("settings,updated_at")
        .eq("guild_id", data.guildId)
        .maybeSingle(),
      fetchGuildChannels(data.guildId).catch(() => null),
    ]);

    if (error) console.warn("Dashboard settings lookup failed", error.message);

    const textChannels = (channels ?? [])
      .filter((channel) => channel.type === 0 || channel.type === 5)
      .sort((a, b) => a.position - b.position)
      .map((channel) => ({ id: String(channel.id), name: String(channel.name), parentId: channel.parent_id ? String(channel.parent_id) : null }));

    return {
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null,
      },
      settings: (row?.settings ?? {}) as Record<string, unknown>,
      updatedAt: row?.updated_at ? String(row.updated_at) : null,
      botInGuild: channels !== null,
      textChannels,
    };
  });

export const saveDashboardSettings = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; section: string; values: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const { session } = await requireGuildManager(data.guildId);
    if (!/^[a-z0-9_-]{1,40}$/i.test(data.section)) throw new Error("Invalid settings section");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current } = await (supabaseAdmin as any)
      .from("guild_dashboard_settings")
      .select("settings")
      .eq("guild_id", data.guildId)
      .maybeSingle();

    const settings = {
      ...((current?.settings ?? {}) as Record<string, unknown>),
      [data.section]: data.values,
    };

    const { error } = await (supabaseAdmin as any).from("guild_dashboard_settings").upsert(
      {
        guild_id: data.guildId,
        settings,
        updated_by: session.discordUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "guild_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, settings };
  });
