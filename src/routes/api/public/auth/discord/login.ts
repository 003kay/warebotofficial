import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl } from "@/lib/discord.server";
import { createStateCookie } from "@/lib/session.server";

export const Route = createFileRoute("/api/public/auth/discord/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const state = randomBytes(16).toString("hex");
        const url = buildAuthorizeUrl(request, state);

        return new Response(null, {
          status: 302,
          headers: {
            Location: url,
            "Set-Cookie": createStateCookie(state),
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
