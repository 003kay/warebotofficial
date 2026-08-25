import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Copy, Image as ImageIcon, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/embeds")({
  head: () => ({ meta: [{ title: "Embed Builder — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["dashboardSettings", params.guildId],
      queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: Page,
});

type Field = { id: number; name: string; value: string; inline: boolean };
type Button = { id: number; style: "primary" | "secondary" | "success" | "danger" | "link"; label: string; target: string; emoji: string; disabled: boolean };

const WARE_AVATAR = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";
const PALETTE = ["#f5f5f5", "#c7c7c7", "#8b8b8b", "#4b5563", "#5865F2", "#4752c4", "#3ba55c", "#2d7d46", "#ed4245", "#b42f32", "#b85f86", "#8c4565", "#a95f42", "#74402e", "#419c7d", "#2f705b", "#6675aa", "#46537c", "#6854ad", "#4a3b7d", "#2d3138", "#15171b"];
const input = "w-full rounded-xl border border-white/[0.07] bg-[#0c0e0f] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/22 focus:border-white/[0.16] focus:bg-[#101213]";
const card = "rounded-[18px] border border-white/[0.06] bg-[#0b0d0e]";

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" onClick={() => onChange(!value)} className="inline-flex items-center gap-2 text-[11px] text-white/42"><span className={`relative h-5 w-9 rounded-full border transition ${value ? "border-white/16 bg-white/22" : "border-white/08 bg-white/[0.04]"}`}><span className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-[2px]"}`} /></span>{label}</button>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <details open className="border-t border-white/[0.055] py-5 first:border-0 first:pt-0"><summary className="cursor-pointer list-none text-[13px] font-semibold text-white/88">{title}</summary><div className="mt-4 space-y-3">{children}</div></details>;
}

function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const [content, setContent] = useState(""); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [url, setUrl] = useState("");
  const [color, setColor] = useState("#2d3138"); const [color2, setColor2] = useState("#15171b");
  const [author, setAuthor] = useState(""); const [authorIcon, setAuthorIcon] = useState(""); const [thumbnail, setThumbnail] = useState(""); const [image, setImage] = useState("");
  const [footer, setFooter] = useState(""); const [footerIcon, setFooterIcon] = useState(""); const [timestamp, setTimestamp] = useState(false);
  const [fields, setFields] = useState<Field[]>([]); const [buttons, setButtons] = useState<Button[]>([]); const [copied, setCopied] = useState(false);

  const safeColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#2d3138";
  const safeColor2 = /^#[0-9a-f]{6}$/i.test(color2) ? color2 : "#15171b";
  const empty = !content && !title && !description && !url && !author && !authorIcon && !thumbnail && !image && !footer && !footerIcon && !timestamp && !fields.length && !buttons.length;
  const generated = useMemo(() => {
    const p = ["{embed}"];
    if (content) p.push(`$v{message: ${content}}`); if (title) p.push(`$v{title: ${title}}`); if (description) p.push(`$v{description: ${description}}`); if (url) p.push(`$v{url: ${url}}`);
    p.push(`$v{color: ${safeColor}}`); if (author) p.push(`$v{author: ${author}}`); if (authorIcon) p.push(`$v{author_icon: ${authorIcon}}`); if (thumbnail) p.push(`$v{thumbnail: ${thumbnail}}`); if (image) p.push(`$v{image: ${image}}`); if (footer) p.push(`$v{footer: ${footer}}`); if (footerIcon) p.push(`$v{footer_icon: ${footerIcon}}`); if (timestamp) p.push("$v{timestamp: true}");
    fields.forEach(f => p.push(`$v{field: ${f.name} | ${f.value} | ${f.inline ? "inline" : "block"}}`)); buttons.forEach(b => p.push(`$v{button: ${b.style} | ${b.label} | ${b.target} | ${b.emoji} | ${b.disabled ? "disabled" : "enabled"}}`)); return p.join("");
  }, [content,title,description,url,safeColor,author,authorIcon,thumbnail,image,footer,footerIcon,timestamp,fields,buttons]);

  const clear = () => { setContent(""); setTitle(""); setDescription(""); setUrl(""); setColor("#2d3138"); setColor2("#15171b"); setAuthor(""); setAuthorIcon(""); setThumbnail(""); setImage(""); setFooter(""); setFooterIcon(""); setTimestamp(false); setFields([]); setButtons([]); };
  const copy = async () => { await navigator.clipboard.writeText(generated); setCopied(true); setTimeout(() => setCopied(false), 1200); };

  return <DashboardShell guild={data.guild} guildId={guildId} active="embeds">
    <div className="mx-auto max-w-[1580px] pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><div className="text-[9px] uppercase tracking-[0.22em] text-white/22">Content tools</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl">Embed Builder</h1><p className="mt-2 max-w-2xl text-sm text-white/34">Build polished Ware embeds with live Discord preview, fields, images, buttons and exact HEX colors.</p></div>
        <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.88fr)]">
        <section className={`${card} p-5 md:p-6`}>
          <Section title="Content"><textarea rows={3} value={content} onChange={e=>setContent(e.target.value)} placeholder="Message content" className={input} /></Section>
          <Section title="Basic settings"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className={input}/><textarea rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className={input}/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" className={input}/></Section>
          <Section title="Appearance">
            <div className="grid gap-3 md:grid-cols-2"><label><div className="mb-2 text-[10px] text-white/35">Primary HEX</div><div className="flex gap-2"><input type="color" value={safeColor} onChange={e=>setColor(e.target.value)} className="h-11 w-12 rounded-lg border border-white/[0.08] bg-transparent p-1"/><input value={color} onChange={e=>setColor(e.target.value)} className={input}/></div></label><label><div className="mb-2 text-[10px] text-white/35">Second shade</div><div className="flex gap-2"><input type="color" value={safeColor2} onChange={e=>setColor2(e.target.value)} className="h-11 w-12 rounded-lg border border-white/[0.08] bg-transparent p-1"/><input value={color2} onChange={e=>setColor2(e.target.value)} className={input}/></div></label></div>
            <div className="grid grid-cols-11 gap-2 pt-1">{PALETTE.map(c=><button key={c} type="button" title={c} onClick={()=>setColor(c)} className={`aspect-square rounded-lg border ${safeColor.toLowerCase()===c.toLowerCase()?"border-white ring-2 ring-white/10":"border-white/[0.06]"}`} style={{backgroundColor:c}} />)}</div>
            <div className="rounded-xl border border-white/[0.06] p-3" style={{background:`linear-gradient(135deg,${safeColor},${safeColor2})`}}><div className="rounded-lg bg-black/45 px-3 py-2 text-[10px] text-white/75">{safeColor} → {safeColor2}</div></div>
          </Section>
          <Section title="Author"><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author name" className={input}/><input value={authorIcon} onChange={e=>setAuthorIcon(e.target.value)} placeholder="Author icon URL" className={input}/></Section>
          <Section title="Fields">{fields.map((f,i)=><div key={f.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] text-white/35">Field {i+1}</span><div className="flex items-center gap-3"><Toggle value={f.inline} onChange={v=>setFields(x=>x.map(y=>y.id===f.id?{...y,inline:v}:y))} label="inline"/><button onClick={()=>setFields(x=>x.filter(y=>y.id!==f.id))}><Trash2 className="h-3.5 w-3.5 text-white/28"/></button></div></div><input value={f.name} onChange={e=>setFields(x=>x.map(y=>y.id===f.id?{...y,name:e.target.value}:y))} placeholder="Field name" className={input}/><textarea rows={2} value={f.value} onChange={e=>setFields(x=>x.map(y=>y.id===f.id?{...y,value:e.target.value}:y))} placeholder="Field value" className={`${input} mt-2`}/></div>)}<button onClick={()=>setFields(x=>[...x,{id:Date.now(),name:"",value:"",inline:false}])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] py-3 text-xs text-white/55 hover:bg-white/[0.05]"><Plus className="h-3.5 w-3.5"/>Add field</button></Section>
          <Section title="Buttons">{buttons.map((b,i)=><div key={b.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] text-white/35">Button {i+1}</span><div className="flex items-center gap-3"><Toggle value={b.disabled} onChange={v=>setButtons(x=>x.map(y=>y.id===b.id?{...y,disabled:v}:y))} label="disabled"/><button onClick={()=>setButtons(x=>x.filter(y=>y.id!==b.id))}><Trash2 className="h-3.5 w-3.5 text-white/28"/></button></div></div><div className="grid gap-2 md:grid-cols-2"><select value={b.style} onChange={e=>setButtons(x=>x.map(y=>y.id===b.id?{...y,style:e.target.value as Button["style"]}:y))} className={input}><option value="secondary">Secondary</option><option value="primary">Primary</option><option value="success">Success</option><option value="danger">Danger</option><option value="link">Link</option></select><input value={b.label} onChange={e=>setButtons(x=>x.map(y=>y.id===b.id?{...y,label:e.target.value}:y))} placeholder="Label" className={input}/><input value={b.target} onChange={e=>setButtons(x=>x.map(y=>y.id===b.id?{...y,target:e.target.value}:y))} placeholder="Custom ID / URL" className={input}/><input value={b.emoji} onChange={e=>setButtons(x=>x.map(y=>y.id===b.id?{...y,emoji:e.target.value}:y))} placeholder="Emoji" className={input}/></div></div>)}<button onClick={()=>setButtons(x=>[...x,{id:Date.now(),style:"secondary",label:"",target:"",emoji:"",disabled:false}])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] py-3 text-xs text-white/55 hover:bg-white/[0.05]"><Plus className="h-3.5 w-3.5"/>Add button</button></Section>
          <Section title="Thumbnail & image"><div className="relative"><ImageIcon className="absolute left-3 top-3.5 h-4 w-4 text-white/20"/><input value={thumbnail} onChange={e=>setThumbnail(e.target.value)} placeholder="Thumbnail URL" className={`${input} pl-10`}/></div><div className="relative"><ImageIcon className="absolute left-3 top-3.5 h-4 w-4 text-white/20"/><input value={image} onChange={e=>setImage(e.target.value)} placeholder="Image URL" className={`${input} pl-10`}/></div></Section>
          <Section title="Footer"><input value={footer} onChange={e=>setFooter(e.target.value)} placeholder="Footer text" className={input}/><input value={footerIcon} onChange={e=>setFooterIcon(e.target.value)} placeholder="Footer icon URL" className={input}/><Toggle value={timestamp} onChange={setTimestamp} label="Show timestamp"/></Section>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-[96px] xl:self-start">
          <section className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-white/[0.055] px-5 py-4"><div><div className="text-sm font-semibold text-white/88">Discord preview</div><div className="mt-1 text-[10px] text-white/25">Updates instantly</div></div><Sparkles className="h-4 w-4 text-white/32"/></div><div className="bg-[#111214] p-5">
            {empty ? <div className="grid min-h-[260px] place-items-center rounded-xl border border-white/[0.045] bg-[#313338] text-sm text-[#949ba4]">Your embed will appear here</div> : <div className="rounded-xl bg-[#313338] p-4 text-[#dbdee1]"><div className="mb-2 flex items-center gap-2"><img src={WARE_AVATAR} className="h-9 w-9 rounded-full bg-black object-contain"/><div className="text-sm font-semibold text-white">ware <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[9px]">APP</span></div></div>{content&&<div className="mb-2 text-sm">{content}</div>}<div className="relative overflow-hidden rounded bg-[#2b2d31] p-4 pl-5" style={{borderLeft:`4px solid ${safeColor}`}}>{thumbnail&&<img src={thumbnail} className="absolute right-4 top-4 h-16 w-16 rounded object-cover"/>}<div className={thumbnail?"pr-20":""}>{author&&<div className="mb-2 flex items-center gap-2 text-xs font-semibold">{authorIcon&&<img src={authorIcon} className="h-5 w-5 rounded-full"/>}{author}</div>}{title&&<div className="text-sm font-semibold text-white">{title}</div>}{description&&<div className="mt-2 whitespace-pre-wrap text-sm text-[#dbdee1]">{description}</div>}<div className="mt-3 grid gap-3">{fields.map(f=><div key={f.id}><div className="text-xs font-semibold text-white">{f.name||"Field name"}</div><div className="mt-0.5 text-xs">{f.value||"Field value"}</div></div>)}</div>{image&&<img src={image} className="mt-4 max-h-72 w-full rounded object-cover"/>}{(footer||timestamp)&&<div className="mt-4 flex items-center gap-2 text-[10px] text-[#b5bac1]">{footerIcon&&<img src={footerIcon} className="h-4 w-4 rounded-full"/>}{footer}{footer&&timestamp?" • ":""}{timestamp?"Today at 12:00 AM":""}</div>}</div></div>{buttons.length>0&&<div className="mt-3 flex flex-wrap gap-2">{buttons.map(b=><button key={b.id} disabled={b.disabled} className={`rounded px-3 py-2 text-xs font-medium text-white disabled:opacity-45 ${b.style==="primary"?"bg-[#5865F2]":b.style==="success"?"bg-[#248046]":b.style==="danger"?"bg-[#da373c]":"bg-[#4e5058]"}`}>{b.emoji} {b.label||"Button"}</button>)}</div>}</div>}
          </div></section>
          <section className={card}><div className="flex items-center justify-between border-b border-white/[0.055] px-5 py-4"><div><div className="text-sm font-semibold text-white/88">Generated script</div><div className="mt-1 text-[10px] text-white/25">Ready for Ware commands</div></div><button onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[10px] text-white/58 hover:bg-white/[0.06]"><Copy className="h-3.5 w-3.5"/>{copied?"Copied":"Copy"}</button></div><div className="p-5"><textarea readOnly value={generated} rows={9} className="w-full resize-none rounded-xl border border-white/[0.055] bg-black/35 p-4 font-mono text-[11px] leading-5 text-white/65 outline-none"/></div></section>
        </aside>
      </div>
    </div>
  </DashboardShell>;
}
