import { createFileRoute } from "@tanstack/react-router";
import {
  clearOAuthNextCookie,
  clearSessionCookie,
  clearStateCookie,
  readSessionDataFromCookie,
} from "@/lib/session.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DISCORD_TOKEN_REVOKE = "https://discord.com/api/v10/oauth2/token/revoke";

async function revokeDiscordAuthorization(accessToken: string) {
  const clientId = (process.env.DISCORD_CLIENT_ID || "1535352463232602173").trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!clientSecret || !accessToken) return;

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    await fetch(DISCORD_TOKEN_REVOKE, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: accessToken,
        token_type_hint: "access_token",
      }),
    });
  } catch (error) {
    console.warn("Discord OAuth token revocation failed during logout", error);
  }
}

export const Route = createFileRoute("/auth/discord/logout")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = readSessionDataFromCookie(request.headers.get("cookie"));

        if (session) {
          await Promise.allSettled([
            revokeDiscordAuthorization(session.accessToken),
            supabaseAdmin
              .from("discord_sessions")
              .delete()
              .eq("user_discord_id", session.discordUserId),
          ]);
        }

        const headers = new Headers();
        // Send the user straight into a fresh Discord login flow so the old Ware
        // session cannot be silently reused when they press Dashboard again.
        headers.set("Location", "/auth/discord/login?switch=1");
        headers.append("Set-Cookie", clearSessionCookie());
        headers.append("Set-Cookie", clearStateCookie());
        headers.append("Set-Cookie", clearOAuthNextCookie());
        headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
