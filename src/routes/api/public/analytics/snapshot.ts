import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function analyticsSecrets() {
  const values = [
    process.env.WARE_ANALYTICS_SECRET,
    process.env.DISCORD_BOT_TOKEN,
    process.env.BOT_TOKEN,
    process.env.DISCORD_TOKEN,
  ]
    .map((value) => (value || "").trim().replace(/^Bot\s+/i, ""))
    .filter(Boolean);

  return [...new Set(values)];
}

function verifyRequest(request: Request, body: string) {
  const secrets = analyticsSecrets();
  if (!secrets.length) return false;

  const timestampText = request.headers.get("x-ware-timestamp") || "";
  const signature = request.headers.get("x-ware-signature") || "";
  if (!/^\d+$/.test(timestampText) || !signature) return false;

  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60) return false;

  return secrets.some((secret) => {
    const expected = createHmac("sha256", secret)
      .update(`${timestampText}.${body}`)
      .digest("hex");
    return safeEqual(signature, expected);
  });
}

export const Route = createFileRoute("/api/public/analytics/snapshot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        if (body.length > 1_500_000) {
          return Response.json({ error: "Payload too large" }, { status: 413 });
        }
        if (!verifyRequest(request, body)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(body);
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        const payload = parsed as Record<string, unknown>;
        const guildId = String(payload.guild_id || "");
        if (!/^\d{15,22}$/.test(guildId)) {
          return Response.json({ error: "Invalid guild id" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await (supabaseAdmin as any)
          .from("guild_analytics_snapshots")
          .upsert(
            {
              guild_id: guildId,
              payload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "guild_id" },
          );

        if (error) {
          console.error("Guild analytics snapshot upsert failed", error);
          return Response.json({ error: "Database error" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
