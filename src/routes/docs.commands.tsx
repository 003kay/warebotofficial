import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories } from "@/lib/commands";

const BOT_COMMAND_COUNT = 821;

function commandAnchor(name: string) {
  return `command-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

export const Route = createFileRoute("/docs/commands")({
  head: () => ({
    meta: [
      { title: "Commands — ware docs" },
      { name: "description", content: "Browse all Ware commands and categories." },
    ],
  }),
  component: CommandsIndex,
});

function CommandsIndex() {
  const allCommands = commandCategories.flatMap((category) =>
    category.commands.map((command) => ({ ...command, category: category.name })),
  );

  return (
    <DocsLayout active="commands" toc={[{ id: "all-commands", label: "All Commands" }]}>
      <p className="text-sm text-muted-foreground">Commands</p>
      <h1 className="mt-1 text-4xl font-bold tracking-[-0.045em] md:text-5xl">All Commands</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
        Every Ware command in one place. Use the categories to narrow things down or search for the exact command you need.
      </p>

      <div className="mt-7 flex flex-wrap gap-3 text-sm">
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-muted-foreground"><span className="font-semibold text-foreground">{BOT_COMMAND_COUNT}</span> bot commands</div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-muted-foreground"><span className="font-semibold text-foreground">{commandCategories.length}</span> categories</div>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4 shrink-0" />
          <span>Use the search bar above to jump directly to any command.</span>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-2">
          <div className="rounded-full border border-white/20 bg-white text-black px-4 py-2 text-xs font-semibold">All Commands</div>
          {commandCategories.map((category) => (
            <Link
              key={category.slug}
              to="/docs/$slug"
              params={{ slug: `commands-${category.slug}` }}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              {category.name}
              <span className="text-[10px] text-white/30">{category.commands.length}</span>
            </Link>
          ))}
        </div>
      </div>

      <section id="all-commands" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Command library</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Everything</h2>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-muted-foreground">{allCommands.length} documented commands</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allCommands.map((command, index) => (
            <article
              key={`${command.category}-${command.name}-${index}`}
              id={commandAnchor(command.name)}
              className="group scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.022] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="truncate rounded-lg border border-white/[0.11] bg-white/[0.07] px-2.5 py-1.5 text-sm font-semibold">,{command.name}</span>
                <span className="shrink-0 rounded-full border border-white/[0.07] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/35">{command.category}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">{command.description}</p>
              <div className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-[11px] leading-5 text-white/40">{command.usage}</div>
            </article>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
