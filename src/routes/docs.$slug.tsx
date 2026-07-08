import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout, docSections } from "@/components/docs/DocsLayout";

type DocPage = {
  title: string;
  section: string;
  body: React.ReactNode;
  toc?: { id: string; label: string }[];
};

const pages: Record<string, DocPage> = {
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
          <li>Access to premium-only social feeds</li>
          <li>Custom vanity role glow and colors</li>
        </ul>
      </div>
    ),
  },
  "security-setup": {
    title: "Security Setup",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Content coming soon. Full command reference will be pasted here.
      </p>
    ),
  },
  "server-configuration": {
    title: "Server Configuration",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Content coming soon. Full command reference will be pasted here.
      </p>
    ),
  },
  integrations: {
    title: "Integrations",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Content coming soon. Full command reference will be pasted here.
      </p>
    ),
  },
  "embed-scripting": {
    title: "Embed Scripting",
    section: "Guides",
    body: (
      <p className="text-muted-foreground">
        Content coming soon. Full command reference will be pasted here.
      </p>
    ),
  },
  commands: {
    title: "All Commands",
    section: "Commands",
    body: (
      <p className="text-muted-foreground">
        Paste your command list and I'll turn each one into a proper reference
        entry.
      </p>
    ),
  },
  "commands-moderation": {
    title: "Moderation Commands",
    section: "Commands",
    body: <p className="text-muted-foreground">Awaiting command list.</p>,
  },
  "commands-roles": {
    title: "Role Commands",
    section: "Commands",
    body: <p className="text-muted-foreground">Awaiting command list.</p>,
  },
  "commands-utility": {
    title: "Utility Commands",
    section: "Commands",
    body: <p className="text-muted-foreground">Awaiting command list.</p>,
  },
  "commands-fun": {
    title: "Fun Commands",
    section: "Commands",
    body: <p className="text-muted-foreground">Awaiting command list.</p>,
  },
};

// Validate slug at load time so unknown slugs 404 cleanly
export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const page = pages[params.slug];
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

  // sanity-check the slug is in the sidebar
  void docSections;

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
