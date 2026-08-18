import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Copy } from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories, type CommandDef } from "@/lib/commands";

function commandAnchor(name: string) {
  return `command-${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function renderCommandText(value: string) {
  return value.replaceAll("@alex", "@timmy");
}

function CommandList({ commands }: { commands: CommandDef[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {commands.map((command) => {
        const usage = renderCommandText(command.usage);
        const example = renderCommandText(command.example);

        return (
          <article
            key={command.name}
            id={commandAnchor(command.name)}
            className="group relative scroll-mt-28 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,.038),rgba(255,255,255,.018))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] [content-visibility:auto] [contain-intrinsic-size:245px] transition-[border-color,background-color,box-shadow] duration-200 hover:border-white/[0.16] hover:bg-white/[0.045] hover:shadow-[0_18px_50px_-34px_rgba(255,255,255,.22)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-50" />
            <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/[0.025] blur-2xl transition-opacity duration-200 group-hover:opacity-100" />

            <div className="relative flex min-h-[215px] flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex max-w-full items-center rounded-xl border border-white/[0.12] bg-white/[0.075] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
                    <code className="truncate font-mono text-[13px] font-medium text-white">
                      ,{command.name}
                    </code>
                  </div>
                </div>

                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-colors duration-200 group-hover:text-white/55" />
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5">
                <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  Syntax
                </div>
                <code className="block break-words font-mono text-[11px] leading-5 text-white/60">
                  ,{usage}
                </code>
              </div>

              <p className="mt-4 text-[13px] leading-6 text-white/55">
                {command.description}
              </p>

              <div className="mt-auto pt-5">
                <div className="border-t border-white/[0.065] pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                      Example
                    </div>
                    <Copy className="h-3 w-3 text-white/20" />
                  </div>

                  <code className="mt-2 block break-words rounded-lg bg-white/[0.045] px-2.5 py-2 font-mono text-[11px] leading-5 text-white/75">
                    {example}
                  </code>
                </div>

                {command.aliases && command.aliases.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                      Aliases
                    </span>
                    {command.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="rounded-md border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[10px] text-white/45"
                      >
                        ,{alias}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const pageInfo: Record<
  string,
  { title: string; section: string; description: string; commandCategory?: string }
> = {
  introduction: {
    title: "Introduction",
    section: "Overview",
    description:
      "Learn how to set up ware in your server, find commands, and configure the features you need.",
  },
  "donator-perks": {
    title: "Donator Perks",
    section: "Overview",
    description:
      "Supporting ware unlocks expanded limits, premium features, and additional server tools.",
  },
  customization: {
    title: "Customization",
    section: "Overview",
    description:
      "Customize ware's prefix, messages, embeds, permissions, and server behavior.",
  },
  "security-setup": {
    title: "Antinuke",
    section: "Security Setup",
    description:
      "Protect your server from malicious admins, compromised staff accounts, destructive bots, and mass actions.",
    commandCategory: "antinuke",
  },
  "join-gate": {
    title: "Join Gate",
    section: "Security Setup",
    description:
      "Control how new members enter your server and add verification or screening before they can chat.",
    commandCategory: "anti",
  },
  "moderation-guide": {
    title: "Moderation",
    section: "Security Setup",
    description:
      "Ban, kick, timeout, jail, mute, warn, lock down, and manage members with Ware's moderation system.",
    commandCategory: "moderation",
  },
  "fake-permissions": {
    title: "Fake Permissions",
    section: "Security Setup",
    description:
      "Give staff Ware-specific command access without granting unnecessary native Discord permissions.",
    commandCategory: "administration",
  },
  "server-configuration": {
    title: "Tickets",
    section: "Server Configuration",
    description:
      "Create and manage ticket workflows, support panels, and server support tools.",
    commandCategory: "tickets",
  },
  integrations: {
    title: "Roles",
    section: "Server Configuration",
    description:
      "Configure role utilities, role management, and server role automation.",
    commandCategory: "channels-roles",
  },
  "embed-scripting": {
    title: "Messages",
    section: "Server Configuration",
    description:
      "Build embeds, manage messages, and use Ware's message tools for cleaner server presentation.",
    commandCategory: "message-tools",
  },
  starboard: {
    title: "Starboard",
    section: "Server Configuration",
    description:
      "Highlight popular messages automatically with a configurable starboard system.",
    commandCategory: "fun",
  },
  "level-rewards": {
    title: "Level Rewards",
    section: "Server Configuration",
    description:
      "Reward active members with progression, levels, and role rewards.",
    commandCategory: "leveling",
  },
};

function findCategory(slug: string) {
  return commandCategories.find((category) => category.slug === slug);
}

export const Route = createFileRoute("/docs/$slug")({
  head: () => ({
    meta: [{ title: "ware docs" }],
  }),
  component: DocPageComponent,
});

function DocPageComponent() {
  const { slug } = Route.useParams();

  const directCategorySlug = slug.startsWith("commands-")
    ? slug.replace(/^commands-/, "")
    : undefined;
  const directCategory = directCategorySlug
    ? findCategory(directCategorySlug)
    : undefined;

  const info = pageInfo[slug];
  const category = directCategory ??
    (info?.commandCategory ? findCategory(info.commandCategory) : undefined);

  const title = directCategory
    ? `${directCategory.name} Commands`
    : info?.title ?? "Documentation";
  const section = directCategory ? "Commands" : info?.section ?? "Ware Docs";
  const description = directCategory?.description ??
    info?.description ??
    "Browse Ware documentation, commands, configuration, and server tools.";

  const toc = category
    ? [{ id: "commands", label: "Commands" }]
    : undefined;

  return (
    <DocsLayout active={slug} toc={toc}>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {section}
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] text-white md:text-6xl">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>

      {category ? (
        <section id="commands" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Command library
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {category.name}
              </h2>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-xs text-muted-foreground">
              {category.commands.length} documented commands
            </span>
          </div>

          <CommandList commands={category.commands} />
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-sm font-medium text-white">Fast setup</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the navigation on the left to jump between setup guides, security tools, and command categories.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-sm font-medium text-white">Search everything</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the search bar above or press Ctrl K to find commands and documentation instantly.
            </p>
          </div>
        </div>
      )}
    </DocsLayout>
  );
}
