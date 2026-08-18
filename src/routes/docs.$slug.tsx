import { createFileRoute } from "@tanstack/react-router";
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
    <div className="mt-7 grid gap-3">
      {commands.map((command) => (
        <article
          key={command.name}
          id={commandAnchor(command.name)}
          className="group scroll-mt-28 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.04]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1 font-mono text-sm text-white">
              ,{command.name}
            </code>
            <code className="font-mono text-xs text-muted-foreground">
              {renderCommandText(command.usage)}
            </code>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {command.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>
              Example:{" "}
              <code className="rounded-md bg-white/[0.06] px-1.5 py-1 font-mono text-white/80">
                {renderCommandText(command.example)}
              </code>
            </span>

            {command.aliases && command.aliases.length > 0 && (
              <span>
                Aliases:{" "}
                <span className="font-mono text-white/65">
                  {command.aliases.map((alias) => `,${alias}`).join(", ")}
                </span>
              </span>
            )}
          </div>
        </article>
      ))}
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
              {category.commands.length} commands
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
