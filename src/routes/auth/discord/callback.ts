import { createFileRoute } from "@tanstack/react-router";
import { exchangeCode, fetchDiscordUser } from "@/lib/discord.server";
import { createSessionCookie, readStateFromCookie } from "@/lib/session.server";

export const Route = createFileRoute("/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const cookieState = readStateFromCookie(request.headers.get("cookie"));

        if (!code || !state || state !== cookieState) {
          return new Response("Invalid OAuth state", { status: 400 });
        }

        try {
          const token = await exchangeCode(code, request);
          const user = await fetchDiscordUser(token.access_token);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
          await supabaseAdmin
            .from("discord_sessions")
            .upsert(
              {
                user_discord_id: user.id,
                username: user.global_name || user.username,
                avatar: user.avatar,
                access_token: token.access_token,
                refresh_token: token.refresh_token,
                expires_at: expiresAt,
              },
              { onConflict: "user_discord_id" },
            );

          const headers = new Headers();
          headers.append("Location", "/dashboard");
          headers.append("Set-Cookie", createSessionCookie(user.id));
          headers.append("Set-Cookie", "ware_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
          return new Response(null, { status: 302, headers });
        } catch (err) {
          console.error("Discord OAuth callback error", err);
          return new Response("OAuth error. Check server logs.", { status: 500 });
        }
      },
    },
  },
});
