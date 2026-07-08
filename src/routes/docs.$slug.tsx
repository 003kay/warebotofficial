import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories } from "@/lib/commands";
import type { ReactNode } from "react";

type DocPage = {
  title: string;
  section: string;
  body: ReactNode;
  toc?: { id: string; label: string }[];
};

function CommandGrid({ commands }: { commands: string[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {commands.map((cmd) => (
        <code
          key={cmd}
          className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-foreground"
        >
          {cmd}
        </code>
      ))}
    </div>
  );
}

const staticPages: Record<string, DocPage> = {
  "donator-perks": {
    title: "Donator Perks",
    section: "Overview",
    toc: [{ id: "perks", label: "Perks" }],
    body: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          Supporting ware unlocks premium features across every module —
          extended limits, exclusive commands, and priority processing.
        </p>
        <h2 id="perks" className="mt-6 text-xl font-semibold text-foreground">
          Perks
        </h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>Priority command processing on shared shards</li>
          <li>Extended tag, alias, and autoresponder limits</li>
          <li>Custom vanity role glow and colors</li>
          <li>Higher economy and giveaway limits</li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: "FAQ",
    section: "Overview",
    body: (
      <div className="space-y-6 text-muted-foreground">
        <div>
          <h3 className="text-lg font-semibold text-foreground">How do I invite ware?</h3>
          <p>Click "Invite to Discord" on the home page and choose a server.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">What's the default prefix?</h3>
          <p>
            The default prefix is <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">,</code>.
            Change it with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">,prefix set (symbol)</code>.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Is ware free?</h3>
          <p>Yes — core features are free forever. Donator perks add premium extras.</p>
        </div>
      </div>
    ),
  },
  "security-setup": {
    title: "Security Setup",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Enable antinuke, automod, and logging first. See the Anti and Logging
        command categories for the full command list.
      </p>
    ),
  },
  "server-configuration": {
    title: "Server Configuration",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Configure welcomes, autoroles, boost messages, and counting from the
        Welcome command category.
      </p>
    ),
  },
  integrations: {
    title: "Integrations",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Connect social platforms and post feeds directly into your channels.
      </p>
    ),
  },
  "embed-scripting": {
    title: "Embed Scripting",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Build rich embeds with variables using the Message Tools commands
        (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">embed</code>,
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">embeds</code>).
      </p>
    ),
  },
  commands: {
    title: "All Commands",
    section: "Commands",
    toc: commandCategories.map((c) => ({ id: c.slug, label: c.name })),
    body: (
      <div className="space-y-12">
        {commandCategories.map((c) => (
          <section key={c.slug}>
            <h2 id={c.slug} className="text-2xl font-semibold text-foreground">
              {c.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            <CommandGrid commands={c.commands} />
          </section>
        ))}
      </div>
    ),
  },
};

function buildPage(slug: string): DocPage | undefined {
  if (staticPages[slug]) return staticPages[slug];

  if (slug.startsWith("commands-")) {
    const catSlug = slug.replace(/^commands-/, "");
    const cat = commandCategories.find((c) => c.slug === catSlug);
    if (!cat) return undefined;
    return {
      title: `${cat.name} Commands`,
      section: "Commands",
      body: (
        <div>
          <p className="text-muted-foreground">{cat.description}</p>
          <CommandGrid commands={cat.commands} />
        </div>
      ),
    };
  }

  return undefined;
}

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const page = buildPage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.page.title} — ware docs` : "ware docs",
      },
    ],
  }),
  component: DocPageComponent,
});

function DocPageComponent() {
  const { slug } = Route.useParams();
  const { page } = Route.useLoaderData();

  return (
    <DocsLayout active={slug} toc={page.toc}>
      <p className="text-sm text-muted-foreground">{page.section}</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
        {page.title}
      </h1>
      <div className="mt-8">{page.body}</div>
    </DocsLayout>
  );
}
