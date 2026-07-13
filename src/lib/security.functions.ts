import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ALL_MODULES, LIST_TYPES, MODULE_KEYS, type ListType } from "@/lib/security-modules";
import type { Json } from "@/integrations/supabase/types";

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
  return { userId, guild };
}

export type SecurityLoadResult = {
  guild: { id: string; name: string; iconUrl: string | null };
  settings: {
    log_channel_id: string | null;
    dry_run_global: boolean;
    profile: string;
    raidmode: boolean;
    panicmode: boolean;
    verification_mode: string;
    verification_role_id: string | null;
    captcha_difficulty: string;
    quarantine_role_id: string | null;
    quarantine_channel_id: string | null;
  };
  modules: Record<
    string,
    {
      enabled: boolean;
      dry_run: boolean;
      punishment: string;
      threshold_count: number;
      threshold_seconds: number;
      extra: Json;
    }
  >;
  lists: Record<ListType, { id: string; entry_type: string; value: string; note: string | null }[]>;
  events: {
    id: string;
    module_key: string | null;
    event_type: string;
    actor_id: string | null;
    target_id: string | null;
    dry_run: boolean;
    punishment: string | null;
    reason: string | null;
    created_at: string;
  }[];
  botInGuild: boolean;
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string; color: number }[];
};

export const getSecurityConfig = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }): Promise<SecurityLoadResult> => {
    const { guild } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fetchGuildChannels, fetchGuildRoles } = await import("@/lib/discord-bot.server");

    const [settingsRes, modulesRes, listsRes, eventsRes, channels, roles] = await Promise.all([
      supabaseAdmin.from("security_settings").select("*").eq("guild_id", data.guildId).maybeSingle(),
      supabaseAdmin.from("security_modules").select("*").eq("guild_id", data.guildId),
      supabaseAdmin.from("security_list_entries").select("*").eq("guild_id", data.guildId),
      supabaseAdmin
        .from("security_events")
        .select("id, module_key, event_type, actor_id, target_id, dry_run, punishment, reason, created_at")
        .eq("guild_id", data.guildId)
        .order("created_at", { ascending: false })
        .limit(50),
      fetchGuildChannels(data.guildId).catch(() => null),
      fetchGuildRoles(data.guildId).catch(() => null),
    ]);

    const s = settingsRes.data;
    const settings = {
      log_channel_id: s?.log_channel_id ?? null,
      dry_run_global: s?.dry_run_global ?? false,
      profile: s?.profile ?? "medium",
      raidmode: s?.raidmode ?? false,
      panicmode: s?.panicmode ?? false,
      verification_mode: s?.verification_mode ?? "off",
      verification_role_id: s?.verification_role_id ?? null,
      captcha_difficulty: s?.captcha_difficulty ?? "medium",
      quarantine_role_id: s?.quarantine_role_id ?? null,
      quarantine_channel_id: s?.quarantine_channel_id ?? null,
    };

    const modules: SecurityLoadResult["modules"] = {};
    for (const def of ALL_MODULES) {
      modules[def.key] = {
        enabled: false,
        dry_run: false,
        punishment: def.defaultPunishment,
        threshold_count: def.defaultCount,
        threshold_seconds: def.defaultSeconds,
        extra: {},
      };
    }
    for (const row of modulesRes.data ?? []) {
      if (!MODULE_KEYS.has(row.module_key)) continue;
      modules[row.module_key] = {
        enabled: row.enabled,
        dry_run: row.dry_run,
        punishment: row.punishment,
        threshold_count: row.threshold_count,
        threshold_seconds: row.threshold_seconds,
        extra: (row.extra as Json) ?? {},
      };
    }

    const lists: SecurityLoadResult["lists"] = {
      trusted: [],
      whitelist: [],
      extra_owner: [],
      name_filter: [],
      link_whitelist: [],
      scam_domain: [],
    };
    for (const row of listsRes.data ?? []) {
      if (!(LIST_TYPES as readonly string[]).includes(row.list_type)) continue;
      lists[row.list_type as ListType].push({
        id: row.id,
        entry_type: row.entry_type,
        value: row.value,
        note: row.note,
      });
    }

    return {
      guild: {
        id: guild.id,
        name: guild.name,
        iconUrl: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
          : null,
      },
      settings,
      modules,
      lists,
      events: eventsRes.data ?? [],
      botInGuild: channels !== null,
      textChannels: (channels ?? [])
        .filter((c) => c.type === 0 || c.type === 5)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, name: c.name })),
      roles: (roles ?? [])
        .filter((r) => r.name !== "@everyone" && !r.managed)
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name, color: r.color })),
    };
  });

export const saveSecuritySettings = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      guildId: string;
      log_channel_id: string | null;
      dry_run_global: boolean;
      profile: string;
      raidmode: boolean;
      panicmode: boolean;
      verification_mode: string;
      verification_role_id: string | null;
      captcha_difficulty: string;
      quarantine_role_id: string | null;
      quarantine_channel_id: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { userId } = await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("security_settings").upsert(
      {
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
      },
      { onConflict: "guild_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSecurityModule = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      guildId: string;
      module_key: string;
      enabled: boolean;
      dry_run: boolean;
      punishment: string;
      threshold_count: number;
      threshold_seconds: number;
      extra: Json;
    }) => d,
  )
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    if (!MODULE_KEYS.has(data.module_key)) throw new Error("Unknown module");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("security_modules").upsert(
      {
        guild_id: data.guildId,
        module_key: data.module_key,
        enabled: data.enabled,
        dry_run: data.dry_run,
        punishment: data.punishment,
        threshold_count: data.threshold_count,
        threshold_seconds: data.threshold_seconds,
        extra: data.extra,
      },
      { onConflict: "guild_id,module_key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addSecurityListEntry = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      guildId: string;
      list_type: ListType;
      entry_type: string;
      value: string;
      note: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    if (!(LIST_TYPES as readonly string[]).includes(data.list_type)) throw new Error("Unknown list");
    const value = data.value.trim();
    if (!value) throw new Error("Value required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("security_list_entries").insert({
      guild_id: data.guildId,
      list_type: data.list_type,
      entry_type: data.entry_type,
      value,
      note: data.note,
    });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const removeSecurityListEntry = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; id: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("security_list_entries")
      .delete()
      .eq("id", data.id)
      .eq("guild_id", data.guildId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
