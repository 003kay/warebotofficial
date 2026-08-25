import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

async function session() {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const req = getRequest();
  return readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
}

export const getLastfmConnection = createServerFn({ method: "GET" }).handler(async () => {
  const current = await session();
  if (!current) return { authenticated: false as const, connected: false as const, username: null };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("lastfm_connections")
    .select("lastfm_username,subscriber,connected_at")
    .eq("discord_user_id", current.discordUserId)
    .maybeSingle();
  if (error) console.warn("Last.fm connection lookup failed", error.message);
  return {
    authenticated: true as const,
    connected: Boolean(data?.lastfm_username),
    username: data?.lastfm_username ? String(data.lastfm_username) : null,
    subscriber: Boolean(data?.subscriber),
    connectedAt: data?.connected_at ? String(data.connected_at) : null,
  };
});
