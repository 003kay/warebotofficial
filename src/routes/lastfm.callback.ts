import { createFileRoute } from "@tanstack/react-router";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const html = (title: string, message: string, status = 200) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;background:#0b0b0d;color:#f5f5f5;font-family:Inter,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}.card{max-width:620px;margin:24px;padding:32px;border:1px solid #26262b;border-radius:16px;background:#121216}h1{font-size:24px;margin:0 0 12px}p{line-height:1.6;color:#c8c8cf}.detail{padding:12px 14px;border-radius:10px;background:#19191f;color:#ff9aa5;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;overflow-wrap:anywhere}a{color:#ff4d5f}</style></head><body><main class="card"><h1>${escapeHtml(title)}</h1><p>${message}</p><p><a href="https://warebot.xyz/commands">Return to Ware</a></p></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );

function verifyState(state: string, secret: string): string | null {
  const [discordId, timestampText, signature] = state.split(".");
  if (!/^\d{15,22}$/.test(discordId || "") || !/^\d+$/.test(timestampText || "") || !signature) {
    return null;
  }

  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || timestamp > now + 60 || now - timestamp > 15 * 60) {
    return null;
  }

  const expected = createHmac("sha256", secret)
    .update(`${discordId}.${timestampText}`)
    .digest("hex");

  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return discordId;
}

function lastfmSignature(params: Record<string, string>, secret: string) {
  const source = Object.keys(params)
    .filter((key) => key !== "format" && key !== "callback")
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("") + secret;
  return createHash("md5").update(source, "utf8").digest("hex");
}

export const Route = createFileRoute("/lastfm/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.LASTFM_API_KEY?.trim();
        const apiSecret = process.env.LASTFM_API_SECRET?.trim();
        if (!apiKey || !apiSecret) {
          return html("Last.fm is not configured", "Ware is missing its Last.fm API credentials on Vercel.", 503);
        }

        const url = new URL(request.url);
        const token = url.searchParams.get("token")?.trim();
        const state = url.searchParams.get("state")?.trim();
        if (!token || !state) {
          return html("Authorization failed", "Last.fm did not return a valid authorization token.", 400);
        }

        const discordId = verifyState(state, apiSecret);
        if (!discordId) {
          return html("Authorization expired", "This Ware login link is invalid or has expired. Return to Discord and run the Last.fm login command again.", 400);
        }

        try {
          const params: Record<string, string> = {
            method: "auth.getSession",
            api_key: apiKey,
            token,
          };
          params.api_sig = lastfmSignature(params, apiSecret);
          params.format = "json";

          const endpoint = new URL("https://ws.audioscrobbler.com/2.0/");
          Object.entries(params).forEach(([key, value]) => endpoint.searchParams.set(key, value));
          const response = await fetch(endpoint, { headers: { "user-agent": "WareBot/1.0" } });
          const payload = (await response.json()) as {
            error?: number;
            message?: string;
            session?: { name?: string; key?: string; subscriber?: number };
          };

          if (!response.ok || payload.error || !payload.session?.name || !payload.session?.key) {
            throw new Error(`Last.fm: ${payload.message || "did not return a valid session"}`);
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await (supabaseAdmin as any)
            .from("lastfm_connections")
            .upsert(
              {
                discord_user_id: discordId,
                lastfm_username: payload.session.name,
                session_key: payload.session.key,
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "discord_user_id" },
            );
          if (error) {
            throw new Error(`Supabase: ${error.message || error.code || "database write failed"}`);
          }

          return Response.redirect(new URL("/authorized", request.url), 302);
        } catch (error) {
          console.error("Last.fm callback error", error);
          const detail = error instanceof Error ? error.message : "Unknown callback error";
          return html(
            "Authorization failed",
            `Ware could not finish connecting your Last.fm account.<br><br><span class="detail">${escapeHtml(detail)}</span><br><br>Send that error text back in Discord so it can be fixed.`,
            500,
          );
        }
      },
    },
  },
});
