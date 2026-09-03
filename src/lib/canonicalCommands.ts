import { commandCategories } from "@/lib/commands";
import { lastFmCategory } from "@/lib/lastfmCommands";
import { referenceCommandCategories } from "@/lib/referenceCommands";

export type WareCommandEntry = {
  name: string;
  description: string;
  usage: string;
  example?: string;
  aliases?: string[];
  permission?: string;
};

export type WareCommandCategory = {
  slug: string;
  name: string;
  description: string;
  commands: WareCommandEntry[];
};

export const canonicalCommandNames = `2048
8ball
activities
addemote
afk
ai
ai2
aichat
aicode
aiexplain
aigrammar
aiimage
aimod
alias
alias add
alias list
alias remove
alias removeall
alias reset
alias view
anime
anti
anti ad
anti bot
anti bot add
anti ghost
anti ghost ping
anti link
anti raid
anti spam
antinuke
antinuke admin
antinuke admins
antinuke config
antinuke disable
antinuke enable
antinuke list
antinuke logs
antinuke punishment
antinuke view
antinuke whitelist
audit
aura
automod
automod blacklist
automod config
automod disable
automod enable
automod setup
automod whitelist
autoreact
autoreact add
autoreact clear
autoreact list
autoreact remove
autoresponder
autoresponder add
autoresponder clear
autoresponder exclusive
autoresponder list
autoresponder remove
autoresponder role
autoresponder update
autorole
autorole add
autorole list
autorole remove
autorole reset
autorole view
avatar
backup
backup create
backup delete
backup list
backup load
badges
balance
ban
bank
banner
base64
battleship
bc
beg
bio
birthday
birthday celebrate
birthday celebrate list
birthday channel
birthday config
birthday list
birthday lock
birthday remove
birthday role
birthday set
birthday test
birthday today
birthday toggle
birthday unlock
bitches
blackjack
blacktea
blacktea stop
blur
book
boostcount
boosterrole
boosterrole award
boosterrole award unset
boosterrole award view
boosterrole base
boosterrole cleanup
boosterrole color
boosterrole create
boosterrole dominant
boosterrole filter
boosterrole filter list
boosterrole filter remove
boosterrole icon
boosterrole limit
boosterrole link
boosterrole list
boosterrole random
boosterrole remove
boosterrole rename
boosterrole share
boosterrole share limit
boosterrole share list
boosterrole share max
boosterrole share remove
boosters
boosters lost
boostmessage
bot
bot message
bot message embed
bot reply
bot reply add
bot reply clear
bot reply list
bot reply remove
botinfo
bots
braincells
brainly
btc
button
buttonrole
buttonrole add
buttonrole list
buttonrole remove
buttonrole removeall
buttonrole reset
buy
c
calculator
case
cases
cashapp
casino
challenge
channel
channel archive
channel category
channel clone
channel copy
channel create
channel delete
channel export
channel import
channel lock
channel nsfw
channel permissions
channel rename
channel slowmode
channel sync
channel topic
channel unlock
channelinfo
character
charinfo
checkers
chess
choose
cleanup
clear
cleargnames
clearnames
clearreactionsnipe
clih
cloneuser
clown
cmds
code
coin
coinflip
color
compress
connect4
continue
cook
count
countdown
counting
country
crash
createembed
crime
crypto
cs
customize
customize avatar
customize banner
customize bio
daily
dashboard
define
delulu
deposit
devices
dice
dih
disablecommand
discog
discog collections
discog login
discog logout
discog profile
discog search
discog wantlist
disconnectall
donate
dropdown
duckduckgo
duel
economy
economy buy
economy daily
economy shop
economy work
editsnipe
embed
embed copy
embed create
embed delete
embed list
embed preview
embedcode
emoji
emoji add
emoji addmany
emoji information
emoji remove
emoji removeduplicates
emoji removemany
emoji rename
emoji stats
emojiinfo
emojis
emotes
enablecommand
end
end blacktea
end flags
essay
execute
explain
fasttype
fakepermissions
fakepermissions grant
fakepermissions list
fakepermissions remove
fakepermissions reset
filter
filter add
filter links
filter list
filter remove
firstmessage
fishing
flag
flags
fm
fn
force
force nickname
force_role
forceavatar
forcerole
forcetimeout
freaky
game
gay
gedit
gemini
gend
getuser
getuser id
giphy
github
giveaway
giveaway blacklist
giveaway bonus
giveaway cancel
giveaway dmcreator
giveaway dmwinners
giveaway duplicate
giveaway edit
giveaway end
giveaway info
giveaway list
giveaway pause
giveaway reroll
giveaway resume
giveaway setmax
giveaway start
giveaway template
glist
gnames
google
greroll
gstart
guildbanner
guildicon
hangman
hardban
height
heist
help
hex
hide
higherlower
highlight
highlight add
highlight ignore
highlight ignore list
highlight list
highlight remove
highlight reset
history
honeypot
honeypot add
honeypot list
honeypot remove
howgay
howhot
https://warebot.xyz
humans
imagerestore
imagine
img
impersonate
imute
inrole
instagram
interest
inventory
invert
inviteinfo
invites
itunes
jail
join
join ping
joined
joke
jumbo
juul
juul flavor
juul hit
juul pass
juul stats
juul toggle
kick
lastfm
lastfm collage
lastfm color
lastfm count
lastfm crowns
lastfm customcommand
lastfm customcommand blacklist
lastfm customcommand blacklist list
lastfm customcommand cleanup
lastfm customcommand list
lastfm customcommand public
lastfm customcommand remove
lastfm customcommand reset
lastfm customreactions
lastfm favorites
lastfm globalboard
lastfm globalwhoknows
lastfm globalwkalbum
lastfm globalwktrack
lastfm hide
lastfm hide list
lastfm itunes
lastfm login
lastfm logout
lastfm lyrics
lastfm milestone
lastfm mode
lastfm mostcrowns
lastfm now
lastfm overview
lastfm playing
lastfm plays
lastfm playsalbum
lastfm playsall
lastfm playstrack
lastfm react
lastfm recent
lastfm recentfor
lastfm recommendation
lastfm score
lastfm scoreboard
lastfm soundcloud
lastfm spotify
lastfm streak
lastfm taste
lastfm topalbums
lastfm topartists
lastfm toptenalbums
lastfm toptentracks
lastfm toptracks
lastfm update
lastfm url
lastfm vote
lastfm whois
lastfm whoknows
lastfm wkalbum
lastfm wktrack
lastfm youtube
lastseen
leaderboards
leaderboards economy
leaderboards invites
leaderboards levels
leaderboards messages
leaderboards voice
lego
lesbian
levels
levels add
levels ignore
levels ignore list
levels leaderboard
levels lock
levels message
levels messagemode
levels remove
levels roles
levels setrate
levels stackroles
levels sync
levels unlock
lock
lockall
lockdown
log
log add
log color
log color list
log channel
log disable
log enable
log events
log ignore
log ignore list
log remove
lottery
ltc
luck
lyrics
makegif
makemp3
manga
market
marry
massdisconnect
masskick
massmove
massnick
massrename
massrole
massunmute
massuntimeout
math
media
media billboard
media bloom
media blur
media book
media caption
media circuitboard
media deepfry
media fisheye
media flag
media flag2
media fortune
media gifmagik
media grayscale
media heart
media invert
media magik
media meme
media motivate
media neon
media pixelate
media rainbow
media reverse
media rubiks
media scramble
media speechbubble
media speed
media spin
media spread
media swirl
media tattoo
media toaster
media valentine
media wormhole
media zoom
media zoomblur
membercount
members
memory
memory add
memory clear
memory delete
memory list
memory search
memorygame
minecraft
mines
modlog
modstats
monthly
move
moveall
movie
movie expand
mute
mutuals
names
newest
nick
note
note add
notes
notes add
nowplaying
npc
nsfw
nsfw set
nuke
oauth
ocr
ocrtr
oldest
osu
pay
perms
pets
ping
pixelate
play
poker
poll
pp
prefix
premium
premium activate
premium servers
profile
punishments
purge
purge attachments
purge bots
purge contains
purge embeds
purge humans
purge images
purge invites
purge links
purge user
purgeafter
purgebefore
purgebots
purgeembeds
purgefiles
purgehumans
purgeimages
purgeinvites
purgelinks
purgenitro
purgerange
purgereactions
purgeuser
qr
quarantine
quickpoll
quote
raidmode
raidmode off
raidmode on
raidmode strict
raidmode verify
randomhex
rank
rate
reactionrole
reactionrole add
reactionrole list
reactionrole remove
reactionrole removeall
reactionrole reset
reactionrole restore
reactionsnipe
reason
remind
removebg
rename
rename emojis
rename stickers
resetnick
restore
restrictcommand
reverse
reverseimage
review
rewrite
rizz
rmute
roast
roblox
roblox check
roblox devex
roblox fromdiscord
roblox inventory
roblox item
roblox outfits
roblox template
roblox todiscord
robloxid
role
role bots
role color
role create
role delete
role duplicate
role everyone
role export
role hoist
role humans
role icon
role icon remove
role import
role info
role invc
role members
role mentionable
role position
role random
role rename
role restore
roleall
rolebots
rolehumans
roleinfo
roleplay
roles
rotate
roulette
rps
run
s?u
scam
scam action
scam off
scam on
scam status
scam timeout
scam whitelist
scam whitelist add
scam whitelist remove
scramble
screenshot
search
security
security backup
security heat
security joingate
security logs
security off
security on
security panic
security permit
security quarantine
security raid
security recover
security release
security score
security setup
security status
security whitelist
seen
selfrole
selfrole add
selfrole create
selfrole delete
selfrole description
selfrole list
selfrole max
selfrole remove
selfrole send
sell
sendmessage
serveravatar
serverbanner
servericon
serverinfo
servervanity
setup
setupdashboard
sfw
sfw set
shazam
ship
shop
sigma
simp
skip
slots
slowmode
snapchat
snapchatstory
snipe
snowflake
softban
sol
splash
spotify
spotify login
spotify logout
spotifyalbum
spotifytrack
staffnote
staffnote add
staffnote clear
staffnote remove
staffnotes
starboard
stats
status
steal
steal-sticker
stealrole
steam
stick
stick embed
stick list
stick message
stick remove
sticker
sticker add
sticker cleanup
sticker remove
sticker rename
sticker tag
stickerinfo
stickers
stocks
stop
stripstaff
sudo
suggest
summarize
support
tags
tags add
tags author
tags edit
tags list
tags random
tags remove
tags rename
tags reset
tags search
telegram
tenor
ticket
ticket add
ticket archive
ticket blacklist
ticket claim
ticket close
ticket closeall
ticket delete
ticket export
ticket info
ticket merge
ticket move
ticket panel
ticket priority
ticket reason
ticket remove
ticket rename
ticket reopen
ticket setup
ticket split
ticket transcript
ticket unclaim
tictactoe
tictactoe leaderboard
tictactoe statistics
tiktok
timediff
timeout
timer
timestamp
timezone
timezone list
timezone set
tone
topcommands
touchgrass
trade
translate
transparent
trash
triggered
trivia
tts
tts channel
tvshow
twitch
twitch add
twitch list
twitch message
twitch message view
twitch remove
unban
unhide
unimute
unjail
unlock
unlockall
unlockdown
unmute
unrmute
unroleall
unscramble
untimeout
upscale
uptime
urban
urbandictionary
userinfo
uwu
valorant
vanity
vanity channel
vanity disable
vanity message
vanity rewards
vanity rewards add
vanity rewards clear
vanity rewards list
vanity rewards remove
vanity scan
vanity set
vanity syncslash
vanity test
verify
verify button
verify captcha
verify setup
virgin
voiceban
voicekick
voicemaster
voicemaster activity
voicemaster bitrate
voicemaster claim
voicemaster configuration
voicemaster create
voicemaster disconnect
voicemaster ghost
voicemaster invite
voicemaster kick
voicemaster limit
voicemaster lock
voicemaster move
voicemaster mute
voicemaster name
voicemaster owner
voicemaster permit
voicemaster permitall
voicemaster permitrole
voicemaster pin
voicemaster private
voicemaster public
voicemaster reject
voicemaster rejectall
voicemaster rejectrole
voicemaster reset
voicemaster rtc
voicemaster status
voicemaster sync
voicemaster transfer
voicemaster trust
voicemaster unghost
voicemaster unlock
voicemaster unmute
voicemaster untrust
voiceunban
vote
wanted
warn
warnings
weather
weekly
welcome
welcome channel
welcome disable
welcome dm
welcome embed
welcome enable
welcome message
welcome reset
welcome role
welcome setup
welcome test
welcome view
whitelist
whitelist add
whitelist list
whitelist remove
who
whois
wiki
wikihow
withdraw
wolfram
work
wouldyourather
wrapped
xbox
xp
youtube`.trim().split(/\n+/);

export const WARE_COMMAND_COUNT = canonicalCommandNames.length;

const forbiddenStandaloneRoots = new Set(["subreddit", "soundcloud", "pinterest"]);
const canonicalSet = new Set(canonicalCommandNames.map((name) => name.toLowerCase()));

function mergeBaseCategories(): WareCommandCategory[] {
  const groups = [
    ...(commandCategories as unknown as WareCommandCategory[]),
    lastFmCategory as unknown as WareCommandCategory,
    ...(referenceCommandCategories as unknown as WareCommandCategory[]),
  ];
  const merged = new Map<string, WareCommandCategory>();
  for (const category of groups) {
    if (forbiddenStandaloneRoots.has(category.slug.toLowerCase())) continue;
    const current = merged.get(category.slug);
    if (!current) {
      merged.set(category.slug, { ...category, commands: [] });
    }
    const target = merged.get(category.slug)!;
    for (const command of category.commands ?? []) {
      const key = command.name.toLowerCase();
      if (!canonicalSet.has(key)) continue;
      if (forbiddenStandaloneRoots.has(key.split(" ")[0])) continue;
      if (!target.commands.some((item) => item.name.toLowerCase() === key)) {
        target.commands.push({ ...command });
      }
    }
  }
  return [...merged.values()];
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function generatedDescription(name: string) {
  const parts = name.split(" ");
  const action = parts[parts.length - 1];
  const subject = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
  const phrases: Record<string, string> = {
    add: `Add an entry to ${subject}.`,
    remove: `Remove an entry from ${subject}.`,
    list: `View the current ${subject} entries.`,
    clear: `Clear the saved ${subject} entries.`,
    reset: `Reset ${subject} back to its default state.`,
    enable: `Enable ${subject} for this server.`,
    disable: `Disable ${subject} for this server.`,
    setup: `Configure ${subject} for this server.`,
    status: `View the current ${subject} status.`,
    view: `View the current ${subject} configuration.`,
    create: `Create a new ${subject} entry.`,
    delete: `Delete a ${subject} entry.`,
    info: `View information about ${subject}.`,
    test: `Test the current ${subject} configuration.`,
    channel: `Set or view the channel used by ${subject}.`,
    role: `Set or view the role used by ${subject}.`,
  };
  return phrases[action] ?? `Use Ware's ${titleCase(name)} command.`;
}

function generatedUsage(name: string) {
  const action = name.split(" ").at(-1) ?? name;
  const argByAction: Record<string, string> = {
    add: "<value>", remove: "<value>", set: "<value>", create: "<name>", delete: "<name>",
    channel: "<#channel>", role: "<@role>", user: "<@user>", member: "<@member>", rename: "<name>",
    reason: "<reason>", message: "<message>", color: "<#hex>", icon: "<url>", position: "<position>",
  };
  const arg = argByAction[action];
  return arg ? `${name} ${arg}` : name;
}

function generatedExample(name: string) {
  const usage = generatedUsage(name);
  return usage
    .replace("<value>", "example")
    .replace("<name>", "example")
    .replace("<#channel>", "#general")
    .replace("<@role>", "@Member")
    .replace("<@user>", "@user")
    .replace("<@member>", "@member")
    .replace("<reason>", "rule violation")
    .replace("<message>", "hello from Ware")
    .replace("<#hex>", "#7c3aed")
    .replace("<url>", "https://example.com/icon.png")
    .replace("<position>", "1");
}

const baseCategories = mergeBaseCategories();
const commandToCategory = new Map<string, string>();
const rootToCategory = new Map<string, string>();
for (const category of baseCategories) {
  for (const command of category.commands) {
    commandToCategory.set(command.name.toLowerCase(), category.slug);
    const root = command.name.toLowerCase().split(" ")[0];
    if (!rootToCategory.has(root)) rootToCategory.set(root, category.slug);
  }
}

if (!baseCategories.some((category) => category.slug === "miscellaneous")) {
  baseCategories.push({ slug: "miscellaneous", name: "Miscellaneous", description: "Additional Ware commands and utilities.", commands: [] });
}

const bySlug = new Map(baseCategories.map((category) => [category.slug, category]));
for (const name of canonicalCommandNames) {
  const key = name.toLowerCase();
  if (commandToCategory.has(key)) continue;
  const root = key.split(" ")[0];
  const slug = rootToCategory.get(root) ?? "miscellaneous";
  const category = bySlug.get(slug) ?? bySlug.get("miscellaneous")!;
  category.commands.push({
    name,
    description: generatedDescription(name),
    usage: generatedUsage(name),
    example: generatedExample(name),
  });
  commandToCategory.set(key, category.slug);
}

export const canonicalCommandCategories: WareCommandCategory[] = baseCategories
  .map((category) => ({
    ...category,
    commands: category.commands
      .filter((command, index, all) => all.findIndex((item) => item.name.toLowerCase() === command.name.toLowerCase()) === index)
      .sort((a, b) => {
        if (category.slug !== "logs") return a.name.localeCompare(b.name);
        const order = ["log", "log remove", "log ignore", "log ignore list", "log color", "log color list", "log add"];
        return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
      }),
  }))
  .filter((category) => category.commands.length > 0);

export const canonicalCommands: WareCommandEntry[] = canonicalCommandNames.map((name) => {
  for (const category of canonicalCommandCategories) {
    const found = category.commands.find((command) => command.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
  }
  return { name, description: generatedDescription(name), usage: generatedUsage(name), example: generatedExample(name) };
});
