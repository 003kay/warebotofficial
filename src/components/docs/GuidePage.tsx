import { useState } from "react";
import { Check, Copy, ArrowRight, ArrowLeft, Terminal } from "lucide-react";
import { DocsLayout } from "./DocsLayout";
import { stainedGuides, type StainedGuide } from "@/lib/stainedGuides";
import { canonicalCommands, canonicalCommandCategories, WARE_COMMAND_COUNT } from "@/lib/canonicalCommands";
import { INVITE_URL, SUPPORT_URL } from "@/lib/links";

function Code({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setCopied(true); setFailed(false); } catch { setFailed(true); } }
  return <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#101313]">
    <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-[10px] font-medium text-white/40"><span>Discord</span><button type="button" onClick={copy} aria-label="Copy command" className="flex items-center gap-1.5 hover:text-white">{copied ? <Check size={12}/> : <Copy size={12}/>} {failed ? "Select and copy below" : copied ? "Copied" : "Copy"}</button></div>
    <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-6 text-[#b9d8dc]"><code>{text}</code></pre>
  </div>;
}

export function GuidePage({ slug }: { slug: string }) {
  const aliases: Record<string,string> = { integrations:"booster-roles", "commands-voicemaster":"voicemaster" };
  const guide = stainedGuides.find(item => item.slug === (aliases[slug] ?? slug));
  const category = slug.startsWith("commands-") ? canonicalCommandCategories.find(item=>item.slug===slug.slice(9)) : undefined;
  const title = guide?.title ?? category?.name ?? "Guide not found";
  const commands = category?.commands ?? canonicalCommands.filter(command => guide?.roots.includes(command.name.split(" ")[0]));
  const steps = guide?.steps ?? [];
  const index = guide ? stainedGuides.indexOf(guide) : -1;
  const toc = [...steps.map((step,i)=>({id:`step-${i}`,label:step.title})), ...(guide?.examples.length ? [{id:"examples",label:"Examples"}] : []), ...(commands.length ? [{id:"reference",label:"Command reference"}] : [])];
  return <DocsLayout active={guide?.slug ?? slug} toc={toc}>
    <div className="mb-10 border-b border-white/[.07] pb-8"><p className="text-xs font-semibold text-[#92b9bf]">{guide?.group ?? "Command reference"}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-white sm:text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-[16px] leading-7 text-white/50">{guide?.summary ?? category?.description ?? "Choose a guide from the sidebar or search for a command."}</p></div>
    {slug === "introduction" && <><div className="mb-9 flex flex-wrap gap-3"><a href={INVITE_URL} className="rounded-xl bg-[#b6d7dd] px-4 py-2.5 text-sm font-semibold text-[#102023]">Invite Stained</a><a href={SUPPORT_URL} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70">Get support</a></div><div className="mb-10 grid gap-3 sm:grid-cols-2">{[{slug:"security-setup",title:"Security",text:"Moderation, antinuke, and join protection"},{slug:"server-configuration",title:"Server setup",text:"Tickets, roles, and welcome messages"},{slug:"lastfm",title:"Integrations",text:"Music accounts and creator notifications"},{slug:"embed-scripting",title:"Embed scripting",text:"Templates, variables, and pagination"}].map(item=><a key={item.slug} href={`/docs/${item.slug}`} className="group rounded-2xl border border-white/10 p-5 transition hover:border-[#92b9bf]/40 hover:bg-white/[.025]"><div className="flex items-center justify-between font-medium">{item.title}<ArrowRight size={15} className="text-white/30 group-hover:text-[#92b9bf]"/></div><p className="mt-2 text-xs leading-6 text-white/40">{item.text}</p></a>)}</div></>}
    {steps.map((step,i)=><section key={step.title} id={`step-${i}`} className="mb-9 scroll-mt-24"><h2 className="text-xl font-semibold tracking-tight">{step.title}</h2><p className="mt-3 whitespace-pre-line text-[14px] leading-7 text-white/60">{step.text}</p></section>)}
    {!!guide?.examples.length && <section id="examples" className="mb-10 scroll-mt-24"><h2 className="mb-4 text-xl font-semibold">Examples</h2>{guide.examples.map(text=><Code key={text} text={text}/>)}</section>}
    {!!commands.length && <section id="reference" className="scroll-mt-24"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Command reference</h2><span className="text-xs text-white/35">{commands.length} commands</span></div><p className="mb-4 text-xs leading-6 text-white/40">Signatures and aliases come from the current Stained script. Replace the comma with your server prefix.</p><div className="divide-y divide-white/[.06] overflow-hidden rounded-xl border border-white/[.08]">{commands.map(command=><details key={command.name} id={`command-${command.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`} className="scroll-mt-24 px-4 py-3 open:bg-white/[.025]"><summary className="cursor-pointer text-sm font-medium text-white/80">,{command.name}</summary><p className="mt-3 text-sm leading-6 text-white/50">{command.description}</p><Code text={`,${command.usage}`}/>{!!command.aliases?.length && <p className="mb-2 text-xs text-white/40">Aliases: {command.aliases.join(", ")}</p>}</details>)}</div></section>}
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/[.08] pt-6">{index>0?<GuideLink guide={stainedGuides[index-1]} previous/>:<span/>}{index>=0 && index<stainedGuides.length-1 && <GuideLink guide={stainedGuides[index+1]}/>}</div>
    <p className="mt-8 flex items-center gap-2 text-[11px] text-white/25"><Terminal size={12}/>{WARE_COMMAND_COUNT.toLocaleString()} registered command paths · Stained documentation</p>
  </DocsLayout>;
}
function GuideLink({guide,previous=false}:{guide:StainedGuide;previous?:boolean}) {return <a href={`/docs/${guide.slug}`} className={`flex items-center gap-3 text-sm text-white/55 hover:text-white ${previous?"":"ml-auto text-right"}`}>{previous && <ArrowLeft size={14}/>}<span><span className="block text-[10px] uppercase tracking-wider text-white/25">{previous?"Previous":"Next"}</span>{guide.title}</span>{!previous && <ArrowRight size={14}/>}</a>}
