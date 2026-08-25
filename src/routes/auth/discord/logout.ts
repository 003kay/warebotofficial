import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie } from "@/lib/session.server";

export const Route = createFileRoute("/auth/discord/logout")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, {
          status: 302,
          headers: { Location: "/", "Set-Cookie": clearSessionCookie() },
        });
      },
    },
  },
});
