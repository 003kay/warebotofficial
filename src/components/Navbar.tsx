import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DISCORD_URL = "https://discord.gg/warebot";
const DASHBOARD_LOGIN = "/auth/discord/login";
const DASHBOARD_LOGOUT = "/auth/discord/logout";
const COMMAND_COUNT = 836;

type NavbarProps = { dashboardMode?: boolean };
const menuRow = "ware-menu-item group flex min-h-[76px] items-center rounded-[18px] border border-white/[.075] bg-[#0c0d0d] px-5 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/[.16] hover:bg-[#121414] hover:shadow-[0_16px_45px_-32px_rgba(255,255,255,.25)]";

export function Navbar({ dashboardMode = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    closingRef.current = false;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) return;

    const backdropAnimation = backdrop.animate(
      [
        { opacity: 0, backdropFilter: "blur(0px)" },
        { opacity: 1, backdropFilter: "blur(16px)" },
      ],
      { duration: 440, easing: "cubic-bezier(.22,.72,.18,1)", fill: "both" },
    );

    const panelAnimation = panel.animate(
      [
        { opacity: 0, transform: "translateY(16px) scale(.94)", filter: "blur(7px)" },
        { opacity: .72, transform: "translateY(5px) scale(.982)", filter: "blur(2px)", offset: .44 },
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
      ],
      { duration: 620, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
    );

    const itemAnimations = Array.from(panel.querySelectorAll<HTMLElement>(".ware-menu-item")).map((item, index) =>
      item.animate(
        [
          { opacity: 0, transform: "translateY(9px)", filter: "blur(3px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        ],
        { duration: 430, delay: 120 + index * 42, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
      ),
    );

    return () => {
      if (closingRef.current) return;
      backdropAnimation.cancel();
      panelAnimation.cancel();
      itemAnimations.forEach(animation => animation.cancel());
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    if (!menuOpen || closingRef.current) return;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) {
      setMenuOpen(false);
      return;
    }

    closingRef.current = true;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(".ware-menu-item"));
    items.forEach((item, index) => {
      item.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(5px)" },
        ],
        { duration: 170, delay: index * 12, easing: "ease-in", fill: "forwards" },
      );
    });

    panel.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translateY(10px) scale(.965)", filter: "blur(5px)" },
      ],
      { duration: 300, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
    );

    const backdropAnimation = backdrop.animate(
      [
        { opacity: 1, backdropFilter: "blur(16px)" },
        { opacity: 0, backdropFilter: "blur(0px)" },
      ],
      { duration: 330, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
    );

    const done = () => {
      closingRef.current = false;
      setMenuOpen(false);
    };
    backdropAnimation.finished.then(done).catch(done);
  }, [menuOpen]);

  const markCommandsTransition = () => {
    try { sessionStorage.setItem("ware-command-entry", "1"); } catch {}
  };

  const accountHref = dashboardMode ? DASHBOARD_LOGOUT : DASHBOARD_LOGIN;

  return <>
    <header className="relative z-40 grid grid-cols-[auto_1fr_auto] items-center px-6 py-6 md:px-10 md:py-7">
      <Link to="/" aria-label="Ware home" className="group grid h-12 w-12 place-items-center rounded-2xl border border-white/[.09] bg-black/55 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.035]"><img src="/ware-logo.svg?v=4" alt="Ware bot" className="h-9 w-9 object-contain transition duration-500 group-hover:scale-105"/></Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
        <Link to="/commands" onClick={markCommandsTransition} className="text-[16px] font-semibold tracking-[-.02em] text-white/74 transition hover:text-white">Commands</Link>
        <Link to="/documentation" className="text-[16px] font-semibold tracking-[-.02em] text-white/74 transition hover:text-white">Docs</Link>
        <Link to="/faq" className="text-[16px] font-semibold tracking-[-.02em] text-white/74 transition hover:text-white">FAQ</Link>
        <span className="text-[16px] font-semibold tracking-[-.02em] text-white/74">Status</span>
      </nav>
      <div className="col-start-3 flex items-center gap-2.5">
        <a href={accountHref} className={dashboardMode?"group inline-flex h-12 items-center gap-2.5 rounded-2xl border border-red-400/65 bg-red-600/45 px-4 text-red-50 shadow-[0_12px_34px_-18px_rgba(239,68,68,.95)] transition duration-300 hover:-translate-y-0.5 hover:border-red-300/90 hover:bg-red-500/60 hover:text-white":"group inline-flex h-12 items-center gap-2.5 rounded-2xl border border-white/[.11] bg-[#0a0b0b]/95 px-4 text-white/92 shadow-[0_12px_34px_-26px_rgba(255,255,255,.4)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[.24] hover:bg-white/[.06] hover:text-white"}>{dashboardMode?<LogOut className="h-4 w-4"/>:<LayoutDashboard className="h-4 w-4 text-white/68"/>}<span className="text-[15px] font-semibold tracking-[-.015em]">{dashboardMode?"Log out":"Dashboard"}</span>{!dashboardMode?<ArrowRight className="h-3.5 w-3.5 text-white/35 transition-transform group-hover:translate-x-0.5"/>:null}</a>
        <button aria-label="Open menu" onClick={()=>setMenuOpen(true)} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[.09] bg-black/60 text-white/70 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[.18] hover:bg-white/[.05] hover:text-white active:scale-95"><Menu className="h-5 w-5"/></button>
      </div>
    </header>

    {menuOpen ? <div ref={backdropRef} className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/78 px-4 py-8" onMouseDown={e=>{if(e.currentTarget===e.target)closeMenu();}}>
      <div ref={panelRef} className="w-full max-w-[620px] overflow-hidden rounded-[26px] border border-white/[.11] bg-[#080909]/[.99] shadow-[0_40px_140px_rgba(0,0,0,.82)]">
        <div className="flex items-center justify-between border-b border-white/[.065] px-6 py-5">
          <div><div className="text-[17px] font-semibold tracking-[-.025em] text-white/92">Ware menu</div><div className="mt-1 text-[12px] text-white/36">Quick access</div></div>
          <button aria-label="Close menu" onClick={closeMenu} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[.08] bg-white/[.03] text-white/50 transition duration-200 hover:rotate-90 hover:border-white/[.15] hover:bg-white/[.07] hover:text-white"><X className="h-5 w-5"/></button>
        </div>
        <nav className="grid gap-3 p-5">
          <Link to="/commands" onClick={markCommandsTransition} className={menuRow}><span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold text-white/94">Commands</span><span className="mt-1.5 block text-[12px] text-white/38">Browse all {COMMAND_COUNT} Ware command paths</span></span><ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1"/></Link>
          <Link to="/documentation" className={menuRow}><span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold text-white/94">Documentation</span><span className="mt-1.5 block text-[12px] text-white/38">Setup guides, features, and references</span></span><ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1"/></Link>
          <Link to="/faq" className={menuRow}><span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold text-white/94">FAQ</span><span className="mt-1.5 block text-[12px] text-white/38">Answers to common Ware questions</span></span><ArrowRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1"/></Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={`${menuRow} gap-4`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[.08] bg-black/40"><ExternalLink className="h-4 w-4 text-white/65"/></span><span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold text-white/94">Discord</span><span className="mt-1.5 block text-[12px] text-white/38">Support, updates, and the Ware community</span></span><ExternalLink className="h-4 w-4 text-white/30"/></a>
          <div className="ware-menu-item flex min-h-[76px] items-center rounded-[18px] border border-white/[.065] bg-[#0a0c0c] px-5 py-4"><span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold text-white/82">Systems operational</span><span className="mt-1.5 block text-[12px] text-white/35">Ware services are online</span></span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.65)]"/></div>
        </nav>
      </div>
    </div> : null}
  </>;
}
