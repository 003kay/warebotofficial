import { createFileRoute } from "@tanstack/react-router";
import { exchangeCode, fetchDiscordUser } from "@/lib/discord.server";
import { clearStateCookie, createSessionCookie, readStateFromCookie } from "@/lib/session.server";

export const Route = createFileRoute("/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const cookieState = readStateFromCookie(request.headers.get("cookie"));

        if (!code || !state || state !== cookieState) {
          return new Response("Invalid OAuth state. Please return to Ware and try again.", { status: 400 });
        }

        try {
          const token = await exchangeCode(code, request);
          const user = await fetchDiscordUser(token.access_token);
          const expiresAt = Date.now() + token.expires_in * 1000;

          // Persisting to Supabase is optional. The signed HttpOnly cookie below is
          // the source of truth for the dashboard session, so a database migration
          // cannot trap users in an OAuth loop.
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
          headers.set("Location", "https://www.warebot.xyz/dashboard");
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
          return new Response(null, { status: 302, headers });
        } catch (err) {
          console.error("Discord OAuth callback error", err);
          return new Response("OAuth error. Check the Ware deployment logs.", { status: 500 });
        }
      },
    },
  },
});
