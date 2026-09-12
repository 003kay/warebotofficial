import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PublicTitle } from "@/components/site/PublicLayout";
import { CommandReference } from "@/components/site/CommandReference";
export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Commands — Ware" },
      {
        name: "description",
        content: "Find Ware command syntax, examples, aliases, and required permissions.",
      },
    ],
  }),
  component: CommandsPage,
});
function CommandsPage() {
  const { category } = Route.useSearch();
  return (
    <PublicLayout>
      <div className="pub-width">
        <PublicTitle label="Ware / Reference" title="Find your command.">
          Syntax, examples, and permissions. Ware uses a comma by default.
        </PublicTitle>
        <CommandReference initialCategory={category} />
      </div>
    </PublicLayout>
  );
}
