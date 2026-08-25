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
        const existing = readSessionDataFromCookie(request.headers.get("cookie"));
        if (existing) {
          return new Response(null, {
            status: 302,
            headers: { Location: next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard" },
          });
        }

        const state = randomBytes(16).toString("hex");
        const authorizeUrl = buildAuthorizeUrl(request, state);
        const headers = new Headers();
        headers.set("Location", authorizeUrl);
        headers.append("Set-Cookie", createStateCookie(state));
        headers.append("Set-Cookie", createOAuthNextCookie(next));
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
