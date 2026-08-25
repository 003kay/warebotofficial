import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ALL_MODULES, LIST_TYPES, MODULE_KEYS, type ListType } from "@/lib/security-modules";
import type { Json } from "@/integrations/supabase/types";

async function requireGuildManager(guildId: string) {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const { userManagesGuild } = await import("@/lib/discord.server");
  const req = getRequest();
  const session = readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
  if (!session) throw new Error("Not signed in");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { userId: session.discordUserId, guild };
}

async function validateChannel(guildId: string, channelId: string | null) {
  if (!channelId) return;
  const { fetchGuildChannels } = await import("@/lib/discord-bot.server");
  const channels = await fetchGuildChannels(guildId);
  if (!channels) throw new Error("Ware cannot access this server with the configured bot token.");
  if (!channels.some((c) => c.id === channelId && (c.type === 0 || c.type === 5))) throw new Error("Selected channel is not a text channel in this server.");
}

async function validateRole(guildId: string, roleId: string | null) {
  if (!roleId) return;
  const { fetchGuildRoles } = await import("@/lib/discord-bot.server");
  const roles = await fetchGuildRoles(guildId);
  if (!roles) throw new Error("Ware cannot access this server with the configured bot token.");
  if (!roles.some((r) => r.id === roleId)) throw new Error("Selected role does not belong to this server.");
}

function missingSchema(message?: string | null) {
  return !!message && /does not exist|schema cache|could not find the table/i.test(message);
}

const DEFAULT_SETTINGS = {
  log_channel_id: null as string | null,
  dry_run_global: false,
  profile: "medium",
  raidmode: false,
  panicmode: false,
  verification_mode: "off",
  verification_role_id: null as string | null,
  captcha_difficulty: "medium",
  quarantine_role_id: null as string | null,
  quarantine_channel_id: null as string | null,
};

const DEFAULT_MODULE_EXTRA: Json = { dm_user: true, timeout_seconds: 600 };

export type SecurityLoadResult = {
  guild: { id: string; name: string; iconUrl: string | null };
  settings: typeof DEFAULT_SETTINGS;
  modules: Record<string, { enabled: boolean; dry_run: boolean; punishment: string; threshold_count: number; threshold_seconds: number; extra: Json }>;
  lists: Record<ListType, { id: string; entry_type: string; value: string; note: string | null }[]>;
  events: { id: string; module_key: string | null; event_type: string; actor_id: string | null; target_id: string | null; dry_run: boolean; punishment: string | null; reason: string | null; created_at: string }[];
  botInGuild: boolean;
  botStatus: string | null;
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string; color: number }[];
  automodSynced: number;
};

export const getSecurityConfig = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }): Promise<SecurityLoadResult> => {
    const { guild } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchGuildChannels, fetchGuildRoles, fetchGuildAutoModRules, getBotGuildStatus } = await import("@/lib/discord-bot.server");

    const [settingsRes, modulesRes, listsRes, eventsRes, fallbackRes, channels, roles, automodRules, botStatus] = await Promise.all([
      supabaseAdmin.from("security_settings").select("*").eq("guild_id", data.guildId).maybeSingle(),
      supabaseAdmin.from("security_modules").select("*").eq("guild_id", data.guildId),
      supabaseAdmin.from("security_list_entries").select("*").eq("guild_id", data.guildId),
      supabaseAdmin.from("security_events").select("id,module_key,event_type,actor_id,target_id,dry_run,punishment,reason,created_at").eq("guild_id", data.guildId).order("created_at", { ascending: false }).limit(50),
      (supabaseAdmin as any).from("guild_dashboard_settings").select("settings").eq("guild_id", data.guildId).maybeSingle(),
      fetchGuildChannels(data.guildId).catch(() => null),
      fetchGuildRoles(data.guildId).catch(() => null),
      fetchGuildAutoModRules(data.guildId).catch(() => null),
      getBotGuildStatus(data.guildId).catch(() => ({ connected: false as const, reason: "discord_error" as const })),
    ]);

    for (const [name, result] of [["security_settings", settingsRes], ["security_modules", modulesRes], ["security_list_entries", listsRes], ["security_events", eventsRes]] as const) {
      if (result.error && !missingSchema(result.error.message)) throw new Error(`${name}: ${result.error.message}`);
    }

    const fallbackSettings = ((fallbackRes?.data?.settings ?? {}) as Record<string, any>).security_core as Record<string, any> | undefined;
    const s = settingsRes.data ?? fallbackSettings ?? {};
    const settings = {
      log_channel_id: s.log_channel_id ?? DEFAULT_SETTINGS.log_channel_id,
      dry_run_global: s.dry_run_global ?? DEFAULT_SETTINGS.dry_run_global,
      profile: s.profile ?? DEFAULT_SETTINGS.profile,
      raidmode: s.raidmode ?? DEFAULT_SETTINGS.raidmode,
      panicmode: s.panicmode ?? DEFAULT_SETTINGS.panicmode,
      verification_mode: s.verification_mode ?? DEFAULT_SETTINGS.verification_mode,
      verification_role_id: s.verification_role_id ?? DEFAULT_SETTINGS.verification_role_id,
      captcha_difficulty: s.captcha_difficulty ?? DEFAULT_SETTINGS.captcha_difficulty,
      quarantine_role_id: s.quarantine_role_id ?? DEFAULT_SETTINGS.quarantine_role_id,
      quarantine_channel_id: s.quarantine_channel_id ?? DEFAULT_SETTINGS.quarantine_channel_id,
    };

    const modules: SecurityLoadResult["modules"] = {};
    for (const def of ALL_MODULES) modules[def.key] = { enabled: false, dry_run: false, punishment: def.defaultPunishment, threshold_count: def.defaultCount, threshold_seconds: def.defaultSeconds, extra: DEFAULT_MODULE_EXTRA };
    for (const row of modulesRes.data ?? []) if (MODULE_KEYS.has(row.module_key)) modules[row.module_key] = { enabled: row.enabled, dry_run: row.dry_run, punishment: row.punishment, threshold_count: row.threshold_count, threshold_seconds: row.threshold_seconds, extra: ({ dm_user: true, timeout_seconds: 600, ...((row.extra as Record<string, Json>) ?? {}) } as Json) };

    const lists: SecurityLoadResult["lists"] = { trusted: [], whitelist: [], extra_owner: [], name_filter: [], word_filter: [], link_whitelist: [], scam_domain: [] };
    for (const row of listsRes.data ?? []) if ((LIST_TYPES as readonly string[]).includes(row.list_type)) lists[row.list_type as ListType].push({ id: row.id, entry_type: row.entry_type, value: row.value, note: row.note });

    // Discord AutoMod keyword rules are treated as a source of truth for Discord-managed filters.
    // Ware keeps them visible alongside Ware-only filters and only inserts missing values; it never
    // deletes the user's additional Ware filters when Discord rules change.
    const automodValues = new Set<string>();
    for (const rule of automodRules ?? []) {
      if (!rule.enabled || rule.trigger_type !== 1) continue;
      for (const value of rule.trigger_metadata?.keyword_filter ?? []) if (value.trim()) automodValues.add(value.trim());
      for (const value of rule.trigger_metadata?.regex_patterns ?? []) if (value.trim()) automodValues.add(value.trim());
    }

    const existingValues = new Set(lists.word_filter.map((entry) => entry.value.toLowerCase()));
    const missingAutoMod = [...automodValues].filter((value) => !existingValues.has(value.toLowerCase()));
    if (missingAutoMod.length) {
      const rows = missingAutoMod.map((value) => ({ guild_id: data.guildId, list_type: "word_filter", entry_type: "discord_automod", value, note: "Synced from Discord AutoMod" }));
      const inserted = await supabaseAdmin.from("security_list_entries").insert(rows).select("id,entry_type,value,note");
      if (!inserted.error) {
        for (const row of inserted.data ?? []) lists.word_filter.push({ id: row.id, entry_type: row.entry_type, value: row.value, note: row.note });
      }
    }

    return {
      guild: { id: guild.id, name: guild.name, iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null },
      settings,
      modules,
      lists,
      events: eventsRes.data ?? [],
      botInGuild: botStatus.connected,
      botStatus: botStatus.connected ? null : botStatus.reason,
      textChannels: (channels ?? []).filter((c) => c.type === 0 || c.type === 5).sort((a, b) => a.position - b.position).map((c) => ({ id: c.id, name: c.name })),
      roles: (roles ?? []).filter((r) => r.name !== "@everyone" && !r.managed).sort((a, b) => b.position - a.position).map((r) => ({ id: r.id, name: r.name, color: r.color })),
      automodSynced: automodValues.size,
    };
  });

export const saveSecuritySettings = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; log_channel_id: string | null; dry_run_global: boolean; profile: string; raidmode: boolean; panicmode: boolean; verification_mode: string; verification_role_id: string | null; captcha_difficulty: string; quarantine_role_id: string | null; quarantine_channel_id: string | null }) => d)
  .handler(async ({ data }) => {
    const { userId } = await requireGuildManager(data.guildId);
    if (!["low", "medium", "high", "extreme"].includes(data.profile)) throw new Error("Invalid protection profile");
    if (!["off", "button", "captcha", "questions"].includes(data.verification_mode)) throw new Error("Invalid verification mode");
    await Promise.all([validateChannel(data.guildId, data.log_channel_id), validateChannel(data.guildId, data.quarantine_channel_id), validateRole(data.guildId, data.verification_role_id), validateRole(data.guildId, data.quarantine_role_id)]);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      guild_id: data.guildId,
      owner_discord_id: userId,
      log_channel_id: data.log_channel_id,
      dry_run_global: data.dry_run_global,
      profile: data.profile,
      raidmode: data.raidmode,
      panicmode: data.panicmode,
      verification_mode: data.verification_mode,
      verification_role_id: data.verification_role_id,
      captcha_difficulty: data.captcha_difficulty,
      quarantine_role_id: data.quarantine_role_id,
      quarantine_channel_id: data.quarantine_channel_id,
    };
    const { error } = await supabaseAdmin.from("security_settings").upsert(payload, { onConflict: "guild_id" });
    if (!error) return { ok: true, storage: "security_settings" as const };
    if (!missingSchema(error.message)) throw new Error(error.message);

    const { data: current, error: currentError } = await (supabaseAdmin as any).from("guild_dashboard_settings").select("settings").eq("guild_id", data.guildId).maybeSingle();
    if (currentError && !missingSchema(currentError.message)) throw new Error(currentError.message);
    const existing = ((current?.settings ?? {}) as Record<string, unknown>);
    const securityCore = { log_channel_id: data.log_channel_id, dry_run_global: data.dry_run_global, profile: data.profile, raidmode: data.raidmode, panicmode: data.panicmode, verification_mode: data.verification_mode, verification_role_id: data.verification_role_id, captcha_difficulty: data.captcha_difficulty, quarantine_role_id: data.quarantine_role_id, quarantine_channel_id: data.quarantine_channel_id };
    const fallbackWrite = await (supabaseAdmin as any).from("guild_dashboard_settings").upsert({ guild_id: data.guildId, settings: { ...existing, security_core: securityCore }, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: "guild_id" });
    if (fallbackWrite.error) throw new Error(fallbackWrite.error.message);
    return { ok: true, storage: "dashboard_settings" as const };
  });

export const saveSecurityModule = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; module_key: string; enabled: boolean; dry_run: boolean; punishment: string; threshold_count: number; threshold_seconds: number; extra: Json }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    if (!MODULE_KEYS.has(data.module_key)) throw new Error("Unknown security module");
    const count = Math.max(1, Math.min(1000, Number(data.threshold_count || 1)));
    const seconds = Math.max(1, Math.min(86400, Number(data.threshold_seconds || 1)));
    const incomingExtra = (data.extra && typeof data.extra === "object" && !Array.isArray(data.extra) ? data.extra : {}) as Record<string, Json>;
    const extra = { dm_user: incomingExtra.dm_user ?? true, timeout_seconds: incomingExtra.timeout_seconds ?? 600, ...incomingExtra } as Json;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("security_modules").upsert({ guild_id: data.guildId, module_key: data.module_key, enabled: data.enabled, dry_run: data.dry_run, punishment: data.punishment, threshold_count: count, threshold_seconds: seconds, extra }, { onConflict: "guild_id,module_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addSecurityListEntry = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; list_type: ListType; entry_type: string; value: string; note: string | null }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    if (!(LIST_TYPES as readonly string[]).includes(data.list_type)) throw new Error("Unknown security list");
    const value = data.value.trim();
    if (!value) throw new Error("Value required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: duplicate } = await supabaseAdmin.from("security_list_entries").select("id").eq("guild_id", data.guildId).eq("list_type", data.list_type).ilike("value", value).maybeSingle();
    if (duplicate) return { ok: true, duplicate: true };
    const { error } = await supabaseAdmin.from("security_list_entries").insert({ guild_id: data.guildId, list_type: data.list_type, entry_type: data.entry_type, value, note: data.note?.trim() || null });
    if (error && !/duplicate/i.test(error.message)) throw new Error(error.message);
    return { ok: true };
  });

export const removeSecurityListEntry = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; id: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const existing = await supabaseAdmin.from("security_list_entries").select("entry_type").eq("id", data.id).eq("guild_id", data.guildId).maybeSingle();
    if (existing.data?.entry_type === "discord_automod") throw new Error("This filter is managed by Discord AutoMod. Remove it in Discord AutoMod instead.");
    const { error } = await supabaseAdmin.from("security_list_entries").delete().eq("id", data.id).eq("guild_id", data.guildId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
