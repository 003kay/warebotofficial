import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getTicketGuildEmojis = createServerFn({ method: "GET" })
  .inputValidator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    const { readSessionDataFromCookie } = await import("@/lib/session.server");
    const { userManagesGuild } = await import("@/lib/discord.server");
    const { fetchGuildEmojis } = await import("@/lib/discord-bot.server");
    const req = getRequest();
    const session = await readSessionDataFromCookie(req?.headers.get("cookie") ?? null);
    if (!session) throw new Error("Not signed in");
    const guild = await userManagesGuild(session.accessToken, data.guildId);
    if (!guild) throw new Error("You don't manage this server");
    const emojis = await fetchGuildEmojis(data.guildId).catch(() => []);
    return (emojis ?? []).filter((emoji) => emoji.id && emoji.name && emoji.available !== false).map((emoji) => ({
      id: emoji.id,
      name: emoji.name as string,
      animated: Boolean(emoji.animated),
      url: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}?size=64&quality=lossless`,
      value: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`,
    }));
  });
