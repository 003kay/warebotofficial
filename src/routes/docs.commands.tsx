import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Command } from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories } from "@/lib/commands";

export const Route = createFileRoute("/docs/commands")({
  head: () => ({
    meta: [
      { title: "Commands — ware docs" },
      {
        name: "description",
        content: "Browse every Ware command by category.",
      },
    ],
  }),
  component: CommandsIndex,
});

function CommandsIndex() {
  const totalCommands = commandCategories.reduce(
    (total, category) => total + category.commands.length,
    0,
  );

  return (
    <DocsLayout active="commands">
      <p className="text-sm text-muted-foreground">Commands</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
        All Commands
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Browse Ware's command library by category. Pick a section below to see
        syntax, examples, aliases, and usage without loading the entire command
        database at once.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
          {totalCommands}+ commands
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
          {commandCategories.length} categories
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {commandCategories.map((category) => (
          <Link
            key={category.slug}
            to="/docs/$slug"
            params={{ slug: `commands-${category.slug}` }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-start justify-between gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Command className="h-4 w-4" />
              </div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                {category.commands.length}
              </span>
            </div>

            <h2 className="mt-6 text-lg font-semibold tracking-tight">
              {category.name}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {category.description}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
              View commands
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
