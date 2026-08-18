import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Eye,
  Hash,
  Plus,
  Save,
  Send,
  Settings,
  Trash2,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getTicketPanel,
  publishTicketPanel,
  saveTicketPanel,
} from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/$guildId/tickets")({
  head: () => ({ meta: [{ title: "Panel Designer — ware dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: TicketsPage,
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

const BUTTON_STYLES: {
  value: string;
  label: string;
  className: string;
}[] = [
  {
    value: "primary",
    label: "Blurple",
    className: "bg-[#5865F2] text-white",
  },
  {
    value: "secondary",
    label: "Grey",
    className: "bg-[#4e5058] text-white",
  },
  {
    value: "success",
    label: "Green",
    className: "bg-[#248046] text-white",
  },
  {
    value: "danger",
    label: "Red",
    className: "bg-[#da373c] text-white",
  },
];

function TicketsPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();

  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const p = data.panel as Record<string, unknown> | null;
  const s = (key: string, fallback: string) =>
    p && typeof p[key] === "string" ? (p[key] as string) : fallback;

  const [form, setForm] = useState({
    title: s("title", DEFAULTS.title),
    description: s("description", DEFAULTS.description),
    color: s("color", DEFAULTS.color),
    panel_type: s("panel_type", DEFAULTS.panel_type),
    dropdown_placeholder: s(
      "dropdown_placeholder",
      DEFAULTS.dropdown_placeholder,
    ),
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
    category_id: s("category_id", ""),
    log_channel_id: s("log_channel_id", ""),
    support_role_ids:
      (p?.support_role_ids as string[] | undefined) ?? [],
  });

  const [options, setOptions] = useState<PanelOptionForm[]>(() => {
    const loaded = (data.options ?? []) as PanelOptionForm[];

    return loaded.length
      ? loaded.map((option) => ({
          label: option.label,
          description: option.description ?? "",
          emoji: option.emoji ?? "🎫",
          category_id: option.category_id ?? null,
          support_role_ids: option.support_role_ids ?? [],
          welcome_message:
            option.welcome_message ?? DEFAULT_OPTION.welcome_message,
          ticket_name_format:
            option.ticket_name_format ?? DEFAULT_OPTION.ticket_name_format,
        }))
      : [DEFAULT_OPTION];
  });

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const [channelSearch, setChannelSearch] = useState("");
  const [channelOpen, setChannelOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logOpen, setLogOpen] = useState(false);

  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setPublishResult(null);
  };

  const updateOption = (
    index: number,
    patch: Partial<PanelOptionForm>,
  ) => {
    setOptions((current) =>
      current.map((option, i) =>
        i === index ? { ...option, ...patch } : option,
      ),
    );
    setSaved(false);
    setPublishResult(null);
  };

  const selectedChannel = data.textChannels.find(
    (channel) => channel.id === form.channel_id,
  );
  const selectedLogChannel = data.textChannels.find(
    (channel) => channel.id === form.log_channel_id,
  );

  const filteredChannels = useMemo(() => {
    const query = channelSearch.trim().toLowerCase();
    return data.textChannels
      .filter((channel) =>
        query ? channel.name.toLowerCase().includes(query) : true,
      )
      .slice(0, 50);
  }, [channelSearch, data.textChannels]);

  const filteredLogChannels = useMemo(() => {
    const query = logSearch.trim().toLowerCase();
    return data.textChannels
      .filter((channel) =>
        query ? channel.name.toLowerCase().includes(query) : true,
      )
      .slice(0, 50);
  }, [logSearch, data.textChannels]);

  const payload = () => ({
    guildId,
    ...form,
    channel_id: form.channel_id || null,
    category_id: form.category_id || null,
    log_channel_id: form.log_channel_id || null,
    options: options.map((option, index) => ({
      position: index,
      label: option.label,
      description: option.description,
      emoji: option.emoji,
      category_id: option.category_id,
      support_role_ids: option.support_role_ids,
      welcome_message: option.welcome_message,
      ticket_name_format: option.ticket_name_format,
    })),
  });

  async function onSave() {
    setSaving(true);
    try {
      await saveTicketPanel({ data: payload() });
      setSaved(true);
      await router.invalidate();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!form.channel_id) {
      alert("Choose a panel channel first.");
      return;
    }

    setPublishing(true);
    setPublishResult(null);

    try {
      await saveTicketPanel({ data: payload() });
      const result = await publishTicketPanel({ data: { guildId } });
      setSaved(true);
      setPublishResult(`Published to Discord · ${result.messageId}`);
      await router.invalidate();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  const btnStyle =
    BUTTON_STYLES.find((style) => style.value === form.button_style) ??
    BUTTON_STYLES[0];

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="designer">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                to="/dashboard/$guildId/panels"
                params={{ guildId }}
                className="hover:text-white"
              >
                Panels
              </Link>
              <span>/</span>
              <span>Panel Designer</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Panel Designer
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit, preview, save, and publish your live Ware ticket panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium hover:bg-white/[0.08] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={onPublish}
              disabled={
                saving || publishing || !form.channel_id || !data.botInGuild
              }
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              {publishing ? "Publishing…" : "Publish to Discord"}
            </button>
          </div>
        </div>

        {publishResult && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
            {publishResult}
          </div>
        )}

        {!data.botInGuild && (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-200">
            Ware is not in this server, so channels and roles cannot be loaded yet.
          </div>
        )}

        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr),minmax(440px,0.9fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="font-semibold">Panel Preview</div>
                <div className="text-xs text-muted-foreground">
                  Live Discord-style preview
                </div>
              </div>

              <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.08] px-2.5 py-1.5">
                  <Eye className="h-3 w-3" />
                  Preview
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground">
                  <Settings className="h-3 w-3" />
                  Live Editing
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-white/10 bg-[#111214] p-4">
                <div className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                    W
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-white">ware</span>
                      <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[9px] font-bold text-white">
                        APP
                      </span>
                    </div>

                    <div
                      className="mt-2 rounded-lg border-l-4 bg-[#1b1c1f] p-4"
                      style={{ borderColor: form.color }}
                    >
                      <div className="font-semibold text-white">
                        {form.title || "Support"}
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-[#c7c9ce]">
                        {form.description || " "}
                      </div>
                    </div>

                    <div className="mt-2">
                      {form.panel_type === "dropdown" ? (
                        <div className="flex max-w-lg items-center justify-between rounded-md bg-[#1b1c1f] px-3 py-2 text-sm text-[#b5bac1]">
                          <span>{form.dropdown_placeholder}</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${btnStyle.className}`}
                        >
                          <span>{form.button_emoji}</span>
                          {form.button_label}
                        </button>
                      )}
                    </div>

                    {form.panel_type === "dropdown" && (
                      <div className="mt-2 max-w-lg overflow-hidden rounded-lg border border-white/10 bg-[#1b1c1f]">
                        {options.slice(0, 5).map((option, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 border-b border-white/5 px-3 py-2 last:border-0"
                          >
                            <span>{option.emoji}</span>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {option.label || `Category ${index + 1}`}
                              </div>
                              <div className="text-xs text-[#949ba4]">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Ticket opening message
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm">
                  {form.welcome_message}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PreviewButton
                    label={form.claim_button_label}
                    emoji={form.claim_button_emoji}
                    style={form.claim_button_style}
                  />
                  <PreviewButton
                    label={form.close_button_label}
                    emoji={form.close_button_emoji}
                    style={form.close_button_style}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Ticket commands
                </div>
                <div className="mt-3 grid gap-2 text-sm font-mono sm:grid-cols-3">
                  <CommandChip value={`${form.command_prefix}${form.close_command}`} label="Close" />
                  <CommandChip value={`${form.command_prefix}${form.reopen_command}`} label="Reopen" />
                  <CommandChip value={`${form.command_prefix}${form.delete_command}`} label="Delete" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <DesignerSection title="Ticket Style" icon={Settings}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["button", "Button", "One-click ticket opening"],
                  ["dropdown", "Dropdown", "Multiple ticket categories"],
                ].map(([value, label, hint]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("panel_type", value)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      form.panel_type === value
                        ? "border-white/35 bg-white/[0.08]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
                  </button>
                ))}
              </div>

              {form.panel_type === "dropdown" && (
                <Field label="Dropdown placeholder">
                  <input
                    className={inputClass}
                    value={form.dropdown_placeholder}
                    onChange={(event) =>
                      set("dropdown_placeholder", event.target.value)
                    }
                  />
                </Field>
              )}
            </DesignerSection>

            <DesignerSection title="Panel Embed" icon={BookOpen}>
              <Field label="Title">
                <input
                  className={inputClass}
                  value={form.title}
                  maxLength={256}
                  onChange={(event) => set("title", event.target.value)}
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  value={form.description}
                  maxLength={4000}
                  onChange={(event) => set("description", event.target.value)}
                />
              </Field>

              <Field label="Accent color">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(event) => set("color", event.target.value)}
                    className="h-11 w-14 rounded-lg border border-white/10 bg-transparent p-1"
                  />
                  <input
                    className={`${inputClass} font-mono`}
                    value={form.color}
                    onChange={(event) => set("color", event.target.value)}
                  />
                </div>
              </Field>
            </DesignerSection>

            <DesignerSection title="Panel Settings" icon={Settings}>
              <ChannelPicker
                label="Panel Channel"
                value={form.channel_id}
                selectedName={selectedChannel?.name}
                search={channelSearch}
                open={channelOpen}
                onSearch={setChannelSearch}
                onOpen={setChannelOpen}
                channels={filteredChannels}
                disabled={!data.botInGuild}
                onSelect={(id) => set("channel_id", id)}
              />

              <Field label="Default Ticket Category" hint="Used by button-style tickets.">
                <select
                  className={inputClass}
                  value={form.category_id}
                  onChange={(event) => set("category_id", event.target.value)}
                  disabled={!data.botInGuild}
                >
                  <option value="">Server root / no category</option>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Default Support Roles"
                hint="Roles that can access and manage tickets."
              >
                <RolePicker
                  roles={data.roles}
                  selected={form.support_role_ids}
                  onToggle={(roleId) => {
                    const active = form.support_role_ids.includes(roleId);
                    set(
                      "support_role_ids",
                      active
                        ? form.support_role_ids.filter((id) => id !== roleId)
                        : [...form.support_role_ids, roleId],
                    );
                  }}
                />
              </Field>

              <ChannelPicker
                label="Log Channel"
                value={form.log_channel_id}
                selectedName={selectedLogChannel?.name}
                search={logSearch}
                open={logOpen}
                onSearch={setLogSearch}
                onOpen={setLogOpen}
                channels={filteredLogChannels}
                disabled={!data.botInGuild}
                allowClear
                onClear={() => set("log_channel_id", "")}
                onSelect={(id) => set("log_channel_id", id)}
              />
            </DesignerSection>

            {form.panel_type === "button" ? (
              <DesignerSection title="Interaction Button" icon={Hash}>
                <ButtonFields
                  label={form.button_label}
                  emoji={form.button_emoji}
                  style={form.button_style}
                  onLabel={(value) => set("button_label", value)}
                  onEmoji={(value) => set("button_emoji", value)}
                  onStyle={(value) => set("button_style", value)}
                />
              </DesignerSection>
            ) : (
              <DesignerSection title="Dropdown Categories" icon={Hash}>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <OptionEditor
                      key={index}
                      option={option}
                      index={index}
                      categories={data.categories}
                      roles={data.roles}
                      onChange={(patch) => updateOption(index, patch)}
                      onRemove={
                        options.length > 1
                          ? () =>
                              setOptions((current) =>
                                current.filter((_, i) => i !== index),
                              )
                          : undefined
                      }
                    />
                  ))}

                  {options.length < 8 && (
                    <button
                      type="button"
                      onClick={() =>
                        setOptions((current) => [
                          ...current,
                          {
                            ...DEFAULT_OPTION,
                            label: `Category ${current.length + 1}`,
                          },
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm hover:bg-white/[0.06]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </button>
                  )}
                </div>
              </DesignerSection>
            )}

            <DesignerSection title="Ticket Controls" icon={Settings}>
              <div className="grid gap-4 md:grid-cols-2">
                <ButtonFields
                  heading="Claim Button"
                  label={form.claim_button_label}
                  emoji={form.claim_button_emoji}
                  style={form.claim_button_style}
                  onLabel={(value) => set("claim_button_label", value)}
                  onEmoji={(value) => set("claim_button_emoji", value)}
                  onStyle={(value) => set("claim_button_style", value)}
                />

                <ButtonFields
                  heading="Close Button"
                  label={form.close_button_label}
                  emoji={form.close_button_emoji}
                  style={form.close_button_style}
                  onLabel={(value) => set("close_button_label", value)}
                  onEmoji={(value) => set("close_button_emoji", value)}
                  onStyle={(value) => set("close_button_style", value)}
                />
              </div>

              <Field
                label="Opening Message"
                hint="Sent immediately inside each newly opened ticket."
              >
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  value={form.welcome_message}
                  maxLength={2000}
                  onChange={(event) =>
                    set("welcome_message", event.target.value)
                  }
                />
              </Field>
            </DesignerSection>

            <DesignerSection title="Ticket Commands" icon={Hash}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Prefix">
                  <input
                    className={`${inputClass} font-mono`}
                    maxLength={4}
                    value={form.command_prefix}
                    onChange={(event) =>
                      set("command_prefix", event.target.value)
                    }
                  />
                </Field>
                <Field label="Close">
                  <input
                    className={`${inputClass} font-mono`}
                    value={form.close_command}
                    onChange={(event) =>
                      set("close_command", event.target.value.replace(/\s/g, ""))
                    }
                  />
                </Field>
                <Field label="Reopen">
                  <input
                    className={`${inputClass} font-mono`}
                    value={form.reopen_command}
                    onChange={(event) =>
                      set("reopen_command", event.target.value.replace(/\s/g, ""))
                    }
                  />
                </Field>
                <Field label="Delete">
                  <input
                    className={`${inputClass} font-mono`}
                    value={form.delete_command}
                    onChange={(event) =>
                      set("delete_command", event.target.value.replace(/\s/g, ""))
                    }
                  />
                </Field>
              </div>
            </DesignerSection>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-white/25";

function DesignerSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Settings;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="font-semibold">{title}</div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function RolePicker({
  roles,
  selected,
  onToggle,
}: {
  roles: { id: string; name: string; color: number }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (!roles.length) {
    return <div className="text-xs text-muted-foreground">No roles available.</div>;
  }

  return (
    <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
      {roles.map((role) => {
        const active = selected.includes(role.id);
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onToggle(role.id)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              active
                ? "border-white/30 bg-white/[0.1] text-white"
                : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-white"
            }`}
          >
            @{role.name}
          </button>
        );
      })}
    </div>
  );
}

function ChannelPicker({
  label,
  selectedName,
  search,
  open,
  onSearch,
  onOpen,
  channels,
  disabled,
  onSelect,
  allowClear,
  onClear,
}: {
  label: string;
  value: string;
  selectedName?: string;
  search: string;
  open: boolean;
  onSearch: (value: string) => void;
  onOpen: (open: boolean) => void;
  channels: { id: string; name: string; parent_id: string | null }[];
  disabled?: boolean;
  onSelect: (id: string) => void;
  allowClear?: boolean;
  onClear?: () => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputClass} pl-9`}
              disabled={disabled}
              value={open ? search : selectedName ?? search}
              placeholder={disabled ? "Invite Ware first" : "Search channels…"}
              onFocus={() => {
                onSearch("");
                onOpen(true);
              }}
              onChange={(event) => {
                onSearch(event.target.value);
                onOpen(true);
              }}
              onBlur={() => setTimeout(() => onOpen(false), 120)}
            />

            {open && !disabled && (
              <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111] p-1 shadow-2xl">
                {channels.length ? (
                  channels.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onSelect(channel.id);
                        onSearch("");
                        onOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-white/[0.06] hover:text-white"
                    >
                      #{channel.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No channels found.
                  </div>
                )}
              </div>
            )}
          </div>

          {allowClear && selectedName && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl border border-white/10 px-3 text-xs text-muted-foreground hover:bg-white/[0.05] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

function ButtonFields({
  heading,
  label,
  emoji,
  style,
  onLabel,
  onEmoji,
  onStyle,
}: {
  heading?: string;
  label: string;
  emoji: string;
  style: string;
  onLabel: (value: string) => void;
  onEmoji: (value: string) => void;
  onStyle: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {heading && <div className="text-sm font-semibold">{heading}</div>}

      <div className="grid grid-cols-[1fr,90px] gap-2">
        <Field label="Label">
          <input
            className={inputClass}
            value={label}
            maxLength={80}
            onChange={(event) => onLabel(event.target.value)}
          />
        </Field>
        <Field label="Emoji">
          <input
            className={inputClass}
            value={emoji}
            onChange={(event) => onEmoji(event.target.value)}
          />
        </Field>
      </div>

      <Field label="Style">
        <div className="grid grid-cols-4 gap-2">
          {BUTTON_STYLES.map((buttonStyle) => (
            <button
              key={buttonStyle.value}
              type="button"
              onClick={() => onStyle(buttonStyle.value)}
              className={`rounded-lg border px-2 py-2 text-xs ${
                style === buttonStyle.value
                  ? "border-white/35 bg-white/[0.09]"
                  : "border-white/10 bg-black/20 text-muted-foreground hover:text-white"
              }`}
            >
              {buttonStyle.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function PreviewButton({
  label,
  emoji,
  style,
}: {
  label: string;
  emoji: string;
  style: string;
}) {
  const buttonStyle =
    BUTTON_STYLES.find((item) => item.value === style) ?? BUTTON_STYLES[0];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${buttonStyle.className}`}
    >
      <span>{emoji}</span>
      {label}
    </span>
  );
}

function CommandChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-white">{value}</div>
      <div className="mt-0.5 font-sans text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function OptionEditor({
  option,
  index,
  categories,
  roles,
  onChange,
  onRemove,
}: {
  option: PanelOptionForm;
  index: number;
  categories: { id: string; name: string }[];
  roles: { id: string; name: string; color: number }[];
  onChange: (patch: Partial<PanelOptionForm>) => void;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span>{option.emoji}</span>
          <span className="truncate text-sm font-medium">
            {option.label || `Category ${index + 1}`}
          </span>
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-3 border-t border-white/10 p-3">
          <div className="grid grid-cols-[1fr,90px] gap-2">
            <Field label="Label">
              <input
                className={inputClass}
                value={option.label}
                onChange={(event) => onChange({ label: event.target.value })}
              />
            </Field>
            <Field label="Emoji">
              <input
                className={inputClass}
                value={option.emoji}
                onChange={(event) => onChange({ emoji: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Description">
            <input
              className={inputClass}
              value={option.description}
              onChange={(event) =>
                onChange({ description: event.target.value })
              }
            />
          </Field>

          <Field label="Discord Category">
            <select
              className={inputClass}
              value={option.category_id ?? ""}
              onChange={(event) =>
                onChange({ category_id: event.target.value || null })
              }
            >
              <option value="">Server root / no category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Support Roles">
            <RolePicker
              roles={roles}
              selected={option.support_role_ids}
              onToggle={(roleId) => {
                const active = option.support_role_ids.includes(roleId);
                onChange({
                  support_role_ids: active
                    ? option.support_role_ids.filter((id) => id !== roleId)
                    : [...option.support_role_ids, roleId],
                });
              }}
            />
          </Field>

          <Field label="Ticket Name Format">
            <input
              className={`${inputClass} font-mono`}
              value={option.ticket_name_format}
              onChange={(event) =>
                onChange({ ticket_name_format: event.target.value })
              }
            />
          </Field>

          <Field label="Opening Message">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={option.welcome_message}
              onChange={(event) =>
                onChange({ welcome_message: event.target.value })
              }
            />
          </Field>
        </div>
      )}
    </div>
  );
}
