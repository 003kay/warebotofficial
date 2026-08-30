import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

async function requireGuildManager(guildId: string) {
  const { readSessionFromCookie } = await import("@/lib/session.server");
  const { getValidAccessToken, userManagesGuild } = await import("@/lib/discord.server");
  const req = getRequest();
  const userId = readSessionFromCookie(req?.headers.get("cookie") ?? null);
  if (!userId) throw new Error("Not signed in");
  const session = await getValidAccessToken(userId);
  if (!session) throw new Error("Session expired");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { guild, session, userId };
}

export type AnalyticsDay = {
  date: string;
  messages: number;
  reactions: number;
  voice_seconds: number;
  joins: number;
  leaves: number;
  commands: number;
};

export type AnalyticsRankRow = {
  id?: string;
  name: string;
  value: number;
  avatar_url?: string | null;
};

export type GuildAnalyticsPayload = {
  version?: number;
  guild_id: string;
  generated_at?: string;
  member_count?: number;
  days?: AnalyticsDay[];
  top_message_channels?: AnalyticsRankRow[];
  top_voice_channels?: AnalyticsRankRow[];
  top_message_members?: AnalyticsRankRow[];
  top_voice_members?: AnalyticsRankRow[];
  top_commands?: AnalyticsRankRow[];
  totals?: {
    messages?: number;
    reactions?: number;
    voice_seconds?: number;
    joins?: number;
    leaves?: number;
    commands?: number;
    active_users?: number;
  };
};

export type AnalyticsMemberProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  inGuild: boolean;
  roles: { id: string; name: string; color: number; iconUrl: string | null; unicodeEmoji: string | null; managed: boolean }[];
};

const DISCORD_API = "https://discord.com/api/v10";

function getBotToken() {
  return (process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.DISCORD_TOKEN || "").trim().replace(/^Bot\s+/i, "");
}
function looksLikeSnowflake(value: string) { return /^\d{15,22}$/.test(value.trim()); }
function botHeaders(extra: Record<string,string> = {}) { return { Authorization: `Bot ${getBotToken()}`, "Content-Type": "application/json", ...extra }; }
function avatarUrl(user: { id:string; avatar?:string|null }) {
  return user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null;
}

async function fetchChannelMap(guildId: string, ids: string[]) {
  const token = getBotToken();
  const map = new Map<string, string>();
  if (!token || !ids.length) return map;
  const headers = { Authorization: `Bot ${token}` };
  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, { headers, cache: "no-store" });
    if (res.ok) {
      const channels = (await res.json()) as { id: string; name?: string }[];
      for (const channel of channels) if (channel?.id && channel?.name) map.set(String(channel.id), String(channel.name));
    }
  } catch {}
  const unresolved = [...new Set(ids)].filter((id) => id && !map.has(id));
  await Promise.all(unresolved.slice(0, 30).map(async (id) => {
    try {
      const res = await fetch(`${DISCORD_API}/channels/${id}`, { headers, cache: "no-store" });
      if (!res.ok) return;
      const channel = (await res.json()) as { id?: string; name?: string };
      if (channel.id && channel.name) map.set(String(channel.id), String(channel.name));
    } catch {}
  }));
  return map;
}

async function fetchMemberIdentityMap(guildId:string, ids:string[]) {
  const map = new Map<string,{ username:string; displayName:string; avatarUrl:string|null }>();
  if (!getBotToken()) return map;
  await Promise.all([...new Set(ids)].slice(0,30).map(async id => {
    try {
      const memberRes = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${id}`, { headers:botHeaders(), cache:"no-store" });
      if (memberRes.ok) {
        const member = await memberRes.json() as any;
        const user = member.user ?? {};
        map.set(id,{ username:String(user.username || id), displayName:String(member.nick || user.global_name || user.username || id), avatarUrl:avatarUrl(user) });
        return;
      }
      const userRes = await fetch(`${DISCORD_API}/users/${id}`, { headers:botHeaders(), cache:"no-store" });
      if (userRes.ok) {
        const user = await userRes.json() as any;
        const username = String(user.username || id);
        map.set(id,{ username, displayName:username, avatarUrl:avatarUrl(user) });
      }
    } catch {}
  }));
  return map;
}

function resolveChannelRows(rows: AnalyticsRankRow[] | undefined, channelMap: Map<string, string>) {
  if (!rows?.length) return rows ?? [];
  return rows.map((row) => {
    const snapshotName = String(row.name || "").trim();
    const id = String(row.id || (looksLikeSnowflake(snapshotName) ? snapshotName : "") || "");
    const liveName = id ? channelMap.get(id) : undefined;
    const usableSnapshotName = snapshotName && !looksLikeSnowflake(snapshotName) && snapshotName.toLowerCase() !== "unknown channel" && snapshotName.toLowerCase() !== "channel" && !/^channel-\d+$/i.test(snapshotName);
    return { ...row, id:id || row.id, name:liveName || (usableSnapshotName ? snapshotName : "deleted-channel") };
  });
}
function resolveMemberRows(rows:AnalyticsRankRow[]|undefined, identities:Map<string,{username:string;displayName:string;avatarUrl:string|null}>) {
  return (rows ?? []).map(row => {
    const id = String(row.id || "");
    const live = id ? identities.get(id) : undefined;
    return live ? { ...row, name:live.username, avatar_url:live.avatarUrl || row.avatar_url } : row;
  });
}

export const getGuildAnalytics = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await (supabaseAdmin as any).from("guild_analytics_snapshots").select("payload,updated_at").eq("guild_id", data.guildId).maybeSingle();
    if (error) {
      console.error("Guild analytics lookup failed", error);
      return { connected: false as const, payload: null, updatedAt: null };
    }
    if (!row?.payload) return { connected: false as const, payload: null, updatedAt: null };
    const payload = row.payload as GuildAnalyticsPayload;
    const channelIds = [...(payload.top_message_channels ?? []), ...(payload.top_voice_channels ?? [])].map((entry) => String(entry.id || (looksLikeSnowflake(String(entry.name || "")) ? entry.name : ""))).filter(Boolean);
    const memberIds = [...(payload.top_message_members ?? []), ...(payload.top_voice_members ?? [])].map(entry=>String(entry.id||"")).filter(looksLikeSnowflake);
    const [channelMap,memberMap] = await Promise.all([fetchChannelMap(data.guildId, channelIds), fetchMemberIdentityMap(data.guildId,memberIds)]);
    const enriched: GuildAnalyticsPayload = {
      ...payload,
      top_message_channels: resolveChannelRows(payload.top_message_channels, channelMap),
      top_voice_channels: resolveChannelRows(payload.top_voice_channels, channelMap),
      top_message_members: resolveMemberRows(payload.top_message_members,memberMap),
      top_voice_members: resolveMemberRows(payload.top_voice_members,memberMap),
    };
    return { connected: true as const, payload: enriched, updatedAt: String(row.updated_at || "") };
  });

export const getAnalyticsMemberProfile = createServerFn({ method:"GET" })
  .inputValidator((d:{guildId:string; userId:string})=>d)
  .handler(async ({data}):Promise<AnalyticsMemberProfile> => {
    await requireGuildManager(data.guildId);
    if (!looksLikeSnowflake(data.userId)) throw new Error("Invalid member ID");
    const [memberRes,rolesRes,userRes] = await Promise.all([
      fetch(`${DISCORD_API}/guilds/${data.guildId}/members/${data.userId}`,{headers:botHeaders(),cache:"no-store"}),
      fetch(`${DISCORD_API}/guilds/${data.guildId}/roles`,{headers:botHeaders(),cache:"no-store"}),
      fetch(`${DISCORD_API}/users/${data.userId}`,{headers:botHeaders(),cache:"no-store"}),
    ]);
    if (!userRes.ok && memberRes.status===404) throw new Error("Discord user could not be loaded");
    const member = memberRes.ok ? await memberRes.json() as any : null;
    const user = member?.user ?? (userRes.ok ? await userRes.json() as any : {id:data.userId,username:data.userId});
    const allRoles = rolesRes.ok ? await rolesRes.json() as any[] : [];
    const memberRoleIds = new Set<string>(member?.roles ?? []);
    const roles = allRoles.filter(r=>memberRoleIds.has(String(r.id))).sort((a,b)=>Number(b.position||0)-Number(a.position||0)).map(r=>({
      id:String(r.id), name:String(r.name), color:Number(r.color||0), managed:Boolean(r.managed), unicodeEmoji:r.unicode_emoji ? String(r.unicode_emoji) : null,
      iconUrl:r.icon ? `https://cdn.discordapp.com/role-icons/${r.id}/${r.icon}.png?size=64` : null,
    }));
    return { id:String(user.id), username:String(user.username||data.userId), displayName:String(member?.nick || user.global_name || user.username || data.userId), avatarUrl:avatarUrl(user), inGuild:Boolean(member), roles };
  });

export const removeAnalyticsMemberRole = createServerFn({ method:"POST" })
  .inputValidator((d:{guildId:string; userId:string; roleId:string})=>d)
  .handler(async ({data}) => {
    const { session, userId:managerId } = await requireGuildManager(data.guildId);
    if (![data.userId,data.roleId].every(looksLikeSnowflake)) throw new Error("Invalid Discord ID");
    let managerName = managerId;
    try {
      const meRes = await fetch(`${DISCORD_API}/users/@me`,{headers:{Authorization:`Bearer ${session.accessToken}`},cache:"no-store"});
      if (meRes.ok) { const me = await meRes.json() as any; managerName = String(me.username || me.global_name || managerId); }
    } catch {}
    const reason = encodeURIComponent(`Removed from Ware Dashboard | By ${managerName} (${managerId})`);
    const res = await fetch(`${DISCORD_API}/guilds/${data.guildId}/members/${data.userId}/roles/${data.roleId}`,{method:"DELETE",headers:botHeaders({"X-Audit-Log-Reason":reason})});
    if (!res.ok) throw new Error(`Discord role removal failed: ${res.status} ${await res.text()}`);
    return {ok:true, managerName, managerId};
  });