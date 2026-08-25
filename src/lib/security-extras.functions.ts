import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const ADMINISTRATOR = 0x8n;

async function requireGuildManager(guildId: string) {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const { userManagesGuild } = await import("@/lib/discord.server");
  const req = getRequest();
  const session = readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
  if (!session) throw new Error("Not signed in");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { guild, session };
}

export const getSecurityCandidates = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { fetchGuildMembers, fetchGuildRoles } = await import("@/lib/discord-bot.server");
    const [roles, members] = await Promise.all([
      fetchGuildRoles(data.guildId).catch(() => null),
      fetchGuildMembers(data.guildId).catch(() => null),
    ]);

    const usableRoles = (roles ?? []).filter((role) => role.name !== "@everyone" && !role.managed);
    const adminRoleIds = new Set(
      usableRoles
        .filter((role) => {
          try { return (BigInt(role.permissions || "0") & ADMINISTRATOR) === ADMINISTRATOR; }
          catch { return false; }
        })
        .map((role) => role.id),
    );

    const adminMembers = (members ?? [])
      .filter((member) => member.user && member.roles.some((roleId) => adminRoleIds.has(roleId)))
      .map((member) => ({
        id: member.user!.id,
        username: member.user!.username,
        displayName: member.nick || member.user!.global_name || member.user!.username,
        avatarUrl: member.user!.avatar
          ? `https://cdn.discordapp.com/avatars/${member.user!.id}/${member.user!.avatar}.png?size=64`
          : null,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      roles: usableRoles.map((role) => ({ id: role.id, name: role.name, color: role.color, administrator: adminRoleIds.has(role.id) })),
      adminMembers,
      membersAvailable: members !== null,
    };
  });

export const removeSecurityEntrySmart = createServerFn({ method: "POST" })
  .inputValidator((d: { guildId: string; id: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = await supabaseAdmin
      .from("security_list_entries")
      .select("id,entry_type,value")
      .eq("guild_id", data.guildId)
      .eq("id", data.id)
      .maybeSingle();
    if (row.error) throw new Error(row.error.message);
    if (!row.data) return { ok: true };

    if (row.data.entry_type === "discord_automod") {
      const { removeGuildAutoModFilter } = await import("@/lib/discord-bot.server");
      await removeGuildAutoModFilter(data.guildId, row.data.value);
    }

    const deleted = await supabaseAdmin
      .from("security_list_entries")
      .delete()
      .eq("guild_id", data.guildId)
      .eq("id", data.id);
    if (deleted.error) throw new Error(deleted.error.message);
    return { ok: true };
  });
