import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useState } from "react";
import avatarAsset from "@/assets/ware-avatar.jpg.asset.json";
import { docSections } from "./doc-sections";
import { DocsSearch } from "./DocsSearch";

export type { DocSection } from "./doc-sections";
export { docSections };

export function DocsLayout({
  active,
  toc,
  children,
}: {
  active: string;
  toc?: { id: string; label: string }[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src={avatarAsset.url}
              alt="ware"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
            />
            <span className="text-lg font-semibold tracking-tight">ware</span>
          </Link>

          <DocsSearch />

          <a
            href="https://discord.gg/penthouses"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-block"
          >
            Support Server
          </a>
          <Link
            to="/"
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/15"
          >
            Home
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-white/10 p-2 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 py-8 md:grid-cols-[220px_1fr] md:px-8 lg:grid-cols-[220px_1fr_200px]">
        <aside
          className={`${
            open ? "block" : "hidden"
          } md:block md:sticky md:top-20 md:h-[calc(100vh-6rem)] md:overflow-y-auto`}
        >
          <nav className="space-y-6 text-sm">
            {docSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = item.slug === active;
                    const Icon = item.icon;
                    return (
                      <li key={item.slug}>
                        <Link
                          to="/docs/$slug"
                          params={{ slug: item.slug }}
                          className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors ${
                            isActive
                              ? "bg-white/10 text-foreground"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          }`}
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>

        {toc && toc.length > 0 && (
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)]">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-block h-3 w-3">☰</span> On this page
            </p>
            <ul className="space-y-2 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
