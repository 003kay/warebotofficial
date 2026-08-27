import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Command, ExternalLink, LayoutDashboard, LogOut, Menu, Radio, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

const WARE_AVATAR = "/ware-logo.svg?v=4";
const DISCORD_URL = "https://discord.gg/warebot";
const DASHBOARD_LOGIN = "/auth/discord/login";
const DASHBOARD_LOGOUT = "/auth/discord/logout";
const COMMAND_COUNT = 836;

type NavbarProps = { dashboardMode?: boolean };

export function Navbar({ dashboardMode = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandLoading, setCommandLoading] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  const openCommands = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMenuOpen(false);
    setCommandLoading(true);
    try { sessionStorage.setItem("ware-command-reveal", "1"); } catch {}
    window.setTimeout(() => { window.location.href = "/commands"; }, 560);
  };

  const accountHref = dashboardMode ? DASHBOARD_LOGOUT : DASHBOARD_LOGIN;

  return <>
    {commandLoading ? (
      <div className="ware-command-loader fixed inset-0 z-[220] grid place-items-center bg-[#030404]" aria-label="Loading commands">
        <div className="ware-command-loader-core">
          <div className="ware-command-loader-halo"/>
          <img src={WARE_AVATAR} alt="Ware" className="ware-command-loader-logo"/>
        </div>
      </div>
    ) : null}

    <header className="relative z-40 grid grid-cols-[auto_1fr_auto] items-center px-6 py-6 md:px-10 md:py-7">
      <Link to="/" aria-label="Ware home" className="group grid h-12 w-12 place-items-center rounded-2xl border border-white/[.09] bg-black/55 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.035]">
        <img src={WARE_AVATAR} alt="Ware bot" className="h-9 w-9 object-contain transition duration-500 group-hover:scale-105"/>
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-[18px] border border-white/[.07] bg-[#090a0a]/80 p-1.5 shadow-[0_18px_55px_-38px_rgba(0,0,0,.95)] backdrop-blur-2xl md:flex">
        <a href="/commands" onClick={openCommands} className="group inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-[12px] font-medium text-white/58 transition hover:bg-white/[.055] hover:text-white">
          <Command className="h-3.5 w-3.5 text-white/38 transition group-hover:text-white/70"/>Commands
        </a>
        <Link to="/documentation" className="group inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-[12px] font-medium text-white/58 transition hover:bg-white/[.055] hover:text-white">
          <BookOpen className="h-3.5 w-3.5 text-white/38 transition group-hover:text-white/70"/>Docs
        </Link>
        <div className="inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-[12px] font-medium text-white/48">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.55)]"/>Status
        </div>
      </nav>

      <div className="col-start-3 flex items-center gap-2.5">
        <a href={accountHref} className={dashboardMode
          ? "group inline-flex h-12 items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/[.10] px-4 text-red-100 transition duration-300 hover:-translate-y-0.5 hover:border-red-400/55 hover:bg-red-500/[.18] hover:text-white"
          : "group inline-flex h-12 items-center gap-2.5 rounded-2xl border border-white/[.10] bg-[#0a0b0b]/90 px-4 text-white/90 shadow-[0_12px_34px_-26px_rgba(255,255,255,.4)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[.22] hover:bg-white/[.055] hover:text-white"}>
          {dashboardMode ? <LogOut className="h-4 w-4"/> : <LayoutDashboard className="h-4 w-4 text-white/65"/>}
          <span className="text-sm font-semibold">{dashboardMode ? "Log out" : "Dashboard"}</span>
          {!dashboardMode ? <ArrowRight className="h-3.5 w-3.5 text-white/35 transition-transform group-hover:translate-x-0.5"/> : null}
        </a>

        <button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[.08] bg-black/55 text-white/65 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[.17] hover:bg-white/[.045] hover:text-white active:scale-95">
          <Menu className="h-5 w-5"/>
        </button>
      </div>
    </header>

    {menuOpen ? (
      <div className="ware-menu-backdrop fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/78 px-4 py-8 backdrop-blur-xl" onMouseDown={event => { if (event.currentTarget === event.target) setMenuOpen(false); }}>
        <div className="ware-menu-panel w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/[.10] bg-[#080909]/[.98] shadow-[0_40px_140px_rgba(0,0,0,.78)]">
          <div className="flex items-center justify-between border-b border-white/[.06] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.07] bg-black/60"><img src={WARE_AVATAR} alt="Ware" className="h-7 w-7 object-contain"/></span><div><div className="text-[11px] font-semibold text-white/85">Ware</div><div className="mt-0.5 text-[8px] uppercase tracking-[.18em] text-white/25">Menu</div></div></div>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-white/45 transition duration-200 hover:rotate-90 hover:border-white/[.13] hover:bg-white/[.06] hover:text-white"><X className="h-5 w-5"/></button>
          </div>

          <nav className="grid gap-2.5 p-4 sm:p-5">
            <a href="/commands" onClick={openCommands} className="ware-menu-entry group flex items-center gap-4 rounded-2xl border border-white/[.065] bg-white/[.022] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/[.14] hover:bg-white/[.05]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-black/35"><Command className="h-5 w-5 text-white/65"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white/88">Commands</span><span className="mt-1 block text-[10px] text-white/30">Browse all {COMMAND_COUNT} Ware command paths</span></span><ArrowRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white/55"/>
            </a>
            <Link to="/documentation" onClick={() => setMenuOpen(false)} className="ware-menu-entry group flex items-center gap-4 rounded-2xl border border-white/[.065] bg-white/[.022] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/[.14] hover:bg-white/[.05]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-black/35"><BookOpen className="h-5 w-5 text-white/60"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white/88">Documentation</span><span className="mt-1 block text-[10px] text-white/30">Setup guides, features, and references</span></span><ArrowRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white/55"/>
            </Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="ware-menu-entry group flex items-center gap-4 rounded-2xl border border-white/[.065] bg-white/[.022] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/[.14] hover:bg-white/[.05]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-black/35"><ExternalLink className="h-5 w-5 text-white/60"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white/88">Discord</span><span className="mt-1 block text-[10px] text-white/30">Support, updates, and the Ware community</span></span><ExternalLink className="h-4 w-4 text-white/25 transition group-hover:text-white/55"/>
            </a>
            <div className="ware-menu-entry flex items-center gap-4 rounded-2xl border border-white/[.055] bg-black/20 p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-400/[.08] bg-emerald-400/[.035]"><Radio className="h-5 w-5 text-emerald-300/65"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white/70">Systems operational</span><span className="mt-1 block text-[10px] text-white/25">Ware services are online</span></span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.55)]"/></div>
          </nav>
        </div>
      </div>
    ) : null}
  </>;
}
