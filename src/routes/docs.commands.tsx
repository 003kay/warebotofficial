import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories } from "@/lib/commands";

const BOT_COMMAND_COUNT = 821;

export const Route = createFileRoute("/docs/commands")({
  head: () => ({
    meta: [
      { title: "Commands — ware docs" },
      { name: "description", content: "Browse Ware commands by category." },
    ],
  }),
  component: CommandsIndex,
});

function CommandsIndex() {
  return (
    <DocsLayout active="commands" toc={[{ id: "categories", label: "Categories" }]}>
      <p className="text-sm text-muted-foreground">Commands</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
        All Commands
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Browse Ware's commands by category. Choose a category to view command
        syntax, examples, aliases, and usage information.
      </p>

      <div className="mt-7 flex flex-wrap gap-3 text-sm">
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-muted-foreground">
          <span className="font-semibold text-foreground">{BOT_COMMAND_COUNT}</span>{" "}
          bot commands
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-muted-foreground">
          <span className="font-semibold text-foreground">{commandCategories.length}</span>{" "}
          categories
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4 shrink-0" />
          <span>Use the search bar above to jump directly to any command.</span>
        </div>
      </div>

      <h2 id="categories" className="mt-12 text-2xl font-semibold tracking-tight">
        Categories
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {commandCategories.map((category) => (
          <Link
            key={category.slug}
            to="/docs/$slug"
            params={{ slug: `commands-${category.slug}` }}
            className="group flex min-h-36 flex-col rounded-xl border border-white/10 bg-white/[0.025] p-5 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {category.commands.length} documented commands
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-1 group-hover:text-foreground" />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
