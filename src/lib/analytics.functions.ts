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

    if (!row?.payload) {
      return { connected: false as const, payload: null, updatedAt: null };
    }

    return {
      connected: true as const,
      payload: row.payload as GuildAnalyticsPayload,
      updatedAt: String(row.updated_at || ""),
    };
  });
