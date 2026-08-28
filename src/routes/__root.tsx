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
import categoryRailCss from "../category-rail.css?url";
import commandPremiumCss from "../command-premium.css?url";
import securitySaveCss from "../security-save.css?url";
import wareV2Css from "../ware-v2.css?url";
import refreshCss from "../ware-refresh.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CategoryRailEnhancer } from "../components/CategoryRailEnhancer";

const WARE_LOGO = "/ware-logo.svg?v=4";
const WARE_FAVICON = "/favicon.svg?v=4";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link></div></div></div>;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1><p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Try again</button><a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">Go home</a></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ware" },
      { name: "description", content: "@003kay on instagram\nhttps://discord.gg/warebot" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Run your entire server from one bot." },
      { name: "twitter:title", content: "Run your entire server from one bot." },
      { property: "og:description", content: "Protection, moderation, tickets, music, utilities and more — powered by Ware." },
      { name: "twitter:description", content: "Protection, moderation, tickets, music, utilities and more — powered by Ware." },
      { property: "og:image", content: WARE_LOGO },
      { name: "twitter:image", content: WARE_LOGO },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: WARE_FAVICON },
      { rel: "shortcut icon", type: "image/svg+xml", href: WARE_FAVICON },
      { rel: "apple-touch-icon", href: WARE_LOGO },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: polishCss },
      { rel: "stylesheet", href: interactionsCss },
      { rel: "stylesheet", href: categoryRailCss },
      { rel: "stylesheet", href: commandPremiumCss },
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

function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current;
    const halo = haloRef.current;
    if (!dot || !halo) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let haloX = targetX;
    let haloY = targetY;
    let raf = 0;

    const draw = () => {
      haloX += (targetX - haloX) * .16;
      haloY += (targetY - haloY) * .16;
      dot.style.transform = `translate3d(${targetX}px,${targetY}px,0) translate(-50%,-50%)`;
      halo.style.transform = `translate3d(${haloX}px,${haloY}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.opacity = "1";
      halo.style.opacity = "1";
    };

    const onLeave = () => {
      dot.style.opacity = "0";
      halo.style.opacity = "0";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const interactive = target?.closest?.("a,button,summary,input,[role='button']");
      halo.style.width = interactive ? "48px" : "30px";
      halo.style.height = interactive ? "48px" : "30px";
      halo.style.borderColor = interactive ? "rgba(255,255,255,.34)" : "rgba(255,255,255,.18)";
      halo.style.background = interactive ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.012)";
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerover", onOver, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return <>
    <div ref={haloRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[990] h-[30px] w-[30px] rounded-full border border-white/[.18] bg-white/[.012] opacity-0 transition-[width,height,border-color,background-color,opacity] duration-300" />
    <div ref={dotRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[991] h-[4px] w-[4px] rounded-full bg-white/75 opacity-0 shadow-[0_0_12px_rgba(255,255,255,.34)] transition-opacity duration-200" />
  </>;
}

function CommandsClickTransition({ runId, onDone }: { runId: number; onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const glow = glowRef.current;
    const ring = ringRef.current;
    if (!overlay || !logo || !glow || !ring) return;

    const duration = 2860;

    const overlayAnimation = overlay.animate(
      [
        { opacity: 1, background: "radial-gradient(circle at center, #0d0e0e 0%, #050505 36%, #000 70%)", offset: 0 },
        { opacity: 1, background: "radial-gradient(circle at center, #101111 0%, #050505 34%, #000 70%)", offset: .58 },
        { opacity: .98, background: "radial-gradient(circle at center, #0b0c0c 0%, #030303 40%, #000 74%)", offset: .75 },
        { opacity: .62, background: "radial-gradient(circle at center, #060707 0%, #010101 44%, #000 78%)", offset: .90 },
        { opacity: 0, background: "#000", offset: 1 },
      ],
      { duration, easing: "linear", fill: "forwards" },
    );

    const logoAnimation = logo.animate(
      [
        { transform: "perspective(1100px) translateZ(-240px) scale(.30)", opacity: 0, filter: "blur(20px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 0 },
        { transform: "perspective(1100px) translateZ(-80px) scale(.66)", opacity: .48, filter: "blur(8px) drop-shadow(0 0 14px rgba(255,255,255,.07))", offset: .12 },
        { transform: "perspective(1100px) translateZ(26px) scale(1.08)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 42px rgba(255,255,255,.23))", offset: .28 },
        { transform: "perspective(1100px) translateZ(0) scale(1)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 26px rgba(255,255,255,.15))", offset: .44 },
        { transform: "perspective(1100px) translateZ(5px) scale(1.012)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 22px rgba(255,255,255,.13))", offset: .58 },
        { transform: "perspective(1100px) translateZ(-38px) scale(.94)", opacity: .98, filter: "blur(.5px) drop-shadow(0 0 17px rgba(255,255,255,.09))", offset: .70 },
        { transform: "perspective(1100px) translateZ(-145px) scale(.73)", opacity: .68, filter: "blur(5px) drop-shadow(0 0 8px rgba(255,255,255,.05))", offset: .82 },
        { transform: "perspective(1100px) translateZ(-275px) scale(.47)", opacity: .24, filter: "blur(12px) drop-shadow(0 0 3px rgba(255,255,255,.02))", offset: .92 },
        { transform: "perspective(1100px) translateZ(-360px) scale(.34)", opacity: 0, filter: "blur(20px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.22,.75,.18,1)", fill: "forwards" },
    );

    const glowAnimation = glow.animate(
      [
        { transform: "scale(.28)", opacity: 0, offset: 0 },
        { transform: "scale(1.12)", opacity: .64, offset: .30 },
        { transform: "scale(1.02)", opacity: .43, offset: .60 },
        { transform: "scale(.74)", opacity: .16, offset: .84 },
        { transform: "scale(.44)", opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.22,.75,.18,1)", fill: "forwards" },
    );

    const ringAnimation = ring.animate(
      [
        { transform: "scale(.56)", opacity: 0, offset: 0 },
        { transform: "scale(.78)", opacity: .28, offset: .22 },
        { transform: "scale(1.05)", opacity: .16, offset: .45 },
        { transform: "scale(1.42)", opacity: .07, offset: .68 },
        { transform: "scale(1.72)", opacity: 0, offset: .88 },
        { transform: "scale(1.78)", opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.22,.75,.18,1)", fill: "forwards" },
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    Promise.allSettled([overlayAnimation.finished, logoAnimation.finished, glowAnimation.finished, ringAnimation.finished]).then(finish);
    const fallback = window.setTimeout(finish, duration + 150);

    return () => {
      window.clearTimeout(fallback);
      overlayAnimation.cancel();
      logoAnimation.cancel();
      glowAnimation.cancel();
      ringAnimation.cancel();
    };
  }, [runId, onDone]);

  return (
    <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-[1000] grid place-items-center bg-black" aria-hidden>
      <div ref={ringRef} className="absolute h-[226px] w-[226px] rounded-full border border-white/[.08]" />
      <div ref={glowRef} className="absolute h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.105),rgba(255,255,255,.026)_40%,transparent_72%)] blur-[31px]" />
      <img ref={logoRef} src={WARE_LOGO} alt="" className="relative z-10 h-[140px] w-[140px] object-contain" />
    </div>
  );
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
    if (pathname === "/commands" && previousPath !== "/commands") playCommandsTransition();
  }, [pathname, playCommandsTransition]);

  return (
    <QueryClientProvider client={queryClient}>
      <CursorFollower />
      {transitionVisible ? <CommandsClickTransition key={transitionRun} runId={transitionRun} onDone={finishTransition} /> : null}
      <CategoryRailEnhancer />
      <Outlet />
    </QueryClientProvider>
  );
}
