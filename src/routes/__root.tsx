import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import polishCss from "../site-polish.css?url";
import interactionsCss from "../interactions.css?url";
import securitySaveCss from "../security-save.css?url";
import wareV2Css from "../ware-v2.css?url";
import refreshCss from "../ware-refresh.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const WARE_LOGO = "/stained-logo.png?v=1";
const WARE_FAVICON = "/stained-logo.png?v=1";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link></div></div></div>;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const [retrying, setRetrying] = useState(true);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    const key = `ware-route-retry:${window.location.pathname}`;
    const attempts = Number(sessionStorage.getItem(key) || "0");
    if (attempts >= 2) {
      setRetrying(false);
      return;
    }
    sessionStorage.setItem(key, String(attempts + 1));
    const timer = window.setTimeout(async () => {
      try {
        await router.invalidate();
        reset();
      } catch {
        setRetrying(false);
      }
    }, 650 + attempts * 650);
    return () => window.clearTimeout(timer);
  }, [error, reset, router]);

  const manualRetry = async () => {
    sessionStorage.removeItem(`ware-route-retry:${window.location.pathname}`);
    setRetrying(true);
    await router.invalidate();
    reset();
  };

  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">{retrying ? "Reconnecting to Stained…" : "This page didn't load"}</h1><p className="mt-2 text-sm text-muted-foreground">{retrying ? "A dashboard request failed. Stained is retrying automatically." : "The automatic retries didn't recover this page."}</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={manualRetry} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Try again</button><a href="/dashboard" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">Dashboard</a></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "stained" },
      { name: "description", content: "stained — Discord moderation, security, tickets, music, and server management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Run your entire server from one bot." },
      { name: "twitter:title", content: "Run your entire server from one bot." },
      { property: "og:description", content: "Protection, moderation, tickets, music, utilities and more — powered by Stained." },
      { name: "twitter:description", content: "Protection, moderation, tickets, music, utilities and more — powered by Stained." },
      { property: "og:image", content: WARE_LOGO },
      { name: "twitter:image", content: WARE_LOGO },
    ],
    links: [
      { rel: "icon", type: "image/png", href: WARE_FAVICON },
      { rel: "shortcut icon", type: "image/png", href: WARE_FAVICON },
      { rel: "apple-touch-icon", href: WARE_LOGO },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: polishCss },
      { rel: "stylesheet", href: interactionsCss },
      { rel: "stylesheet", href: securitySaveCss },
      { rel: "stylesheet", href: wareV2Css },
      { rel: "stylesheet", href: refreshCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function CommandsClickTransition({ runId, onDone }: { runId: number; onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const halo = haloRef.current;
    const ring = ringRef.current;
    const beam = beamRef.current;
    const label = labelRef.current;
    if (!overlay || !logo || !halo || !ring || !beam || !label) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 180 : 920;

    const overlayAnimation = overlay.animate([
      { opacity: 1, transform: "scale(1)", background: "#020303", offset: 0 },
      { opacity: 1, transform: "scale(1)", background: "#030404", offset: .48 },
      { opacity: .96, transform: "scale(1.006)", background: "#020303", offset: .7 },
      { opacity: 0, transform: "scale(1.025)", background: "#000", offset: 1 },
    ], { duration, easing: "cubic-bezier(.22,.72,.18,1)", fill: "forwards" });

    const logoAnimation = logo.animate([
      { transform: "perspective(1000px) translateZ(-260px) scale(.54) rotateX(8deg)", opacity: 0, filter: "blur(18px) brightness(.72)", offset: 0 },
      { transform: "perspective(1000px) translateZ(-70px) scale(.82) rotateX(3deg)", opacity: .52, filter: "blur(7px) brightness(.9)", offset: .12 },
      { transform: "perspective(1000px) translateZ(20px) scale(1.045) rotateX(0deg)", opacity: 1, filter: "blur(0px) brightness(1.08) drop-shadow(0 0 34px rgba(255,255,255,.16))", offset: .24 },
      { transform: "perspective(1000px) translateZ(0) scale(1) rotateX(0deg)", opacity: 1, filter: "blur(0px) brightness(1) drop-shadow(0 0 22px rgba(255,255,255,.11))", offset: .5 },
      { transform: "perspective(1000px) translateZ(-75px) scale(.9) rotateX(-2deg)", opacity: .82, filter: "blur(2px) brightness(.92)", offset: .72 },
      { transform: "perspective(1000px) translateZ(-340px) scale(.5) rotateX(-7deg)", opacity: 0, filter: "blur(16px) brightness(.68)", offset: 1 },
    ], { duration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });

    const haloAnimation = halo.animate([
      { transform: "scale(.5)", opacity: 0, filter: "blur(34px)", offset: 0 },
      { transform: "scale(1.08)", opacity: .52, filter: "blur(32px)", offset: .24 },
      { transform: "scale(.96)", opacity: .28, filter: "blur(38px)", offset: .52 },
      { transform: "scale(.62)", opacity: 0, filter: "blur(46px)", offset: 1 },
    ], { duration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });

    const ringAnimation = ring.animate([
      { transform: "scale(.72)", opacity: 0, borderColor: "rgba(255,255,255,0)", offset: 0 },
      { transform: "scale(.96)", opacity: .22, borderColor: "rgba(255,255,255,.12)", offset: .22 },
      { transform: "scale(1.26)", opacity: .06, borderColor: "rgba(255,255,255,.05)", offset: .5 },
      { transform: "scale(1.55)", opacity: 0, borderColor: "rgba(255,255,255,0)", offset: .8 },
      { transform: "scale(1.55)", opacity: 0, offset: 1 },
    ], { duration, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });

    const beamAnimation = beam.animate([
      { transform: "scaleX(0)", opacity: 0, filter: "blur(8px)", offset: 0 },
      { transform: "scaleX(.18)", opacity: 0, filter: "blur(6px)", offset: .12 },
      { transform: "scaleX(1)", opacity: .75, filter: "blur(0px)", offset: .26 },
      { transform: "scaleX(.78)", opacity: .18, filter: "blur(2px)", offset: .5 },
      { transform: "scaleX(.18)", opacity: 0, filter: "blur(6px)", offset: .72 },
      { transform: "scaleX(0)", opacity: 0, offset: 1 },
    ], { duration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });

    const labelAnimation = label.animate([
      { transform: "translateY(10px)", opacity: 0, letterSpacing: ".42em", offset: 0 },
      { transform: "translateY(8px)", opacity: 0, letterSpacing: ".38em", offset: .14 },
      { transform: "translateY(0)", opacity: .45, letterSpacing: ".30em", offset: .28 },
      { transform: "translateY(0)", opacity: .34, letterSpacing: ".28em", offset: .52 },
      { transform: "translateY(-8px)", opacity: 0, letterSpacing: ".34em", offset: .76 },
      { transform: "translateY(-8px)", opacity: 0, offset: 1 },
    ], { duration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });

    let finished = false;
    const finish = () => { if (!finished) { finished = true; onDone(); } };
    Promise.allSettled([
      overlayAnimation.finished,
      logoAnimation.finished,
      haloAnimation.finished,
      ringAnimation.finished,
      beamAnimation.finished,
      labelAnimation.finished,
    ]).then(finish);
    const fallback = window.setTimeout(finish, duration + 180);
    return () => {
      window.clearTimeout(fallback);
      overlayAnimation.cancel(); logoAnimation.cancel(); haloAnimation.cancel();
      ringAnimation.cancel(); beamAnimation.cancel(); labelAnimation.cancel();
    };
  }, [runId, onDone]);

  return <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-[1000] grid place-items-center overflow-hidden bg-[#020303]" aria-hidden>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.025),transparent_32%),linear-gradient(to_bottom,transparent,rgba(255,255,255,.012),transparent)]" />
    <div ref={haloRef} className="absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,.025)_35%,transparent_70%)]" />
    <div ref={ringRef} className="absolute h-[232px] w-[232px] rounded-full border border-white/[.08]" />
    <div ref={beamRef} className="absolute h-px w-[min(72vw,760px)] origin-center bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.08),rgba(255,255,255,.85),rgba(255,255,255,.08),transparent)] shadow-[0_0_18px_rgba(255,255,255,.16)]" />
    <div className="relative z-10 flex flex-col items-center">
      <img ref={logoRef} src={WARE_LOGO} alt="" className="h-[132px] w-[132px] object-contain sm:h-[150px] sm:w-[150px]" />
      <div ref={labelRef} className="mt-7 text-[9px] font-semibold uppercase text-white/40">COMMAND SYSTEM</div>
    </div>
  </div>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const previousPathRef = useRef<string | null>(null);
  const [transitionRun, setTransitionRun] = useState(0);
  const [transitionVisible, setTransitionVisible] = useState(false);
  const finishTransition = useCallback(() => setTransitionVisible(false), []);
  const playCommandsTransition = useCallback(() => {
    setTransitionRun(current => current + 1);
    setTransitionVisible(true);
  }, []);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;
    sessionStorage.removeItem(`ware-route-retry:${pathname}`);
    if (pathname === "/commands" && previousPath !== "/commands") playCommandsTransition();
  }, [pathname, playCommandsTransition]);

  return <QueryClientProvider client={queryClient}>
    {transitionVisible ? <CommandsClickTransition key={transitionRun} runId={transitionRun} onDone={finishTransition} /> : null}
    <Outlet/>
  </QueryClientProvider>;
}

