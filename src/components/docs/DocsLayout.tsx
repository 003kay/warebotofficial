import { Link } from "@tanstack/react-router";
import type { MouseEvent, ReactNode } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import { docSections } from "./doc-sections";
import { DocsSearch } from "./DocsSearch";

export type { DocSection } from "./doc-sections";
export { docSections };

const WARE_IMAGE = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";

export function DocsLayout({ active, toc, children }: { active: string; toc?: { id: string; label: string }[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const commandSection = docSections.find((section) => section.title === "Commands");
  const otherSections = docSections.filter((section) => section.title !== "Commands");

  function openCommandPage(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setOpen(false);
    setLoading(true);
    window.setTimeout(() => { window.location.href = href; }, 520);
  }

  const navigation = (
    <nav className="space-y-7 text-sm">
      {commandSection && (
        <div>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">Commands</p>
          <ul className="space-y-1">
            {commandSection.items.map((item, index) => {
              const isActive = item.slug === active;
              const Icon = item.icon;
              const href = item.slug === "commands" ? "/docs/commands" : `/docs/${item.slug}`;
              return (
                <li key={item.slug}>
                  <a href={href} onClick={(event) => openCommandPage(event, href)} className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-200 ${isActive ? "border-white/[0.13] bg-white/[0.08] text-white" : "border-transparent text-muted-foreground hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white"}`}>
                    {Icon && <span className={`grid h-7 w-7 place-items-center rounded-lg ${isActive ? "bg-white/[0.08]" : "bg-white/[0.025]"}`}><Icon className="h-3.5 w-3.5" /></span>}
                    <span className={index === 0 ? "font-semibold" : ""}>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {otherSections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">{section.title}</p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = item.slug === active;
              const Icon = item.icon;
              return (
                <li key={item.slug}>
                  <Link to="/docs/$slug" params={{ slug: item.slug }} onClick={() => setOpen(false)} className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 ${isActive ? "border-white/[0.12] bg-white/[0.08] text-white" : "border-transparent text-muted-foreground hover:border-white/[0.07] hover:bg-white/[0.035] hover:text-white"}`}>
                    {Icon && <span className={`grid h-7 w-7 place-items-center rounded-lg ${isActive ? "bg-white/[0.07]" : "bg-white/[0.025]"}`}><Icon className="h-3.5 w-3.5 shrink-0 opacity-85" /></span>}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.035),transparent_28rem),radial-gradient(circle_at_85%_25%,rgba(255,255,255,.02),transparent_26rem)]" />
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      {loading && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#050505] animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-75 fade-in duration-300">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-[0_0_60px_rgba(255,255,255,.08)]"><img src={WARE_IMAGE} alt="Ware" className="h-full w-full object-cover" /><div className="absolute inset-0 animate-pulse bg-white/[0.05]" /></div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">loading commands</div>
          </div>
        </div>
      )}

      <header className="relative z-40 border-b border-white/[0.07] bg-[#050505]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4 md:px-6 xl:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition-all group-hover:border-white/20"><img src={WARE_IMAGE} alt="ware" className="h-full w-full object-cover" /></div>
            <div className="leading-tight"><div className="text-sm font-semibold tracking-tight">ware</div><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">command center</div></div>
          </Link>
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:bg-white/[0.07] md:hidden" aria-label="Open menu"><Menu className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 gap-5 px-4 py-7 md:grid-cols-[230px_minmax(0,1fr)] md:px-6 lg:grid-cols-[230px_minmax(0,1fr)_170px] xl:gap-6 xl:px-8">
        <aside className="hidden md:sticky md:top-5 md:block md:h-[calc(100vh-2.5rem)] md:overflow-y-auto md:pr-2">{navigation}</aside>
        <main className="min-w-0">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_30px_100px_-55px_rgba(255,255,255,.12)] md:p-7 xl:p-9">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
            {active !== "commands" && (
              <div className="relative mb-8 flex flex-col gap-3 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1"><DocsSearch /></div>
                <Link to="/" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-xs font-medium transition-all hover:border-white/20 hover:bg-white/[0.07]"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
              </div>
            )}
            <div className="relative">{children}</div>
          </div>
        </main>
        {toc && toc.length > 0 && <aside className="hidden lg:sticky lg:top-5 lg:block lg:h-[calc(100vh-2.5rem)]"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">On this page</p><ul className="space-y-1.5 text-sm">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="block rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-white">{t.label}</a></li>)}</ul></div></aside>}
      </div>

      <div className={`fixed inset-0 z-[80] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button aria-label="Close menu" onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute inset-x-3 top-3 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[28px] border border-white/10 bg-[#0b0b0c]/98 p-5 shadow-2xl transition-all duration-300 ease-out ${open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="mb-6 flex items-center justify-between border-b border-white/[0.07] pb-4"><div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10"><img src={WARE_IMAGE} alt="Ware" className="h-full w-full object-cover" /></div><div><div className="font-semibold">Menu</div><div className="text-[10px] text-muted-foreground">Ware documentation</div></div></div><button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]" aria-label="Close menu"><X className="h-4 w-4" /></button></div>
          {navigation}
        </div>
      </div>
    </div>
  );
}
