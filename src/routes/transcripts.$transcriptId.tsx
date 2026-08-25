import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ExternalLink, Hash, LockKeyhole, MessageSquareText, Paperclip } from "lucide-react";
import { getTicketTranscript, type TranscriptMessage } from "@/lib/transcript.functions";

export const Route = createFileRoute("/transcripts/$transcriptId")({
  head: () => ({ meta: [{ title: "Ticket Transcript — Ware" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["transcript", params.transcriptId],
      queryFn: () => getTicketTranscript({ data: { transcriptId: params.transcriptId } }),
    });
    return null;
  },
  component: TranscriptPage,
});

function avatarUrl(message: TranscriptMessage) {
  if (message.author_avatar?.startsWith("http")) return message.author_avatar;
  if (message.author_avatar && message.author_id) {
    return `https://cdn.discordapp.com/avatars/${message.author_id}/${message.author_avatar}.png?size=80`;
  }
  return null;
}

function time(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function DiscordEmbed({ embed }: { embed: NonNullable<TranscriptMessage["embeds"]>[number] }) {
  const accent = typeof embed.color === "number" ? `#${embed.color.toString(16).padStart(6, "0")}` : "#5865f2";
  return (
    <div className="relative mt-2 max-w-[620px] overflow-hidden rounded-md bg-[#2b2d31] shadow-sm">
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
      <div className="p-4 pl-5">
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            {embed.title ? <div className="mb-2 text-[14px] font-semibold text-[#f2f3f5]">{embed.title}</div> : null}
            {embed.description ? <div className="whitespace-pre-wrap text-[13px] leading-[1.45] text-[#dbdee1]">{embed.description}</div> : null}
            {embed.fields?.length ? (
              <div className="mt-3 grid grid-cols-12 gap-x-4 gap-y-3">
                {embed.fields.map((field, i) => (
                  <div key={i} className={field.inline ? "col-span-6 md:col-span-4" : "col-span-12"}>
                    <div className="text-[12px] font-semibold text-[#f2f3f5]">{field.name}</div>
                    <div className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-[#dbdee1]">{field.value}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {embed.thumbnail?.url ? <img src={embed.thumbnail.url} alt="" className="h-20 w-20 shrink-0 rounded object-cover" /> : null}
        </div>
        {embed.image?.url ? <img src={embed.image.url} alt="" className="mt-3 max-h-[440px] max-w-full rounded object-contain" /> : null}
        {embed.footer?.text ? <div className="mt-3 text-[10px] text-[#b5bac1]">{embed.footer.text}</div> : null}
      </div>
    </div>
  );
}

function Message({ message }: { message: TranscriptMessage }) {
  const avatar = avatarUrl(message);
  const imageAttachments = (message.attachments ?? []).filter((a) => a.content_type?.startsWith("image/"));
  const otherAttachments = (message.attachments ?? []).filter((a) => !a.content_type?.startsWith("image/"));
  return (
    <article className="group flex gap-3 px-4 py-2.5 transition hover:bg-white/[0.018] md:px-6">
      <div className="mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#313338]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-[12px] font-semibold text-white/55">{message.author_name?.slice(0, 2).toUpperCase()}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] font-semibold text-[#f2f3f5]">{message.author_name || "Unknown user"}</span>
          {message.bot ? <span className="rounded bg-[#5865f2] px-1 py-[1px] text-[8px] font-bold uppercase text-white">APP</span> : null}
          <span className="text-[10px] text-[#949ba4]">{time(message.timestamp)}</span>
          {message.edited_timestamp ? <span className="text-[9px] text-[#949ba4]">(edited)</span> : null}
        </div>
        {message.content ? <div className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.45] text-[#dbdee1]">{message.content}</div> : null}
        {message.embeds?.map((embed, i) => <DiscordEmbed key={i} embed={embed} />)}
        {imageAttachments.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {imageAttachments.map((a, i) => <a key={i} href={a.url} target="_blank" rel="noreferrer"><img src={a.url} alt={a.name} className="max-h-[380px] max-w-[520px] rounded-lg object-contain" /></a>)}
          </div>
        ) : null}
        {otherAttachments.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" className="mt-2 flex max-w-[440px] items-center gap-3 rounded-lg border border-white/[0.07] bg-[#2b2d31] p-3 text-[12px] text-[#00a8fc] hover:underline">
            <Paperclip className="h-4 w-4 text-[#b5bac1]" />
            <span className="min-w-0 flex-1 truncate">{a.name}</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#b5bac1]" />
          </a>
        ))}
      </div>
    </article>
  );
}

function TranscriptPage() {
  const { transcriptId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["transcript", transcriptId],
    queryFn: () => getTicketTranscript({ data: { transcriptId } }),
  });

  useEffect(() => {
    if (!data.authenticated) {
      window.location.replace(`/auth/discord/login?next=${encodeURIComponent(`/transcripts/${transcriptId}`)}`);
    }
  }, [data.authenticated, transcriptId]);

  if (!data.authenticated) {
    return <div className="grid min-h-screen place-items-center bg-[#1e1f22] text-white"><div className="flex items-center gap-3 text-sm text-white/60"><LockKeyhole className="h-4 w-4" /> Connecting your Discord account…</div></div>;
  }
  if (!("allowed" in data) || !data.allowed || !data.transcript) {
    return <div className="grid min-h-screen place-items-center bg-[#1e1f22] px-6 text-center text-white"><div><LockKeyhole className="mx-auto h-8 w-8 text-white/35" /><h1 className="mt-4 text-xl font-semibold">Transcript unavailable</h1><p className="mt-2 text-sm text-white/45">You must be the ticket participant or manage the server to view this transcript.</p></div></div>;
  }

  const t = data.transcript as any;
  const messages = (t.messages ?? []) as TranscriptMessage[];
  return (
    <div className="min-h-screen bg-[#1e1f22] text-[#dbdee1]">
      <header className="sticky top-0 z-20 border-b border-black/20 bg-[#111214]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05]"><Hash className="h-5 w-5 text-white/55" /></div>
            <div className="min-w-0"><div className="truncate text-[14px] font-semibold text-white">{t.channel_name || `ticket-${t.ticket_id}`}</div><div className="mt-0.5 text-[10px] text-white/35">Ticket #{t.ticket_id} · {t.message_count ?? messages.length} messages</div></div>
          </div>
          <a href="/dashboard" className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] text-white/65 hover:bg-white/[0.07]">Ware Dashboard</a>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] pb-20">
        <section className="m-4 overflow-hidden rounded-2xl border border-white/[0.065] bg-[#232428] md:m-6">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div><div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Opened by</div><div className="mt-1 text-[12px] font-medium text-white/80">{t.opener_name || t.opener_id}</div></div>
            <div><div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Closed by</div><div className="mt-1 text-[12px] font-medium text-white/80">{t.closer_name || t.closer_id || "Unknown"}</div></div>
            <div><div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Claimed by</div><div className="mt-1 text-[12px] font-medium text-white/80">{t.claimer_name || t.claimer_id || "Not claimed"}</div></div>
            <div><div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Closed</div><div className="mt-1 text-[12px] font-medium text-white/80">{time(t.closed_at)}</div></div>
          </div>
          {t.reason ? <div className="border-t border-white/[0.055] px-5 py-4"><div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Reason</div><div className="mt-1 text-[12px] text-white/70">{t.reason}</div></div> : null}
        </section>

        <div className="mx-4 mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/25 md:mx-6"><MessageSquareText className="h-3.5 w-3.5" /> Transcript</div>
        <section className="mx-2 overflow-hidden rounded-xl bg-[#313338] py-3 shadow-[0_20px_60px_rgba(0,0,0,.24)] md:mx-6">
          {messages.length ? messages.map((message, i) => <Message key={message.id || i} message={message} />) : <div className="grid min-h-48 place-items-center px-6 text-center text-[12px] text-white/35">This transcript was saved without message history.</div>}
        </section>
      </main>
    </div>
  );
}
