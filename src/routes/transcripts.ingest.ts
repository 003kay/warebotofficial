import { createFileRoute } from "@tanstack/react-router";

function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/transcripts/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = (process.env.WARE_TRANSCRIPT_SECRET || "").trim();
        const auth = request.headers.get("authorization") || "";
        if (!expected || auth !== `Bearer ${expected}`) return unauthorized();

        try {
          const body = (await request.json()) as {
            guildId: string;
            ticketId: string;
            channelId?: string | null;
            channelName?: string | null;
            openerId: string;
            openerName?: string | null;
            closerId?: string | null;
            closerName?: string | null;
            claimerId?: string | null;
            claimerName?: string | null;
            reason?: string | null;
            openedAt?: string | null;
            closedAt?: string | null;
            logChannelId?: string | null;
            messages?: unknown[];
            metadata?: Record<string, unknown>;
          };

          if (!body.guildId || !body.ticketId || !body.openerId) {
            return new Response(JSON.stringify({ error: "guildId, ticketId and openerId are required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const messages = Array.isArray(body.messages) ? body.messages.slice(0, 10000) : [];
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: row, error } = await (supabaseAdmin as any)
            .from("ticket_transcripts")
            .upsert(
              {
                guild_id: String(body.guildId),
                ticket_id: String(body.ticketId),
                channel_id: body.channelId ? String(body.channelId) : null,
                channel_name: body.channelName ? String(body.channelName).slice(0, 100) : null,
                opener_id: String(body.openerId),
                opener_name: body.openerName ? String(body.openerName).slice(0, 100) : null,
                closer_id: body.closerId ? String(body.closerId) : null,
                closer_name: body.closerName ? String(body.closerName).slice(0, 100) : null,
                claimer_id: body.claimerId ? String(body.claimerId) : null,
                claimer_name: body.claimerName ? String(body.claimerName).slice(0, 100) : null,
                reason: body.reason ? String(body.reason).slice(0, 1000) : null,
                opened_at: body.openedAt || null,
                closed_at: body.closedAt || new Date().toISOString(),
                message_count: messages.length,
                messages,
                metadata: body.metadata || {},
              },
              { onConflict: "guild_id,ticket_id" },
            )
            .select("id")
            .single();

          if (error || !row?.id) throw new Error(error?.message || "Failed to save transcript");

          let logMessageId: string | null = null;
          if (body.logChannelId) {
            try {
              const { publishTranscriptClosedLog } = await import("@/lib/discord-bot.server");
              const log = await publishTranscriptClosedLog({
                channelId: String(body.logChannelId),
                transcriptId: String(row.id),
                ticketId: String(body.ticketId),
                openerName: body.openerName,
                openerId: String(body.openerId),
                closerName: body.closerName,
                closerId: body.closerId,
                claimerName: body.claimerName,
                claimerId: body.claimerId,
                reason: body.reason,
                openedAt: body.openedAt,
                closedAt: body.closedAt,
                baseUrl: new URL(request.url).origin,
              });
              logMessageId = log.id;
            } catch (logError) {
              console.error("Transcript saved but close log failed", logError);
            }
          }

          return new Response(
            JSON.stringify({
              ok: true,
              transcriptId: row.id,
              transcriptUrl: `${new URL(request.url).origin}/transcripts/${row.id}`,
              logMessageId,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (error) {
          console.error("Transcript ingest failed", error);
          return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Transcript ingest failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
