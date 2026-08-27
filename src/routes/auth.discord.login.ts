import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl } from "@/lib/discord.server";
import {
  createOAuthNextCookie,
  createStateCookie,
  readSessionDataFromCookie,
} from "@/lib/session.server";

export const Route = createFileRoute("/auth/discord/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const next = url.searchParams.get("next") || "/dashboard";
        const switchingAccount = url.searchParams.get("switch") === "1";
        const existing = readSessionDataFromCookie(request.headers.get("cookie"));

        if (existing && !switchingAccount) {
          return new Response(null, {
            status: 302,
            headers: {
              Location:
                next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard",
              "Cache-Control": "no-store",
            },
          });
        }

        const state = randomBytes(16).toString("hex");
        const authorizeUrl = buildAuthorizeUrl(request, state);
        let location = authorizeUrl;

        // When the user explicitly logged out to switch accounts, route through
        // Discord's login screen first instead of immediately reusing the browser's
        // last OAuth authorization. Discord then owns the account-selection/login UI.
        if (switchingAccount) {
          const discordAuthorize = new URL(authorizeUrl);
          const redirectTo = `${discordAuthorize.pathname}${discordAuthorize.search}`;
          location = `https://discord.com/login?redirect_to=${encodeURIComponent(redirectTo)}`;
        }

        const headers = new Headers();
        headers.set("Location", location);
        headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
        headers.append("Set-Cookie", createStateCookie(state));
        headers.append("Set-Cookie", createOAuthNextCookie(next));
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
