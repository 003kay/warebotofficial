import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Download, Image as ImageIcon, Plus, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/embeds")({
  head: () => ({ meta: [{ title: "Embed Builder" }] }),
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: ["dashboardSettings", params.guildId],
        queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }),
      });
    } catch {}
    return null;
  },
  component: Page,
});

type Field = { id: number; name: string; value: string; inline: boolean };

const WARE_AVATAR = "/ware-logo.svg?v=4";
const PALETTE = [
  "#2d3138", "#4b161b", "#6b2415", "#704214", "#5a4b12",
  "#365314", "#14532d", "#115e59", "#155e75", "#164e63",
  "#1e3a8a", "#312e81", "#4c1d95", "#581c87", "#701a75",
  "#831843", "#7f1d1d", "#9a3412", "#854d0e", "#3f6212",
  "#166534", "#0f766e", "#0e7490", "#1d4ed8", "#4338ca",
  "#6d28d9", "#7e22ce", "#a21caf", "#be185d", "#374151",
];
const VARIABLES = ["{user.mention}", "{user.name}", "{user.avatar}", "{guild.name}", "{guild.count}"];
const input = "w-full rounded-[14px] border border-white/[0.075] bg-[#07090c] px-4 py-3 text-[13px] font-medium text-white/90 outline-none transition placeholder:text-white/22 focus:border-[#6477d8]/45 focus:bg-[#0b0e13] focus:ring-2 focus:ring-[#5267d4]/10";
const card = "rounded-[22px] border border-white/[0.07] bg-[linear-gradient(145deg,rgba(15,18,24,.98),rgba(7,9,12,.99))] shadow-[0_24px_80px_rgba(0,0,0,.24)]";

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" onClick={() => onChange(!value)} className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/50">
    <span className={`relative h-[22px] w-10 rounded-full border transition ${value ? "border-[#6579da]/40 bg-[#4b5db6]/35" : "border-white/[.09] bg-white/[.035]"}`}>
      <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${value ? "left-[21px] bg-[#91a2ff]" : "left-[2px] bg-white/46"}`} />
    </span>{label}
  </button>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-white/[0.055] py-6 first:border-0 first:pt-0"><div className="text-[12px] font-bold text-white/88">{title}</div><div className="mt-4 space-y-3">{children}</div></section>;
}

function wrap(name: string, value: string) { return `$v[${name}: ${value}]`; }

function Page() {
  const { guildId } = Route.useParams();
  const query = useQuery({
    queryKey: ["dashboardSettings", guildId],
    queryFn: () => getDashboardSettings({ data: { guildId } }),
    retry: 4,
    retryDelay: attempt => Math.min(300 * 2 ** attempt, 2200),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#2d3138");
  const [author, setAuthor] = useState("");
  const [authorIcon, setAuthorIcon] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [image, setImage] = useState("");
  const [footer, setFooter] = useState("");
  const [footerIcon, setFooterIcon] = useState("");
  const [timestamp, setTimestamp] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  const safeColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#2d3138";
  const empty = !content && !title && !description && !url && !author && !authorIcon && !thumbnail && !image && !footer && !footerIcon && !timestamp && !fields.length;

  const generated = useMemo(() => {
    const parts = ["[embed]"];
    if (content.trim()) parts.push(wrap("message", content.trim()));
    if (title.trim()) parts.push(wrap("title", title.trim()));
    if (description.trim()) parts.push(wrap("description", description.trim()));
    if (url.trim()) parts.push(wrap("url", url.trim()));
    parts.push(wrap("color", safeColor.replace("#", "")));
    if (author.trim()) parts.push(wrap("author", author.trim()));
    if (authorIcon.trim()) parts.push(wrap("author_icon", authorIcon.trim()));
    if (thumbnail.trim()) parts.push(wrap("thumbnail", thumbnail.trim()));
    if (image.trim()) parts.push(wrap("image", image.trim()));
    if (footer.trim()) parts.push(wrap("footer", footer.trim()));
    if (footerIcon.trim()) parts.push(wrap("footer_icon", footerIcon.trim()));
    if (timestamp) parts.push(wrap("timestamp", "true"));
    fields.forEach(f => {
      if (f.name.trim() || f.value.trim()) parts.push(wrap("field", `${f.name.trim()} | ${f.value.trim()} | ${f.inline ? "inline" : "block"}`));
    });
    return parts.join("");
  }, [content, title, description, url, safeColor, author, authorIcon, thumbnail, image, footer, footerIcon, timestamp, fields]);

  const clear = () => {
    setContent(""); setTitle(""); setDescription(""); setUrl(""); setColor("#2d3138");
    setAuthor(""); setAuthorIcon(""); setThumbnail(""); setImage(""); setFooter("");
    setFooterIcon(""); setTimestamp(false); setFields([]);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const exportScript = () => {
    const blob = new Blob([generated], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `ware-embed-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    setExported(true);
    window.setTimeout(() => setExported(false), 1200);
  };

  if (query.isPending) return <div className="grid min-h-screen place-items-center bg-[#06070a] text-white/45"><RefreshCw className="h-5 w-5 animate-spin" /></div>;
  if (query.isError || !query.data) return <div className="grid min-h-screen place-items-center bg-[#06070a] px-6 text-white"><div className="w-full max-w-md rounded-2xl border border-white/[.08] bg-[#0b0e13] p-6 text-center"><div className="text-lg font-bold">Couldn’t load this server</div><button onClick={() => query.refetch()} className="mt-5 rounded-xl border border-white/[.1] bg-white/[.05] px-4 py-2.5 text-sm">Retry</button></div></div>;

  const data = query.data;
  return <DashboardShell guild={data.guild} guildId={guildId} active="embeds">
    <div className="w-full pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7788d4]/70">Content tools</div><h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-white">Embed Builder</h1><p className="mt-2 max-w-2xl text-sm font-medium text-white/38">Build, preview, export, and copy a Stained embed.</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={exportScript} className="inline-flex items-center gap-2 rounded-xl border border-[#6878cf]/18 bg-[#5262ac]/10 px-4 py-2.5 text-xs font-semibold text-[#c4ccff]/72 hover:bg-[#5262ac]/18"><Download className="h-3.5 w-3.5"/>{exported ? "Exported" : "Export"}</button>
          <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/62 hover:bg-white/[.07]"><RotateCcw className="h-3.5 w-3.5"/>Reset</button>
        </div>
      </div>

      <div className="mt-7 grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(360px,.72fr)_minmax(560px,1.28fr)] 2xl:grid-cols-[minmax(460px,.68fr)_minmax(760px,1.32fr)]">
        <section className={`${card} min-w-0 p-6`}>
          <Section title="Content"><textarea rows={3} value={content} onChange={e=>setContent(e.target.value)} placeholder="Message above the embed" className={input}/><div className="flex flex-wrap gap-2">{VARIABLES.map(v=><button key={v} type="button" onClick={()=>setContent(x=>x+v)} className="rounded-lg border border-[#6677c8]/15 bg-[#5262ac]/10 px-2.5 py-1.5 font-mono text-[10px] text-[#b3befa]/65 hover:bg-[#5262ac]/18">{v}</button>)}</div></Section>
          <Section title="Embed"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className={input}/><textarea rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description — {user.mention} works here" className={input}/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Title URL (optional)" className={input}/></Section>
          <Section title="Color">
            <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3"><input type="color" value={safeColor} onChange={e=>setColor(e.target.value)} className="h-12 w-[58px] cursor-pointer rounded-[14px] border border-white/[.09] bg-[#080a0d] p-1.5"/><input value={color} onChange={e=>setColor(e.target.value)} className={input}/></div>
            <div className="grid grid-cols-10 gap-2 sm:grid-cols-15">{PALETTE.map(c=><button key={c} type="button" onClick={()=>setColor(c)} title={c} className={`h-10 rounded-[12px] border transition duration-150 hover:-translate-y-0.5 hover:scale-[1.04] ${safeColor.toLowerCase()===c.toLowerCase()?"border-white/85 ring-2 ring-white/20":"border-white/[.08]"}`} style={{backgroundColor:c}}/>)}</div>
          </Section>
          <Section title="Author"><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author name" className={input}/><input value={authorIcon} onChange={e=>setAuthorIcon(e.target.value)} placeholder="Author icon URL" className={input}/></Section>
          <Section title="Images"><div className="relative"><ImageIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8291d6]/55"/><input value={thumbnail} onChange={e=>setThumbnail(e.target.value)} placeholder="Thumbnail URL or {user.avatar}" className={`${input} pl-10`}/></div><div className="relative"><ImageIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8291d6]/55"/><input value={image} onChange={e=>setImage(e.target.value)} placeholder="Large image URL" className={`${input} pl-10`}/></div></Section>
          <Section title="Fields">{fields.map((f,i)=><div key={f.id} className="rounded-[15px] border border-white/[.065] bg-white/[.02] p-3.5"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold text-white/38">Field {i+1}</span><div className="flex items-center gap-3"><Toggle value={f.inline} onChange={v=>setFields(x=>x.map(y=>y.id===f.id?{...y,inline:v}:y))} label="inline"/><button onClick={()=>setFields(x=>x.filter(y=>y.id!==f.id))}><Trash2 className="h-4 w-4 text-white/30"/></button></div></div><input value={f.name} onChange={e=>setFields(x=>x.map(y=>y.id===f.id?{...y,name:e.target.value}:y))} placeholder="Field name" className={input}/><textarea rows={2} value={f.value} onChange={e=>setFields(x=>x.map(y=>y.id===f.id?{...y,value:e.target.value}:y))} placeholder="Field value" className={`${input} mt-2`}/></div>)}<button onClick={()=>setFields(x=>[...x,{id:Date.now(),name:"",value:"",inline:false}])} className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#6677c8]/15 bg-[#5262ac]/8 py-3 text-xs font-bold text-[#b4bdf0]/65 hover:bg-[#5262ac]/16"><Plus className="h-4 w-4"/>Add field</button></Section>
          <Section title="Footer"><input value={footer} onChange={e=>setFooter(e.target.value)} placeholder="Footer text" className={input}/><input value={footerIcon} onChange={e=>setFooterIcon(e.target.value)} placeholder="Footer icon URL" className={input}/><Toggle value={timestamp} onChange={setTimestamp} label="Show timestamp"/></Section>
        </section>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-[88px] lg:self-start">
          <section className={`${card} w-full min-w-0 overflow-hidden`}>
            <div className="border-b border-white/[.06] px-6 py-4"><div className="text-sm font-bold text-white/90">Discord preview</div><div className="mt-1 text-[10px] font-medium text-white/28">Wide live preview</div></div>
            <div className="w-full bg-[#0d1015] p-5 sm:p-7">
              {empty ? <div className="grid min-h-[410px] w-full place-items-center rounded-[18px] border border-white/[.055] bg-[#1e2025] text-sm font-medium text-[#949ba4]">Your embed will appear here</div> :
              <div className="min-h-[410px] w-full rounded-[18px] bg-[#313338] p-5 text-[#dbdee1]">
                <div className="mb-4 flex items-center gap-2.5"><img src={WARE_AVATAR} className="h-10 w-10 rounded-full bg-black object-contain p-1"/><div className="text-sm font-bold text-white">stained <span className="rounded bg-[#5865F2] px-1.5 py-0.5 text-[9px]">✓ APP</span></div></div>
                {content&&<div className="mb-3 whitespace-pre-wrap text-sm">{content}</div>}
                <div className="relative w-full overflow-hidden rounded bg-[#2b2d31] p-4 pl-5" style={{borderLeft:`4px solid ${safeColor}`}}>
                  {thumbnail&&<img src={thumbnail==="{user.avatar}"?WARE_AVATAR:thumbnail} className="absolute right-4 top-4 h-20 w-20 rounded object-cover"/>}
                  <div className={thumbnail?"pr-24":""}>{author&&<div className="mb-2 text-xs font-bold">{author}</div>}{title&&<div className="text-base font-bold text-white">{title}</div>}{description&&<div className="mt-2 whitespace-pre-wrap text-sm leading-5">{description}</div>}<div className="mt-3 grid gap-3 sm:grid-cols-2">{fields.map(f=><div key={f.id}><div className="text-xs font-bold text-white">{f.name||"Field name"}</div><div className="mt-0.5 text-xs">{f.value||"Field value"}</div></div>)}</div>{image&&<img src={image} className="mt-4 max-h-80 w-full rounded object-cover"/>}{(footer||timestamp)&&<div className="mt-4 text-[10px] text-[#b5bac1]">{footer}{footer&&timestamp?" • ":""}{timestamp?"Today at 12:00 AM":""}</div>}</div>
                </div>
              </div>}
            </div>
          </section>

          <section className={`${card} w-full min-w-0`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.06] px-6 py-4"><div><div className="text-sm font-bold text-white/90">Generated script</div><div className="mt-1 text-[10px] text-white/28">Full-width Stained embed syntax</div></div><div className="flex gap-2"><button onClick={exportScript} className="inline-flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-3.5 py-2 text-[10px] font-bold text-white/58 hover:bg-white/[.07]"><Download className="h-3.5 w-3.5"/>Export</button><button onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-[#6677c8]/16 bg-[#5262ac]/10 px-3.5 py-2 text-[10px] font-bold text-[#bec7ff]/70 hover:bg-[#5262ac]/18"><Copy className="h-3.5 w-3.5"/>{copied?"Copied":"Copy"}</button></div></div>
            <div className="p-5"><textarea readOnly value={generated} rows={12} className="min-h-[300px] w-full resize-y rounded-[16px] border border-white/[.065] bg-[#06080b] p-5 font-mono text-[13px] leading-6 text-white/80 outline-none"/></div>
          </section>
        </aside>
      </div>
    </div>
  </DashboardShell>;
}

