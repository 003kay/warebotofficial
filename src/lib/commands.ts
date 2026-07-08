export interface CommandCategory {
  slug: string;
  name: string;
  description: string;
  commands: string[];
}

export const commandCategories: CommandCategory[] = [
  {
    slug: "moderation",
    name: "Moderation",
    description: "Keep your server safe with a full moderation toolkit.",
    commands: [
      "ban", "kick", "unban", "hardban", "softban", "massban", "mute", "unmute",
      "timeout", "untimeout", "warn", "jail", "unjail", "rmute", "imute", "clear",
      "strip", "restore", "lockdown", "lock", "unlock", "lockall", "masskick",
      "massmove", "massrename", "massrole", "massdisconnect", "massdm",
    ],
  },
  {
    slug: "anti",
    name: "Anti",
    description: "Automated protections against raids, spam, and malicious activity.",
    commands: [
      "anti", "antinuke", "automod", "filter", "blacklist", "anti ad", "anti link",
      "anti raid", "anti spam", "anti ghostping", "anti bot",
    ],
  },
  {
    slug: "voicemaster",
    name: "VoiceMaster",
    description: "Give members full control over their own voice channels.",
    commands: [
      "voicemaster setup", "reset", "sendinterface", "lock", "unlock", "hide",
      "reveal", "rename", "claim", "delete", "limit", "bitrate", "status",
      "permit", "reject", "drag", "temporary", "joinrole", "information",
    ],
  },
  {
    slug: "logging",
    name: "Logging",
    description: "Track everything happening in your server.",
    commands: ["log", "logs", "audit", "case", "cases"],
  },
  {
    slug: "welcome",
    name: "Welcome",
    description: "Onboarding, boosts, invites, and member events.",
    commands: [
      "autorole", "boostrole", "boostmessage", "counting", "birthday",
      "invite", "inviteinfo", "invites",
    ],
  },
  {
    slug: "economy",
    name: "Economy",
    description: "Currency, games, and a full server-side economy.",
    commands: [
      "balance", "bank", "deposit", "daily", "beg", "crime", "heist", "gamble",
      "casino", "lottery", "market", "inventory", "buy", "fishing",
    ],
  },
  {
    slug: "ai",
    name: "AI",
    description: "Chat, code, and image generation powered by AI.",
    commands: [
      "ai", "ask", "gemini", "aichat", "aicode", "aiexplain", "aigrammar",
      "aiimage", "essay", "explain", "code",
    ],
  },
  {
    slug: "utility",
    name: "Utility",
    description: "Everyday tools your server actually needs.",
    commands: [
      "help", "prefix", "avatar", "banner", "userinfo", "serverinfo",
      "membercount", "channelinfo", "emojiinfo", "google", "github",
      "calculator", "math", "define", "crypto", "countdown", "base64",
    ],
  },
  {
    slug: "fun",
    name: "Fun",
    description: "Games, minigames, and social commands.",
    commands: [
      "8ball", "coinflip", "dice", "hangman", "checkers", "chess", "connect4",
      "battleship", "higherlower", "fasttype", "memorygame", "joke", "hug",
      "kiss", "cuddle", "gay", "howgay", "howhot", "braincells", "delulu", "marry",
    ],
  },
  {
    slug: "message-tools",
    name: "Message Tools",
    description: "Embeds, cloning, snipes, and message management.",
    commands: [
      "embed", "embeds", "message", "copy", "clone", "cloneuser", "cleanup",
      "editsnipe", "clearsnipe", "firstmessage",
    ],
  },
  {
    slug: "administration",
    name: "Administration",
    description: "Server-wide controls and configuration.",
    commands: [
      "backup", "dashboard", "config", "load", "import", "export", "execute",
      "force", "forcerole", "forcetimeout", "forceavatar", "ghost",
    ],
  },
];
