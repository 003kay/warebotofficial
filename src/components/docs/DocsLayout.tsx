import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BookOpen, Command, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { docSections } from "./doc-sections";
import { DocsSearch } from "./DocsSearch";
import { WARE_COMMAND_COUNT } from "@/lib/canonicalCommands";

export type { DocSection } from "./doc-sections";
export { docSections };

const WARE_IMAGE = "/stained-logo.png";

export function DocsLayout({ active, toc, children }: { active: string; toc?: { id: string; label: string }[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const navigation = (
    <nav className="space-y-7 text-sm">
      <div>
        <div className="mb-3 flex items-center justify-between px-2"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/30">Documentation</p><span className="font-mono text-[9px] text-white/22">{WARE_COMMAND_COUNT}</span></div>
        <Link to="/docs/commands" onClick={() => setOpen(false)} className={`mb-1 flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${active === "commands" ? "border-white/[.14] bg-white/[.08] text-white" : "border-transparent text-white/48 hover:border-white/[.07] hover:bg-white/[.04] hover:text-white"}`}><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[.04]"><Command className="h-3.5 w-3.5" /></span><span className="flex-1 font-medium">All commands</span><span className="font-mono text-[9px] text-white/25">{WARE_COMMAND_COUNT}</span></Link>
      </div>
      {docSections.map(section => <div key={section.title}><p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/28">{section.title}</p><ul className="space-y-1">{section.items.filter(item => item.slug !== "commands").map(item => { const Icon = item.icon; const selected = item.slug === active; return <li key={item.slug}><Link to="/docs/$slug" params={{ slug: item.slug }} onClick={() => setOpen(false)} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition ${selected ? "border-white/[.12] bg-white/[.075] text-white" : "border-transparent text-white/44 hover:border-white/[.06] hover:bg-white/[.035] hover:text-white"}`}>{Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : <BookOpen className="h-3.5 w-3.5 shrink-0" />}<span className="truncate">{item.label}</span></Link></li>; })}</ul></div>)}
    </nav>
  );

  return <div className="min-h-screen bg-[#090b0c] text-white">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,.045),transparent_34rem),radial-gradient(circle_at_90%_20%,rgba(255,255,255,.025),transparent_30rem)]" />
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070808]/90 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 md:px-6 lg:px-8"><Link to="/" className="flex shrink-0 items-center gap-3"><img src={WARE_IMAGE} alt="stained" className="h-9 w-9 rounded-xl border border-white/10 object-cover"/><div><div className="text-sm font-semibold">stained docs</div><div className="font-mono text-[8px] uppercase tracking-[.18em] text-white/28">reference</div></div></Link><div className="mx-auto hidden w-full max-w-xl md:block"><DocsSearch /></div><Link to="/commands" className="hidden h-9 items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-3 text-[11px] text-white/55 transition hover:border-white/15 hover:text-white sm:flex"><Search className="h-3.5 w-3.5"/>Command browser</Link><button onClick={() => setOpen(true)} className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-white/10 md:hidden" aria-label="Open docs menu"><Menu className="h-4 w-4"/></button></div></header>

    <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-9 md:grid-cols-[235px_minmax(0,1fr)] md:px-6 lg:grid-cols-[220px_minmax(0,1fr)_170px] lg:px-8">
      <aside className="hidden md:sticky md:top-24 md:block md:h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-2">{navigation}</aside>
      <main className="min-w-0"><div className="mx-auto max-w-[820px] px-1 py-3 md:px-5 lg:px-8">{children}</div></main>
      {toc?.length ? <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit"><div className="rounded-2xl border border-white/[.07] bg-[#0b0c0c] p-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-white/28">On this page</p><ul className="space-y-1">{toc.map(item => <li key={item.id}><a href={`#${item.id}`} className="block rounded-lg px-2 py-1.5 text-xs text-white/38 transition hover:bg-white/[.04] hover:text-white">{item.label}</a></li>)}</ul></div></aside> : null}
    </div>

    <div className={`fixed inset-0 z-[80] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}><button onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition ${open ? "opacity-100" : "opacity-0"}`} aria-label="Close docs menu"/><div className={`absolute bottom-3 left-3 right-3 max-h-[85vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#0a0b0b] p-5 shadow-2xl transition ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}><div className="mb-5 flex items-center justify-between border-b border-white/[.07] pb-4"><div><div className="font-semibold">stained documentation</div><div className="mt-1 text-[10px] text-white/30">{WARE_COMMAND_COUNT} current commands</div></div><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10"><X className="h-4 w-4"/></button></div><div className="mb-5"><DocsSearch /></div>{navigation}</div></div>
  </div>;
}
