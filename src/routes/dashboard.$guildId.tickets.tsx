import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";
import avatarAsset from "@/assets/ware-avatar.jpg.asset.json";
import {
  getTicketPanel,
  saveTicketPanel,
  publishTicketPanel,
} from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/$guildId/tickets")({
  head: () => ({ meta: [{ title: "Tickets — ware dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: TicketsPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      {error.message === "You don't manage this server"
        ? "You don't have Manage Server permission for this guild."
        : `Error: ${error.message}`}
    </div>
  ),
});

const DEFAULTS = {
  title: "Support",
  description: "Click the button below to open a ticket.",
  color: "#5865F2",
  panel_type: "button",
  dropdown_placeholder: "Select a ticket category…",
  button_label: "Open Ticket",
  button_emoji: "🎫",
  button_style: "primary",
  close_button_label: "Close",
  close_button_emoji: "🔒",
  close_button_style: "danger",
  claim_button_label: "Claim",
  claim_button_emoji: "✋",
  claim_button_style: "success",
  command_prefix: "$",
  close_command: "close",
  reopen_command: "reopen",
  delete_command: "delete",
  welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
};

type PanelOptionForm = {
  label: string;
  description: string;
  emoji: string;
  category_id: string | null;
  support_role_ids: string[];
  welcome_message: string;
  ticket_name_format: string;
};

const DEFAULT_OPTION: PanelOptionForm = {
  label: "Support",
  description: "General help",
  emoji: "🎫",
  category_id: null,
  support_role_ids: [],
  welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
  ticket_name_format: "ticket-{number}",
};


const BUTTON_STYLES: { value: string; label: string; className: string }[] = [
  { value: "primary", label: "Blurple", className: "bg-[#5865F2] hover:bg-[#4752c4] text-white" },
  { value: "secondary", label: "Grey", className: "bg-[#4e5058] hover:bg-[#6d6f78] text-white" },
  { value: "success", label: "Green", className: "bg-[#248046] hover:bg-[#1a6334] text-white" },
  { value: "danger", label: "Red", className: "bg-[#da373c] hover:bg-[#a12828] text-white" },
];

function TicketsPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const p = data.panel as Record<string, unknown> | null;
  const s = (k: string, d: string) => (p && typeof p[k] === "string" ? (p[k] as string) : d);

  const [form, setForm] = useState({
    title: s("title", DEFAULTS.title),
    description: s("description", DEFAULTS.description),
    color: s("color", DEFAULTS.color),
    panel_type: s("panel_type", DEFAULTS.panel_type),
    dropdown_placeholder: s("dropdown_placeholder", DEFAULTS.dropdown_placeholder),
    button_label: s("button_label", DEFAULTS.button_label),
    button_emoji: s("button_emoji", DEFAULTS.button_emoji),
    button_style: s("button_style", DEFAULTS.button_style),
    close_button_label: s("close_button_label", DEFAULTS.close_button_label),
    close_button_emoji: s("close_button_emoji", DEFAULTS.close_button_emoji),
    close_button_style: s("close_button_style", DEFAULTS.close_button_style),
    claim_button_label: s("claim_button_label", DEFAULTS.claim_button_label),
    claim_button_emoji: s("claim_button_emoji", DEFAULTS.claim_button_emoji),
    claim_button_style: s("claim_button_style", DEFAULTS.claim_button_style),
    command_prefix: s("command_prefix", DEFAULTS.command_prefix),
    close_command: s("close_command", DEFAULTS.close_command),
    reopen_command: s("reopen_command", DEFAULTS.reopen_command),
    delete_command: s("delete_command", DEFAULTS.delete_command),
    welcome_message: s("welcome_message", DEFAULTS.welcome_message),
    channel_id: s("channel_id", ""),
    category_id: "",
    log_channel_id: s("log_channel_id", ""),
    support_role_ids: (p?.support_role_ids as string[] | undefined) ?? [],
  });
  const [options, setOptions] = useState<PanelOptionForm[]>(() => {
    const loaded = (data.options ?? []) as PanelOptionForm[];
    return loaded.length > 0
      ? loaded.map((o) => ({
          label: o.label,
          description: o.description ?? "",
          emoji: o.emoji ?? "🎫",
          category_id: o.category_id ?? null,
          support_role_ids: o.support_role_ids ?? [],
          welcome_message: o.welcome_message ?? DEFAULT_OPTION.welcome_message,
          ticket_name_format: o.ticket_name_format ?? DEFAULT_OPTION.ticket_name_format,
        }))
      : [DEFAULT_OPTION];
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [channelSearch, setChannelSearch] = useState("");
  const [channelOpen, setChannelOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logOpen, setLogOpen] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
    setPublishResult(null);
  };

  const updateOption = (i: number, patch: Partial<PanelOptionForm>) => {
    setOptions((os) => os.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
    setSaved(false);
    setPublishResult(null);
  };
  const addOption = () => {
    if (options.length >= 8) return;
    setOptions((os) => [...os, { ...DEFAULT_OPTION, label: `Category ${os.length + 1}` }]);
    setSaved(false);
  };
  const removeOption = (i: number) => {
    setOptions((os) => (os.length <= 1 ? os : os.filter((_, idx) => idx !== i)));
    setSaved(false);
  };

  const selectedChannel = data.textChannels.find((c) => c.id === form.channel_id);
  const filteredChannels = useMemo(() => {
    const q = channelSearch.trim().toLowerCase();
    const list = q
      ? data.textChannels.filter((c) => c.name.toLowerCase().includes(q))
      : data.textChannels;
    return list.slice(0, 50);
  }, [data.textChannels, channelSearch]);

  const selectedLogChannel = data.textChannels.find((c) => c.id === form.log_channel_id);
  const filteredLogChannels = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    const list = q
      ? data.textChannels.filter((c) => c.name.toLowerCase().includes(q))
      : data.textChannels;
    return list.slice(0, 50);
  }, [data.textChannels, logSearch]);

  const payload = () => ({
    guildId,
    ...form,
    channel_id: form.channel_id || null,
    category_id: null as string | null,
    log_channel_id: form.log_channel_id || null,
    options: options.map((o, i) => ({
      position: i,
      label: o.label,
      description: o.description,
      emoji: o.emoji,
      category_id: o.category_id,
      support_role_ids: o.support_role_ids,
      welcome_message: o.welcome_message,
      ticket_name_format: o.ticket_name_format,
    })),
  });


  async function onSave() {
    setSaving(true);
    try {
      await saveTicketPanel({ data: payload() });
      setSaved(true);
      router.invalidate();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!form.channel_id) {
      alert("Choose a channel first, then save.");
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      await saveTicketPanel({ data: payload() });
      const res = await publishTicketPanel({ data: { guildId } });
      setPublishResult(`Panel posted to Discord (message ${res.messageId}).`);
      router.invalidate();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  const btnStyle = BUTTON_STYLES.find((b) => b.value === form.button_style) ?? BUTTON_STYLES[0];
  const closeStyle = BUTTON_STYLES.find((b) => b.value === form.close_button_style) ?? BUTTON_STYLES[3];
  const claimStyle = BUTTON_STYLES.find((b) => b.value === form.claim_button_style) ?? BUTTON_STYLES[2];

  const prefixInvalid = !form.command_prefix || /[a-zA-Z]/.test(form.command_prefix);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Servers
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-3">
            {data.guild.iconUrl ? (
              <img src={data.guild.iconUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10" />
            )}
            <span className="font-semibold">{data.guild.name}</span>
          </div>
        </div>

        {!data.botInGuild && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            The Ware bot isn't in this server yet, so channels and roles can't be listed.{" "}
            <a
              href={`https://discord.com/oauth2/authorize?client_id=1519976058923778058&permissions=8&scope=bot+applications.commands&guild_id=${guildId}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Invite Ware to this server
            </a>{" "}
            and refresh.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ticket Panel</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Customize the panel embed, buttons, commands, and where tickets get posted.
              </p>
            </div>

            <Section title="Panel type">
              <p className="-mt-2 text-xs text-muted-foreground">
                Buttons show a single "Open Ticket" button. Dropdown shows a menu with up to 8 ticket categories — each with its own Discord category, support roles, and welcome message.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "button", label: "Button", hint: "One-click ticket open." },
                  { v: "dropdown", label: "Dropdown menu", hint: "Multiple ticket categories." },
                ].map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => set("panel_type", t.v)}
                    className={`rounded-xl px-4 py-3 text-left ring-1 transition-colors ${
                      form.panel_type === t.v
                        ? "bg-white/10 ring-white/40"
                        : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.hint}</div>
                  </button>
                ))}
              </div>
              {form.panel_type === "dropdown" && (
                <Field label="Dropdown placeholder" hint="Shown when nothing is selected yet.">
                  <input
                    type="text"
                    value={form.dropdown_placeholder}
                    maxLength={100}
                    onChange={(e) => set("dropdown_placeholder", e.target.value)}
                    className="input"
                  />
                </Field>
              )}
            </Section>

            <Section title="Where">

              <Field label="Panel channel" hint="Search by name if you can't scroll to find it.">
                <div className="relative">
                  <input
                    type="text"
                    value={channelOpen ? channelSearch : selectedChannel ? `#${selectedChannel.name}` : channelSearch}
                    onChange={(e) => {
                      setChannelSearch(e.target.value);
                      setChannelOpen(true);
                    }}
                    onFocus={() => {
                      setChannelOpen(true);
                      setChannelSearch("");
                    }}
                    onBlur={() => setTimeout(() => setChannelOpen(false), 150)}
                    placeholder={data.botInGuild ? "Type to search channels…" : "Invite the bot first"}
                    className="input"
                    disabled={!data.botInGuild}
                  />
                  {channelOpen && data.botInGuild && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-[#1a1a1e] shadow-2xl">
                      {filteredChannels.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">No channels match.</div>
                      ) : (
                        filteredChannels.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              set("channel_id", c.id);
                              setChannelSearch("");
                              setChannelOpen(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${
                              c.id === form.channel_id ? "bg-white/5 text-white" : "text-[#dbdee1]"
                            }`}
                          >
                            #{c.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Field>
              <Field
                label="Support roles"
                hint="Members with these roles can see and reply in every ticket."
              >
                <div className="flex flex-wrap gap-2">
                  {data.roles.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      {data.botInGuild ? "No roles found." : "Invite the bot to load roles."}
                    </span>
                  )}
                  {data.roles.map((r) => {
                    const active = form.support_role_ids.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          set(
                            "support_role_ids",
                            active
                              ? form.support_role_ids.filter((x) => x !== r.id)
                              : [...form.support_role_ids, r.id],
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs ring-1 transition-colors ${
                          active
                            ? "bg-white/15 ring-white/40"
                            : "bg-white/[0.03] ring-white/10 hover:bg-white/10"
                        }`}
                        style={
                          r.color
                            ? { color: `#${r.color.toString(16).padStart(6, "0")}` }
                            : undefined
                        }
                      >
                        @{r.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field
                label="Log channel"
                hint="All transcripts and open, close, reopen, and delete events get posted here."
              >
                <div className="relative">
                  <input
                    type="text"
                    value={logOpen ? logSearch : selectedLogChannel ? `#${selectedLogChannel.name}` : logSearch}
                    onChange={(e) => {
                      setLogSearch(e.target.value);
                      setLogOpen(true);
                    }}
                    onFocus={() => {
                      setLogOpen(true);
                      setLogSearch("");
                    }}
                    onBlur={() => setTimeout(() => setLogOpen(false), 150)}
                    placeholder={data.botInGuild ? "Type to search channels…" : "Invite the bot first"}
                    className="input"
                    disabled={!data.botInGuild}
                  />
                  {form.log_channel_id && (
                    <button
                      type="button"
                      onClick={() => set("log_channel_id", "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-white/10 hover:text-white"
                    >
                      clear
                    </button>
                  )}
                  {logOpen && data.botInGuild && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-[#1a1a1e] shadow-2xl">
                      {filteredLogChannels.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">No channels match.</div>
                      ) : (
                        filteredLogChannels.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              set("log_channel_id", c.id);
                              setLogSearch("");
                              setLogOpen(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${
                              c.id === form.log_channel_id ? "bg-white/5 text-white" : "text-[#dbdee1]"
                            }`}
                          >
                            #{c.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Field>
            </Section>

            <Section title="Embed">
              <Field label="Title">
                <input type="text" value={form.title} maxLength={256}
                  onChange={(e) => set("title", e.target.value)} className="input" />
              </Field>
              <Field label="Description" hint="Supports basic Discord markdown.">
                <textarea value={form.description} maxLength={4000} rows={5}
                  onChange={(e) => set("description", e.target.value)} className="input resize-none" />
              </Field>
              <Field label="Accent color">
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border border-white/10 bg-transparent" />
                  <input type="text" value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="input w-32 font-mono" />
                </div>
              </Field>
            </Section>

            {form.panel_type === "button" ? (
              <ButtonEditor
                title="Open ticket button"
                hint="Shown on the panel. Users click this to open a ticket."
                label={form.button_label} onLabel={(v) => set("button_label", v)}
                emoji={form.button_emoji} onEmoji={(v) => set("button_emoji", v)}
                style={form.button_style} onStyle={(v) => set("button_style", v)}
              />
            ) : (
              <Section title="Dropdown options">
                <p className="-mt-2 text-xs text-muted-foreground">
                  Up to 8 categories. Each one opens a ticket in its own Discord category, pings its own support roles, and posts its own welcome message.
                </p>
                <div className="space-y-4">
                  {options.map((opt, i) => (
                    <OptionEditor
                      key={i}
                      index={i}
                      option={opt}
                      categories={data.categories}
                      roles={data.roles}
                      onChange={(patch) => updateOption(i, patch)}
                      onRemove={options.length > 1 ? () => removeOption(i) : undefined}
                    />
                  ))}
                </div>
                {options.length < 8 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" /> Add category
                  </button>
                )}
              </Section>
            )}


            <ButtonEditor
              title="Close ticket button"
              hint="Shown inside a ticket to close it."
              label={form.close_button_label} onLabel={(v) => set("close_button_label", v)}
              emoji={form.close_button_emoji} onEmoji={(v) => set("close_button_emoji", v)}
              style={form.close_button_style} onStyle={(v) => set("close_button_style", v)}
            />

            <ButtonEditor
              title="Claim ticket button"
              hint="Support staff click this to take ownership of a ticket."
              label={form.claim_button_label} onLabel={(v) => set("claim_button_label", v)}
              emoji={form.claim_button_emoji} onEmoji={(v) => set("claim_button_emoji", v)}
              style={form.claim_button_style} onStyle={(v) => set("claim_button_style", v)}
            />

            <Section title="Commands">
              <Field
                label="Prefix"
                hint="Any character except letters — e.g. $, !, ?, ., -"
              >
                <input type="text" value={form.command_prefix} maxLength={4}
                  onChange={(e) => set("command_prefix", e.target.value)}
                  className={`input w-24 font-mono ${prefixInvalid ? "ring-1 ring-red-500/60" : ""}`} />
                {prefixInvalid && (
                  <div className="mt-1 text-xs text-red-400">Prefix can't contain letters.</div>
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Close command">
                  <div className="flex">
                    <span className="grid place-items-center rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 font-mono text-sm text-muted-foreground">
                      {form.command_prefix || "$"}
                    </span>
                    <input type="text" value={form.close_command}
                      onChange={(e) => set("close_command", e.target.value.replace(/\s/g, ""))}
                      className="input rounded-l-none font-mono" />
                  </div>
                </Field>
                <Field label="Reopen command">
                  <div className="flex">
                    <span className="grid place-items-center rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 font-mono text-sm text-muted-foreground">
                      {form.command_prefix || "$"}
                    </span>
                    <input type="text" value={form.reopen_command}
                      onChange={(e) => set("reopen_command", e.target.value.replace(/\s/g, ""))}
                      className="input rounded-l-none font-mono" />
                  </div>
                </Field>
                <Field label="Delete command">
                  <div className="flex">
                    <span className="grid place-items-center rounded-l-md border border-r-0 border-white/10 bg-white/5 px-3 font-mono text-sm text-muted-foreground">
                      {form.command_prefix || "$"}
                    </span>
                    <input type="text" value={form.delete_command}
                      onChange={(e) => set("delete_command", e.target.value.replace(/\s/g, ""))}
                      className="input rounded-l-none font-mono" />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="After ticket opens">
              <Field label="Opening message" hint="First message sent inside a new ticket.">
                <textarea value={form.welcome_message} maxLength={2000} rows={4}
                  onChange={(e) => set("welcome_message", e.target.value)} className="input resize-none" />
              </Field>
            </Section>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button onClick={onSave} disabled={saving || publishing}
                className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/15 disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button onClick={onPublish}
                disabled={saving || publishing || !form.channel_id || !data.botInGuild}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">
                {publishing ? "Publishing…" : "Publish to Discord"}
              </button>
              {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
              {publishResult && <span className="text-sm text-emerald-400">{publishResult}</span>}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              Live preview
            </div>
            <div className="rounded-lg bg-[#313338] p-4 text-[#dbdee1] shadow-2xl">
              <div className="flex gap-3">
                <img src={avatarAsset.url} alt="ware" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">Ware</span>
                    <span className="rounded bg-[#5865F2] px-1 py-[1px] text-[10px] font-semibold text-white">APP</span>
                    <span className="text-xs text-[#949ba4]">Today at 12:00 PM</span>
                  </div>
                  <div className="mt-1 max-w-[440px] rounded border-l-4 bg-[#2b2d31] p-3"
                    style={{ borderColor: form.color }}>
                    <div className="font-semibold text-white">{form.title || " "}</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-[#dbdee1]">{form.description}</div>
                  </div>
                  <div className="mt-2">
                    <button type="button"
                      className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium ${btnStyle.className}`}>
                      <span>{form.button_emoji}</span><span>{form.button_label}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#313338] p-4 text-[#dbdee1] shadow-2xl">
              <div className="text-xs uppercase tracking-widest text-[#949ba4]">
                #ticket-0001 (opening message)
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm">{form.welcome_message}</div>
              <div className="mt-3 flex gap-2">
                <button type="button"
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium ${claimStyle.className}`}>
                  <span>{form.claim_button_emoji}</span><span>{form.claim_button_label}</span>
                </button>
                <button type="button"
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium ${closeStyle.className}`}>
                  <span>{form.close_button_emoji}</span><span>{form.close_button_label}</span>
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-[#313338] p-4 text-[13px] text-[#dbdee1] shadow-2xl">
              <div className="text-xs uppercase tracking-widest text-[#949ba4]">Commands</div>
              <ul className="mt-2 space-y-1 font-mono">
                <li><span className="text-white">{form.command_prefix}{form.close_command}</span> <span className="text-[#949ba4]">— close the ticket</span></li>
                <li><span className="text-white">{form.command_prefix}{form.reopen_command}</span> <span className="text-[#949ba4]">— reopen the ticket</span></li>
                <li><span className="text-white">{form.command_prefix}{form.delete_command}</span> <span className="text-[#949ba4]">— delete the ticket</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ButtonEditor({
  title, hint, label, onLabel, emoji, onEmoji, style, onStyle,
}: {
  title: string; hint?: string;
  label: string; onLabel: (v: string) => void;
  emoji: string; onEmoji: (v: string) => void;
  style: string; onStyle: (v: string) => void;
}) {
  return (
    <Section title={title}>
      {hint && <p className="-mt-2 text-xs text-muted-foreground">{hint}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label">
          <input type="text" value={label} maxLength={80}
            onChange={(e) => onLabel(e.target.value)} className="input" />
        </Field>
        <Field label="Emoji">
          <input type="text" value={emoji}
            onChange={(e) => onEmoji(e.target.value)} className="input" />
        </Field>
      </div>
      <Field label="Style">
        <div className="grid grid-cols-4 gap-2">
          {BUTTON_STYLES.map((s) => (
            <button key={s.value} type="button" onClick={() => onStyle(s.value)}
              className={`rounded-md px-3 py-2 text-xs font-medium ring-1 transition-colors ${
                style === s.value ? "ring-white/40 bg-white/10" : "ring-white/10 hover:bg-white/5"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </Field>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pill-surface space-y-4 rounded-2xl p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </label>
  );
}
