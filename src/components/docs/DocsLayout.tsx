import type { ReactNode } from "react";
import { docSections } from "./doc-sections";
import { DocsSearch } from "./DocsSearch";
import { PublicLayout } from "@/components/site/PublicLayout";
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
  const navigation = (
    <nav aria-label="Documentation">
      <a href="/docs/commands" aria-current={active === "commands" ? "page" : undefined}>
        All commands
      </a>
      {docSections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.items
            .filter((item) => item.slug !== "commands")
            .map((item) => (
              <a
                key={item.slug}
                href={`/docs/${item.slug}`}
                aria-current={active === item.slug ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
        </section>
      ))}
    </nav>
  );
  return (
    <PublicLayout>
      <div className="pub-doc-layout">
        <aside className="pub-doc-nav">{navigation}</aside>
        <div className="pub-doc-body">
          <details className="pub-doc-mobile">
            <summary>Browse documentation</summary>
            {navigation}
          </details>
          <div className="pub-doc-search">
            <DocsSearch />
          </div>
          {children}
        </div>
        {toc?.length ? (
          <aside className="pub-doc-contents">
            <p>On this page</p>
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </aside>
        ) : null}
      </div>
    </PublicLayout>
  );
}
