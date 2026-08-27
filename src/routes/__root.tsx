import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
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

    const duration = 1450;

    const overlayAnimation = overlay.animate(
      [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.64 },
        { opacity: 0, offset: 1 },
      ],
      { duration, easing: "linear", fill: "forwards" },
    );

    const logoAnimation = logo.animate(
      [
        { transform: "scale(.55)", opacity: 0, filter: "blur(12px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 0 },
        { transform: "scale(1.11)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 38px rgba(255,255,255,.22))", offset: 0.2 },
        { transform: "scale(1)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 24px rgba(255,255,255,.15))", offset: 0.43 },
        { transform: "scale(.98)", opacity: 1, filter: "blur(0px) drop-shadow(0 0 20px rgba(255,255,255,.12))", offset: 0.61 },
        { transform: "scale(.74)", opacity: 0, filter: "blur(10px) drop-shadow(0 0 0 rgba(255,255,255,0))", offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.2,.78,.2,1)", fill: "forwards" },
    );

    const glowAnimation = glow.animate(
      [
        { transform: "scale(.5)", opacity: 0, offset: 0 },
        { transform: "scale(1.12)", opacity: .72, offset: .22 },
        { transform: "scale(1)", opacity: .5, offset: .6 },
        { transform: "scale(.68)", opacity: 0, offset: 1 },
      ],
      { duration, easing: "cubic-bezier(.2,.78,.2,1)", fill: "forwards" },
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    Promise.allSettled([overlayAnimation.finished, logoAnimation.finished, glowAnimation.finished]).then(finish);
    const fallback = window.setTimeout(finish, duration + 80);

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
        className="absolute h-[250px] w-[250px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,.025)_42%,transparent_72%)] blur-[24px]"
      />
      <img ref={logoRef} src={WARE_LOGO} alt="" className="relative z-10 h-[124px] w-[124px] object-contain" />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [transitionRun, setTransitionRun] = useState(0);
  const [transitionVisible, setTransitionVisible] = useState(false);

  const finishTransition = useCallback(() => setTransitionVisible(false), []);

  const playCommandsTransition = useCallback(() => {
    setTransitionRun(current => current + 1);
    setTransitionVisible(true);
  }, []);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin || url.pathname !== "/commands") return;

      event.preventDefault();
      event.stopPropagation();

      const category = url.searchParams.get("category") || undefined;
      playCommandsTransition();
      void router.navigate({ to: "/commands", search: { category } });
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [playCommandsTransition, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {transitionVisible ? <CommandsClickTransition key={transitionRun} runId={transitionRun} onDone={finishTransition} /> : null}
      <CategoryRailEnhancer />
      <Outlet />
    </QueryClientProvider>
  );
}
