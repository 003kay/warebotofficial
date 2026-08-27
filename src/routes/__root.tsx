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

  useEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const glow = glowRef.current;
    if (!overlay || !logo || !glow) return;

    const duration = 1800;

    const overlayAnimation = overlay.animate(
      [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.66 },
        { opacity: 0.82, offset: 0.78 },
        { opacity: 0, offset: 1 },
      ],
      { duration, easing: "linear", fill: "forwards" },
    );

    const logoAnimation = logo.animate(
      [
        { transform: "scale(.2)", opacity: 0, filter: "blur(18px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 0 },
        { transform: "scale(.72)", opacity: .5, filter: "blur(7px) drop-shadow(0 0 12px rgba(255,255,255,.08))", offset: 0.1 },
        { transform: "scale(1.24)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 46px rgba(255,255,255,.28))", offset: 0.24 },
        { transform: "scale(.98)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 24px rgba(255,255,255,.15))", offset: 0.42 },
        { transform: "scale(1.03)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 24px rgba(255,255,255,.15))", offset: 0.56 },
        { transform: "scale(.92)", opacity: .95, filter: "blur(1px) drop-shadow(0 0 16px rgba(255,255,255,.10))", offset: 0.68 },
        { transform: "scale(.54)", opacity: .38, filter: "blur(9px) drop-shadow(0 0 4px rgba(255,255,255,.04))", offset: 0.84 },
        { transform: "scale(.28)", opacity: 0, filter: "blur(16px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" },
    );

    const glowAnimation = glow.animate(
      [
        { transform: "scale(.25)", opacity: 0, offset: 0 },
        { transform: "scale(1.35)", opacity: .85, offset: .25 },
        { transform: "scale(1.08)", opacity: .55, offset: .58 },
        { transform: "scale(.72)", opacity: .18, offset: .82 },
        { transform: "scale(.38)", opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" },
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    Promise.allSettled([overlayAnimation.finished, logoAnimation.finished, glowAnimation.finished]).then(finish);
    const fallback = window.setTimeout(finish, duration + 120);

    return () => {
      window.clearTimeout(fallback);
      overlayAnimation.cancel();
      logoAnimation.cancel();
      glowAnimation.cancel();
    };
  }, [runId, onDone]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[1000] grid place-items-center bg-black"
      aria-hidden
    >
      <div
        ref={glowRef}
        className="absolute h-[290px] w-[290px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.12),rgba(255,255,255,.03)_40%,transparent_72%)] blur-[26px]"
      />
      <img ref={logoRef} src={WARE_LOGO} alt="" className="relative z-10 h-[132px] w-[132px] object-contain" />
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