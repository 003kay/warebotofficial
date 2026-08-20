import { createFileRoute } from "@tanstack/react-router";

const BOT_CALLBACK_URL = process.env.LASTFM_BOT_CALLBACK_URL?.trim();

export const Route = createFileRoute("/lastfm/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!BOT_CALLBACK_URL) {
          return new Response(
            "Last.fm callback is not configured on the Ware website. Set LASTFM_BOT_CALLBACK_URL to the public callback URL exposed by the bot host.",
            { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
          );
        }

        const incoming = new URL(request.url);
        const target = new URL(BOT_CALLBACK_URL);
        for (const [key, value] of incoming.searchParams.entries()) {
          target.searchParams.set(key, value);
        }

        return Response.redirect(target.toString(), 302);
      },
    },
  },
});
