const DISCORD_API = "https://discord.com/api/v10";

function botHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN not set");
  return { Authorization: `Bot ${token}`, "Content-Type": "application/json" };
}

export type DiscordChannel = {
  id: string;
  name: string;
  type: number; // 0=text, 4=category, 5=announcement, 15=forum
  parent_id: string | null;
  position: number;
};

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
};

// Returns null if the bot isn't in the guild.
export async function fetchGuildChannels(guildId: string): Promise<DiscordChannel[] | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, { headers: botHeaders() });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Discord channels fetch failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as DiscordChannel[];
}

export async function fetchGuildRoles(guildId: string): Promise<DiscordRole[] | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, { headers: botHeaders() });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Discord roles fetch failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as DiscordRole[];
}

const STYLE_MAP: Record<string, number> = { primary: 1, secondary: 2, success: 3, danger: 4 };

function buildPanelPayload(panel: {
  title: string;
  description: string;
  color: string;
  button_label: string;
  button_emoji: string;
  button_style: string;
}) {
  const colorInt = parseInt((panel.color || "#5865F2").replace("#", ""), 16) || 0x5865f2;
  return {
    embeds: [{ title: panel.title, description: panel.description, color: colorInt }],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: STYLE_MAP[panel.button_style] ?? 1,
            label: panel.button_label,
            custom_id: "ware_open_ticket",
            emoji: panel.button_emoji ? { name: panel.button_emoji } : undefined,
          },
        ],
      },
    ],
  };
}

// Creates the panel message (or edits it if we already have one).
export async function publishPanelMessage(
  channelId: string,
  panel: Parameters<typeof buildPanelPayload>[0],
  existingMessageId: string | null,
): Promise<{ messageId: string }> {
  const payload = buildPanelPayload(panel);

  if (existingMessageId) {
    const edit = await fetch(
      `${DISCORD_API}/channels/${channelId}/messages/${existingMessageId}`,
      { method: "PATCH", headers: botHeaders(), body: JSON.stringify(payload) },
    );
    if (edit.ok) return { messageId: existingMessageId };
    // Fall through to a fresh post if the old message is gone / channel changed.
  }

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Discord post failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string };
  return { messageId: json.id };
}
