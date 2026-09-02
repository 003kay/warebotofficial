import { createFileRoute } from "@tanstack/react-router";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function derivedBotSecret(value: string | undefined) {
  const token = (value || "").trim().replace(/^Bot\s+/i, "");
  if (!token) return "";
  return createHash("sha256")
    .update(`ware-analytics-v1:${token}`)
    .digest("hex");
}

function secrets() {
  const values = [
    (process.env.WARE_ANALYTICS_SECRET || "").trim(),
    derivedBotSecret(process.env.DISCORD_BOT_TOKEN),
    derivedBotSecret(process.env.BOT_TOKEN),
    derivedBotSecret(process.env.DISCORD_TOKEN),
  ].filter(Boolean);

  return [...new Set(values)];
}

function verify(request: Request, body: string) {
  const keys = secrets();
  if (!keys.length) return false;
  const timestamp = request.headers.get("x-ware-timestamp") || "";
  const signature = request.headers.get("x-ware-signature") || "";
  if (!/^\d+$/.test(timestamp) || !signature) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) return false;
  return keys.some((key) => {
    const expected = createHmac("sha256", key).update(`${timestamp}.${body}`).digest("hex");
    return safeEqual(signature, expected);
  });
}

function snowflake(value: unknown) {
  const result = String(value || "");
  return /^\d{15,22}$/.test(result) ? result : null;
}

export const Route = createFileRoute("/api/public/tickets/transcript")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        if (body.length > 2_000_000) return Response.json({ error: "Payload too large" }, { status: 413 });
        if (!verify(request, body)) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let payload: Record<string, any>;
        try { payload = JSON.parse(body); }
        catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

        const guildId = snowflake(payload.guild_id);
        const openerId = snowflake(payload.opener_id);
        const closerId = snowflake(payload.closer_id);
        if (!guildId || !openerId || !closerId) return Response.json({ error: "Invalid ticket identity" }, { status: 400 });

        const messages = Array.isArray(payload.messages) ? payload.messages.slice(0, 10000) : [];
        const row = {
          guild_id: guildId,
          ticket_id: String(payload.ticket_id || payload.channel_id || "ticket").slice(0, 100),
          channel_id: snowflake(payload.channel_id),
          channel_name: String(payload.channel_name || "ticket").slice(0, 100),
          opener_id: openerId,
          opener_name: String(payload.opener_name || openerId).slice(0, 100),
          closer_id: closerId,
          closer_name: String(payload.closer_name || closerId).slice(0, 100),
          claimer_id: snowflake(payload.claimer_id),
          claimer_name: payload.claimer_name ? String(payload.claimer_name).slice(0, 100) : null,
          reason: payload.reason ? String(payload.reason).slice(0, 1000) : null,
          opened_at: payload.opened_at || new Date().toISOString(),
          closed_at: payload.closed_at || new Date().toISOString(),
          message_count: messages.length,
          messages,
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await (supabaseAdmin as any)
          .from("ticket_transcripts")
          .insert(row)
          .select("id")
          .single();
        if (error) {
          console.error("Ticket transcript insert failed", error);
          return Response.json({ error: "Database error" }, { status: 500 });
        }

        return Response.json({ ok: true, id: String(data.id), url: `/transcripts/${data.id}` });
      },
    },
  },
});