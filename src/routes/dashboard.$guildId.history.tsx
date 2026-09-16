import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { listTicketTranscripts } from "@/lib/transcript.functions";

export const Route = createFileRoute("/dashboard/$guildId/history")({
  head: () => ({ meta: [{ title: "Ticket History — Stained Dashboard" }] }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }),
      context.queryClient.ensureQueryData({ queryKey: ["ticketTranscripts", params.guildId], queryFn: () => listTicketTranscripts({ data: { guildId: params.guildId } }) }),
    ]);
    return null;
  },
  component: TicketHistoryPage,
});

function when(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function TicketHistoryPage() {
  const { guildId } = Route.useParams();
  const [query, setQuery] = useState("");
  const { data: server } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const { data: transcripts } = useSuspenseQuery({ queryKey: ["ticketTranscripts", guildId], queryFn: () => listTicketTranscripts({ data: { guildId } }) });
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transcripts as any[];
    return (transcripts as any[]).filter((t) => [t.ticket_id, t.channel_name, t.opener_name, t.closer_name, t.reason].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [query, transcripts]);

  return (
    <DashboardShell guild={server.guild} guildId={guildId} active="history">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/24">Ticketing</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white/94">Ticket History</h1>
            <p className="mt-2 text-[11px] text-white/32">Closed tickets and authenticated transcripts for {server.guild.name}.</p>
          </div>
          <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets, users, reasons…" className="w-full rounded-xl border border-white/[0.07] bg-[#0d0f0f] py-3 pl-10 pr-3 text-[11px] text-white outline-none placeholder:text-white/18 focus:border-white/[0.15]" /></div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#101212]">
          <div className="grid grid-cols-[90px_minmax(160px,1fr)_minmax(140px,1fr)_150px_100px] gap-3 border-b border-white/[0.05] px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-white/22">
            <span>Ticket</span><span>Opened by</span><span>Closed by</span><span>Closed</span><span className="text-right">Transcript</span>
          </div>
          {rows.length ? rows.map((t: any) => (
            <div key={t.id} className="grid grid-cols-[90px_minmax(160px,1fr)_minmax(140px,1fr)_150px_100px] items-center gap-3 border-b border-white/[0.04] px-4 py-3.5 last:border-0 hover:bg-white/[0.018]">
              <div className="text-[11px] font-semibold text-white/72">#{t.ticket_id}</div>
              <div className="min-w-0"><div className="truncate text-[11px] text-white/68">{t.opener_name || t.opener_id}</div><div className="mt-0.5 truncate text-[9px] text-white/22">{t.channel_name || "ticket channel"}</div></div>
              <div className="truncate text-[11px] text-white/55">{t.closer_name || "Unknown"}</div>
              <div className="text-[10px] text-white/35">{when(t.closed_at)}</div>
              <div className="text-right"><a href={`/transcripts/${t.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 py-2 text-[10px] text-white/65 transition hover:bg-white/[0.07] hover:text-white"><FileText className="h-3.5 w-3.5" /> View <ExternalLink className="h-3 w-3 text-white/25" /></a></div>
            </div>
          )) : <div className="grid min-h-64 place-items-center px-6 text-center"><div><FileText className="mx-auto h-7 w-7 text-white/18" /><div className="mt-3 text-[12px] font-medium text-white/48">No closed tickets yet</div><div className="mt-1 text-[10px] text-white/22">Transcripts will appear here when Stained saves a closed ticket.</div></div></div>}
        </div>
      </div>
    </DashboardShell>
  );
}

