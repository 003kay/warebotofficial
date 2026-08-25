import { Link } from "@tanstack/react-router";
import { ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const WARE_AVATAR = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";
const DISCORD_URL = "https://discord.gg/wept";
const itemClass = "group flex min-h-18 items-center justify-between rounded-2xl border border-white/[0.04] bg-gradient-to-r from-white/[0.035] to-white/[0.018] px-5 text-lg font-medium text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.10] hover:from-white/[0.065] hover:to-white/[0.03] hover:text-white sm:min-h-20 sm:px-6 sm:text-xl";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  return <>
    <header className="relative z-40 flex items-center justify-between px-6 py-6 md:px-10 md:py-7">
      <Link to="/" aria-label="Ware home" className="group relative h-12 w-12 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] shadow-[0_12px_40px_-24px_rgba(255,255,255,.32),inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.05]">
        <img src={WARE_AVATAR} alt="Ware bot" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="group grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] text-white/62 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.045] hover:text-white">
        <Menu className="h-5 w-5" />
      </button>
    </header>

    {menuOpen && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/76 px-4 pb-8 pt-20 backdrop-blur-[9px]" onMouseDown={e => { if (e.currentTarget === e.target) setMenuOpen(false); }}>
      <div className="mx-auto w-full max-w-2xl animate-[menu-in_.24s_cubic-bezier(.2,.8,.2,1)] rounded-[2rem] border border-white/[0.085] bg-[linear-gradient(180deg,rgba(18,18,20,.985),rgba(9,9,11,.985))] p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div><div className="text-[10px] uppercase tracking-[0.22em] text-white/35">ware</div><h2 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-white">Menu</h2></div>
          <button onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.05] bg-white/[0.018] text-white/55"><X className="h-6 w-6" /></button>
        </div>
        <nav className="grid gap-3">
          <Link to="/commands" onClick={() => setMenuOpen(false)} className={itemClass}><span>Commands</span><span className="text-xs uppercase tracking-[0.16em] text-white/25">821+</span></Link>
          <Link to="/embeds" onClick={() => setMenuOpen(false)} className={itemClass}><span>Embeds</span><span className="text-xs uppercase tracking-[0.16em] text-white/25">Builder</span></Link>
          <div aria-disabled="true" className="flex min-h-18 cursor-not-allowed items-center justify-between rounded-2xl border border-white/[0.035] bg-gradient-to-r from-white/[0.018] to-white/[0.009] px-5 text-white/30 sm:min-h-20 sm:px-6">
            <span>
              <span className="block text-lg font-medium text-white/34 sm:text-xl">Dashboard</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-white/18">Coming soon</span>
            </span>
            <span className="rounded-full border border-white/[0.055] bg-white/[0.018] px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-white/20">Soon</span>
          </div>
          <div className="flex min-h-18 items-center justify-between rounded-2xl border border-white/[0.04] bg-gradient-to-r from-white/[0.028] to-white/[0.014] px-5 text-lg font-medium text-white/62 sm:min-h-20 sm:px-6 sm:text-xl"><span>Status</span><span className="inline-flex items-center gap-2 text-xs text-emerald-300/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Online</span></div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className={itemClass}><span>Discord</span><ExternalLink className="h-5 w-5 text-white/30" /></a>
          <Link to="/documentation" onClick={() => setMenuOpen(false)} className={itemClass}><span>Documentation</span></Link>
        </nav>
      </div>
    </div>}
  </>;
}
