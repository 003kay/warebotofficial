import { createFileRoute } from "@tanstack/react-router";
import { Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

const WARE_AVATAR = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";

export const Route = createFileRoute("/embeds")({
  head: () => ({
    meta: [
      { title: "Embed Builder — ware" },
      { name: "description", content: "Build and preview Discord embeds for Ware." },
    ],
  }),
  component: EmbedBuilderPage,
});

const fieldClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/[0.18] focus:bg-white/[0.05]";
const panelClass = "rounded-[22px] border border-white/[0.08] bg-[#0b0c0d]/94 p-5 md:p-6";

function EmbedBuilderPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#2a2d31");
  const [author, setAuthor] = useState("");
  const [authorIcon, setAuthorIcon] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [image, setImage] = useState("");
  const [footer, setFooter] = useState("");
  const [footerIcon, setFooterIcon] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => {
    const pieces = ["{embed}"];
    if (content) pieces.push(`$v{message: ${content}}`);
    if (title) pieces.push(`$v{title: ${title}}`);
    if (description) pieces.push(`$v{description: ${description}}`);
    if (url) pieces.push(`$v{url: ${url}}`);
    if (color) pieces.push(`$v{color: ${color}}`);
    if (author) pieces.push(`$v{author: ${author}}`);
    if (thumbnail) pieces.push(`$v{thumbnail: ${thumbnail}}`);
    if (image) pieces.push(`$v{image: ${image}}`);
    if (footer) pieces.push(`$v{footer: ${footer}}`);
    if (fieldName || fieldValue) pieces.push(`$v{field: ${fieldName} | ${fieldValue}}`);
    if (buttonLabel || buttonUrl) pieces.push(`$v{button: ${buttonLabel} | ${buttonUrl}}`);
    return pieces.join("");
  }, [content, title, description, url, color, author, thumbnail, image, footer, fieldName, fieldValue, buttonLabel, buttonUrl]);

  const clear = () => {
    setContent(""); setTitle(""); setDescription(""); setUrl(""); setColor("#2a2d31");
    setAuthor(""); setAuthorIcon(""); setThumbnail(""); setImage(""); setFooter(""); setFooterIcon("");
    setFieldName(""); setFieldValue(""); setButtonLabel(""); setButtonUrl("");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-[1500px] px-5 pb-24 pt-2 md:px-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/28">ware tools</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] md:text-5xl">Embed Builder</h1>
            <p className="mt-2 text-sm text-white/36">Build Ware embeds and preview exactly how they will look in Discord.</p>
          </div>
          <button onClick={clear} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-2.5 text-sm text-red-200/80 transition hover:bg-red-400/[0.10]"><RotateCcw className="h-4 w-4"/>Clear</button>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className={panelClass}>
            <div className="space-y-5">
              <div><label className="mb-2 block text-xs font-semibold text-white/55">Content</label><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Message content above the embed" rows={3} className={fieldClass}/></div>
              <div className="border-t border-white/[0.07] pt-5"><h2 className="text-sm font-bold">Basic Settings</h2><div className="mt-4 space-y-4">
                <div><label className="mb-2 block text-xs text-white/45">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className={fieldClass}/></div>
                <div><label className="mb-2 block text-xs text-white/45">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5} className={fieldClass}/></div>
                <div><label className="mb-2 block text-xs text-white/45">URL</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://warebot.xyz" className={fieldClass}/></div>
                <div><label className="mb-2 block text-xs text-white/45">Color</label><div className="flex gap-3"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-11 w-14 rounded-lg border border-white/10 bg-transparent"/><input value={color} onChange={e=>setColor(e.target.value)} className={fieldClass}/></div></div>
              </div></div>

              <details className="border-t border-white/[0.07] pt-4"><summary className="cursor-pointer text-sm font-semibold">Author</summary><div className="mt-4 grid gap-3 md:grid-cols-2"><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author name" className={fieldClass}/><input value={authorIcon} onChange={e=>setAuthorIcon(e.target.value)} placeholder="Author icon URL" className={fieldClass}/></div></details>
              <details className="border-t border-white/[0.07] pt-4"><summary className="cursor-pointer text-sm font-semibold">Fields</summary><div className="mt-4 grid gap-3 md:grid-cols-2"><input value={fieldName} onChange={e=>setFieldName(e.target.value)} placeholder="Field name" className={fieldClass}/><input value={fieldValue} onChange={e=>setFieldValue(e.target.value)} placeholder="Field value" className={fieldClass}/></div></details>
              <details className="border-t border-white/[0.07] pt-4"><summary className="cursor-pointer text-sm font-semibold">Buttons</summary><div className="mt-4 grid gap-3 md:grid-cols-2"><input value={buttonLabel} onChange={e=>setButtonLabel(e.target.value)} placeholder="Button label" className={fieldClass}/><input value={buttonUrl} onChange={e=>setButtonUrl(e.target.value)} placeholder="Button URL" className={fieldClass}/></div></details>
              <details className="border-t border-white/[0.07] pt-4"><summary className="cursor-pointer text-sm font-semibold">Thumbnail & Image</summary><div className="mt-4 grid gap-3"><input value={thumbnail} onChange={e=>setThumbnail(e.target.value)} placeholder="Thumbnail URL" className={fieldClass}/><input value={image} onChange={e=>setImage(e.target.value)} placeholder="Image URL" className={fieldClass}/></div></details>
              <details className="border-t border-white/[0.07] pt-4"><summary className="cursor-pointer text-sm font-semibold">Footer</summary><div className="mt-4 grid gap-3 md:grid-cols-2"><input value={footer} onChange={e=>setFooter(e.target.value)} placeholder="Footer text" className={fieldClass}/><input value={footerIcon} onChange={e=>setFooterIcon(e.target.value)} placeholder="Footer icon URL" className={fieldClass}/></div></details>
            </div>
          </section>

          <div className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className={panelClass}>
              <h2 className="text-xl font-bold">Preview</h2>
              <div className="mt-4 rounded-xl bg-[#313338] p-4 text-[#dbdee1] shadow-inner">
                <div className="flex gap-3">
                  <img src={WARE_AVATAR} alt="Ware" className="h-10 w-10 rounded-full object-cover"/>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm"><span className="font-semibold text-white">ware</span><span className="inline-flex items-center gap-1 rounded-[3px] bg-[#5865f2] px-1.5 py-[1px] text-[10px] font-bold text-white"><span>✓</span> APP</span><span className="text-xs text-[#949ba4]">Today at 6:49 AM</span></div>
                    {content ? <div className="mt-1 whitespace-pre-wrap text-sm">{content}</div> : null}
                    <div className="mt-2 max-w-[560px] overflow-hidden rounded-[4px] border-l-4 p-3" style={{borderLeftColor: color, backgroundColor:"#2b2d31"}}>
                      {author ? <div className="mb-2 flex items-center gap-2 text-xs font-semibold">{authorIcon ? <img src={authorIcon} className="h-5 w-5 rounded-full"/> : null}{author}</div> : null}
                      {title ? <div className="font-semibold text-white">{title}</div> : null}
                      {description ? <div className="mt-1 whitespace-pre-wrap text-sm">{description}</div> : null}
                      {(fieldName || fieldValue) ? <div className="mt-3"><div className="text-xs font-semibold text-white">{fieldName || "Field"}</div><div className="mt-1 text-sm">{fieldValue}</div></div> : null}
                      {thumbnail ? <img src={thumbnail} className="float-right ml-4 mt-1 h-20 w-20 rounded object-cover"/> : null}
                      {image ? <img src={image} className="mt-3 max-h-72 max-w-full rounded object-cover"/> : null}
                      {footer ? <div className="mt-3 flex items-center gap-2 text-[11px] text-[#b5bac1]">{footerIcon ? <img src={footerIcon} className="h-4 w-4 rounded-full"/> : null}{footer}</div> : null}
                    </div>
                    {(buttonLabel || buttonUrl) ? <button className="mt-2 rounded bg-[#4e5058] px-3 py-2 text-sm font-medium text-white">{buttonLabel || "Button"}</button> : null}
                  </div>
                </div>
              </div>
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
