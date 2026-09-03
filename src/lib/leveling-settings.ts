export type LevelReward = { level: number; roleId: string };
export type PercentBooster = { percentage: number; roleId?: string; channelId?: string };

export type LevelingSettings = {
  enabled: boolean;
  curve: "linear" | "quadratic";
  curveMultiplier: number;
  maxLevel: number;
  messageXpEnabled: boolean;
  messageXpMode: "random" | "per_word";
  messageXpMin: number;
  messageXpMax: number;
  messageXpCooldown: number;
  voiceXpEnabled: boolean;
  voiceXpMin: number;
  voiceXpMax: number;
  voiceXpCooldown: number;
  voiceXpMinMembers: number;
  voiceXpAntiAfk: boolean;
  reactionXpEnabled: boolean;
  reactionXpAwards: "both" | "sender" | "receiver";
  reactionXpMin: number;
  reactionXpMax: number;
  reactionXpCooldown: number;
  levelupEnabled: boolean;
  levelupMode: "context" | "channel" | "dm" | "none";
  levelupChannelId: string;
  levelupMessage: string;
  levelupImage: boolean;
  stackRewards: boolean;
  roleRewards: LevelReward[];
  firstPlaceRoleId: string;
  stackBoosters: boolean;
  voteRewardEnabled: boolean;
  effortEnabled: boolean;
  effortWords: number;
  effortImages: number;
  effortPercentage: number;
  roleBoosters: PercentBooster[];
  channelBoosters: PercentBooster[];
  weeklyEnabled: boolean;
  weeklyChannelId: string;
  monthlyEnabled: boolean;
  monthlyChannelId: string;
  rankCardAccent: string;
  rankCardBackground: string;
  disableXpCommand: boolean;
  disableLeaderboardReset: boolean;
  leaderboardVanity: string;
  autoReset: boolean;
  restrictionMode: "deny" | "allow";
  restrictedChannelIds: string[];
  restrictedRoleIds: string[];
  threadXp: boolean;
  forumXp: boolean;
  textInVoiceXp: boolean;
  slashCommandXp: boolean;
};

export const DEFAULT_LEVELING_SETTINGS: LevelingSettings = {
  enabled: false,
  curve: "linear",
  curveMultiplier: 1,
  maxLevel: 0,
  messageXpEnabled: true,
  messageXpMode: "random",
  messageXpMin: 5,
  messageXpMax: 5,
  messageXpCooldown: 0,
  voiceXpEnabled: false,
  voiceXpMin: 15,
  voiceXpMax: 40,
  voiceXpCooldown: 180,
  voiceXpMinMembers: 2,
  voiceXpAntiAfk: true,
  reactionXpEnabled: false,
  reactionXpAwards: "both",
  reactionXpMin: 25,
  reactionXpMax: 25,
  reactionXpCooldown: 300,
  levelupEnabled: true,
  levelupMode: "context",
  levelupChannelId: "",
  levelupMessage: "{user.mention} has reached level **{level}**. GG!",
  levelupImage: false,
  stackRewards: true,
  roleRewards: [],
  firstPlaceRoleId: "",
  stackBoosters: true,
  voteRewardEnabled: false,
  effortEnabled: false,
  effortWords: 25,
  effortImages: 3,
  effortPercentage: 10,
  roleBoosters: [],
  channelBoosters: [],
  weeklyEnabled: false,
  weeklyChannelId: "",
  monthlyEnabled: false,
  monthlyChannelId: "",
  rankCardAccent: "#6f7fe5",
  rankCardBackground: "#0b0d12",
  disableXpCommand: false,
  disableLeaderboardReset: false,
  leaderboardVanity: "",
  autoReset: true,
  restrictionMode: "deny",
  restrictedChannelIds: [],
  restrictedRoleIds: [],
  threadXp: true,
  forumXp: true,
  textInVoiceXp: true,
  slashCommandXp: false,
};

const asBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;
const asNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
};
const asText = (value: unknown, fallback: string, max: number) =>
  typeof value === "string" ? value.slice(0, max) : fallback;
const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;
const ids = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.map(String).filter((id) => /^\d{15,22}$/.test(id)))].slice(0, 100)
    : [];

export function normalizeLevelingSettings(value: unknown): LevelingSettings {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const d = DEFAULT_LEVELING_SETTINGS;
  const rewards = Array.isArray(raw.roleRewards)
    ? raw.roleRewards
        .flatMap((entry) => {
          if (!entry || typeof entry !== "object") return [];
          const row = entry as Record<string, unknown>;
          const roleId = String(row.roleId || "");
          if (!/^\d{15,22}$/.test(roleId)) return [];
          return [{ level: Math.round(asNumber(row.level, 1, 1, 10_000)), roleId }];
        })
        .slice(0, 15)
    : [];
  const roleBoosters = Array.isArray(raw.roleBoosters)
    ? raw.roleBoosters
        .flatMap((entry) => {
          if (!entry || typeof entry !== "object") return [];
          const row = entry as Record<string, unknown>;
          const roleId = String(row.roleId || "");
          return /^\d{15,22}$/.test(roleId)
            ? [{ roleId, percentage: asNumber(row.percentage, 10, 0, 1000) }]
            : [];
        })
        .slice(0, 1)
    : [];
  const channelBoosters = Array.isArray(raw.channelBoosters)
    ? raw.channelBoosters
        .flatMap((entry) => {
          if (!entry || typeof entry !== "object") return [];
          const row = entry as Record<string, unknown>;
          const channelId = String(row.channelId || "");
          return /^\d{15,22}$/.test(channelId)
            ? [{ channelId, percentage: asNumber(row.percentage, 10, 0, 1000) }]
            : [];
        })
        .slice(0, 1)
    : [];
  return {
    enabled: asBoolean(raw.enabled, d.enabled),
    curve: oneOf(raw.curve, ["linear", "quadratic"] as const, d.curve),
    curveMultiplier: asNumber(raw.curveMultiplier, d.curveMultiplier, 0.1, 100),
    maxLevel: Math.round(asNumber(raw.maxLevel, d.maxLevel, 0, 10_000)),
    messageXpEnabled: asBoolean(raw.messageXpEnabled, d.messageXpEnabled),
    messageXpMode: oneOf(raw.messageXpMode, ["random", "per_word"] as const, d.messageXpMode),
    messageXpMin: Math.round(asNumber(raw.messageXpMin, d.messageXpMin, 0, 100_000)),
    messageXpMax: Math.round(asNumber(raw.messageXpMax, d.messageXpMax, 0, 100_000)),
    messageXpCooldown: Math.round(asNumber(raw.messageXpCooldown, d.messageXpCooldown, 0, 86_400)),
    voiceXpEnabled: asBoolean(raw.voiceXpEnabled, d.voiceXpEnabled),
    voiceXpMin: Math.round(asNumber(raw.voiceXpMin, d.voiceXpMin, 0, 100_000)),
    voiceXpMax: Math.round(asNumber(raw.voiceXpMax, d.voiceXpMax, 0, 100_000)),
    voiceXpCooldown: Math.round(asNumber(raw.voiceXpCooldown, d.voiceXpCooldown, 30, 86_400)),
    voiceXpMinMembers: Math.round(asNumber(raw.voiceXpMinMembers, d.voiceXpMinMembers, 1, 1000)),
    voiceXpAntiAfk: asBoolean(raw.voiceXpAntiAfk, d.voiceXpAntiAfk),
    reactionXpEnabled: asBoolean(raw.reactionXpEnabled, d.reactionXpEnabled),
    reactionXpAwards: oneOf(
      raw.reactionXpAwards,
      ["both", "sender", "receiver"] as const,
      d.reactionXpAwards,
    ),
    reactionXpMin: Math.round(asNumber(raw.reactionXpMin, d.reactionXpMin, 0, 100_000)),
    reactionXpMax: Math.round(asNumber(raw.reactionXpMax, d.reactionXpMax, 0, 100_000)),
    reactionXpCooldown: Math.round(
      asNumber(raw.reactionXpCooldown, d.reactionXpCooldown, 0, 86_400),
    ),
    levelupEnabled: asBoolean(raw.levelupEnabled, d.levelupEnabled),
    levelupMode: oneOf(
      raw.levelupMode,
      ["context", "channel", "dm", "none"] as const,
      d.levelupMode,
    ),
    levelupChannelId: asText(raw.levelupChannelId, "", 22),
    levelupMessage: asText(raw.levelupMessage, d.levelupMessage, 1500),
    levelupImage: asBoolean(raw.levelupImage, d.levelupImage),
    stackRewards: asBoolean(raw.stackRewards, d.stackRewards),
    roleRewards: rewards,
    firstPlaceRoleId: asText(raw.firstPlaceRoleId, "", 22),
    stackBoosters: asBoolean(raw.stackBoosters, d.stackBoosters),
    voteRewardEnabled: asBoolean(raw.voteRewardEnabled, d.voteRewardEnabled),
    effortEnabled: asBoolean(raw.effortEnabled, d.effortEnabled),
    effortWords: Math.round(asNumber(raw.effortWords, d.effortWords, 1, 5000)),
    effortImages: Math.round(asNumber(raw.effortImages, d.effortImages, 1, 10)),
    effortPercentage: asNumber(raw.effortPercentage, d.effortPercentage, 0, 1000),
    roleBoosters,
    channelBoosters,
    weeklyEnabled: asBoolean(raw.weeklyEnabled, d.weeklyEnabled),
    weeklyChannelId: asText(raw.weeklyChannelId, "", 22),
    monthlyEnabled: asBoolean(raw.monthlyEnabled, d.monthlyEnabled),
    monthlyChannelId: asText(raw.monthlyChannelId, "", 22),
    rankCardAccent: asText(raw.rankCardAccent, d.rankCardAccent, 7),
    rankCardBackground: asText(raw.rankCardBackground, d.rankCardBackground, 7),
    disableXpCommand: asBoolean(raw.disableXpCommand, d.disableXpCommand),
    disableLeaderboardReset: asBoolean(raw.disableLeaderboardReset, d.disableLeaderboardReset),
    leaderboardVanity: asText(raw.leaderboardVanity, "", 48).toLowerCase(),
    autoReset: asBoolean(raw.autoReset, d.autoReset),
    restrictionMode: oneOf(raw.restrictionMode, ["deny", "allow"] as const, d.restrictionMode),
    restrictedChannelIds: ids(raw.restrictedChannelIds),
    restrictedRoleIds: ids(raw.restrictedRoleIds),
    threadXp: asBoolean(raw.threadXp, d.threadXp),
    forumXp: asBoolean(raw.forumXp, d.forumXp),
    textInVoiceXp: asBoolean(raw.textInVoiceXp, d.textInVoiceXp),
    slashCommandXp: asBoolean(raw.slashCommandXp, d.slashCommandXp),
  };
}
