export const dashboardFields: Record<string, string[]> = {
  "filters": ["enabled", "caps", "spam", "spoiler", "massmention", "musicfiles", "emoji", "invites", "links", "snipe"],
  "server": [
    "prefix",
    "deleteCommandMessages",
    "dmModerationActions"
  ],
  "automations": [
    "enabled",
    "autoRoleId"
  ],
  "customCommands": [
    "enabled"
  ],
  "voicemaster": [
    "enabled",
    "joinChannelId",
    "categoryId",
    "defaultName",
    "userLimit",
    "autoDelete"
  ],
  "messages": [
    "welcomeEnabled",
    "welcomeChannelId",
    "welcomeMessage",
    "leaveEnabled",
    "leaveChannelId",
    "leaveMessage"
  ],
  "logging": [
    "enabled",
    "channelId"
  ],
  "permissions": [
    "staffRoleId",
    "jailRemoveRoles"
  ],
  "joinGate": [
    "ageEnabled",
    "minimumAgeDays",
    "requireAvatar",
    "action",
    "massjoinEnabled",
    "joinThreshold",
    "lockChannels",
    "punishJoins"
  ]
};
