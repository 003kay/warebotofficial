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

    const duration = 2580;

    const overlayAnimation = overlay.animate(
      [
        { opacity: 1, background: "radial-gradient(circle at center, #0f1010 0%, #050505 34%, #000 69%)", offset: 0 },
        { opacity: 1, background: "radial-gradient(circle at center, #111212 0%, #050505 33%, #000 69%)", offset: 0.62 },
        { opacity: 1, background: "radial-gradient(circle at center, #0b0c0c 0%, #030303 38%, #000 72%)", offset: 0.72 },
        { opacity: .72, background: "radial-gradient(circle at center, #070808 0%, #010101 42%, #000 75%)", offset: 0.86 },
        { opacity: 0, background: "#000", offset: 1 },
      ],
      { duration, easing: "linear", fill: "forwards" },
    );

    const logoAnimation = logo.animate(
      [
        { transform: "perspective(1000px) translateZ(-210px) scale(.34)", opacity: 0, filter: "blur(18px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 0 },
        { transform: "perspective(1000px) translateZ(-65px) scale(.70)", opacity: .5, filter: "blur(7px) drop-shadow(0 0 14px rgba(255,255,255,.08))", offset: .11 },
        { transform: "perspective(1000px) translateZ(34px) scale(1.10)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 44px rgba(255,255,255,.25))", offset: .25 },
        { transform: "perspective(1000px) translateZ(0) scale(1)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 26px rgba(255,255,255,.16))", offset: .42 },
        { transform: "perspective(1000px) translateZ(6px) scale(1.018)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 23px rgba(255,255,255,.14))", offset: .56 },
        { transform: "perspective(1000px) translateZ(-28px) scale(.96)", opacity: 1, filter: "blur(.3px) drop-shadow(0 0 18px rgba(255,255,255,.11))", offset: .67 },
        { transform: "perspective(1000px) translateZ(-115px) scale(.78)", opacity: .78, filter: "blur(4px) drop-shadow(0 0 10px rgba(255,255,255,.07))", offset: .79 },
        { transform: "perspective(1000px) translateZ(-230px) scale(.55)", opacity: .34, filter: "blur(10px) drop-shadow(0 0 4px rgba(255,255,255,.03))", offset: .90 },
        { transform: "perspective(1000px) translateZ(-330px) scale(.38)", opacity: 0, filter: "blur(18px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.22,.72,.18,1)", fill: "forwards" },
    );

    const glowAnimation = glow.animate(
      [
        { transform: "scale(.28)", opacity: 0, offset: 0 },
        { transform: "scale(1.18)", opacity: .70, offset: .27 },
        { transform: "scale(1.04)", opacity: .48, offset: .58 },
        { transform: "scale(.82)", opacity: .25, offset: .76 },
        { transform: "scale(.56)", opacity: .08, offset: .90 },
        { transform: "scale(.40)", opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.22,.72,.18,1)", fill: "forwards" },
    );

    const ringAnimation = ring.animate(
      [
        { transform: "scale(.52)", opacity: 0, offset: 0 },
        { transform: "scale(.72)", opacity: .36, offset: .19 },
        { transform: "scale(1.02)", opacity: .20, offset: .40 },
        { transform: "scale(1.34)", opacity: .10, offset: .62 },
        { transform: "scale(1.72)", opacity: 0, offset: .82 },
        { transform: "scale(1.78)", opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.22,.72,.18,1)", fill: "forwards" },
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    Promise.allSettled([overlayAnimation.finished, logoAnimation.finished, glowAnimation.finished, ringAnimation.finished]).then(finish);
    const fallback = window.setTimeout(finish, duration + 140);

    return () => {
      window.clearTimeout(fallback);
      overlayAnimation.cancel();
      logoAnimation.cancel();
      glowAnimation.cancel();
      ringAnimation.cancel();
    };
  }, [runId, onDone]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[1000] grid place-items-center bg-black"
      aria-hidden
    >
      <div ref={ringRef} className="absolute h-[220px] w-[220px] rounded-full border border-white/[.09]" />
      <div ref={glowRef} className="absolute h-[310px] w-[310px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.12),rgba(255,255,255,.03)_40%,transparent_72%)] blur-[30px]" />
      <img ref={logoRef} src={WARE_LOGO} alt="" className="relative z-10 h-[138px] w-[138px] object-contain" />
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

    if (pathname === "/commands" && previousPath !== "/commands") {
      playCommandsTransition();
    }
  }, [pathname, playCommandsTransition]);

  return (
    <QueryClientProvider client={queryClient}>
      {transitionVisible ? <CommandsClickTransition key={transitionRun} runId={transitionRun} onDone={finishTransition} /> : null}
      <CategoryRailEnhancer />
      <Outlet />
    </QueryClientProvider>
  );
}
