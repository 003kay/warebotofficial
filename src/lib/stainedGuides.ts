export type StainedGuide = { slug:string; title:string; group:string; summary:string; roots:string[]; steps:{title:string;text:string}[]; examples:string[]; note:string };
export const stainedGuides: StainedGuide[] = [
  {
    "slug": "introduction",
    "title": "Introduction",
    "group": "Overview",
    "summary": "Set up Stained, configure your community, and find the right command.",
    "roots": [
      "help",
      "setup",
      "setupmute",
      "prefix"
    ],
    "steps": [
      {
        "title": "Invite Stained",
        "text": "Use the invite button, choose your server, and place the bot role above the roles it will manage."
      },
      {
        "title": "Start with moderation",
        "text": "Run ,setme to prepare jail channels and ,setupmute to create mute roles. Use ,help followed by a command to inspect its arguments."
      },
      {
        "title": "Choose your next guide",
        "text": "Configure security first, then add messages, role rewards, tickets, and integrations. The dashboard reports when the running bot has applied a change."
      }
    ],
    "examples": [
      ",prefix set !",
      ",setme",
      ",setupmute"
    ],
    "note": ""
  },
  {
    "slug": "donator-perks",
    "title": "Donator Perks",
    "group": "Overview",
    "summary": "Understand the premium controls registered in Stained.",
    "roots": [
      "premium",
      "donate"
    ],
    "steps": [
      {
        "title": "Check your access",
        "text": "Use the premium commands to inspect your current entitlement. Feature availability depends on your Stained account and server configuration."
      },
      {
        "title": "Before purchasing",
        "text": "Confirm the current offering with Stained support. Another bot’s subscription tiers do not determine Stained’s features or pricing."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "customization",
    "title": "Customization",
    "group": "Overview",
    "summary": "Configure the bot’s presentation and server-specific behavior.",
    "roots": [
      "customize",
      "prefix",
      "settings"
    ],
    "steps": [
      {
        "title": "Server preferences",
        "text": "Choose a server prefix and configure response templates for welcome messages and moderation."
      },
      {
        "title": "Bot profile",
        "text": "Avatar, banner, and biography commands use the permissions enforced by the script. Account-wide profile changes are restricted to the bot owner."
      }
    ],
    "examples": [
      ",prefix set ,",
      ",customize avatar https://example.com/avatar.png"
    ],
    "note": ""
  },
  {
    "slug": "security-setup",
    "title": "Antinuke",
    "group": "Security",
    "summary": "Limit destructive actions and review the configuration before enabling modules.",
    "roots": [
      "antinuke"
    ],
    "steps": [
      {
        "title": "Configure trusted access",
        "text": "The server owner controls antinuke administration. Exemptions bypass protection, so review the admin and whitelist lists carefully."
      },
      {
        "title": "Enable individual modules",
        "text": "Choose a punishment and threshold per module. The command flag controls whether bot-issued moderation contributes to detection."
      },
      {
        "title": "Review the result",
        "text": "Inspect the configuration after each change. Stained needs the Discord permissions and role position required to carry out its configured punishment."
      }
    ],
    "examples": [
      ",antinuke channel on --threshold 3 --do ban",
      ",antinuke ban on --threshold 3 --do stripstaff --command on",
      ",antinuke config"
    ],
    "note": ""
  },
  {
    "slug": "join-gate",
    "title": "Join Gate",
    "group": "Security",
    "summary": "Screen new accounts and respond to bursts of joins.",
    "roots": [
      "antiraid",
      "recentban",
      "raid"
    ],
    "steps": [
      {
        "title": "Account checks",
        "text": "Require an avatar or a minimum account age. Age thresholds are measured in days; choose kick or ban as the action."
      },
      {
        "title": "Mass joins",
        "text": "Configure the join threshold and whether a detected raid locks channels or punishes new arrivals."
      },
      {
        "title": "After a raid",
        "text": "Review recent joins before using cleanup commands. Disable the raid state to restore saved channel permissions."
      }
    ],
    "examples": [
      ",antiraid age on --threshold 7 --do kick",
      ",antiraid massjoin on --threshold 10 --do kick --lock true --punish true",
      ",antiraid config"
    ],
    "note": ""
  },
  {
    "slug": "moderation-guide",
    "title": "Moderation",
    "group": "Security",
    "summary": "Prepare jail and mute roles, then configure staff responses.",
    "roots": [
      "setup",
      "setupmute",
      "settings",
      "invoke",
      "jail",
      "ban",
      "kick",
      "timeout"
    ],
    "steps": [
      {
        "title": "Initial setup",
        "text": "Run ,setme and ,setupmute. Check that Stained can manage the generated roles and write to the log channels."
      },
      {
        "title": "Role handling",
        "text": "Configure whether jail removes a member’s roles. Fake permissions can allow bot commands without granting native Discord moderation permissions."
      },
      {
        "title": "Response templates",
        "text": "Use invoke commands to configure supported public and private moderation messages."
      }
    ],
    "examples": [
      ",settings jailroles yes",
      ",invoke jail message {user.mention} was jailed: {reason}"
    ],
    "note": ""
  },
  {
    "slug": "fake-permissions",
    "title": "Fake Permissions",
    "group": "Security",
    "summary": "Grant roles permission to use Stained commands.",
    "roots": [
      "fakepermissions"
    ],
    "steps": [
      {
        "title": "Create a grant",
        "text": "Choose a server role and a comma-separated list of Discord permission names. These grants apply to Stained’s permission checks."
      },
      {
        "title": "Review access",
        "text": "List grants regularly and remove permissions no longer needed. A bot permission does not itself grant access to Discord’s native moderation controls."
      }
    ],
    "examples": [
      ",fakepermissions grant @Moderators manage_messages, moderate_members",
      ",fakepermissions list"
    ],
    "note": ""
  },
  {
    "slug": "honeypot",
    "title": "Honeypot",
    "group": "Security",
    "summary": "Detect messages posted in a designated trap channel.",
    "roots": [
      "honeypot"
    ],
    "steps": [
      {
        "title": "Choose a channel",
        "text": "Create a clearly marked channel that ordinary members should not use. Select ban, softban, or jail for messages sent there."
      },
      {
        "title": "Review exceptions",
        "text": "Administrators and configured staff are exempt. Keep Stained’s moderation log and role hierarchy configured."
      }
    ],
    "examples": [
      ",honeypot add #do-not-post jail",
      ",honeypot list",
      ",honeypot remove #do-not-post"
    ],
    "note": ""
  },
  {
    "slug": "server-configuration",
    "title": "Overview",
    "group": "Tickets",
    "summary": "Create private support conversations with configurable panels.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Start with ,tickets setup and your staff role. Build and publish a panel from the dashboard, then test it with a non-staff account."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-commands",
    "title": "Commands & Permissions",
    "group": "Tickets",
    "summary": "Find ticket administration and member actions.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Configuration and lifecycle actions have separate permission checks. Support staff should test claim, close, reopen, and transcript access before using a panel publicly."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-panels",
    "title": "Panels",
    "group": "Tickets",
    "summary": "Publish the entry point for your support system.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Choose a destination channel, panel text, and ticket options in the dashboard. Publish the panel and use tickets resend when a live message needs replacement."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-options",
    "title": "Options",
    "group": "Tickets",
    "summary": "Separate support requests into useful ticket types.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Choose a label, category, and support roles for each option. Keep private channel permissions explicit and verify them with a test account."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-forms",
    "title": "Forms",
    "group": "Tickets",
    "summary": "Collect information before staff handles a request.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Run tickets form, click Edit questions, and enter one question per line. Forms support up to five text questions. Run tickets options to select the panel option and attach a form. Answers are stored on the opened ticket."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-access",
    "title": "Blacklist & Access",
    "group": "Tickets",
    "summary": "Control who may open and participate in tickets.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Blacklist entries may target members or roles. Allow and deny commands manage extra participants in the current ticket; inspect the allow list before removing access."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-lifecycle",
    "title": "Lifecycle & Automation",
    "group": "Tickets",
    "summary": "Manage tickets from opening through closure.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Claim a ticket when a staff member takes responsibility. Close resolved requests, reopen follow-ups when needed, and export a transcript before deletion."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-messages",
    "title": "Custom Messages",
    "group": "Tickets",
    "summary": "Write clear panel and ticket responses.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Use the embed builder for panel content and keep opening instructions short. Preview the result in your test channel before publishing."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "ticket-variables",
    "title": "Variables",
    "group": "Tickets",
    "summary": "Use contextual values in ticket messages.",
    "roots": [
      "tickets"
    ],
    "steps": [
      {
        "title": "Configure",
        "text": "Only use variables supported by the selected message renderer. Preview the message with a test ticket to check user, server, and channel values."
      },
      {
        "title": "Verify",
        "text": "Open a test ticket and check that the requester, support roles, and bot can see the correct channel. Use the command reference below for the registered syntax."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "vanity-roles",
    "title": "Vanity Roles",
    "group": "Roles",
    "summary": "Reward members who advertise your server in their status.",
    "roots": [
      "vanity"
    ],
    "steps": [
      {
        "title": "Choose a matching phrase",
        "text": "Set the substring Stained should watch and add the reward roles with the vanity slash commands."
      },
      {
        "title": "Configure feedback",
        "text": "Choose the award channel, thank-you message, and log destination. The bot must be able to manage the reward roles."
      }
    ],
    "examples": [
      "/vanity set /stained",
      "/vanity role add @Supporter"
    ],
    "note": ""
  },
  {
    "slug": "booster-roles",
    "title": "Booster Roles",
    "group": "Roles",
    "summary": "Let boosters create a personal role.",
    "roots": [
      "boosterrole"
    ],
    "steps": [
      {
        "title": "Set the base role",
        "text": "Place a separator role above Discord’s booster role and below Stained. Configure it as the booster base."
      },
      {
        "title": "Create and customize",
        "text": "A booster can choose a color and name, then rename the role or change its icon. Server support for role icons is required."
      },
      {
        "title": "Keep roles tidy",
        "text": "Use list and cleanup to review tracked roles. The award settings manage an additional shared role for boosters."
      }
    ],
    "examples": [
      ",boosterrole base @BoosterBase",
      ",boosterrole #658A95 My role",
      ",boosterrole rename New name"
    ],
    "note": ""
  },
  {
    "slug": "reaction-roles",
    "title": "Reaction Roles",
    "group": "Roles",
    "summary": "Assign roles when members react to a message.",
    "roots": [
      "reactionrole"
    ],
    "steps": [
      {
        "title": "Register a reaction",
        "text": "Copy the target message link, choose an emoji, and select a role below Stained."
      },
      {
        "title": "Remove a mapping",
        "text": "Remove one emoji mapping or all mappings from a message. Test both adding and removing the reaction."
      }
    ],
    "examples": [
      ",reactionrole add MESSAGE_LINK ✅ @Member",
      ",reactionrole remove MESSAGE_LINK ✅"
    ],
    "note": ""
  },
  {
    "slug": "button-roles",
    "title": "Button Roles",
    "group": "Roles",
    "summary": "Attach role toggles to a Stained message.",
    "roots": [
      "buttonrole"
    ],
    "steps": [
      {
        "title": "Create the message",
        "text": "Send an embed using Stained, then copy its message link. Buttons can only be attached to a message the bot can edit."
      },
      {
        "title": "Add the role button",
        "text": "Choose a role, style, emoji, and short label. Use the list command to locate a button before removing it."
      }
    ],
    "examples": [
      ",buttonrole add MESSAGE_LINK @Member green ✅ Join",
      ",buttonrole list"
    ],
    "note": ""
  },
  {
    "slug": "system-messages",
    "title": "System Messages",
    "group": "Messages",
    "summary": "Send welcome, goodbye, and boost messages.",
    "roots": [
      "welcome",
      "goodbye",
      "boost"
    ],
    "steps": [
      {
        "title": "Choose a destination",
        "text": "Add a message for the desired channel. Plain text and embed scripts can use member and server variables."
      },
      {
        "title": "Preview the message",
        "text": "Use view to send a preview. Optional self-destruct values must be between six and sixty seconds."
      },
      {
        "title": "Remove a destination",
        "text": "Remove the configured channel when you no longer want that event message."
      }
    ],
    "examples": [
      ",welcome add #welcome Hello {user.mention}, welcome to {guild.name}!",
      ",welcome view #welcome"
    ],
    "note": ""
  },
  {
    "slug": "autoresponders",
    "title": "Auto Responders",
    "group": "Messages",
    "summary": "Respond to a text trigger or apply a role action.",
    "roots": [
      "autoresponder"
    ],
    "steps": [
      {
        "title": "Create a trigger",
        "text": "Separate the trigger from its response with a comma. Use --not_strict for substring matching and --reply to reference the triggering message."
      },
      {
        "title": "Control delivery",
        "text": "--delete removes the trigger; --self_destruct accepts 6–60 seconds. --ignore_command_check permits matching a command message."
      },
      {
        "title": "Restrict access",
        "text": "Exclusive rules narrow matching to selected roles or channels. Role responders assign or remove a role instead of sending the normal response."
      }
    ],
    "examples": [
      ",autoresponder add hello, Welcome! --reply",
      ",autoresponder exclusive #general hello"
    ],
    "note": ""
  },
  {
    "slug": "auto-messages",
    "title": "Auto Messages",
    "group": "Messages",
    "summary": "Schedule a repeating message in a channel.",
    "roots": [
      "timer"
    ],
    "steps": [
      {
        "title": "Set an interval",
        "text": "Use a duration such as 30m or 2h. A channel has one repeating message and the minimum interval is ten minutes."
      },
      {
        "title": "Inspect and remove",
        "text": "Use view to preview the stored message, list to inspect schedules, and remove to stop a channel’s timer."
      }
    ],
    "examples": [
      ",timer add #general 30m Remember to check the rules.",
      ",timer view #general"
    ],
    "note": ""
  },
  {
    "slug": "starboard",
    "title": "Starboard",
    "group": "Configuration",
    "summary": "Repost messages that reach a reaction threshold.",
    "roots": [
      "starboard",
      "clownboard"
    ],
    "steps": [
      {
        "title": "Enable the board",
        "text": "Unlock the board and select its destination. Configure the reaction emoji and minimum count."
      },
      {
        "title": "Choose eligibility",
        "text": "Decide whether self-reactions count and add ignored channels, members, or roles."
      },
      {
        "title": "Style the repost",
        "text": "Configure color, timestamps, attachments, and the jump link. The same workflow applies to clownboard."
      }
    ],
    "examples": [
      ",starboard unlock",
      ",starboard set #highlights",
      ",starboard threshold 3"
    ],
    "note": ""
  },
  {
    "slug": "voicemaster",
    "title": "VoiceMaster",
    "group": "Configuration",
    "summary": "Create temporary voice rooms when members join a creator channel.",
    "roots": [
      "voicemaster"
    ],
    "steps": [
      {
        "title": "Install the interface",
        "text": "Run setup and review the created category, creator channel, and controls."
      },
      {
        "title": "Set room defaults",
        "text": "Configure room name, bitrate in kbps, and region. A join role can be assigned while members use managed rooms."
      },
      {
        "title": "Use room controls",
        "text": "Room owners can rename, limit, lock, hide, and permit access. Empty temporary rooms are removed when automatic deletion is enabled."
      }
    ],
    "examples": [
      ",voicemaster setup",
      ",voicemaster default name {user.display_name}'s room",
      ",voicemaster limit 5"
    ],
    "note": ""
  },
  {
    "slug": "level-rewards",
    "title": "Level Rewards",
    "group": "Configuration",
    "summary": "Track activity, award roles, and configure level-up delivery.",
    "roots": [
      "levels",
      "rank",
      "setlevel",
      "setxp"
    ],
    "steps": [
      {
        "title": "Enable XP",
        "text": "Run levels unlock. Ignore channels and roles that should not earn XP; lock pauses tracking."
      },
      {
        "title": "Add rewards",
        "text": "Associate roles with levels. Stackroles controls whether older rewards remain; sync reconciles existing members."
      },
      {
        "title": "Configure messages",
        "text": "Choose a text or embed template and a delivery mode: context, pm, a channel, or none. Direct messages require {guild.name}; level-up messages begin at level four."
      }
    ],
    "examples": [
      ",levels unlock",
      ",levels add @LevelFive 5",
      ",levels message {user.mention} reached {level.new_rank} in {guild.name}!"
    ],
    "note": ""
  },
  {
    "slug": "bump-reminder",
    "title": "Bump Reminder",
    "group": "Configuration",
    "summary": "Remind members to bump the server.",
    "roots": [
      "bumpreminder"
    ],
    "steps": [
      {
        "title": "Choose the bump channel",
        "text": "Set the channel where bump confirmations are observed and reminders should appear."
      },
      {
        "title": "Customize messages",
        "text": "Set reminder and thank-you templates. Autolock and autoclean manage the bump channel around the reminder cycle."
      }
    ],
    "examples": [
      ",bumpreminder channel #bump",
      ",bumpreminder thankyou Thanks {user.mention}!"
    ],
    "note": ""
  },
  {
    "slug": "reaction-triggers",
    "title": "Reaction Triggers",
    "group": "Configuration",
    "summary": "React to matching messages automatically.",
    "roots": [
      "reaction"
    ],
    "steps": [
      {
        "title": "Create a trigger",
        "text": "Assign an emoji to a trigger phrase. Inspect its owner and remove individual mappings when needed."
      },
      {
        "title": "Channel reactions",
        "text": "The messages subcommand assigns up to three reactions to each message in the selected channel. Use it without emojis to clear the channel rule."
      }
    ],
    "examples": [
      ",reaction add 👋 hello",
      ",reaction messages #photos ❤️"
    ],
    "note": ""
  },
  {
    "slug": "command-aliases",
    "title": "Command Aliases",
    "group": "Configuration",
    "summary": "Create server shortcuts for existing commands.",
    "roots": [
      "alias"
    ],
    "steps": [
      {
        "title": "Create a shortcut",
        "text": "Map an unused name to a command. Positional placeholders insert the supplied arguments into a command template."
      },
      {
        "title": "Maintain aliases",
        "text": "View an alias before using it and remove obsolete entries. An alias does not bypass the target command’s permission checks."
      }
    ],
    "examples": [
      ",alias add quiet timeout {0} 10m",
      ",alias view quiet"
    ],
    "note": ""
  },
  {
    "slug": "logging",
    "title": "Logging",
    "group": "Configuration",
    "summary": "Record server events in a configured log channel.",
    "roots": [
      "log"
    ],
    "steps": [
      {
        "title": "Choose events",
        "text": "Register the destination and desired event type. Stained needs View Channel, Send Messages, and Embed Links."
      },
      {
        "title": "Reduce noise",
        "text": "Ignore selected members or channels. Check the enabled event list after changing configuration."
      },
      {
        "title": "Customize appearance",
        "text": "Use log color to override event colors. Missing channels and temporary rate limits are handled without losing healthy configuration."
      }
    ],
    "examples": [
      ",log add #logs messages",
      ",log ignore #private",
      ",log color #logs messages #658A95"
    ],
    "note": ""
  },
  {
    "slug": "music",
    "title": "Music",
    "group": "Utilities",
    "summary": "Queue tracks and control playback in voice channels.",
    "roots": [
      "play",
      "queue",
      "pause",
      "resume",
      "skip",
      "seek",
      "volume",
      "repeat",
      "settings"
    ],
    "steps": [
      {
        "title": "Start playback",
        "text": "Join a voice channel and provide a search query or supported URL. Playback depends on the music backend configured by the host."
      },
      {
        "title": "Manage the queue",
        "text": "Inspect queued tracks, remove or move entries, and select a repeat mode. DJ controls restrict shared playback changes."
      }
    ],
    "examples": [
      ",play relaxing music",
      ",queue",
      ",seek 2:30"
    ],
    "note": ""
  },
  {
    "slug": "webhooks",
    "title": "Webhooks",
    "group": "Utilities",
    "summary": "Send and edit messages using managed webhook identifiers.",
    "roots": [
      "webhook"
    ],
    "steps": [
      {
        "title": "Create a webhook",
        "text": "Run create in the destination channel and keep its returned identifier. Configure its avatar and name in Discord integrations."
      },
      {
        "title": "Send or edit",
        "text": "Use the identifier to send content. --add separates additional embeds; edit uses the posted message link."
      },
      {
        "title": "Manage access",
        "text": "List identifiers and lock access when needed. Delete removes a managed webhook."
      }
    ],
    "examples": [
      ",webhook create Announcements",
      ",webhook send IDENTIFIER Hello from Stained"
    ],
    "note": ""
  },
  {
    "slug": "giveaways",
    "title": "Giveaways",
    "group": "Utilities",
    "summary": "Host a timed prize draw.",
    "roots": [
      "giveaway"
    ],
    "steps": [
      {
        "title": "Start the draw",
        "text": "Choose a channel, duration, winner count, and prize. Members enter through the giveaway message."
      },
      {
        "title": "Adjust requirements",
        "text": "Edit the host, duration, prize, images, or eligibility rules. Check the configured level and role requirements."
      },
      {
        "title": "Finish",
        "text": "End draws, reroll winners, or cancel when necessary. Review the giveaway list to avoid duplicate events."
      }
    ],
    "examples": [
      ",giveaway start #giveaways 24h 2 Community prize",
      ",giveaway list"
    ],
    "note": ""
  },
  {
    "slug": "counters",
    "title": "Counters",
    "group": "Utilities",
    "summary": "Display server counts in channel names.",
    "roots": [
      "counter"
    ],
    "steps": [
      {
        "title": "Choose the statistic",
        "text": "Create a counter for members, humans, bots, channel types, or boost statistics."
      },
      {
        "title": "Name the channel",
        "text": "Keep a numeric value in the name so Stained can refresh it while preserving your label. Remove a counter with its channel ID."
      }
    ],
    "examples": [
      ",counter add members voice",
      ",counter remove CHANNEL_ID"
    ],
    "note": ""
  },
  {
    "slug": "spotify",
    "title": "Spotify",
    "group": "Integrations",
    "summary": "Connect external services to Stained.",
    "roots": [
      "spotify"
    ],
    "steps": [
      {
        "title": "Connect and configure",
        "text": "Connect your Spotify account before issuing playback commands. A supported active device and Spotify account capabilities are required."
      },
      {
        "title": "Check delivery",
        "text": "Test the command in Discord and inspect the response. Authentication failures or provider outages require the host or account owner to reconnect the service."
      }
    ],
    "examples": [
      ",spotify play your favorite song"
    ],
    "note": ""
  },
  {
    "slug": "lastfm",
    "title": "Last.fm",
    "group": "Integrations",
    "summary": "Connect external services to Stained.",
    "roots": [
      "lastfm"
    ],
    "steps": [
      {
        "title": "Connect and configure",
        "text": "Link your Last.fm username and enable scrobbling in your music player. Recent plays and account statistics come from Last.fm; upstream delays can affect freshness."
      },
      {
        "title": "Check delivery",
        "text": "Test the command in Discord and inspect the response. Authentication failures or provider outages require the host or account owner to reconnect the service."
      }
    ],
    "examples": [
      ",lastfm set YOUR_USERNAME"
    ],
    "note": ""
  },
  {
    "slug": "fortnite",
    "title": "Fortnite",
    "group": "Integrations",
    "summary": "Connect external services to Stained.",
    "roots": [
      "fortnite"
    ],
    "steps": [
      {
        "title": "Connect and configure",
        "text": "Search cosmetics, watch items for shop returns, and choose a channel for shop updates. Configure the announcement role and voting options separately."
      },
      {
        "title": "Check delivery",
        "text": "Test the command in Discord and inspect the response. Authentication failures or provider outages require the host or account owner to reconnect the service."
      }
    ],
    "examples": [
      ",fortnite item Toosie Slide"
    ],
    "note": ""
  },
  {
    "slug": "social-notifications",
    "title": "Social Notifications",
    "group": "Integrations",
    "summary": "Connect external services to Stained.",
    "roots": [
      "twitter",
      "twitch",
      "youtube",
      "tiktok",
      "instagram",
      "kick"
    ],
    "steps": [
      {
        "title": "Connect and configure",
        "text": "Choose a platform, creator, and announcement channel. Notification delivery requires the platform API or feed configured by the host."
      },
      {
        "title": "Check delivery",
        "text": "Test the command in Discord and inspect the response. Authentication failures or provider outages require the host or account owner to reconnect the service."
      }
    ],
    "examples": [
      ",twitch add #streams CREATOR"
    ],
    "note": ""
  },
  {
    "slug": "syntax",
    "title": "Command Syntax",
    "group": "Resources",
    "summary": "Read command arguments and duration values.",
    "roots": [
      "help"
    ],
    "steps": [
      {
        "title": "Arguments",
        "text": "The command reference displays the active script signature. Replace placeholders with actual values rather than typing the brackets."
      },
      {
        "title": "Durations and flags",
        "text": "Use compact durations such as 10m, 2h, or 1d. Flags begin with two ordinary hyphens, for example --threshold. Quoted strings keep multi-word arguments together."
      }
    ],
    "examples": [
      ",help antiraid massjoin"
    ],
    "note": ""
  },
  {
    "slug": "embed-scripting",
    "title": "Embed Scripting",
    "group": "Resources",
    "summary": "Build rich messages with Stained’s template syntax.",
    "roots": [
      "embed"
    ],
    "steps": [
      {
        "title": "Structure",
        "text": "Begin with {embed}, then separate parameters with $v. A parameter uses a name, colon, and value inside braces."
      },
      {
        "title": "Content",
        "text": "Common parameters include title, description, color, image, thumbnail, footer, and fields. Use && to separate field name and value."
      },
      {
        "title": "Preview",
        "text": "Send a test embed before using it in a welcome message, timer, or webhook."
      }
    ],
    "examples": [
      "{embed}$v{title: Welcome}$v{description: Hello {user.mention}}$v{color: #658A95}"
    ],
    "note": ""
  },
  {
    "slug": "variables",
    "title": "Variables",
    "group": "Resources",
    "summary": "Insert member, server, and event values into templates.",
    "roots": [
      "embed",
      "welcome",
      "levels"
    ],
    "steps": [
      {
        "title": "Common values",
        "text": "Member templates support {user.mention}, {user.name}, and {user.id}. Server templates support {guild.name}; available values depend on the event."
      },
      {
        "title": "Event values",
        "text": "Level messages include the achieved level and XP. A message renderer cannot resolve values for a different event, so always preview in its intended context."
      }
    ],
    "examples": [
      "Hello {user.mention}, welcome to {guild.name}!"
    ],
    "note": ""
  },
  {
    "slug": "pagination",
    "title": "Pagination",
    "group": "Resources",
    "summary": "Turn a Stained embed into a multi-page message.",
    "roots": [
      "pagination"
    ],
    "steps": [
      {
        "title": "Create page one",
        "text": "Send an embed and copy its message link. Register it with pagination set."
      },
      {
        "title": "Add and edit pages",
        "text": "Append another embed using add. Update uses a one-based page number and new embed code."
      },
      {
        "title": "Manage controls",
        "text": "List configured paginations, restore their controls, or remove pagination from a message."
      }
    ],
    "examples": [
      ",pagination set MESSAGE_LINK",
      ",pagination add MESSAGE_LINK {embed}$v{description: Second page}",
      ",pagination update MESSAGE_LINK 2 {embed}$v{description: Updated page}"
    ],
    "note": ""
  },
  {
    "slug": "permissions",
    "title": "Permissions",
    "group": "Resources",
    "summary": "Understand command permissions and role hierarchy.",
    "roots": [
      "fakepermissions",
      "help"
    ],
    "steps": [
      {
        "title": "Invoker permissions",
        "text": "Commands may require Manage Server, Manage Messages, Manage Roles, or Administrator. Some security actions require the server owner."
      },
      {
        "title": "Bot permissions",
        "text": "Stained also needs the permissions for its action. Role operations require the target role to be below the bot’s highest role. Fake permissions do not alter this Discord restriction."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "events",
    "title": "Events",
    "group": "Resources",
    "summary": "Enable or disable automated behaviors.",
    "roots": [
      "enableevent",
      "disableevent"
    ],
    "steps": [
      {
        "title": "Choose an event",
        "text": "Events include AFK responses, autoresponders, reaction triggers, snipes, and supported media reposts."
      },
      {
        "title": "Scope",
        "text": "Use the event commands for their configured scope. Disabling an event pauses automatic processing without deleting stored triggers."
      }
    ],
    "examples": [
      ",ee autoresponder",
      ",de commandfailure"
    ],
    "note": ""
  },
  {
    "slug": "voices",
    "title": "Speech Voices",
    "group": "Resources",
    "summary": "Use the voices exposed by the configured speech provider.",
    "roots": [
      "tts",
      "voices"
    ],
    "steps": [
      {
        "title": "Choose a voice",
        "text": "Inspect the voice command or help response for the voices your installation supports."
      },
      {
        "title": "Provider availability",
        "text": "Speech requires the provider configured on the bot host. A voice advertised by another installation may not be available in yours."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "languages",
    "title": "Translation Languages",
    "group": "Resources",
    "summary": "Translate using Google Translate language names or codes.",
    "roots": [
      "translate"
    ],
    "steps": [
      {
        "title": "Choose the language",
        "text": "Use the language list supplied by the script. The catalog includes Google Translate’s expanded language set and accepts supported language codes."
      },
      {
        "title": "Translate text",
        "text": "Provide a target language and text. Keep the message within the command’s input limit and try again if the translation provider is temporarily unavailable."
      }
    ],
    "examples": [
      ",help translate"
    ],
    "note": ""
  },
  {
    "slug": "ios-dash",
    "title": "iOS Dash",
    "group": "Troubleshooting",
    "summary": "Fix flags changed by smart punctuation.",
    "roots": [
      "help"
    ],
    "steps": [
      {
        "title": "Use ordinary hyphens",
        "text": "A command flag starts with two hyphens (--), not an em dash (—). Paste the command example or turn off Smart Punctuation in your keyboard settings."
      },
      {
        "title": "Retry",
        "text": "Check the full command before sending it again. An unrecognized flag should produce a usage response rather than silently changing the action."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "channel-permissions",
    "title": "Channel Permissions",
    "group": "Troubleshooting",
    "summary": "Resolve access and moderation failures.",
    "roots": [
      "lock",
      "unlock",
      "voicemaster"
    ],
    "steps": [
      {
        "title": "Check overrides",
        "text": "Inspect both role permissions and channel overrides. Stained needs access to see, send, and embed messages in its configured destinations."
      },
      {
        "title": "Check hierarchy",
        "text": "Move Stained above managed roles and below roles it should not control. For voice rooms, inspect Connect and View Channel permissions as well."
      }
    ],
    "examples": [],
    "note": ""
  },
  {
    "slug": "server-removal",
    "title": "Bot Connection",
    "group": "Troubleshooting",
    "summary": "Diagnose an unavailable bot or stale dashboard connection.",
    "roots": [
      "botinfo",
      "ping"
    ],
    "steps": [
      {
        "title": "Check the host",
        "text": "Confirm the bot process is running, its token is valid, and the host can reach Discord. DNS errors must be resolved by the hosting provider."
      },
      {
        "title": "Check synchronization",
        "text": "Upload the current main.py and restart the bot. The dashboard connection banner shows its last report and any settings it could not apply."
      }
    ],
    "examples": [],
    "note": ""
  }
];
