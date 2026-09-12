import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { CommandReference } from "@/components/site/CommandReference";
export const Route = createFileRoute("/docs/commands")({
  head: () => ({ meta: [{ title: "Command reference — Ware docs" }] }),
  component: CommandsDocs,
});
function CommandsDocs() {
  return (
    <DocsLayout active="commands">
      <p className="pub-label">Documentation / Reference</p>
      <h1 className="mt-5">Commands</h1>
      <p className="mt-5">Find the syntax, examples, and permissions for each command.</p>
      <CommandReference />
    </DocsLayout>
  );
}
