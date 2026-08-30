import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function sharedSecret() {
  return (
    process.env.WARE_ANALYTICS_SECRET ||
    process.env.DISCORD_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    process.env.DISCORD_TOKEN ||
    ""
  ).trim().replace(/^Bot\s+/i, "");
}

function verifyRequest(request: Request, body: string) {
  const secret = sharedSecret();
  if (!secret) return false;
  const timestampText = request.headers.get("x-ware-timestamp") || "";
  const signature = request.headers.get("x-ware-signature") || "";
  if (!/^\d+$/.test(timestampText) || !signature) return false;
  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60) return false;
  const expected = createHmac("sha256", secret).update(`${timestampText}.${body}`).digest("hex");
  return safeEqual(signature, expected);
}

export const Route = createFileRoute("/api/public/security/config")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        if (body.length > 200_000) return Response.json({ error: "Payload too large" }, { status: 413 });
        if (!verifyRequest(request, body)) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let parsed: any;
        try { parsed = JSON.parse(body); }
        catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

        const guildIds = Array.isArray(parsed?.guild_ids)
          ? [...new Set(parsed.guild_ids.map((value: unknown) => String(value)).filter((value: string) => /^\d{15,22}$/.test(value)))].slice(0, 500)
          : [];
        if (!guildIds.length) return Response.json({ guilds: {} });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("security_modules")
          .select("guild_id,module_key,enabled,punishment,threshold_count,threshold_seconds,extra")
          .in("guild_id", guildIds);

        if (error) {
          console.error("Security config sync read failed", error);
          return Response.json({ error: "Database error" }, { status: 500 });
        }

        const guilds: Record<string, unknown[]> = {};
        for (const guildId of guildIds) guilds[guildId] = [];
        for (const row of data ?? []) {
          const guildId = String(row.guild_id);
          if (!guilds[guildId]) guilds[guildId] = [];
          guilds[guildId].push(row);
        }
        return Response.json({ guilds, synced_at: new Date().toISOString() });
      },
    },
  },
});
