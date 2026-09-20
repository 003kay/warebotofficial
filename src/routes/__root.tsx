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
import { useEffect, useState, type ReactNode } from "react";

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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { pathname, pending } = useRouterState({ select: state => ({
    pathname: state.location.pathname,
    pending: state.status === "pending",
  }) });
  useEffect(() => {
    try { sessionStorage.removeItem(`ware-route-retry:${pathname}`); } catch { /* Storage may be unavailable. */ }
  }, [pathname]);
  return <QueryClientProvider client={queryClient}>
    {pending && <div role="status" aria-label="Loading page" className="pointer-events-none fixed inset-x-0 top-0 z-[1000] h-0.5 overflow-hidden bg-white/10"><div className="h-full w-full bg-[#a9cdd3] motion-safe:animate-pulse" /><span className="sr-only">Loading page…</span></div>}
    <Outlet />
  </QueryClientProvider>;
}
