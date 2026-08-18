import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { docSections } from "./doc-sections";
import { DocsSearch } from "./DocsSearch";

export type { DocSection } from "./doc-sections";
export { docSections };

const WARE_LOGO = "/favicon.svg";

export function DocsLayout({
  active,
  toc,
  children,
}: {
  active: string;
  toc?: { id: string; label: string }[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.035),transparent_28rem),radial-gradient(circle_at_85%_25%,rgba(255,255,255,.02),transparent_26rem)]" />
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050505]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-4 py-3 md:px-6 xl:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.06]">
              <img src={WARE_LOGO} alt="ware" className="h-6 w-6 object-contain" />
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold tracking-tight">ware</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">documentation</div>
            </div>
          </Link>

          <DocsSearch />

          <a href="https://discord.gg/wept" target="_blank" rel="noreferrer" className="hidden rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-white/20 hover:bg-white/[0.055] hover:text-white md:inline-block">Support Server</a>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 md:hidden" aria-label="Toggle sidebar">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-1 gap-5 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)] md:px-6 lg:grid-cols-[220px_minmax(0,1fr)_170px] xl:gap-6 xl:px-8">
        <aside className={`${open ? "block" : "hidden"} md:block md:sticky md:top-24 md:h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-2`}>
          <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-xs font-medium"><Sparkles className="h-3.5 w-3.5" />Ware Docs</div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Commands, setup guides, security, configuration, and server tools.</p>
          </div>
          <nav className="space-y-6 text-sm">
            {docSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">{section.title}</p>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = item.slug === active;
                    const Icon = item.icon;
                    return <li key={item.slug}><Link to="/docs/$slug" params={{ slug: item.slug }} onClick={() => setOpen(false)} className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 ${isActive ? "border-white/[0.12] bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.03)]" : "border-transparent text-muted-foreground hover:border-white/[0.07] hover:bg-white/[0.035] hover:text-white"}`}>{Icon && <span className={`grid h-7 w-7 place-items-center rounded-lg ${isActive ? "bg-white/[0.07]" : "bg-white/[0.025]"}`}><Icon className="h-3.5 w-3.5 shrink-0 opacity-85" /></span>}<span>{item.label}</span></Link></li>;
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-6 shadow-[0_30px_100px_-55px_rgba(255,255,255,.12)] md:p-7 xl:p-9">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
            <div className="relative">{children}</div>
          </div>
        </main>

        {toc && toc.length > 0 && <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)]"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">On this page</p><ul className="space-y-1.5 text-sm">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="block rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-white">{t.label}</a></li>)}</ul></div></aside>}
      </div>
    </div>
  );
}
