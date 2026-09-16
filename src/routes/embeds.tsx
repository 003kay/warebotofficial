import { createFileRoute } from "@tanstack/react-router";
import { Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

const WARE_AVATAR = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";
const DARK_PALETTE = [
  "#f5f5f5", "#b85f86", "#a95f42", "#419c7d", "#6675aa", "#6854ad",
  "#d8d8d8", "#b27691", "#4e57cf", "#9f3658", "#714050", "#65473b",
  "#346e5d", "#404c78", "#493977", "#91415c", "#2d3138", "#15171b",
];

export const Route = createFileRoute("/embeds")({
  head: () => ({
    meta: [
      { title: "Embed Builder — stained" },
      { name: "description", content: "Build and preview Discord embeds for Stained." },
    ],
  }),
  component: EmbedBuilderPage,
});

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-[#151515] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-white/[0.18] focus:bg-[#181818]";
const sectionClass = "border-t border-white/[0.08] pt-5";
const panelClass = "rounded-[22px] border border-white/[0.08] bg-[#090909]/96 p-5 md:p-6";

type EmbedField = { id: number; name: string; value: string; inline: boolean };
type EmbedButton = { id: number; style: string; label: string; target: string; emoji: string; disabled: boolean };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-white/62">
      <button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-10 rounded-full border transition ${checked ? "border-white/20 bg-white/28" : "border-white/10 bg-white/[0.08]"}`}>
        <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white/65 transition-all ${checked ? "left-[21px]" : "left-[3px]"}`} />
      </button>
      <span>{label}</span>
    </label>
  );
}

function normalizedHex(value: string, fallback: string) {
  const raw = value.trim();
  const candidate = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate : fallback;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const safe = normalizedHex(value, "#2a2d31");
  return (
    <div>
      <label className="mb-2 block text-xs text-white/50">{label}</label>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-3.5">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10" style={{ backgroundColor: safe }}>
            <input aria-label={`${label} picker`} type="color" value={safe} onChange={e => onChange(e.target.value)} className="absolute inset-[-8px] h-16 w-16 cursor-pointer opacity-0" />
          </div>
          <div className="flex flex-1 items-center rounded-xl border border-white/[0.08] bg-[#111] px-3.5">
            <span className="mr-1 text-sm text-white/35">#</span>
            <input value={value.replace(/^#/, "")} maxLength={6} onChange={e => onChange(`#${e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6)}`)} className="w-full bg-transparent py-3 font-mono text-sm text-white outline-none" placeholder="2a2d31" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-9 gap-2 sm:grid-cols-12">
          {DARK_PALETTE.map(swatch => (
            <button key={swatch} type="button" onClick={() => onChange(swatch)} title={swatch} className={`aspect-square min-h-6 rounded-lg border transition hover:scale-105 ${safe.toLowerCase() === swatch.toLowerCase() ? "border-white/80 ring-2 ring-white/15" : "border-white/[0.07]"}`} style={{ backgroundColor: swatch }} />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-white/28">Click the large color square for the full color picker, use a preset, or enter an exact HEX value.</p>
      </div>
    </div>
  );
}

function EmbedBuilderPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#2a2d31");
  const [color2, setColor2] = useState("#15171b");
  const [author, setAuthor] = useState("");
  const [authorIcon, setAuthorIcon] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [image, setImage] = useState("");
  const [footer, setFooter] = useState("");
  const [footerIcon, setFooterIcon] = useState("");
  const [timestamp, setTimestamp] = useState(false);
  const [fields, setFields] = useState<EmbedField[]>([]);
  const [buttons, setButtons] = useState<EmbedButton[]>([]);
  const [copied, setCopied] = useState(false);

  const primary = normalizedHex(color, "#2a2d31");
  const secondary = normalizedHex(color2, "#15171b");
  const isEmpty = !content && !title && !description && !url && !author && !authorIcon && !thumbnail && !image && !footer && !footerIcon && !timestamp && fields.length === 0 && buttons.length === 0;

  const generated = useMemo(() => {
    const pieces = ["{embed}"];
    if (content) pieces.push(`$v{message: ${content}}`);
    if (title) pieces.push(`$v{title: ${title}}`);
    if (description) pieces.push(`$v{description: ${description}}`);
    if (url) pieces.push(`$v{url: ${url}}`);
    if (color) pieces.push(`$v{color: ${normalizedHex(color, "#2a2d31")}}`);
    if (author) pieces.push(`$v{author: ${author}}`);
    if (authorIcon) pieces.push(`$v{author_icon: ${authorIcon}}`);
    if (thumbnail) pieces.push(`$v{thumbnail: ${thumbnail}}`);
    if (image) pieces.push(`$v{image: ${image}}`);
    if (footer) pieces.push(`$v{footer: ${footer}}`);
    if (footerIcon) pieces.push(`$v{footer_icon: ${footerIcon}}`);
    if (timestamp) pieces.push("$v{timestamp: true}");
    fields.forEach(field => pieces.push(`$v{field: ${field.name} | ${field.value} | ${field.inline ? "inline" : "block"}}`));
    buttons.forEach(button => pieces.push(`$v{button: ${button.style} | ${button.label} | ${button.target} | ${button.emoji} | ${button.disabled ? "disabled" : "enabled"}}`));
    return pieces.join("");
  }, [content, title, description, url, color, author, authorIcon, thumbnail, image, footer, footerIcon, timestamp, fields, buttons]);

  const clear = () => {
    setContent(""); setTitle(""); setDescription(""); setUrl(""); setColor("#2a2d31"); setColor2("#15171b");
    setAuthor(""); setAuthorIcon(""); setThumbnail(""); setImage(""); setFooter(""); setFooterIcon(""); setTimestamp(false);
    setFields([]); setButtons([]);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const addField = () => setFields(prev => [...prev, { id: Date.now(), name: "", value: "", inline: false }]);
  const addButton = () => setButtons(prev => [...prev, { id: Date.now(), style: "secondary", label: "", target: "", emoji: "", disabled: false }]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-[1500px] px-5 pb-24 pt-2 md:px-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-black tracking-[-0.05em] md:text-5xl">Embed Builder</h1>
          <button onClick={clear} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.06] px-4 py-2.5 text-sm text-red-100/85 transition hover:bg-red-400/[0.10]"><RotateCcw className="h-4 w-4"/>Clear</button>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
          <section className={panelClass}>
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold">Content</h2>
                <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Message content" rows={3} className={`${inputClass} mt-4`} />
              </div>

              <div className={sectionClass}>
                <h2 className="text-base font-bold">Basic Settings</h2>
                <div className="mt-4 space-y-4">
                  <div><label className="mb-2 block text-xs text-white/50">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className={inputClass}/></div>
                  <div><label className="mb-2 block text-xs text-white/50">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={5} className={inputClass}/></div>
                  <div><label className="mb-2 block text-xs text-white/50">URL</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" className={inputClass}/></div>
                </div>
              </div>

              <details open className={sectionClass}>
                <summary className="cursor-pointer list-none text-base font-bold">Appearance</summary>
                <div className="mt-4 space-y-4">
                  <ColorControl label="Primary shade" value={color} onChange={setColor} />
                  <ColorControl label="Secondary shade" value={color2} onChange={setColor2} />
                  <div className="rounded-xl border border-white/[0.07] p-3.5" style={{background:`linear-gradient(135deg, ${primary}, ${secondary})`}}>
                    <div className="rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/75">Shade preview · {primary} → {secondary}</div>
                  </div>
                  <p className="text-[11px] leading-5 text-white/30">Discord embeds support one accent color, so the primary shade is used for the generated embed. The second shade is available for Stained&apos;s builder styling and Components V2 designs.</p>
                </div>
              </details>

              <details open className={sectionClass}>
                <summary className="cursor-pointer list-none text-base font-bold">Author</summary>
                <div className="mt-4 space-y-4">
                  <div><label className="mb-2 block text-xs text-white/50">Author Name</label><input value={author} onChange={e=>setAuthor(e.target.value)} className={inputClass}/></div>
                  <div><label className="mb-2 block text-xs text-white/50">Author Icon URL</label><input value={authorIcon} onChange={e=>setAuthorIcon(e.target.value)} placeholder="https://..." className={inputClass}/></div>
                </div>
              </details>

              <details open className={sectionClass}>
                <summary className="cursor-pointer list-none text-base font-bold">Fields</summary>
                <div className="mt-4 space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-white/45">Field {index + 1}</span>
                        <div className="flex items-center gap-3"><Toggle checked={field.inline} onChange={value=>setFields(prev=>prev.map(x=>x.id===field.id?{...x,inline:value}:x))} label="inline"/><button onClick={()=>setFields(prev=>prev.filter(x=>x.id!==field.id))} className="text-white/28 transition hover:text-red-300"><Trash2 className="h-4 w-4"/></button></div>
                      </div>
                      <input value={field.name} onChange={e=>setFields(prev=>prev.map(x=>x.id===field.id?{...x,name:e.target.value}:x))} placeholder="Field name" className={inputClass}/>
                      <textarea value={field.value} onChange={e=>setFields(prev=>prev.map(x=>x.id===field.id?{...x,value:e.target.value}:x))} placeholder="Field value" rows={3} className={`${inputClass} mt-3`}/>
                    </div>
                  ))}
                  <button onClick={addField} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] py-3 text-sm text-white/75 transition hover:bg-white/[0.06]"><Plus className="h-4 w-4"/>Add Field</button>
                </div>
              </details>

              <details open className={sectionClass}>
                <summary className="cursor-pointer list-none text-base font-bold">Buttons</summary>
                <div className="mt-4 space-y-3">
                  {buttons.map((button, index) => (
                    <div key={button.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-white/45">Button {index + 1}</span>
                        <div className="flex items-center gap-3"><Toggle checked={button.disabled} onChange={value=>setButtons(prev=>prev.map(x=>x.id===button.id?{...x,disabled:value}:x))} label="disabled"/><button onClick={()=>setButtons(prev=>prev.filter(x=>x.id!==button.id))} className="text-white/28 transition hover:text-red-300"><Trash2 className="h-4 w-4"/></button></div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <select value={button.style} onChange={e=>setButtons(prev=>prev.map(x=>x.id===button.id?{...x,style:e.target.value}:x))} className={inputClass}><option value="secondary">secondary (grey)</option><option value="primary">primary (blue)</option><option value="success">success (green)</option><option value="danger">danger (red)</option><option value="link">link</option></select>
                        <input value={button.label} onChange={e=>setButtons(prev=>prev.map(x=>x.id===button.id?{...x,label:e.target.value}:x))} placeholder="Label" className={inputClass}/>
                        <input value={button.target} onChange={e=>setButtons(prev=>prev.map(x=>x.id===button.id?{...x,target:e.target.value}:x))} placeholder="custom id / target" className={inputClass}/>
                        <input value={button.emoji} onChange={e=>setButtons(prev=>prev.map(x=>x.id===button.id?{...x,emoji:e.target.value}:x))} placeholder="Emoji" className={inputClass}/>
                      </div>
                    </div>
                  ))}
                  <button onClick={addButton} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] py-3 text-sm text-white/75 transition hover:bg-white/[0.06]"><Plus className="h-4 w-4"/>Add Button</button>
                </div>
              </details>

              <details open className={sectionClass}>
                <summary className="cursor-pointer list-none text-base font-bold">Thumbnail &amp; Image</summary>
                <div className="mt-4 space-y-4">
                  <div><label className="mb-2 block text-xs text-white/50">Thumbnail URL</label><input value={thumbnail} onChange={e=>setThumbnail(e.target.value)} placeholder="Thumbnail URL" className={inputClass}/></div>
                  <div><label className="mb-2 block text-xs text-white/50">Image URL</label><input value={image} onChange={e=>setImage(e.target.value)} placeholder="Image URL" className={inputClass}/></div>
                </div>
              </details>

              <details open className={sectionClass}>
                <summary className="cursor-pointer list-none text-base font-bold">Footer</summary>
                <div className="mt-4 space-y-4">
                  <div><label className="mb-2 block text-xs text-white/50">Footer Text</label><input value={footer} onChange={e=>setFooter(e.target.value)} className={inputClass}/></div>
                  <div><label className="mb-2 block text-xs text-white/50">Footer Icon URL</label><input value={footerIcon} onChange={e=>setFooterIcon(e.target.value)} placeholder="Footer icon URL" className={inputClass}/></div>
                  <Toggle checked={timestamp} onChange={setTimestamp} label="Show timestamp"/>
                </div>
              </details>
            </div>
          </section>

          <div className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className={panelClass}>
              <h2 className="text-xl font-bold">Preview</h2>
              {isEmpty ? (
                <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-xl bg-[#313338] text-sm text-[#949ba4] shadow-inner">Your embed will appear here</div>
              ) : (
                <div className="mt-4 rounded-xl bg-[#313338] p-4 text-[#dbdee1] shadow-inner">
                  <div className="flex gap-3">
                    <img src={WARE_AVATAR} alt="Stained" className="h-10 w-10 rounded-full object-cover"/>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-sm"><span className="font-semibold text-white">stained</span><span className="inline-flex items-center gap-1 rounded-[3px] bg-[#5865f2] px-1.5 py-[1px] text-[10px] font-bold text-white"><span>✓</span> APP</span><span className="text-xs text-[#949ba4]">Today at 6:49 AM</span></div>
                      {content ? <div className="mt-1 whitespace-pre-wrap text-sm">{content}</div> : null}
                      <div className="mt-2 max-w-[560px] overflow-hidden rounded-[4px] border-l-4 p-3" style={{borderLeftColor: primary, background:`linear-gradient(135deg, #2b2d31 0%, #2b2d31 72%, ${secondary}55 140%)`}}>
                        {author ? <div className="mb-2 flex items-center gap-2 text-xs font-semibold">{authorIcon ? <img src={authorIcon} className="h-5 w-5 rounded-full"/> : null}{author}</div> : null}
                        {title ? <div className="font-semibold text-white">{title}</div> : null}
                        {description ? <div className="mt-1 whitespace-pre-wrap text-sm">{description}</div> : null}
                        {fields.length ? <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.map(field=><div key={field.id} className={field.inline ? "" : "sm:col-span-2"}><div className="text-xs font-semibold text-white">{field.name || "Field"}</div><div className="mt-1 whitespace-pre-wrap text-sm">{field.value}</div></div>)}</div> : null}
                        {thumbnail ? <img src={thumbnail} className="float-right ml-4 mt-1 h-20 w-20 rounded object-cover"/> : null}
                        {image ? <img src={image} className="mt-3 max-h-72 max-w-full rounded object-cover"/> : null}
                        {(footer || timestamp) ? <div className="mt-3 flex items-center gap-2 text-[11px] text-[#b5bac1]">{footerIcon ? <img src={footerIcon} className="h-4 w-4 rounded-full"/> : null}{footer}{footer && timestamp ? " • " : ""}{timestamp ? "Today at 6:49 AM" : ""}</div> : null}
                      </div>
                      {buttons.length ? <div className="mt-2 flex flex-wrap gap-2">{buttons.map(button=><button key={button.id} disabled={button.disabled} className={`rounded px-3 py-2 text-sm font-medium text-white ${button.style === "primary" ? "bg-[#5865f2]" : button.style === "success" ? "bg-[#248046]" : button.style === "danger" ? "bg-[#da373c]" : "bg-[#4e5058]"} ${button.disabled ? "opacity-50" : ""}`}>{button.emoji ? `${button.emoji} ` : ""}{button.label || "Button"}</button>)}</div> : null}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className={panelClass}>
              <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Generated Script</h2><button onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-white/65 transition hover:bg-white/[0.06] hover:text-white"><Copy className="h-4 w-4"/>{copied ? "Copied" : "Copy Script"}</button></div>
              <textarea readOnly value={generated} rows={7} className="mt-4 w-full resize-y rounded-xl border border-white/[0.08] bg-black/35 p-4 font-mono text-xs leading-6 text-white/70 outline-none"/>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

