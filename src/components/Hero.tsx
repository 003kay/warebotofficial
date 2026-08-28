import { useEffect, useRef } from "react";
import { ArrowRight, Gavel, MessageSquare, ShieldCheck, Terminal, Users, Wrench } from "lucide-react";
import { INVITE_URL } from "@/lib/links";

const WARE_AVATAR = "/ware-logo.svg?v=4";
const COMMAND_COUNT = 836;

function DiscordLogo() {
  return <svg viewBox="0 0 127.14 96.36" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" /></svg>;
}

function LastFmLogo() {
  return <svg viewBox="0 0 24 24" aria-label="Last.fm" className="h-4 w-4 fill-current"><path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" /></svg>;
}

const categories = [
  { title: "Protection", description: "Anti-nuke, raid defense & security", icon: ShieldCheck, href: "/commands?category=antinuke" },
  { title: "Moderation", description: "Powerful staff and server controls", icon: Gavel, href: "/commands?category=moderation" },
  { title: "Tickets", description: "Support panels, flows & transcripts", icon: MessageSquare, href: "/commands?category=tickets" },
  { title: "Community", description: "Economy, giveaways, levels & more", icon: Users, href: "/commands?category=utility" },
  { title: "Last.fm", description: "Scrobbles, music stats & profiles", href: "/commands?category=lastfm", accent: true, lastfm: true },
  { title: "Utility", description: "Tools, embeds, lookups & automation", icon: Wrench, href: "/commands?category=utility" },
] as const;

function CommandCenter() {
  const floatRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0, liftX: 0, liftY: 0 });
  const currentRef = useRef({ x: 0, y: 0, liftX: 0, liftY: 0 });

  useEffect(() => {
    const floatEl = floatRef.current;
    const panel = panelRef.current;
    const shadow = shadowRef.current;
    if (!floatEl || !panel || !shadow) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const t = (now - started) / 1000;
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.085;
      current.y += (target.y - current.y) * 0.085;
      current.liftX += (target.liftX - current.liftX) * 0.10;
      current.liftY += (target.liftY - current.liftY) * 0.10;

      const floatX = reduceMotion ? 0 : Math.sin(t * 0.52) * 3.2 + Math.sin(t * 0.19) * 1.1;
      const floatY = reduceMotion ? 0 : Math.sin(t * 0.72) * 11.5 + Math.cos(t * 0.31) * 3.5;
      const floatRotate = reduceMotion ? 0 : Math.sin(t * 0.38) * 0.16;

      floatEl.style.transform = `translate3d(${floatX.toFixed(2)}px, ${floatY.toFixed(2)}px, 0) rotateZ(${floatRotate.toFixed(3)}deg)`;
      panel.style.transform = `perspective(1250px) translate3d(${current.liftX.toFixed(2)}px, ${current.liftY.toFixed(2)}px, 0) rotateX(${current.y.toFixed(2)}deg) rotateY(${current.x.toFixed(2)}deg)`;

      const shadowPulse = reduceMotion ? 0.5 : 0.5 + Math.sin(t * 0.72) * 0.12;
      const shadowScale = reduceMotion ? 0.98 : 0.97 + Math.sin(t * 0.72) * 0.035;
      shadow.style.opacity = String(shadowPulse);
      shadow.style.transform = `translate3d(0, ${28 + Math.sin(t * 0.72) * 6}px, 0) scale(${shadowScale})`;

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));

    targetRef.current.x = nx * 3.4;
    targetRef.current.y = -ny * 2.7;
    targetRef.current.liftX = nx * 5.5;
    targetRef.current.liftY = ny * 4;

    const light = lightRef.current;
    if (light) {
      light.style.opacity = "1";
      light.style.background = `radial-gradient(360px circle at ${((nx + 1) * 50).toFixed(1)}% ${((ny + 1) * 50).toFixed(1)}%, rgba(255,255,255,.13), rgba(255,255,255,.045) 28%, transparent 66%)`;
    }
  };

  const onPointerLeave = () => {
    targetRef.current.x = 0;
    targetRef.current.y = 0;
    targetRef.current.liftX = 0;
    targetRef.current.liftY = 0;
    if (lightRef.current) lightRef.current.style.opacity = "0";
  };

  return (
    <div ref={floatRef} className="relative mx-auto mt-16 w-full max-w-[1120px] will-change-transform md:mt-20">
      <div ref={shadowRef} className="pointer-events-none absolute inset-x-[7%] bottom-[-42px] -z-10 h-[112px] rounded-[50%] bg-white/[.06] blur-[56px] will-change-transform" />
      <div
        ref={panelRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="hero-console relative overflow-hidden rounded-[32px] border border-white/[.12] bg-black/75 p-2 shadow-[0_55px_150px_-70px_rgba(255,255,255,.22)] backdrop-blur-2xl will-change-transform transition-[border-color,box-shadow] duration-300 hover:border-white/[.18] hover:shadow-[0_72px_180px_-76px_rgba(255,255,255,.32)]"
      >
        <div ref={lightRef} className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-300" />
        <div className="hero-console-sheen" />
        <div className="relative z-[4] overflow-hidden rounded-[25px] border border-white/[.07] bg-[#080909]/95">
          <div className="border-b border-white/[.07] px-5 py-4"><div className="flex items-center gap-3"><div className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-white/20"/><i className="h-2 w-2 rounded-full bg-white/12"/><i className="h-2 w-2 rounded-full bg-white/7"/></div><span className="font-mono text-[10px] text-white/30">ware / command center</span></div></div>
          <div className="p-4 sm:p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/[.08] bg-gradient-to-r from-white/[.05] to-white/[.018] p-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40"><img src={WARE_AVATAR} alt="Ware" className="h-10 w-10 object-contain"/></div><div className="text-[15px] font-semibold tracking-[-.02em] text-white">Ware</div></div>
            <div className="mb-3 flex items-center justify-between px-1"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">Command modules</span><a href="/commands" className="text-[11px] font-medium text-white/42 transition hover:text-white">View all →</a></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(c=>{const Icon="icon" in c?c.icon:null;return <a key={c.title} href={c.href} className={`group relative flex min-h-[122px] flex-col overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 ${"accent" in c&&c.accent?"border-[#d9232e]/25 bg-[#d9232e]/[.035] hover:border-[#ff4651]/40":"border-white/[.07] bg-white/[.018] hover:border-white/[.16] hover:bg-white/[.045]"}`}><div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.07),transparent_55%)]"/><div className={`relative grid h-9 w-9 place-items-center rounded-xl border ${"accent" in c&&c.accent?"border-[#d9232e]/30 bg-[#d9232e]/12 text-[#ff4b55]":"border-white/10 bg-white/[.035] text-white/70"}`}>{"lastfm" in c&&c.lastfm?<LastFmLogo/>:Icon?<Icon className="h-4 w-4"/>:null}</div><div className="relative mt-auto pt-4"><div className="flex items-center gap-1 text-[15px] font-semibold tracking-[-.02em] text-white/90">{c.title}<ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-70"/></div><div className="mt-1.5 text-[11px] leading-4 text-white/38">{c.description}</div></div></a>})}
            </div>
            <a href="/commands" className="group mt-3 flex items-center gap-3 rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3.5 transition duration-300 hover:border-white/[.15] hover:bg-white/[.035]"><Terminal className="h-4 w-4 text-white/45"/><span className="font-mono text-[11px] text-white/40">$ ware commands --all</span><span className="animate-cursor h-4 w-px bg-white/50"/><ArrowRight className="ml-auto h-3.5 w-3.5 text-white/25 transition group-hover:translate-x-1"/></a>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/[.07] border-t border-white/[.07]">{[["99.99%","uptime"],[String(COMMAND_COUNT),"commands"],["24/7","protection"]].map(([v,l])=><div key={l} className="px-3 py-4 text-center"><div className="text-[15px] font-semibold text-white">{v}</div><div className="mt-1 text-[9px] uppercase tracking-[.12em] text-white/30">{l}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return <section className="ware-hero relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-14">
    <style>{`
      @keyframes wareSilverShine { 0% { background-position: 180% 50%; } 100% { background-position: -80% 50%; } }
      .ware-silver-shine { color: transparent; background-image: linear-gradient(105deg,#808388 0%,#c8cbd0 28%,#f3f4f5 46%,#b4b7bc 64%,#72757a 82%,#d5d7da 100%); background-size:240% 100%; background-position:180% 50%; -webkit-background-clip:text; background-clip:text; animation:wareSilverShine 4.6s cubic-bezier(.4,0,.2,1) infinite; }
      @media(prefers-reduced-motion:reduce){.ware-silver-shine{animation:none!important}}
    `}</style>
    <div className="hero-orb hero-orb-a"/><div className="hero-orb hero-orb-b"/><div className="hero-beam"/>
    <div className="relative z-10 max-w-[900px] text-left animate-[soft-rise_.7s_ease_both]">
      <h1 className="max-w-[850px] text-[3.05rem] font-bold leading-[1.06] tracking-[-.055em] text-white sm:text-[3.8rem] md:text-[4.55rem] xl:text-[5.05rem]">Ware is Discord&apos;s<br/><span className="ware-silver-shine">all-in-one server app.</span></h1>
      <p className="mt-8 max-w-[720px] text-[17px] leading-[1.85] text-white/68 md:text-[18px]">Built for communities that want serious control without stacking a dozen bots. Manage protection, moderation, tickets, music, utilities, automation, and everyday server tools from one place.</p>
      <div className="mt-9 flex flex-wrap gap-3"><a href={INVITE_URL} target="_blank" rel="noreferrer" className="premium-button group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"><DiscordLogo/>Add to Discord<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></a><a href="/commands" className="glass-button group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium">Explore commands<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></a></div>
    </div>
    <CommandCenter />
  </section>;
}
