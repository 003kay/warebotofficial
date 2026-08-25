import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export type TranscriptMessage = {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string | null;
  bot?: boolean;
  content?: string;
  timestamp: string;
  edited_timestamp?: string | null;
  attachments?: Array<{ id?: string; name: string; url: string; content_type?: string | null; size?: number }>;
  embeds?: Array<{
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    footer?: { text?: string; icon_url?: string };
    thumbnail?: { url?: string };
    image?: { url?: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }>;
};

async function getSession() {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const req = getRequest();
  return readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
}

async function canViewGuild(accessToken: string, guildId: string) {
  const { userManagesGuild } = await import("@/lib/discord.server");
  return Boolean(await userManagesGuild(accessToken, guildId));
}

export const listTicketTranscripts = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Not signed in");
    if (!(await canViewGuild(session.accessToken, data.guildId))) throw new Error("You don't manage this server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("ticket_transcripts")
      .select("id,ticket_id,channel_name,opener_id,opener_name,closer_name,claimer_name,reason,opened_at,closed_at,message_count")
      .eq("guild_id", data.guildId)
      .order("closed_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getTicketTranscript = createServerFn({ method: "GET" })
  .inputValidator((d: { transcriptId: string }) => d)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) return { authenticated: false as const, transcript: null };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await (supabaseAdmin as any)
      .from("ticket_transcripts")
      .select("*")
      .eq("id", data.transcriptId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { authenticated: true as const, allowed: false as const, transcript: null };
    const manager = await canViewGuild(session.accessToken, String(row.guild_id));
    const participant = String(row.opener_id || "") === session.discordUserId || String(row.closer_id || "") === session.discordUserId || String(row.claimer_id || "") === session.discordUserId;
    if (!manager && !participant) return { authenticated: true as const, allowed: false as const, transcript: null };
    return {
      authenticated: true as const,
      allowed: true as const,
      transcript: {
        ...row,
        messages: Array.isArray(row.messages) ? (row.messages as TranscriptMessage[]) : [],
      },
    };
  });
