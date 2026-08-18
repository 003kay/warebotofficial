import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories, type CommandDef } from "@/lib/commands";
import type { ReactNode } from "react";

type DocPage = {
  title: string;
  section: string;
  body: ReactNode;
  toc?: { id: string; label: string }[];
};

function CommandList({ commands }: { commands: CommandDef[] }) {
  return (
    <div className="mt-6 space-y-4">
      {commands.map((c) => (
        <div
          key={c.name}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <code className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-sm text-foreground">
              ,{c.name}
            </code>
            <span className="font-mono text-xs text-muted-foreground">
              {c.usage}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Example:{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-foreground">
              {c.example}
            </code>
          </div>
        </div>
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
  customization: {
    title: "Customization",
    section: "Overview",
    body: (
      <p className="text-muted-foreground">
        Customize ware's prefix, embed color, welcome/goodbye messages, and per-command permissions from the dashboard or via commands.
      </p>
    ),
  },
  "join-gate": {
    title: "Join Gate",
    section: "Security Setup",
    body: (
      <p className="text-muted-foreground">
        Screen new members with age/verification gates before they can chat.
        See the Anti command category for the full list of protections.
      </p>
    ),
  },
  "moderation-guide": {
    title: "Moderation",
    section: "Security Setup",
    toc: [{ id: "commands", label: "Commands" }],
    body: (
      <div>
        <p className="text-muted-foreground">
          Ban, kick, timeout, jail, mute, warn, and mass actions like
          lockdown and role cleanup — everything you need to keep a server
          in line.
        </p>
        <h2 id="commands" className="mt-10 text-xl font-semibold text-foreground">
          Commands
        </h2>
        <CommandList
          commands={
            commandCategories.find((c) => c.slug === "moderation")
              ?.commands ?? []
          }
        />
      </div>
    ),
  },
  "fake-permissions": {
    title: "Fake Permissions",
    section: "Security Setup",
    body: (
      <p className="text-muted-foreground">
        Grant ware-only permissions to roles without giving them native Discord permissions.
      </p>
    ),
  },
  starboard: {
    title: "Starboard",
    section: "Server Configuration",
    body: (
      <p className="text-muted-foreground">
        Configure a starboard channel and threshold so popular messages get highlighted automatically.
      </p>
    ),
  },
  "level-rewards": {
    title: "Level Rewards",
    section: "Server Configuration",
    body: (
      <p className="text-muted-foreground">
        Reward active members with roles as they level up in your server.
      </p>
    ),
  },
  "security-setup": {
    title: "Antinuke",
    section: "Security Setup",
    toc: [{ id: "commands", label: "Commands" }],
    body: (
      <div>
        <p className="text-muted-foreground">
          Enable AntiNuke first to protect the server from malicious admins,
          compromised staff accounts, and bots that ban, kick, or destroy
          channels and roles in bulk. Pair it with AutoMod and logging for
          full coverage — see the Config/Logs command category for those.
        </p>
        <h2 id="commands" className="mt-10 text-xl font-semibold text-foreground">
          Commands
        </h2>
        <CommandList
          commands={
            commandCategories.find((c) => c.slug === "antinuke")
              ?.commands ?? []
          }
        />
      </div>
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
            <CommandList commands={c.commands} />
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
          <CommandList commands={cat.commands} />
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
