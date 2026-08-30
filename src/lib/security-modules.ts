// Catalog of every configurable security module. The dashboard renders these
// as one card per entry. The bot reads the same keys from `security_modules`.

export type PunishmentOption = "none" | "warn" | "strip" | "mute" | "kick" | "ban" | "quarantine";

export type ModuleField =
  | { kind: "threshold"; label?: string }
  | { kind: "extra_number"; key: string; label: string; min?: number; max?: number; default: number }
  | { kind: "extra_text"; key: string; label: string; placeholder?: string };

export type SecurityModule = {
  key: string;
  name: string;
  description: string;
  defaultPunishment: PunishmentOption;
  defaultCount: number;
  defaultSeconds: number;
  supportsThreshold: boolean;
  extraFields?: ModuleField[];
};

export type SecurityGroup = {
  slug: string;
  name: string;
  description: string;
  modules: SecurityModule[];
};

const m = (
  key: string,
  name: string,
  description: string,
  opts: Partial<Omit<SecurityModule, "key" | "name" | "description">> = {},
): SecurityModule => ({
  key,
  name,
  description,
  defaultPunishment: opts.defaultPunishment ?? "strip",
  defaultCount: opts.defaultCount ?? 3,
  defaultSeconds: opts.defaultSeconds ?? 60,
  supportsThreshold: opts.supportsThreshold ?? true,
  extraFields: opts.extraFields,
});

export const PUNISHMENTS: { value: PunishmentOption; label: string }[] = [
  { value: "none", label: "Log only" },
  { value: "warn", label: "Warn" },
  { value: "strip", label: "Strip roles" },
  { value: "mute", label: "Timeout" },
  { value: "kick", label: "Kick" },
  { value: "ban", label: "Ban" },
  { value: "quarantine", label: "Quarantine" },
];

export const SECURITY_GROUPS: SecurityGroup[] = [
  {
    slug: "core",
    name: "Core Protection",
    description: "Verification gates, quarantine, panic and raid modes.",
    modules: [
      m("verification", "Verification gate", "Require new members to verify before they can chat.", { supportsThreshold: false, defaultPunishment: "none" }),
      m("captcha", "Captcha challenge", "Force a captcha to complete verification.", { supportsThreshold: false, defaultPunishment: "none" }),
      m("agecheck", "Minimum account age", "Reject accounts younger than the configured age.", { supportsThreshold: false, defaultPunishment: "kick", extraFields: [{ kind: "extra_number", key: "min_days", label: "Minimum age (days)", min: 0, max: 365, default: 7 }] }),
      m("panicmode", "Panic mode", "Lock the server and quarantine recent joiners on demand.", { supportsThreshold: false, defaultPunishment: "quarantine" }),
      m("raidmode", "Raid mode", "Auto-kick new joins and tighten verification during a raid.", { supportsThreshold: true, defaultPunishment: "kick", defaultCount: 10, defaultSeconds: 60 }),
      m("altdetect", "Alt account detection", "Flag suspected alts of banned members.", { supportsThreshold: false, defaultPunishment: "quarantine" }),
      m("dehoist", "Dehoist usernames", "Auto-rename members using hoist characters.", { supportsThreshold: false, defaultPunishment: "none" }),
      m("normalize", "Normalize usernames", "Strip zalgo, RTL, and unusual unicode from nicknames.", { supportsThreshold: false, defaultPunishment: "none" }),
      m("namefilter", "Name filter", "Block or auto-rename members with blacklisted names.", { supportsThreshold: false, defaultPunishment: "warn" }),
      m("joingate_noavatar", "Join gate: no avatar", "Filter joins from accounts without a profile picture.", { supportsThreshold: false, defaultPunishment: "kick" }),
      m("joingate_vpn", "Join gate: VPN / proxy", "Block joins from known VPN or proxy IPs.", { supportsThreshold: false, defaultPunishment: "kick" }),
    ],
  },
  {
    slug: "antinuke",
    name: "Anti-Nuke",
    description: "Detect destructive actions, restore channel/role/server changes, then log, strip, kick, or ban based on X actions inside your chosen time window.",
    modules: [
      m("anti_channel", "Channel protection + restore", "Restores unauthorized channel deletes/edits and removes unauthorized channel creation.", { defaultPunishment: "ban", defaultCount: 3, defaultSeconds: 60 }),
      m("anti_role", "Role protection + restore", "Restores unauthorized role deletes/edits, role permissions and previous role membership where available.", { defaultPunishment: "ban", defaultCount: 3, defaultSeconds: 60 }),
      m("anti_ban", "Anti mass ban", "Detect repeated unauthorized member bans.", { defaultPunishment: "ban", defaultCount: 3, defaultSeconds: 60 }),
      m("anti_kick", "Anti mass kick", "Detect repeated unauthorized member kicks.", { defaultPunishment: "ban", defaultCount: 3, defaultSeconds: 60 }),
      m("anti_prune", "Anti prune", "Detect mass member prune attempts.", { defaultPunishment: "ban", defaultCount: 1, defaultSeconds: 300 }),
      m("anti_webhook", "Anti webhook", "Detect webhook create/update/delete outside approved staff.", { defaultPunishment: "ban", defaultCount: 2, defaultSeconds: 60 }),
      m("anti_emoji", "Anti emoji / sticker nuke", "Detect mass emoji or sticker deletion.", { defaultPunishment: "ban", defaultCount: 5, defaultSeconds: 60 }),
      m("anti_server", "Server settings + vanity restore", "Restores protected server settings and vanity changes, with configurable response timing.", { defaultPunishment: "ban", defaultCount: 1, defaultSeconds: 60, supportsThreshold: true }),
      m("anti_permission", "Dangerous role permission edits", "Detect dangerous permission grants and restore protected role state.", { defaultPunishment: "strip", defaultCount: 1, defaultSeconds: 60, supportsThreshold: true }),
      m("anti_bot", "Unauthorized bot add", "Detect new bots added without approval and apply the selected response.", { defaultPunishment: "ban", defaultCount: 1, defaultSeconds: 60, supportsThreshold: true }),
    ],
  },
  {
    slug: "antiraid",
    name: "Anti-Raid & Spam",
    description: "Automatically catch join raids, spam, floods, and content abuse.",
    modules: [
      m("anti_raid", "Anti raid", "Catch join raids and lock the server.", { defaultPunishment: "kick", defaultCount: 10, defaultSeconds: 30 }),
      m("anti_spam", "Anti spam", "Detect and punish message spam.", { defaultPunishment: "mute", defaultCount: 6, defaultSeconds: 8 }),
      m("anti_flood", "Anti flood", "Punish duplicate-message flooding.", { defaultPunishment: "mute", defaultCount: 4, defaultSeconds: 10 }),
      m("anti_mention", "Anti mass mention", "Punish mentions in a single message.", { defaultPunishment: "mute", defaultCount: 5, defaultSeconds: 0 }),
      m("anti_caps", "Anti caps", "Punish excessive capital letters.", { defaultPunishment: "warn", supportsThreshold: false, extraFields: [{ kind: "extra_number", key: "max_percent", label: "Max caps %", min: 30, max: 100, default: 70 }] }),
      m("anti_emojispam", "Anti emoji spam", "Punish excessive emoji in a message.", { defaultPunishment: "warn", supportsThreshold: false, extraFields: [{ kind: "extra_number", key: "max_emojis", label: "Max emoji per message", min: 3, max: 50, default: 10 }] }),
      m("anti_stickerspam", "Anti sticker spam", "Punish sticker spam.", { defaultPunishment: "warn", defaultCount: 4, defaultSeconds: 10 }),
      m("anti_ghostping", "Anti ghost ping", "Log or warn members who ping then delete.", { defaultPunishment: "warn", supportsThreshold: false }),
      m("anti_selfbot", "Anti selfbot", "Detect and punish suspected selfbots.", { defaultPunishment: "kick", supportsThreshold: false }),
      m("anti_impersonation", "Anti impersonation", "Detect members impersonating staff by name or avatar.", { defaultPunishment: "quarantine", supportsThreshold: false }),
    ],
  },
  {
    slug: "filters",
    name: "Content Filters",
    description: "Block links, invites, scams, tokens, NSFW, and word filters.",
    modules: [
      m("anti_invite", "Anti invite", "Block Discord invite links.", { defaultPunishment: "mute", supportsThreshold: false }),
      m("anti_link", "Anti link", "Block all links except whitelisted domains.", { defaultPunishment: "warn", supportsThreshold: false }),
      m("anti_scam", "Anti scam", "Block known scam / phishing domains.", { defaultPunishment: "ban", supportsThreshold: false }),
      m("anti_token", "Anti token leak", "Detect and delete leaked Discord tokens.", { defaultPunishment: "warn", supportsThreshold: false }),
      m("anti_nsfw", "Anti NSFW", "Scan images for NSFW content and remove.", { defaultPunishment: "warn", supportsThreshold: false }),
      m("filter_words", "Word filter", "Syncs Discord AutoMod keyword filters and lets you add Ware-only filters too.", { defaultPunishment: "warn", supportsThreshold: false }),
      m("anti_dm", "Anti DM abuse", "Block ware DMs from non-trusted users.", { defaultPunishment: "none", supportsThreshold: false }),
    ],
  },
];

export const ALL_MODULES: SecurityModule[] = SECURITY_GROUPS.flatMap((g) => g.modules);
export const MODULE_KEYS = new Set(ALL_MODULES.map((m) => m.key));

export const LIST_TYPES = [
  "trusted",
  "whitelist",
  "extra_owner",
  "name_filter",
  "word_filter",
  "link_whitelist",
  "scam_domain",
] as const;
export type ListType = (typeof LIST_TYPES)[number];
