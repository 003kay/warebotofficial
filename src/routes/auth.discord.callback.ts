import { createFileRoute } from "@tanstack/react-router";
import { exchangeCode, fetchDiscordUser } from "@/lib/discord.server";
import {
  clearOAuthNextCookie,
  clearStateCookie,
  createSessionCookie,
  readOAuthNextFromCookie,
  readStateFromCookie,
} from "@/lib/session.server";

export const Route = createFileRoute("/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const cookieHeader = request.headers.get("cookie");
        const cookieState = readStateFromCookie(cookieHeader);

        if (!code || !state || state !== cookieState) {
          return new Response("Invalid OAuth state. Please return to Stained and try again.", { status: 400 });
        }

        try {
          const token = await exchangeCode(code, request);
          const user = await fetchDiscordUser(token.access_token);
          const expiresAt = Date.now() + token.expires_in * 1000;

          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { error } = await supabaseAdmin.from("discord_sessions").upsert(
              {
                user_discord_id: user.id,
                username: user.global_name || user.username,
                avatar: user.avatar,
                access_token: token.access_token,
                refresh_token: token.refresh_token,
                expires_at: new Date(expiresAt).toISOString(),
              },
              { onConflict: "user_discord_id" },
            );
            if (error) console.warn("Optional discord_sessions persistence failed:", error.message);
          } catch (persistError) {
            console.warn("Optional Discord session persistence unavailable:", persistError);
          }

          const headers = new Headers();
          headers.set("Location", readOAuthNextFromCookie(cookieHeader));
          headers.append(
            "Set-Cookie",
            createSessionCookie({
              discordUserId: user.id,
              username: user.global_name || user.username,
              avatar: user.avatar,
              accessToken: token.access_token,
              refreshToken: token.refresh_token,
              expiresAt,
            }),
          );
          headers.append("Set-Cookie", clearStateCookie());
          headers.append("Set-Cookie", clearOAuthNextCookie());
          return new Response(null, { status: 302, headers });
        } catch (err) {
          console.error("Discord OAuth callback error", err);
          const message = err instanceof Error ? err.message : "Unknown OAuth error";
          const safeMessage = message
            .replace(/client_secret=[^&\s]+/gi, "client_secret=[redacted]")
            .replace(/[A-Za-z0-9_-]{50,}/g, "[redacted]");
          return new Response(`OAuth error: ${safeMessage}`, { status: 500 });
        }
      },
    },
  },
});

