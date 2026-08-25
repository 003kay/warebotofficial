import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl, getCanonicalAuthUrl } from "@/lib/discord.server";
import { createStateCookie, readSessionDataFromCookie } from "@/lib/session.server";

export const Route = createFileRoute("/auth/discord/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const canonicalAuthUrl = getCanonicalAuthUrl(request);
        if (canonicalAuthUrl) {
          return new Response(null, { status: 302, headers: { Location: canonicalAuthUrl } });
        }

        const existing = readSessionDataFromCookie(request.headers.get("cookie"));
        if (existing) {
          return new Response(null, {
            status: 302,
            headers: { Location: "https://www.warebot.xyz/dashboard" },
          });
        }

        const state = randomBytes(16).toString("hex");
        const authorizeUrl = buildAuthorizeUrl(request, state);
        const headers = new Headers();
        headers.set("Location", authorizeUrl);
        headers.append("Set-Cookie", createStateCookie(state));
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
