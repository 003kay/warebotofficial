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
  return guild;
}

export type AnalyticsDay = {
  date: string;
  messages: number;
  reactions: number;
  voice_seconds: number;
  joins: number;
  leaves: number;
  commands: number;
};

export type AnalyticsRankRow = {
  id?: string;
  name: string;
  value: number;
};

export type GuildAnalyticsPayload = {
  version?: number;
  guild_id: string;
  generated_at?: string;
  member_count?: number;
  days?: AnalyticsDay[];
  top_message_channels?: AnalyticsRankRow[];
  top_voice_channels?: AnalyticsRankRow[];
  top_commands?: AnalyticsRankRow[];
  totals?: {
    messages?: number;
    reactions?: number;
    voice_seconds?: number;
    joins?: number;
    leaves?: number;
    commands?: number;
  };
};

function resolveChannelRows(rows: AnalyticsRankRow[] | undefined, channels: { id: string; name: string }[]) {
  if (!rows?.length) return rows ?? [];
  const byId = new Map(channels.map((channel) => [String(channel.id), channel.name]));
  return rows.map((row) => {
    const id = String(row.id || row.name || "");
    const resolved = byId.get(id);
    return {
      ...row,
      id: id || row.id,
      name: resolved || (row.name && row.name !== id ? row.name : `Unknown channel`),
    };
  });
}

export const getGuildAnalytics = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchGuildChannels } = await import("@/lib/discord-bot.server");

    const [{ data: row, error }, channels] = await Promise.all([
      (supabaseAdmin as any)
        .from("guild_analytics_snapshots")
        .select("payload,updated_at")
        .eq("guild_id", data.guildId)
        .maybeSingle(),
      fetchGuildChannels(data.guildId).catch(() => null),
    ]);

    if (error) {
      console.error("Guild analytics lookup failed", error);
      return { connected: false as const, payload: null, updatedAt: null };
    }

    if (!row?.payload) {
      return { connected: false as const, payload: null, updatedAt: null };
    }

    const payload = row.payload as GuildAnalyticsPayload;
    const liveChannels = channels ?? [];
    const enriched: GuildAnalyticsPayload = {
      ...payload,
      top_message_channels: resolveChannelRows(payload.top_message_channels, liveChannels),
      top_voice_channels: resolveChannelRows(payload.top_voice_channels, liveChannels),
    };

    return {
      connected: true as const,
      payload: enriched,
      updatedAt: String(row.updated_at || ""),
    };
  });
