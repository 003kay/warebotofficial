import { Link } from "@tanstack/react-router";
import { ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const WARE_AVATAR = "/ware-logo.svg?v=4";
const DISCORD_URL = "https://discord.gg/warebot";
const DASHBOARD_LOGIN = "/auth/discord/login";
const DASHBOARD_LOGOUT = "/auth/discord/logout";
const COMMAND_COUNT = 822;
const itemClass = "group flex min-h-18 items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0b0d0d] px-5 text-lg font-medium text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-[#111313] hover:text-white sm:min-h-20 sm:px-6 sm:text-xl";

type NavbarProps = { dashboardMode?: boolean };

export function Navbar({ dashboardMode = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  const accountHref = dashboardMode ? DASHBOARD_LOGOUT : DASHBOARD_LOGIN;
  const accountTitle = dashboardMode ? "Log out of Discord" : "Open Ware Dashboard";
  const accountLabel = dashboardMode ? "Log out" : "Dashboard";
  const accountSubLabel = dashboardMode ? "Switch account" : "Manage servers";

  return <>
    <header className="relative z-40 flex items-center justify-between px-6 py-6 md:px-10 md:py-7">
      <Link to="/" aria-label="Ware home" className="group relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0b0b] shadow-[0_18px_50px_-34px_rgba(255,255,255,.35),inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-[#111313]">
        <img src={WARE_AVATAR} alt="Ware bot" className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <a href={accountHref} title={accountTitle} className="group relative flex min-h-12 min-w-[128px] items-center rounded-2xl border border-white/[0.09] bg-[#0a0b0b] px-4 text-left text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.17] hover:bg-[#111313] hover:text-white sm:min-h-14 sm:min-w-[162px] sm:px-5">
          <span className="leading-none"><span className="block text-[12px] font-semibold tracking-[-0.01em] text-white/90 sm:text-[15px]">{accountLabel}</span><span className="mt-1.5 block text-[7px] uppercase tracking-[0.16em] text-white/35 sm:text-[9px]">{accountSubLabel}</span></span>
        </a>
        <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-[#0a0b0b] text-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#111313] hover:text-white sm:h-14 sm:w-14"><Menu className="h-5 w-5 sm:h-6 sm:w-6" /></button>
      </div>
    </header>

    {menuOpen && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 px-4 pb-8 pt-20 backdrop-blur-[12px]" onMouseDown={e => { if (e.currentTarget === e.target) setMenuOpen(false); }}>
      <div className="mx-auto w-full max-w-2xl animate-[menu-in_.24s_cubic-bezier(.2,.8,.2,1)] rounded-[2rem] border border-white/[0.10] bg-[#090a0a] p-5 shadow-[0_40px_120px_-50px_#000] sm:p-7">
        <div className="mb-6 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.22em] text-white/35">ware</div><h2 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-white">Navigate</h2></div><button onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/55 hover:text-white"><X className="h-6 w-6" /></button></div>
        <nav className="grid gap-3">
          <Link to="/commands" onClick={() => setMenuOpen(false)} className={itemClass}><span>Commands</span><span className="font-mono text-xs text-white/32">{COMMAND_COUNT}</span></Link>
          <div className="flex min-h-18 items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0b0d0d] px-5 text-lg font-medium text-white/62 sm:min-h-20 sm:px-6 sm:text-xl"><span>Status</span><span className="inline-flex items-center gap-2 text-xs text-emerald-300/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Online</span></div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className={itemClass}><span>Discord</span><ExternalLink className="h-5 w-5 text-white/30" /></a>
          <Link to="/documentation" onClick={() => setMenuOpen(false)} className={itemClass}><span>Documentation</span></Link>
        </nav>
      </div>
    </div>}
  </>;
}
