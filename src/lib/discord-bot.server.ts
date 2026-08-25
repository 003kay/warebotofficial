const DISCORD_API = "https://discord.com/api/v10";

function getBotToken() {
  const token = (
    process.env.DISCORD_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    process.env.DISCORD_TOKEN ||
    ""
  ).trim();
  if (!token) throw new Error("Ware dashboard bot token is not configured. Set DISCORD_BOT_TOKEN in the website deployment environment.");
  return token.replace(/^Bot\s+/i, "");
}

function botHeaders() {
  return { Authorization: `Bot ${getBotToken()}`, "Content-Type": "application/json" };
}

export type DiscordChannel = { id: string; name: string; type: number; parent_id: string | null; position: number };
export type DiscordRole = { id: string; name: string; color: number; position: number; managed: boolean; permissions: string };
export type DiscordGuildMember = {
  user?: { id: string; username: string; global_name?: string | null; avatar?: string | null };
  nick?: string | null;
  roles: string[];
};
export type DiscordAutoModRule = {
  id: string;
  name: string;
  enabled: boolean;
  trigger_type: number;
  trigger_metadata?: { keyword_filter?: string[]; regex_patterns?: string[]; presets?: number[]; allow_list?: string[] };
};

export type BotGuildStatus =
  | { connected: true; reason: null }
  | { connected: false; reason: "not_in_guild" | "forbidden" | "token_missing" | "token_invalid" | "discord_error" };

export async function getBotGuildStatus(guildId: string): Promise<BotGuildStatus> {
  let headers: ReturnType<typeof botHeaders>;
  try { headers = botHeaders(); } catch { return { connected: false, reason: "token_missing" }; }
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}`, { headers, cache: "no-store" });
  if (res.ok) return { connected: true, reason: null };
  if (res.status === 404) return { connected: false, reason: "not_in_guild" };
  if (res.status === 401) return { connected: false, reason: "token_invalid" };
  if (res.status === 403) return { connected: false, reason: "forbidden" };
  return { connected: false, reason: "discord_error" };
}

export async function fetchGuildChannels(guildId: string): Promise<DiscordChannel[] | null> {
  const status = await getBotGuildStatus(guildId);
  if (!status.connected) return null;
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, { headers: botHeaders(), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Discord channels fetch failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as DiscordChannel[];
}

export async function fetchGuildRoles(guildId: string): Promise<DiscordRole[] | null> {
  const status = await getBotGuildStatus(guildId);
  if (!status.connected) return null;
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, { headers: botHeaders(), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Discord roles fetch failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as DiscordRole[];
}

export async function fetchGuildMembers(guildId: string): Promise<DiscordGuildMember[] | null> {
  const status = await getBotGuildStatus(guildId);
  if (!status.connected) return null;
  const all: DiscordGuildMember[] = [];
  let after = "0";
  for (let page = 0; page < 10; page += 1) {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members?limit=1000&after=${after}`, { headers: botHeaders(), cache: "no-store" });
    if (res.status === 403) return null;
    if (!res.ok) throw new Error(`Discord members fetch failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as DiscordGuildMember[];
    all.push(...batch);
    if (batch.length < 1000) break;
    const last = batch[batch.length - 1]?.user?.id;
    if (!last) break;
    after = last;
  }
  return all;
}

export async function fetchGuildAutoModRules(guildId: string): Promise<DiscordAutoModRule[] | null> {
  const status = await getBotGuildStatus(guildId);
  if (!status.connected) return null;
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/auto-moderation/rules`, { headers: botHeaders(), cache: "no-store" });
  if (res.status === 404) return [];
  if (res.status === 403) return null;
  if (!res.ok) throw new Error(`Discord AutoMod fetch failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as DiscordAutoModRule[];
}

export async function removeGuildAutoModFilter(guildId: string, rawValue: string): Promise<boolean> {
  const value = rawValue.trim();
  if (!value) return false;
  const rules = await fetchGuildAutoModRules(guildId);
  if (!rules) throw new Error("Ware cannot edit Discord AutoMod. Make sure Ware has Manage Server permission.");
  let changed = false;
  for (const rule of rules) {
    if (rule.trigger_type !== 1) continue;
    const metadata = rule.trigger_metadata ?? {};
    const nextKeywords = (metadata.keyword_filter ?? []).filter((entry) => entry.toLowerCase() !== value.toLowerCase());
    const nextRegex = (metadata.regex_patterns ?? []).filter((entry) => entry.toLowerCase() !== value.toLowerCase());
    if (nextKeywords.length === (metadata.keyword_filter ?? []).length && nextRegex.length === (metadata.regex_patterns ?? []).length) continue;
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/auto-moderation/rules/${rule.id}`, {
      method: "PATCH",
      headers: botHeaders(),
      body: JSON.stringify({
        trigger_metadata: {
          ...metadata,
          keyword_filter: nextKeywords,
          regex_patterns: nextRegex,
        },
      }),
    });
    if (!res.ok) throw new Error(`Discord AutoMod update failed: ${res.status} ${await res.text()}`);
    changed = true;
  }
  return changed;
}

const STYLE_MAP: Record<string, number> = { primary: 1, secondary: 2, success: 3, danger: 4 };
export type PanelOption = { id: string; position: number; label: string; description: string; emoji: string };

function parseEmoji(raw: string): { name?: string; id?: string; animated?: boolean } | undefined {
  if (!raw) return undefined;
  const m = raw.match(/^<(a?):([^:]+):(\d+)>$/);
  if (m) return { name: m[2], id: m[3], animated: m[1] === "a" };
  return { name: raw };
}

function buildPanelPayload(panel: { title: string; description: string; color: string; button_label: string; button_emoji: string; button_style: string; panel_type?: string; dropdown_placeholder?: string }, options: PanelOption[] = []) {
  const colorInt = parseInt((panel.color || "#5865F2").replace("#", ""), 16) || 0x5865f2;
  const useDropdown = panel.panel_type === "dropdown" && options.length > 0;
  const components = useDropdown
    ? [{ type: 1, components: [{ type: 3, custom_id: "ware_open_ticket_select", placeholder: panel.dropdown_placeholder || "Select a ticket category…", min_values: 1, max_values: 1, options: options.slice().sort((a, b) => a.position - b.position).slice(0, 25).map((o) => ({ label: o.label.slice(0, 100) || "Support", value: o.id, description: o.description ? o.description.slice(0, 100) : undefined, emoji: parseEmoji(o.emoji) })) }] }]
    : [{ type: 1, components: [{ type: 2, style: STYLE_MAP[panel.button_style] ?? 1, label: panel.button_label, custom_id: "ware_open_ticket", emoji: parseEmoji(panel.button_emoji) }] }];
  return { embeds: [{ title: panel.title, description: panel.description, color: colorInt }], components };
}

export async function publishPanelMessage(channelId: string, panel: Parameters<typeof buildPanelPayload>[0], existingMessageId: string | null, options: PanelOption[] = []): Promise<{ messageId: string }> {
  const payload = buildPanelPayload(panel, options);
  if (existingMessageId) {
    const edit = await fetch(`${DISCORD_API}/channels/${channelId}/messages/${existingMessageId}`, { method: "PATCH", headers: botHeaders(), body: JSON.stringify(payload) });
    if (edit.ok) return { messageId: existingMessageId };
  }
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, { method: "POST", headers: botHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Discord post failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string };
  return { messageId: json.id };
}

export async function publishTranscriptClosedLog(input: { channelId: string; transcriptId: string; ticketId: string; openerName?: string | null; openerId: string; closerName?: string | null; closerId?: string | null; claimerName?: string | null; claimerId?: string | null; reason?: string | null; openedAt?: string | null; closedAt?: string | null; baseUrl: string }) {
  const transcriptUrl = `${input.baseUrl.replace(/\/$/, "")}/transcripts/${input.transcriptId}`;
  const opened = input.openedAt ? `<t:${Math.floor(new Date(input.openedAt).getTime() / 1000)}:f>` : "Unknown";
  const closed = input.closedAt ? `<t:${Math.floor(new Date(input.closedAt).getTime() / 1000)}:f>` : `<t:${Math.floor(Date.now() / 1000)}:f>`;
  const fields = [
    { name: "🎟️ Ticket", value: `#${input.ticketId}`, inline: true },
    { name: "✅ Opened by", value: input.openerName ? `${input.openerName}\n<@${input.openerId}>` : `<@${input.openerId}>`, inline: true },
    { name: "🔒 Closed by", value: input.closerId ? (input.closerName ? `${input.closerName}\n<@${input.closerId}>` : `<@${input.closerId}>`) : "Unknown", inline: true },
    { name: "🕒 Opened", value: opened, inline: true },
    { name: "📌 Claimed by", value: input.claimerId ? (input.claimerName ? `${input.claimerName}\n<@${input.claimerId}>` : `<@${input.claimerId}>`) : "Not claimed", inline: true },
    { name: "⏱️ Closed", value: closed, inline: true },
  ];
  if (input.reason) fields.push({ name: "❔ Reason", value: input.reason.slice(0, 1024), inline: false });
  const payload = { embeds: [{ title: "Ticket Closed", color: 0x2b2d31, fields, timestamp: input.closedAt || new Date().toISOString(), footer: { text: "Ware Tickets" } }], components: [{ type: 1, components: [{ type: 2, style: 5, label: "View Transcript", url: transcriptUrl, emoji: { name: "📄" } }] }] };
  const res = await fetch(`${DISCORD_API}/channels/${input.channelId}/messages`, { method: "POST", headers: botHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Discord transcript log failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string };
}
