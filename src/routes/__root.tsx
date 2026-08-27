import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

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

function CommandTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "enter" | "leave">("idle");
  const runningRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };

    const start = () => {
      if (runningRef.current || window.location.pathname === "/commands") return;
      runningRef.current = true;
      clearTimers();
      setPhase("enter");

      const navigateTimer = window.setTimeout(async () => {
        try {
          await router.navigate({ to: "/commands" });
          const leaveTimer = window.setTimeout(() => setPhase("leave"), 180);
          const finishTimer = window.setTimeout(() => {
            setPhase("idle");
            runningRef.current = false;
          }, 1500);
          timersRef.current.push(leaveTimer, finishTimer);
        } catch (error) {
          console.error("Commands navigation failed", error);
          setPhase("leave");
          const failSafe = window.setTimeout(() => {
            setPhase("idle");
            runningRef.current = false;
            window.location.href = "/commands";
          }, 1050);
          timersRef.current.push(failSafe);
        }
      }, 1050);

      const hardFailSafe = window.setTimeout(() => {
        if (!runningRef.current) return;
        setPhase("idle");
        runningRef.current = false;
      }, 4500);

      timersRef.current.push(navigateTimer, hardFailSafe);
    };

    window.addEventListener("ware:navigate-commands", start);
    return () => {
      window.removeEventListener("ware:navigate-commands", start);
      clearTimers();
      runningRef.current = false;
    };
  }, [router]);

  if (phase === "idle") return null;
  return <div className={`ware-command-transition ${phase === "leave" ? "is-leaving" : "is-entering"}`} aria-label="Loading commands">
    <div className="ware-command-transition-glow"/>
    <img src={WARE_LOGO} alt="Ware" className="ware-command-transition-logo"/>
  </div>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><CommandTransition/><CategoryRailEnhancer/><Outlet/></QueryClientProvider>;
}
