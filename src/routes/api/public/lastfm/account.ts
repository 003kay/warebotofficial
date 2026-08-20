import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

function verifyBotRequest(request: Request, discordId: string) {
  const secret = process.env.LASTFM_API_SECRET?.trim();
  if (!secret || !/^\d{15,22}$/.test(discordId)) return false;

  const url = new URL(request.url);
  const timestampText = url.searchParams.get("ts") || "";
  const signature = url.searchParams.get("sig") || "";
  if (!/^\d+$/.test(timestampText) || !signature) return false;

  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60) return false;

  const expected = createHmac("sha256", secret)
    .update(`${request.method.toUpperCase()}:${discordId}:${timestampText}`)
    .digest("hex");
  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

export const Route = createFileRoute("/api/public/lastfm/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const discordId = url.searchParams.get("discord_id") || "";
        if (!verifyBotRequest(request, discordId)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await (supabaseAdmin as any)
          .from("lastfm_connections")
          .select("discord_user_id,lastfm_username,session_key,subscriber,connected_at,updated_at")
          .eq("discord_user_id", discordId)
          .maybeSingle();

        if (error) {
          console.error("Last.fm account lookup failed", error);
          return Response.json({ error: "Database error" }, { status: 500 });
        }
        if (!data) return Response.json({ connected: false }, { status: 404 });
        return Response.json({ connected: true, ...data });
      },

      DELETE: async ({ request }) => {
        const url = new URL(request.url);
        const discordId = url.searchParams.get("discord_id") || "";
        if (!verifyBotRequest(request, discordId)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await (supabaseAdmin as any)
          .from("lastfm_connections")
          .delete()
          .eq("discord_user_id", discordId);
        if (error) {
          console.error("Last.fm account delete failed", error);
          return Response.json({ error: "Database error" }, { status: 500 });
        }
        return Response.json({ disconnected: true });
      },
    },
  },
});
