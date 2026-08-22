export type ReferenceCommand = {
  name: string;
  description: string;
  usage: string;
  example: string;
  aliases?: string[];
  permission?: string;
};

const cmd = (
  name: string,
  description: string,
  args: string[] = [],
  permission = "None",
): ReferenceCommand => ({
  name,
  description,
  usage: `,${name}${args.length ? ` ${args.map(arg => `(${arg})`).join(" ")}` : ""}`,
  example: `,${name}${args.length ? ` ${args.map(arg => `<${arg}>`).join(" ")}` : ""}`,
  permission,
});

export const referenceCommandCategories = [
  {
    slug: "crypto",
    name: "Crypto",
    description: "Prices, gas, transaction lookups, and confirmation alerts.",
    commands: [
      cmd("crypto", "Checks the current price of the specified cryptocurrency", ["crypto", "cur"]),
      cmd("subscribe", "Subscribe to a bitcoin transaction for one confirmation", ["hash"]),
      cmd("transaction", "Get information about a BTC, LTC or ETH transaction", ["hash"]),
      cmd("gas", "View the current gas prices"),
    ],
  },
  {
    slug: "snipe",
    name: "Snipe",
    description: "Deleted, edited, and removed-reaction history tools.",
    commands: [
      cmd("clearsnipe", "Clear all results for reactions, edits and messages", [], "Manage Messages"),
      cmd("reactionhistory", "See logged reactions for a message", ["messagelink"], "Manage Messages"),
      cmd("reactionsnipe", "Snipe the latest reaction that was removed"),
      cmd("editsnipe", "Snipe the latest message that was edited"),
      cmd("snipe", "Snipe the latest message that was deleted"),
    ],
  },
  {
    slug: "counters",
    name: "Counters",
    description: "Live server statistic counters backed by channel names.",
    commands: [
      cmd("counter", "Create counters for everybody to see", [], "Manage Channels"),
      cmd("counter set", "Set a channel counter to an existing channel", ["channel", "option"], "Manage Channels"),
      cmd("counter list", "List every counter available in this server", [], "Manage Channels"),
      cmd("counter remove", "Remove a channel counter", ["channel", "action"], "Manage Channels"),
      cmd("counter add", "Create channel counter", ["option", "channel"], "Manage Channels"),
    ],
  },
  {
    slug: "timers",
    name: "Timers",
    description: "Recurring server messages and activity controls.",
    commands: [
      cmd("timer", "Post repeating messages in your server", [], "Manage Guild"),
      cmd("timer list", "View all auto messages in your server", [], "Manage Guild"),
      cmd("timer remove", "Remove repeating message from a channel", ["channel"], "Manage Guild"),
      cmd("timer view", "Preview a channel's auto message", ["channel"], "Manage Guild"),
      cmd("timer add", "Add repeating message to a channel", ["channel", "interval", "message"], "Manage Guild"),
      cmd("timer activity", "Enable or disable channel activity requirement", ["setting"], "Manage Guild"),
    ],
  },
  {
    slug: "twitch",
    name: "Twitch",
    description: "Profile lookups and live-stream notifications.",
    commands: [
      cmd("twitch", "Check a Twitch profile or set up stream notifications", ["username"]),
      cmd("twitch remove", "Remove stream notifications from a channel", ["channel", "streamer"], "Manage Guild"),
      cmd("twitch message", "Set a message for Twitch notifications", ["streamer", "message"], "Manage Guild"),
      cmd("twitch message view", "View Twitch message for new streams", ["streamer"], "Manage Guild"),
      cmd("twitch add", "Add stream notifications to a channel", ["channel", "streamer"], "Manage Guild"),
      cmd("twitch list", "View all Twitch stream notifications", [], "Manage Guild"),
    ],
  },
  {
    slug: "youtube",
    name: "YouTube",
    description: "Video search and channel upload notifications.",
    commands: [
      cmd("youtube", "Search YouTube for video results", ["search"]),
      cmd("youtube list", "View all YouTube post notifications", [], "Manage Guild"),
      cmd("youtube remove", "Disable post notifications for a channel", ["channel", "channelurl"], "Manage Guild"),
      cmd("youtube message", "Customize the message for YouTube notifications", ["channelurl", "message"], "Manage Guild"),
      cmd("youtube message view", "View YouTube message for new posts", ["channelurl"], "Manage Guild"),
      cmd("youtube add", "Enable post notifications for a channel", ["channel", "channelurl"], "Manage Guild"),
    ],
  },
  {
    slug: "logs",
    name: "Logs",
    description: "Logging channels, ignored targets, and per-event colors.",
    commands: [
      cmd("log", "Set up logging for your community", [], "Manage Guild"),
      cmd("log remove", "Remove events from a logging channel", ["channel", "event"], "Manage Guild"),
      cmd("log ignore", "Ignore a member or channel from being logged", ["member or channel"], "Manage Guild"),
      cmd("log ignore list", "View all ignored members and channels", [], "Manage Guild"),
      cmd("log color", "Customize embed color for an event", ["channel", "event", "color"], "Manage Guild"),
      cmd("log color list", "List embed color customization for events", ["channel"], "Manage Guild"),
    ],
  },
  {
    slug: "twitter",
    name: "X / Twitter",
    description: "Profile lookups and new-post feeds from X.",
    commands: [
      cmd("twitter", "Gets profile information on the given Twitter user", ["handle"]),
      cmd("twitter remove", "Remove feed for new tweets", ["channel", "handle"], "Manage Channels"),
      cmd("twitter add", "Create feed for new tweets from a user", ["channel", "handle"], "Manage Channels"),
      cmd("twitter message", "Set a message for new tweets", ["handle", "message"], "Manage Channels"),
      cmd("twitter message view", "View Twitter message for new tweets", ["handle"], "Manage Channels"),
      cmd("twitter list", "View a list of every Twitter feed", [], "Manage Channels"),
    ],
  },
  {
    slug: "fortnite",
    name: "Fortnite",
    description: "Item information, shop updates, pings, voting, and watches.",
    commands: [
      cmd("fortnite", "Set automatic Fortnite Shop rotation updates", [], "Manage Guild"),
      cmd("fortnite shop", "Set channel for Item Shop updates", ["channel"], "Manage Guild"),
      cmd("fortnite shop ping", "Set role for Item Shop updates", ["role"], "Manage Guild"),
      cmd("fortnite shop voting", "Set voting for Item Shop updates", ["setting"], "Manage Guild"),
      cmd("fortnite item", "View information on a Fortnite cosmetic item", ["name"]),
      cmd("fortnite watch", "Set reminder for an item", ["item"]),
    ],
  },
  {
    slug: "antiraid",
    name: "AntiRaid",
    description: "Join protection, account-age rules, avatar rules, and raid state.",
    commands: [
      cmd("antiraid", "Configure protection against potential raids", [], "Manage Guild"),
      cmd("antiraid newaccounts", "Punish new registered accounts", ["setting", "flags"], "Manage Guild"),
      cmd("antiraid whitelist", "Create a one-time whitelist to allow a user to join", ["member"], "Manage Guild"),
      cmd("antiraid whitelist view", "View all current antiraid whitelists", [], "Manage Guild"),
      cmd("antiraid avatar", "Punish accounts without a profile picture", ["setting", "flags"], "Manage Guild"),
      cmd("antiraid config", "View server antiraid configuration", [], "Manage Guild"),
      cmd("antiraid state", "Turn off server's raid state", [], "Manage Guild"),
      cmd("antiraid massjoin", "Protect server against mass bot raids", ["setting", "flags"], "Manage Guild"),
    ],
  },
  {
    slug: "bump-reminder",
    name: "Bump Reminder",
    description: "Disboard bump reminders, channel controls, and cleanup behavior.",
    commands: [
      cmd("bumpreminder", "Get reminders to /bump your server on Disboard!", ["setting"], "Manage Channels"),
      cmd("bumpreminder autoclean", "Automatically delete messages that aren't /bump", ["choice"], "Manage Channels"),
      cmd("bumpreminder channel", "Set Bump Reminder channel for the server", ["channel"], "Manage Channels"),
      cmd("bumpreminder autolock", "Lock channel until ready to use /bump", ["choice"], "Manage Channels"),
      cmd("bumpreminder message", "Set the reminder message to run /bump", ["message"], "Manage Channels"),
      cmd("bumpreminder message view", "View the current remind message", [], "Manage Channels"),
    ],
  },
  {
    slug: "utility",
    name: "Utility",
    description: "Useful server tools, expression copying, and general utilities.",
    commands: [
      cmd("steal", "Copy custom Discord emojis from other servers into the current server", ["emojis"], "Manage Expressions"),
      cmd("steal-sticker", "Copy a Discord sticker into the current server from a reply or channel", ["channel"], "Manage Expressions"),
    ],
  },
] as const;