import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

async function requireGuildManager(guildId: string) {
  const { readSessionDataFromCookie } = await import("@/lib/session.server");
  const { userManagesGuild } = await import("@/lib/discord.server");
  const req = getRequest();
  const session = readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
  if (!session) throw new Error("Not signed in");
  const guild = await userManagesGuild(session.accessToken, guildId);
  if (!guild) throw new Error("You don't manage this server");
  return { session, guild };
}

export const publishTicketPanelLive = createServerFn({ method: "POST" })
  .inputValidator((d: {
    guildId: string;
    channelId: string;
    title: string;
    description: string;
    color: string;
    panel_type: string;
    dropdown_placeholder: string;
    button_label: string;
    button_emoji: string;
    button_style: string;
    options: { label: string; description: string; emoji: string; position: number }[];
  }) => d)
  .handler(async ({ data }) => {
    await requireGuildManager(data.guildId);
    const { fetchGuildChannels, publishPanelMessage } = await import("@/lib/discord-bot.server");
    const channels = await fetchGuildChannels(data.guildId);
    if (!channels) throw new Error("Ware could not access this server. Check the bot token and server permissions.");
    const channel = channels.find((c) => c.id === data.channelId && (c.type === 0 || c.type === 5));
    if (!channel) throw new Error("That text channel is not available to Ware.");

    const { messageId } = await publishPanelMessage(
      data.channelId,
      {
        title: data.title.slice(0, 256),
        description: data.description.slice(0, 4000),
        color: data.color,
        panel_type: data.panel_type,
        dropdown_placeholder: data.dropdown_placeholder.slice(0, 150),
        button_label: data.button_label.slice(0, 80),
        button_emoji: data.button_emoji.slice(0, 100),
        button_style: data.button_style,
      },
      null,
      data.options.slice(0, 10).map((option, index) => ({
        id: `live-${index}`,
        position: index,
        label: option.label.slice(0, 100),
        description: option.description.slice(0, 100),
        emoji: option.emoji.slice(0, 100),
      })),
    );

    return { ok: true, messageId, channelName: channel.name };
  });
