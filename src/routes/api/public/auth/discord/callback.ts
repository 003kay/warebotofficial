import { createFileRoute } from "@tanstack/react-router";
import { exchangeCode, fetchDiscordUser } from "@/lib/discord.server";
import { clearStateCookie, createSessionCookie, readStateFromCookie } from "@/lib/session.server";

export const Route = createFileRoute("/api/public/auth/discord/callback")({
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
          const expiresAt = Date.now() + token.expires_in * 1000;

          const headers = new Headers();
          headers.append("Location", "/dashboard");
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
          headers.append("Cache-Control", "no-store");
          return new Response(null, { status: 302, headers });
        } catch (err) {
          console.error("Discord OAuth callback error", err);
          return new Response("OAuth error. Check server logs.", { status: 500 });
        }
      },
    },
  },
});
