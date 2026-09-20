import { createFileRoute } from "@tanstack/react-router";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function derivedBotSecret(value: string | undefined, prefix = "stained") {
  const token = (value || "").trim().replace(/^Bot\s+/i, "");
  if (!token) return "";
  return createHash("sha256").update(`${prefix}-analytics-v1:${token}`).digest("hex");
}

function sharedSecrets() {
  const values = [
    (process.env.WARE_ANALYTICS_SECRET || "").trim(),
    (process.env.STAINED_ANALYTICS_SECRET || "").trim(),
    ...[process.env.DISCORD_BOT_TOKEN, process.env.BOT_TOKEN, process.env.DISCORD_TOKEN].map(token => derivedBotSecret(token, "ware")),
    derivedBotSecret(process.env.DISCORD_BOT_TOKEN),
    derivedBotSecret(process.env.BOT_TOKEN),
    derivedBotSecret(process.env.DISCORD_TOKEN),
  ].filter(Boolean);

  return [...new Set(values)];
}

function verifyRequest(request: Request, body: string) {
  const secrets = sharedSecrets();
  if (!secrets.length) return false;
  const timestampText = (request.headers.get("x-stained-timestamp") || request.headers.get("x-ware-timestamp")) || "";
  const signature = (request.headers.get("x-stained-signature") || request.headers.get("x-ware-signature")) || "";
  if (!/^\d+$/.test(timestampText) || !signature) return false;
  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60) return false;
  return secrets.some((secret) => {
    const expected = createHmac("sha256", secret).update(`${timestampText}.${body}`).digest("hex");
    return safeEqual(signature, expected);
  });
}

const VALID_MODULE = /^[a-z0-9_-]{1,50}$/i;
const VALID_GUILD = /^\d{15,22}$/;

export const Route = createFileRoute("/api/public/security/config")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        if (body.length > 300_000)
          return Response.json({ error: "Payload too large" }, { status: 413 });
        if (!verifyRequest(request, body))
          return Response.json({ error: "Unauthorized" }, { status: 401 });

        let parsed: any;
        try {
          parsed = JSON.parse(body);
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const guildIds: string[] = Array.isArray(parsed?.guild_ids)
          ? [
              ...new Set<string>(
                parsed.guild_ids
                  .map((value: unknown) => String(value))
                  .filter((value: string) => VALID_GUILD.test(value)),
              ),
            ].slice(0, 500)
          : [];
        if (!guildIds.length) return Response.json({ guilds: {}, verification: {}, leveling: {} });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const incoming = Array.isArray(parsed?.security_updates) ? parsed.security_updates : [];
        const rows = incoming.slice(0, 500).flatMap((row: any) => {
          const guildId = String(row?.guild_id || "");
          const moduleKey = String(row?.module_key || "");
          if (!guildIds.includes(guildId) || !VALID_MODULE.test(moduleKey)) return [];
          const punishment = String(row?.punishment || "ban").slice(0, 32);
          return [
            {
              guild_id: guildId,
              module_key: moduleKey,
              enabled: Boolean(row?.enabled),
              dry_run: false,
              punishment,
              threshold_count: Math.max(1, Math.min(1000, Number(row?.threshold_count || 1))),
              threshold_seconds: Math.max(1, Math.min(86400, Number(row?.threshold_seconds || 60))),
              extra:
                row?.extra && typeof row.extra === "object" && !Array.isArray(row.extra)
                  ? row.extra
                  : {},
            },
          ];
        });

        if (rows.length) {
          const write = await supabaseAdmin
            .from("security_modules")
            .upsert(rows, { onConflict: "guild_id,module_key" });
          if (write.error) {
            console.error("Security config sync write failed", write.error);
            return Response.json({ error: "Database write error" }, { status: 500 });
          }
        }

        const [modulesResult, dashboardResult] = await Promise.all([
          supabaseAdmin
            .from("security_modules")
            .select(
              "guild_id,module_key,enabled,punishment,threshold_count,threshold_seconds,extra",
            )
            .in("guild_id", guildIds),
          (supabaseAdmin as any)
            .from("guild_dashboard_settings")
            .select("guild_id,settings")
            .in("guild_id", guildIds),
        ]);

        if (modulesResult.error || dashboardResult.error) {
          console.error("Security config sync read failed", modulesResult.error);
          return Response.json({ error: "Database error" }, { status: 500 });
        }

        const guilds: Record<string, unknown[]> = {};
        const verification: Record<string, Record<string, unknown>> = {};
        const leveling: Record<string, Record<string, unknown>> = {};
        for (const guildId of guildIds) {
          guilds[guildId] = [];
          verification[guildId] = {};
          leveling[guildId] = {};
        }
        for (const row of modulesResult.data ?? []) {
          const guildId = String(row.guild_id);
          if (!guilds[guildId]) guilds[guildId] = [];
          guilds[guildId].push(row);
        }
        for (const row of dashboardResult.data ?? []) {
          const guildId = String(row.guild_id);
          const settings = (row.settings ?? {}) as Record<string, unknown>;
          const value = settings.verification;
          if (value && typeof value === "object" && !Array.isArray(value))
            verification[guildId] = value as Record<string, unknown>;
          const levelingValue = settings.leveling;
          if (levelingValue && typeof levelingValue === "object" && !Array.isArray(levelingValue))
            leveling[guildId] = levelingValue as Record<string, unknown>;
        }

        const dashboard: Record<string, unknown> = {};
        for (const row of dashboardResult.data ?? []) dashboard[String(row.guild_id)] = row.settings ?? {};
        const tickets: Record<string, unknown> = {};
        if (parsed.protocol === 2) {
          const panels = await supabaseAdmin.from("ticket_panels").select("*").in("guild_id", guildIds);
          if (panels.error) return Response.json({ error: "Ticket configuration read failed" }, { status: 500 });
          const ids = (panels.data ?? []).map((panel: any) => panel.id);
          const options = ids.length ? await supabaseAdmin.from("ticket_panel_options").select("*").in("panel_id", ids) : { data: [], error: null };
          if (options.error) return Response.json({ error: "Ticket option read failed" }, { status: 500 });
          for (const panel of panels.data ?? []) tickets[String(panel.guild_id)] = { ...panel, options: (options.data ?? []).filter((option: any) => option.panel_id === panel.id) };
        }
        if (parsed.protocol === 2 && Array.isArray(parsed.runtime)) {
          const runtimeRows = parsed.runtime.slice(0, 500).filter((row: any) => guildIds.includes(String(row?.guild_id)))
            .map((row: any) => ({ guild_id: String(row.guild_id), snapshot: row.snapshot ?? {},
              applied: row.applied ?? {}, errors: row.errors ?? {},
              command_count: Math.max(0, Math.min(100000, Number(row.command_count) || 0)),
              version: String(row.version ?? "").slice(0, 64), updated_at: new Date().toISOString() }));
          if (runtimeRows.length) {
            const write = await (supabaseAdmin as any).from("guild_bot_runtime").upsert(runtimeRows, { onConflict: "guild_id" });
            if (write.error) return Response.json({ error: "Runtime status write failed" }, { status: 500 });
          }
        }
        return Response.json({
          protocol: 2,
          dashboard,
          tickets,
          guilds,
          verification,
          leveling,
          synced_at: new Date().toISOString(),
        });
      },
    },
  },
});
