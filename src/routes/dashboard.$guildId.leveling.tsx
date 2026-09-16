import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  Image,
  MessageSquare,
  Plus,
  Save,
  SmilePlus,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModernSelect } from "@/components/dashboard/ModernSelect";
import {
  getDashboardSettings,
  saveDashboardSettings,
  testLevelupMessage,
} from "@/lib/dashboard-settings.functions";
import { normalizeLevelingSettings, type LevelingSettings } from "@/lib/leveling-settings";

export const Route = createFileRoute("/dashboard/$guildId/leveling")({
  head: () => ({ meta: [{ title: "Leveling — Stained Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["dashboardSettings", params.guildId],
      queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: LevelingPage,
});

const panel =
  "rounded-[22px] border border-white/[.065] bg-[#0d0f0f] shadow-[0_18px_70px_rgba(0,0,0,.16)]";
const input =
  "w-full rounded-[14px] border border-white/[.08] bg-[#080a0c] px-4 py-3 text-[12px] font-semibold text-white/80 outline-none transition placeholder:text-white/20 focus:border-[#7182dd]/35";
type Channel = { id: string; name: string };
type Role = { id: string; name: string; color: number };
type Emoji = { id: string; name: string; animated: boolean };

function LevelingPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({
    queryKey: ["dashboardSettings", guildId],
    queryFn: () => getDashboardSettings({ data: { guildId } }),
  });
  const [settings, setSettings] = useState<LevelingSettings>(() =>
    normalizeLevelingSettings(data.settings.leveling),
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [testChannel, setTestChannel] = useState("");
  const channels = data.textChannels as Channel[];
  const roles = data.roles as Role[];
  const emojis = data.emojis as Emoji[];
  const channelOptions = useMemo(
    () => [
      { label: "Choose a channel", value: "" },
      ...channels.map((c) => ({ label: `#${c.name}`, value: c.id })),
    ],
    [channels],
  );
  const roleOptions = useMemo(
    () => [{ label: "None", value: "" }, ...roles.map((r) => ({ label: r.name, value: r.id }))],
    [roles],
  );
  const set = <K extends keyof LevelingSettings>(key: K, value: LevelingSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  };
  async function save() {
    setSaving(true);
    setNotice("");
    try {
      await saveDashboardSettings({
        data: {
          guildId,
          section: "leveling",
          values: settings as unknown as Record<string, unknown>,
        },
      });
      setNotice("Saved — Stained will sync these settings within about 30 seconds.");
      await router.invalidate();
    } catch (error) {
      setNotice((error as Error).message || "Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function test() {
    if (!testChannel) return;
    setNotice("");
    try {
      await testLevelupMessage({
        data: {
          guildId,
          channelId: testChannel,
          values: settings as unknown as Record<string, unknown>,
        },
      });
      setNotice("Test level-up message sent.");
    } catch (error) {
      setNotice((error as Error).message || "Test failed");
    }
  }
  function appendEmoji(emoji: Emoji) {
    const markup = `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
    set(
      "levelupMessage",
      `${settings.levelupMessage}${settings.levelupMessage.endsWith(" ") ? "" : " "}${markup}`,
    );
  }
  function addReward() {
    if (settings.roleRewards.length >= 15 || !roles[0]) return;
    set("roleRewards", [...settings.roleRewards, { level: 1, roleId: roles[0].id }]);
  }
  function addRoleBooster() {
    if (settings.roleBoosters.length || !roles[0]) return;
    set("roleBoosters", [{ roleId: roles[0].id, percentage: 10 }]);
  }
  function addChannelBooster() {
    if (settings.channelBoosters.length || !channels[0]) return;
    set("channelBoosters", [{ channelId: channels[0].id, percentage: 10 }]);
  }

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="leveling">
      <div className="mx-auto max-w-[1480px] pb-20">
        <section className={`${panel} overflow-hidden`}>
          <div className="flex flex-col gap-5 bg-[radial-gradient(circle_at_85%_0%,rgba(91,112,215,.13),transparent_42%)] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/28">
                <Trophy className="h-4 w-4" /> Community progression
              </div>
              <h1 className="mt-2 text-[36px] font-bold tracking-[-.05em] text-white/95">
                Leveling
              </h1>
              <p className="mt-2 max-w-2xl text-[12px] font-semibold leading-5 text-white/34">
                XP is off until you enable it here. Configure messages, voice, reactions, rewards,
                boosters, announcements and restrictions per server.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-[18px] border border-white/[.07] bg-black/20 px-5 py-4">
              <div>
                <div className="text-[12px] font-bold text-white/82">Level system</div>
                <div className="mt-1 text-[9px] font-semibold text-white/28">
                  {settings.enabled ? "Members can earn XP" : "No XP will be awarded"}
                </div>
              </div>
              <Switch
                label="Level system"
                value={settings.enabled}
                onChange={(value) => set("enabled", value)}
              />
            </div>
          </div>
        </section>

        <Section
          title="XP options"
          description="Choose how members earn XP and how quickly levels scale."
        >
          <div className="grid gap-3 xl:grid-cols-2">
            <Card title="Formula" icon={<BarChart3 />}>
              <p className="mb-4 text-[10px] font-semibold leading-5 text-white/30">
                Linear level costs increase by 100 XP each time: 100, 200, 300, 400…
              </p>
              <Grid>
                <SelectField
                  label="Curve"
                  value={settings.curve}
                  options={[
                    { label: "Linear", value: "linear" },
                    { label: "Quadratic", value: "quadratic" },
                  ]}
                  onChange={(v) => set("curve", v as LevelingSettings["curve"])}
                />
                <NumberField
                  label="Multiplier"
                  value={settings.curveMultiplier}
                  min={0.1}
                  step={0.1}
                  onChange={(v) => set("curveMultiplier", v)}
                />
                <NumberField
                  label="Max level"
                  hint="0 = unlimited"
                  value={settings.maxLevel}
                  min={0}
                  onChange={(v) => set("maxLevel", v)}
                />
              </Grid>
            </Card>
            <Card
              title="Message XP"
              icon={<MessageSquare />}
              toggle={settings.messageXpEnabled}
              onToggle={(v) => set("messageXpEnabled", v)}
            >
              <Grid locked={!settings.messageXpEnabled}>
                <SelectField
                  label="Mode"
                  value={settings.messageXpMode}
                  options={[
                    { label: "Random per message", value: "random" },
                    { label: "XP per word", value: "per_word" },
                  ]}
                  onChange={(v) => set("messageXpMode", v as LevelingSettings["messageXpMode"])}
                />
                <NumberField
                  label="Minimum"
                  value={settings.messageXpMin}
                  min={0}
                  onChange={(v) => set("messageXpMin", v)}
                />
                <NumberField
                  label="Maximum"
                  value={settings.messageXpMax}
                  min={0}
                  onChange={(v) => set("messageXpMax", v)}
                />
                <NumberField
                  label="Cooldown (seconds)"
                  value={settings.messageXpCooldown}
                  min={0}
                  onChange={(v) => set("messageXpCooldown", v)}
                />
              </Grid>
            </Card>
          </div>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            <Card
              title="Voice XP"
              icon={<Volume2 />}
              toggle={settings.voiceXpEnabled}
              onToggle={(v) => set("voiceXpEnabled", v)}
            >
              <Grid locked={!settings.voiceXpEnabled}>
                <NumberField
                  label="Minimum"
                  value={settings.voiceXpMin}
                  min={0}
                  onChange={(v) => set("voiceXpMin", v)}
                />
                <NumberField
                  label="Maximum"
                  value={settings.voiceXpMax}
                  min={0}
                  onChange={(v) => set("voiceXpMax", v)}
                />
                <NumberField
                  label="Cooldown (seconds)"
                  value={settings.voiceXpCooldown}
                  min={30}
                  onChange={(v) => set("voiceXpCooldown", v)}
                />
                <NumberField
                  label="Minimum members"
                  value={settings.voiceXpMinMembers}
                  min={1}
                  onChange={(v) => set("voiceXpMinMembers", v)}
                />
                <ToggleField
                  label="Anti-AFK"
                  value={settings.voiceXpAntiAfk}
                  onChange={(v) => set("voiceXpAntiAfk", v)}
                />
              </Grid>
            </Card>
            <Card
              title="Reaction XP"
              icon={<SmilePlus />}
              toggle={settings.reactionXpEnabled}
              onToggle={(v) => set("reactionXpEnabled", v)}
            >
              <Grid locked={!settings.reactionXpEnabled}>
                <SelectField
                  label="Awards"
                  value={settings.reactionXpAwards}
                  options={[
                    { label: "Both members", value: "both" },
                    { label: "Reaction sender", value: "sender" },
                    { label: "Message author", value: "receiver" },
                  ]}
                  onChange={(v) =>
                    set("reactionXpAwards", v as LevelingSettings["reactionXpAwards"])
                  }
                />
                <NumberField
                  label="Minimum"
                  value={settings.reactionXpMin}
                  min={0}
                  onChange={(v) => set("reactionXpMin", v)}
                />
                <NumberField
                  label="Maximum"
                  value={settings.reactionXpMax}
                  min={0}
                  onChange={(v) => set("reactionXpMax", v)}
                />
                <NumberField
                  label="Cooldown (seconds)"
                  value={settings.reactionXpCooldown}
                  min={0}
                  onChange={(v) => set("reactionXpCooldown", v)}
                />
              </Grid>
            </Card>
          </div>
        </Section>

        <Section
          title="Level-up message"
          description="Unicode emoji always work. The picker contains only custom emojis that belong to this server."
        >
          <Card
            title="Level-up message"
            toggle={settings.levelupEnabled}
            onToggle={(v) => set("levelupEnabled", v)}
          >
            <div
              className={`space-y-4 ${settings.levelupEnabled ? "" : "pointer-events-none opacity-35"}`}
            >
              <Grid>
                <SelectField
                  label="Send to"
                  value={settings.levelupMode}
                  options={[
                    { label: "Channel message was sent in", value: "context" },
                    { label: "Specific channel", value: "channel" },
                    { label: "Direct message", value: "dm" },
                    { label: "Do not send", value: "none" },
                  ]}
                  onChange={(v) => set("levelupMode", v as LevelingSettings["levelupMode"])}
                />
                {settings.levelupMode === "channel" ? (
                  <SelectField
                    label="Channel"
                    value={settings.levelupChannelId}
                    options={channelOptions}
                    onChange={(v) => set("levelupChannelId", v)}
                  />
                ) : null}
              </Grid>
              <label>
                <span className="mb-2 block text-[10px] font-bold text-white/36">Message</span>
                <textarea
                  className={`${input} min-h-28 resize-y rounded-[16px]`}
                  value={settings.levelupMessage}
                  onChange={(e) => set("levelupMessage", e.target.value)}
                  maxLength={1500}
                />
                <span className="mt-2 block text-[9px] font-semibold text-white/24">
                  Tags: {"{user.mention}"}, {"{user.name}"}, {"{level}"}, {"{xp}"},{" "}
                  {"{earned.role}"}
                </span>
              </label>
              {emojis.length ? (
                <div>
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-[.13em] text-white/24">
                    Server emojis
                  </div>
                  <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-[15px] border border-white/[.055] bg-black/20 p-3">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji.id}
                        type="button"
                        title={`:${emoji.name}:`}
                        onClick={() => appendEmoji(emoji)}
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-white/[.06] bg-white/[.025] hover:bg-white/[.08]"
                      >
                        <img
                          src={`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}?size=48`}
                          alt={`:${emoji.name}:`}
                          className="h-6 w-6 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-semibold text-white/25">
                  This server has no custom emojis available to Stained. You can still type or paste
                  any normal Unicode emoji.
                </div>
              )}
              <div className="flex flex-wrap items-end gap-3">
                <ToggleField
                  label="Include rank-card image"
                  value={settings.levelupImage}
                  onChange={(v) => set("levelupImage", v)}
                />
                <div className="min-w-[240px] flex-1">
                  <SelectField
                    label="Test in"
                    value={testChannel}
                    options={channelOptions}
                    onChange={setTestChannel}
                  />
                </div>
                <button
                  type="button"
                  onClick={test}
                  disabled={!testChannel}
                  className="h-11 rounded-full border border-white/[.10] bg-white/[.05] px-5 text-[10px] font-bold text-white/68 disabled:opacity-30"
                >
                  Send test
                </button>
              </div>
            </div>
          </Card>
        </Section>

        <Section
          title="Role rewards"
          description="Give members roles when they reach specific levels."
        >
          <Card
            title="Role rewards"
            action={
              <span className="text-[10px] font-bold text-white/36">
                {settings.roleRewards.length}/15 used
              </span>
            }
          >
            <ToggleField
              label="Stack rewards"
              hint="Keep earlier reward roles when a member levels up."
              value={settings.stackRewards}
              onChange={(v) => set("stackRewards", v)}
            />
            <div className="mt-4 space-y-2">
              {settings.roleRewards.map((reward, index) => (
                <div
                  key={`${reward.roleId}-${index}`}
                  className="grid gap-2 rounded-[15px] border border-white/[.055] bg-black/20 p-3 sm:grid-cols-[160px_1fr_auto]"
                >
                  <NumberField
                    label="Level"
                    value={reward.level}
                    min={1}
                    onChange={(level) =>
                      set(
                        "roleRewards",
                        settings.roleRewards.map((row, i) =>
                          i === index ? { ...row, level } : row,
                        ),
                      )
                    }
                  />
                  <SelectField
                    label="Role"
                    value={reward.roleId}
                    options={roleOptions}
                    onChange={(roleId) =>
                      set(
                        "roleRewards",
                        settings.roleRewards.map((row, i) =>
                          i === index ? { ...row, roleId } : row,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "roleRewards",
                        settings.roleRewards.filter((_, i) => i !== index),
                      )
                    }
                    className="mt-5 grid h-10 w-10 place-items-center rounded-full border border-red-400/10 text-red-200/45"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addReward}
              disabled={settings.roleRewards.length >= 15 || !roles.length}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[.08] bg-white/[.04] px-4 py-2.5 text-[10px] font-bold text-white/58 disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" /> Add reward
            </button>
          </Card>
          <div className="mt-3 max-w-xl">
            <Card title="First place role" icon={<Trophy />}>
              <SelectField
                label="Daily leaderboard winner"
                value={settings.firstPlaceRoleId}
                options={roleOptions}
                onChange={(v) => set("firstPlaceRoleId", v)}
              />
            </Card>
          </div>
        </Section>

        <Section title="XP boosters" description="Increase XP for effort, roles and channels.">
          <div className="grid gap-3 lg:grid-cols-3">
            <Card
              title="Stack boosters"
              toggle={settings.stackBoosters}
              onToggle={(v) => set("stackBoosters", v)}
            >
              <p className="text-[10px] font-semibold leading-5 text-white/28">
                When off, only the highest matching boost applies.
              </p>
            </Card>
            <Card
              title="Vote reward"
              toggle={settings.voteRewardEnabled}
              onToggle={(v) => set("voteRewardEnabled", v)}
            >
              <p className="text-[10px] font-semibold leading-5 text-white/28">
                Makes the vote reward available to the live bot integration.
              </p>
            </Card>
            <Card
              title="Effort booster"
              toggle={settings.effortEnabled}
              onToggle={(v) => set("effortEnabled", v)}
            >
              <Grid locked={!settings.effortEnabled}>
                <NumberField
                  label="Words"
                  value={settings.effortWords}
                  min={1}
                  onChange={(v) => set("effortWords", v)}
                />
                <NumberField
                  label="Images"
                  value={settings.effortImages}
                  min={1}
                  onChange={(v) => set("effortImages", v)}
                />
                <NumberField
                  label="Boost %"
                  value={settings.effortPercentage}
                  min={0}
                  onChange={(v) => set("effortPercentage", v)}
                />
              </Grid>
            </Card>
          </div>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            <BoosterCard
              title="Role boosters"
              type="role"
              rows={settings.roleBoosters}
              options={roleOptions}
              onAdd={addRoleBooster}
              onChange={(rows) => set("roleBoosters", rows)}
            />
            <BoosterCard
              title="Channel boosters"
              type="channel"
              rows={settings.channelBoosters}
              options={channelOptions}
              onAdd={addChannelBooster}
              onChange={(rows) => set("channelBoosters", rows)}
            />
          </div>
        </Section>

        <Section
          title="Weekly & monthly highlights"
          description="Post automatic top-10 activity recaps in the channels you choose."
        >
          <div className="grid gap-3 xl:grid-cols-2">
            <Card
              title="Weekly highlights"
              toggle={settings.weeklyEnabled}
              onToggle={(v) => set("weeklyEnabled", v)}
            >
              <SelectField
                label="Every Sunday at 12am UTC"
                value={settings.weeklyChannelId}
                options={channelOptions}
                onChange={(v) => set("weeklyChannelId", v)}
              />
            </Card>
            <Card
              title="Monthly highlights"
              toggle={settings.monthlyEnabled}
              onToggle={(v) => set("monthlyEnabled", v)}
            >
              <SelectField
                label="First day of each month"
                value={settings.monthlyChannelId}
                options={channelOptions}
                onChange={(v) => set("monthlyChannelId", v)}
              />
            </Card>
          </div>
        </Section>

        <Section
          title="Rank card & XP management"
          description="Customize rank visuals and protect owner-only XP controls."
        >
          <div className="grid gap-3 xl:grid-cols-3">
            <Card title="Rank card" icon={<Image />}>
              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label="Accent"
                  value={settings.rankCardAccent}
                  onChange={(v) => set("rankCardAccent", v)}
                />
                <ColorField
                  label="Background"
                  value={settings.rankCardBackground}
                  onChange={(v) => set("rankCardBackground", v)}
                />
              </div>
            </Card>
            <Card title="XP management">
              <div className="space-y-4">
                <ToggleField
                  label="Disable /xp command"
                  value={settings.disableXpCommand}
                  onChange={(v) => set("disableXpCommand", v)}
                />
                <ToggleField
                  label="Disable leaderboard reset"
                  value={settings.disableLeaderboardReset}
                  onChange={(v) => set("disableLeaderboardReset", v)}
                />
              </div>
            </Card>
            <Card title="Leaderboard">
              <label>
                <span className="mb-2 block text-[10px] font-bold text-white/36">Vanity URL</span>
                <input
                  className={input}
                  value={settings.leaderboardVanity}
                  onChange={(e) =>
                    set(
                      "leaderboardVanity",
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "")
                        .slice(0, 48),
                    )
                  }
                  placeholder="my-server"
                />
              </label>
              <a
                href={`/dashboard/${guildId}/leaderboard`}
                className="mt-3 inline-flex rounded-full border border-white/[.08] px-4 py-2.5 text-[10px] font-bold text-white/58"
              >
                View leaderboard
              </a>
              <div className="mt-4">
                <ToggleField
                  label="Auto reset when members leave"
                  value={settings.autoReset}
                  onChange={(v) => set("autoReset", v)}
                />
              </div>
            </Card>
          </div>
        </Section>

        <Section title="XP restrictions" description="Control who and where can earn XP.">
          <Card title="Channel and role rules">
            <Grid>
              <SelectField
                label="Mode"
                value={settings.restrictionMode}
                options={[
                  { label: "No XP in selected", value: "deny" },
                  { label: "Only XP in selected", value: "allow" },
                ]}
                onChange={(v) => set("restrictionMode", v as LevelingSettings["restrictionMode"])}
              />
              <MultiIdField
                label="Channels"
                values={settings.restrictedChannelIds}
                options={channelOptions.filter((o) => o.value)}
                onChange={(v) => set("restrictedChannelIds", v)}
              />
              <MultiIdField
                label="Roles"
                values={settings.restrictedRoleIds}
                options={roleOptions.filter((o) => o.value)}
                onChange={(v) => set("restrictedRoleIds", v)}
              />
            </Grid>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ToggleField
                label="Thread XP"
                value={settings.threadXp}
                onChange={(v) => set("threadXp", v)}
              />
              <ToggleField
                label="Forum XP"
                value={settings.forumXp}
                onChange={(v) => set("forumXp", v)}
              />
              <ToggleField
                label="Text in voice XP"
                value={settings.textInVoiceXp}
                onChange={(v) => set("textInVoiceXp", v)}
              />
              <ToggleField
                label="Slash command XP"
                value={settings.slashCommandXp}
                onChange={(v) => set("slashCommandXp", v)}
              />
            </div>
          </Card>
        </Section>

        <div className="sticky bottom-4 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/[.09] bg-[#090b0f]/95 p-3.5 shadow-[0_20px_70px_rgba(0,0,0,.6)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 px-2 text-[10px] font-semibold text-white/38">
            {notice ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300/70" />
            ) : (
              <Sparkles className="h-4 w-4 text-[#9daaf0]/60" />
            )}
            {notice ||
              (settings.enabled
                ? "Leveling is enabled after you save."
                : "Leveling remains fully off until you enable and save it.")}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[11px] font-bold text-black disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save leveling settings"}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 px-1">
        <h2 className="text-[22px] font-bold tracking-[-.03em] text-white/90">{title}</h2>
        <p className="mt-1 text-[11px] font-semibold text-white/29">{description}</p>
      </div>
      {children}
    </section>
  );
}
function Card({
  title,
  icon,
  toggle,
  onToggle,
  action,
  children,
}: {
  title: string;
  icon?: ReactNode;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`${panel} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-[#9caaec]/55">{icon}</span>
          <h3 className="text-[14px] font-bold text-white/82">{title}</h3>
        </div>
        {onToggle ? <Switch label={title} value={Boolean(toggle)} onChange={onToggle} /> : action}
      </div>
      {children}
    </div>
  );
}
function Grid({ children, locked = false }: { children: ReactNode; locked?: boolean }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${locked ? "pointer-events-none opacity-30" : ""}`}>
      {children}
    </div>
  );
}
function Switch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full border transition ${value ? "border-emerald-400/25 bg-emerald-400/15" : "border-white/[.09] bg-white/[.025]"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full transition-all ${value ? "left-6 bg-emerald-300" : "left-1 bg-white/40"}`}
      />
    </button>
  );
}
function NumberField({
  label,
  hint,
  value,
  min = 0,
  step = 1,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.11em] text-white/28">
        <span>{label}</span>
        {hint ? <span className="normal-case tracking-normal text-white/20">{hint}</span> : null}
      </span>
      <input
        className={input}
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[.11em] text-white/28">
        {label}
      </span>
      <ModernSelect value={value} options={options} onChange={onChange} />
    </label>
  );
}
function ToggleField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-[50px] items-center justify-between gap-4 rounded-[14px] border border-white/[.055] bg-black/15 px-3.5 py-2.5">
      <div>
        <div className="text-[10px] font-bold text-white/60">{label}</div>
        {hint ? <div className="mt-1 text-[8px] font-semibold text-white/22">{hint}</div> : null}
      </div>
      <Switch label={label} value={value} onChange={onChange} />
    </div>
  );
}
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[.11em] text-white/28">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 rounded-[12px] border border-white/[.08] bg-black p-1"
        />
        <input
          className={input}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 7))}
        />
      </div>
    </label>
  );
}
function MultiIdField({
  label,
  values,
  options,
  onChange,
}: {
  label: string;
  values: string[];
  options: { label: string; value: string }[];
  onChange: (v: string[]) => void;
}) {
  const available = options.filter((o) => !values.includes(o.value));
  return (
    <div>
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[.11em] text-white/28">
        {label}
      </span>
      <ModernSelect
        value=""
        options={[{ label: "Add…", value: "" }, ...available]}
        onChange={(id) => {
          if (id) onChange([...values, id]);
        }}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((id) => (
          <button
            type="button"
            key={id}
            onClick={() => onChange(values.filter((v) => v !== id))}
            className="rounded-full border border-white/[.07] bg-white/[.03] px-2.5 py-1.5 text-[9px] font-semibold text-white/48"
          >
            {options.find((o) => o.value === id)?.label || id} ×
          </button>
        ))}
      </div>
    </div>
  );
}
function BoosterCard({
  title,
  type,
  rows,
  options,
  onAdd,
  onChange,
}: {
  title: string;
  type: "role" | "channel";
  rows: { percentage: number; roleId?: string; channelId?: string }[];
  options: { label: string; value: string }[];
  onAdd: () => void;
  onChange: (v: { percentage: number; roleId?: string; channelId?: string }[]) => void;
}) {
  const key = type === "role" ? "roleId" : "channelId";
  return (
    <Card
      title={title}
      action={<span className="text-[10px] font-bold text-white/34">{rows.length}/1 used</span>}
    >
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
            <SelectField
              label={type === "role" ? "Role" : "Channel"}
              value={String(row[key] || "")}
              options={options}
              onChange={(id) =>
                onChange(rows.map((entry, i) => (i === index ? { ...entry, [key]: id } : entry)))
              }
            />
            <NumberField
              label="Boost percentage"
              value={row.percentage}
              min={0}
              onChange={(percentage) =>
                onChange(rows.map((entry, i) => (i === index ? { ...entry, percentage } : entry)))
              }
            />
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-5 grid h-10 w-10 place-items-center rounded-full border border-red-400/10 text-red-200/45"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={Boolean(rows.length) || options.length < 2}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[.08] px-4 py-2.5 text-[10px] font-bold text-white/52 disabled:opacity-30"
      >
        <Zap className="h-3.5 w-3.5" /> Add booster
      </button>
    </Card>
  );
}

