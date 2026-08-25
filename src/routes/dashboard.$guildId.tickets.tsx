import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Hash, Palette, Save, Send, Settings2, ShieldCheck, Ticket, UsersRound } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel, saveTicketPanel } from "@/lib/dashboard.functions";
import { publishTicketPanelLive } from "@/lib/ticket-live.functions";

export const Route = createFileRoute("/dashboard/$guildId/tickets")({
  head: () => ({ meta: [{ title: "Panel Designer — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: TicketsPage,
});

const input = "w-full rounded-xl border border-white/[0.075] bg-[#090a0a] px-3.5 py-3 text-sm text-white outline-none transition focus:border-white/[0.18]";
const card = "rounded-2xl border border-white/[0.065] bg-[#101111] shadow-[0_18px_60px_rgba(0,0,0,.18)]";

function TicketsPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const p = (data.panel ?? {}) as Record<string, any>;
  const [channelId, setChannelId] = useState(String(p.channel_id ?? ""));
  const [title, setTitle] = useState(String(p.title ?? "Support Tickets"));
  const [description, setDescription] = useState(String(p.description ?? "Choose an option below to open a private ticket with staff."));
  const [color, setColor] = useState(String(p.color ?? "#111217"));
  const [panelType, setPanelType] = useState(String(p.panel_type ?? "button"));
  const [buttonLabel, setButtonLabel] = useState(String(p.button_label ?? "Open Ticket"));
  const [buttonEmoji, setButtonEmoji] = useState(String(p.button_emoji ?? "🎫"));
  const [buttonStyle, setButtonStyle] = useState(String(p.button_style ?? "secondary"));
  const [prefix, setPrefix] = useState(String(p.command_prefix ?? ","));
  const [categoryId, setCategoryId] = useState(String(p.category_id ?? ""));
  const [logChannelId, setLogChannelId] = useState(String(p.log_channel_id ?? ""));
  const [supportRoleIds, setSupportRoleIds] = useState<string[]>((p.support_role_ids as string[] | undefined) ?? []);
  const [optionLabel, setOptionLabel] = useState(String(data.options?.[0]?.label ?? "Support"));
  const [optionDescription, setOptionDescription] = useState(String(data.options?.[0]?.description ?? "General support"));
  const [optionEmoji, setOptionEmoji] = useState(String(data.options?.[0]?.emoji ?? "🎫"));
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const channel = useMemo(() => data.textChannels.find((c) => c.id === channelId), [data.textChannels, channelId]);

  const payload = () => ({
    guildId,
    title,
    description,
    color,
    panel_type: panelType,
    dropdown_placeholder: "Select a ticket category…",
    button_label: buttonLabel,
    button_emoji: buttonEmoji,
    button_style: buttonStyle,
    close_button_label: "Close",
    close_button_emoji: "🔒",
    close_button_style: "secondary",
    claim_button_label: "Claim",
    claim_button_emoji: "📌",
    claim_button_style: "secondary",
    command_prefix: prefix,
    close_command: "close",
    reopen_command: "reopen",
    delete_command: "delete",
    welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
    channel_id: channelId || null,
    category_id: categoryId || null,
    log_channel_id: logChannelId || null,
    support_role_ids: supportRoleIds,
    options: [{
      position: 0,
      label: optionLabel,
      description: optionDescription,
      emoji: optionEmoji,
      category_id: categoryId || null,
      support_role_ids: supportRoleIds,
      welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
      ticket_name_format: "ticket-{number}",
    }],
  });

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      await saveTicketPanel({ data: payload() });
      setStorageWarning(false);
      setNotice("Panel configuration saved.");
      await router.invalidate();
    } catch (error) {
      const message = (error as Error).message || "Save failed";
      if (/ticket_panels|schema cache|relation .* does not exist/i.test(message)) {
        setStorageWarning(true);
        setNotice("Database migration is not applied yet. Live Discord publishing still works, but persistent ticket settings require the ticket_panels migration.");
      } else {
        setNotice(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function send() {
    if (!channelId) return setNotice("Choose a Discord channel first.");
    setSending(true);
    setNotice(null);
    try {
      try {
        await saveTicketPanel({ data: payload() });
        setStorageWarning(false);
      } catch (error) {
        const message = (error as Error).message || "";
        if (/ticket_panels|schema cache|relation .* does not exist/i.test(message)) setStorageWarning(true);
        else throw error;
      }

      const result = await publishTicketPanelLive({
        data: {
          guildId,
          channelId,
          title,
          description,
          color,
          panel_type: panelType,
          dropdown_placeholder: "Select a ticket category…",
          button_label: buttonLabel,
          button_emoji: buttonEmoji,
          button_style: buttonStyle,
          options: [{ position: 0, label: optionLabel, description: optionDescription, emoji: optionEmoji }],
        },
      });
      setNotice(`Sent to #${result.channelName}.`);
    } catch (error) {
      setNotice((error as Error).message || "Could not send panel to Discord.");
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="designer">
      <div className="mx-auto max-w-[1480px] pb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/24">Ticketing</div>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-.045em] text-white">Panel Designer</h1>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-white/34">Build the ticket panel, choose where it goes, preview it, and publish directly through Ware.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || sending} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[.08] bg-[#0b0c0c] px-4 text-[12px] font-medium text-white/70 hover:bg-white/[.05] disabled:opacity-40"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save"}</button>
            <button onClick={send} disabled={sending || !channelId || !data.botInGuild} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[.12] bg-black px-4 text-[12px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.02)] hover:bg-[#111] disabled:opacity-35"><Send className="h-3.5 w-3.5" />{sending ? "Sending…" : `Send to ${channel ? `#${channel.name}` : "#channel"}`}</button>
          </div>
        </div>

        {!data.botInGuild ? <div className="mb-5 rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-4 py-3 text-[12px] text-amber-100/70">Ware cannot read this server with the configured bot token. Check DISCORD_BOT_TOKEN and Ware's permissions.</div> : null}
        {storageWarning ? <div className="mb-5 rounded-xl border border-amber-300/15 bg-amber-300/[.045] px-4 py-3 text-[12px] leading-5 text-amber-100/70"><b>Database setup required:</b> the Supabase project still does not contain <code>public.ticket_panels</code>. Publishing is running in live mode until the migration is applied.</div> : null}
        {notice ? <div className="mb-5 rounded-xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-[12px] text-white/62">{notice}</div> : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="space-y-5">
            <section className={`${card} p-5`}>
              <div className="mb-4 flex items-center justify-between"><div><div className="text-[13px] font-semibold text-white/82">Publish destination</div><div className="mt-1 text-[10px] text-white/28">Only channels Ware can access are listed.</div></div><ShieldCheck className="h-4 w-4 text-emerald-300/60" /></div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <select value={channelId} onChange={(e) => setChannelId(e.target.value)} className={input}><option value="">Choose a channel…</option>{data.textChannels.map((c) => <option key={c.id} value={c.id}># {c.name}</option>)}</select>
                <button onClick={send} disabled={sending || !channelId || !data.botInGuild} className="h-[46px] rounded-xl border border-white/[.12] bg-black px-5 text-[12px] font-semibold text-white hover:bg-[#111] disabled:opacity-35">{sending ? "Sending…" : `Send to ${channel ? `#${channel.name}` : "#channel"}`}</button>
              </div>
            </section>

            <section className={`${card} p-5`}>
              <div className="mb-5 flex items-center gap-2"><Palette className="h-4 w-4 text-white/45" /><div className="text-[13px] font-semibold text-white/82">Panel appearance</div></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2"><span className="mb-2 block text-[10px] text-white/38">Title</span><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-[10px] text-white/38">Description</span><textarea className={`${input} min-h-24 resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Color</span><div className="flex gap-2"><input type="color" className="h-[46px] w-14 rounded-xl border border-white/[.07] bg-[#090a0a] p-1" value={color} onChange={(e) => setColor(e.target.value)} /><input className={input} value={color} onChange={(e) => setColor(e.target.value)} /></div></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Panel type</span><select className={input} value={panelType} onChange={(e) => setPanelType(e.target.value)}><option value="button">Button</option><option value="dropdown">Dropdown</option></select></label>
              </div>
            </section>

            <section className={`${card} p-5`}>
              <div className="mb-5 flex items-center gap-2"><Settings2 className="h-4 w-4 text-white/45" /><div className="text-[13px] font-semibold text-white/82">Ticket behavior</div></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label><span className="mb-2 block text-[10px] text-white/38">Command prefix</span><input className={input} value={prefix} onChange={(e) => setPrefix(e.target.value)} maxLength={5} /></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Ticket category</span><select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="">Automatic / none</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Log channel</span><select className={input} value={logChannelId} onChange={(e) => setLogChannelId(e.target.value)}><option value="">No log channel</option>{data.textChannels.map((c) => <option key={c.id} value={c.id}># {c.name}</option>)}</select></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Support roles</span><select multiple className={`${input} min-h-28`} value={supportRoleIds} onChange={(e) => setSupportRoleIds(Array.from(e.target.selectedOptions).map((o) => o.value))}>{data.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
              </div>
            </section>

            <section className={`${card} p-5`}>
              <div className="mb-5 flex items-center gap-2"><Ticket className="h-4 w-4 text-white/45" /><div className="text-[13px] font-semibold text-white/82">Open ticket control</div></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label><span className="mb-2 block text-[10px] text-white/38">Button label</span><input className={input} value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} /></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Emoji</span><input className={input} value={buttonEmoji} onChange={(e) => setButtonEmoji(e.target.value)} /></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Button style</span><select className={input} value={buttonStyle} onChange={(e) => setButtonStyle(e.target.value)}><option value="secondary">Grey</option><option value="primary">Blurple</option><option value="success">Green</option><option value="danger">Red</option></select></label>
                <label><span className="mb-2 block text-[10px] text-white/38">Option label</span><input className={input} value={optionLabel} onChange={(e) => setOptionLabel(e.target.value)} /></label>
                <label className="md:col-span-2"><span className="mb-2 block text-[10px] text-white/38">Option description</span><input className={input} value={optionDescription} onChange={(e) => setOptionDescription(e.target.value)} /></label>
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <section className={`${card} overflow-hidden`}>
              <div className="border-b border-white/[.055] px-5 py-4"><div className="text-[13px] font-semibold text-white/82">Discord preview</div><div className="mt-1 text-[10px] text-white/25">Updates as you edit</div></div>
              <div className="p-5">
                <div className="rounded-2xl bg-[#313338] p-4 text-[#dbdee1] shadow-inner">
                  <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-xs text-white">W</div><div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">ware <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[8px]">APP</span></div><div className="border-l-4 pl-4" style={{ borderColor: color }}><div className="font-semibold text-white">{title || "Support Tickets"}</div><div className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-[#b5bac1]">{description}</div></div><div className="mt-3 inline-flex rounded-md bg-[#4e5058] px-3 py-2 text-[12px] font-medium text-white">{buttonEmoji} {buttonLabel}</div></div></div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[.055] bg-white/[.02] px-3 py-3"><span className="text-[10px] text-white/27">Destination</span><span className="text-[11px] font-medium text-white/60">{channel ? `#${channel.name}` : "Not selected"}</span></div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
