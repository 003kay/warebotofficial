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

function getBotToken() {
  return (
    process.env.DISCORD_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    process.env.DISCORD_TOKEN ||
    ""
  ).trim().replace(/^Bot\s+/i, "");
}

function looksLikeSnowflake(value: string) {
  return /^\d{15,22}$/.test(value.trim());
}

async function fetchChannelMap(guildId: string, ids: string[]) {
  const token = getBotToken();
  const map = new Map<string, string>();
  if (!token || !ids.length) return map;

  const headers = { Authorization: `Bot ${token}` };

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, { headers, cache: "no-store" });
    if (res.ok) {
      const channels = (await res.json()) as { id: string; name?: string }[];
      for (const channel of channels) {
        if (channel?.id && channel?.name) map.set(String(channel.id), String(channel.name));
      }
    }
  } catch {
    // Individual lookups below are the fallback.
  }

  const unresolved = [...new Set(ids)].filter((id) => id && !map.has(id));
  await Promise.all(unresolved.slice(0, 30).map(async (id) => {
    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${id}`, { headers, cache: "no-store" });
      if (!res.ok) return;
      const channel = (await res.json()) as { id?: string; name?: string };
      if (channel.id && channel.name) map.set(String(channel.id), String(channel.name));
    } catch {
      // The bot snapshot may still have a stored name.
    }
  }));

  return map;
}

function resolveChannelRows(rows: AnalyticsRankRow[] | undefined, channelMap: Map<string, string>) {
  if (!rows?.length) return rows ?? [];
  return rows.map((row) => {
    const snapshotName = String(row.name || "").trim();
    const id = String(row.id || (looksLikeSnowflake(snapshotName) ? snapshotName : "") || "");
    const liveName = id ? channelMap.get(id) : undefined;
    const usableSnapshotName = snapshotName && !looksLikeSnowflake(snapshotName) && snapshotName.toLowerCase() !== "unknown channel" && snapshotName.toLowerCase() !== "channel";
    const fallback = id ? `channel-${id.slice(-6)}` : "channel";

    return {
      ...row,
      id: id || row.id,
      name: liveName || (usableSnapshotName ? snapshotName : fallback),
    };
  });
}

export const getGuildAnalytics = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await (supabaseAdmin as any)
      .from("guild_analytics_snapshots")
      .select("payload,updated_at")
      .eq("guild_id", data.guildId)
      .maybeSingle();

    if (error) {
      console.error("Guild analytics lookup failed", error);
      return { connected: false as const, payload: null, updatedAt: null };
    }
    if (!row?.payload) return { connected: false as const, payload: null, updatedAt: null };

    const payload = row.payload as GuildAnalyticsPayload;
    const channelIds = [...(payload.top_message_channels ?? []), ...(payload.top_voice_channels ?? [])]
      .map((entry) => String(entry.id || (looksLikeSnowflake(String(entry.name || "")) ? entry.name : "")))
      .filter(Boolean);

    const channelMap = await fetchChannelMap(data.guildId, channelIds);
    const enriched: GuildAnalyticsPayload = {
      ...payload,
      top_message_channels: resolveChannelRows(payload.top_message_channels, channelMap),
      top_voice_channels: resolveChannelRows(payload.top_voice_channels, channelMap),
    };

    return { connected: true as const, payload: enriched, updatedAt: String(row.updated_at || "") };
  });
