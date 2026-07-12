import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl, getRedirectUri } from "@/lib/discord.server";
import { createStateCookie } from "@/lib/session.server";

export const Route = createFileRoute("/api/public/auth/discord/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Ensure redirect URI is built (validates request); throws if config missing
        getRedirectUri(request);
        const state = randomBytes(16).toString("hex");
        const url = buildAuthorizeUrl(request, state);
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Opening Discord…</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0b0f; color: #f5f5f7; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width: min(420px, calc(100vw - 32px)); text-align: center; }
      a { display: inline-flex; margin-top: 18px; padding: 12px 18px; border-radius: 999px; background: #fff; color: #050507; text-decoration: none; font-weight: 700; }
      p { color: #a1a1aa; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>Opening Discord…</h1>
      <p>If Discord does not open automatically, use the button below. Discord blocks sign-in inside embedded previews.</p>
      <a id="discord-link" href="${url}" target="_top" rel="noreferrer">Continue with Discord</a>
    </main>
    <script>
      const discordUrl = ${JSON.stringify(url)};
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = discordUrl;
        } else {
          window.location.replace(discordUrl);
        }
      } catch (error) {
        document.getElementById("discord-link").focus();
      }
    </script>
  </body>
</html>`;
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": createStateCookie(state),
          },
        });
      },
    },
  },
});
