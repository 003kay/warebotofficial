import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Search, ShieldCheck, Settings, Terminal } from "lucide-react";
import { DocsLayout } from "@/components/docs/DocsLayout";

export const Route = createFileRoute("/docs/introduction")({
  head: () => ({
    meta: [
      { title: "Introduction — ware docs" },
      {
        name: "description",
        content:
          "Learn how to get started with ware, browse commands, configure your server, and use the documentation.",
      },
    ],
  }),
  component: IntroductionPage,
});

function IntroductionPage() {
  return (
    <DocsLayout
      active="introduction"
      toc={[
        { id: "getting-started", label: "Getting Started" },
        { id: "commands", label: "Finding Commands" },
        { id: "next-steps", label: "Next Steps" },
      ]}
    >
      <p className="text-sm text-muted-foreground">Overview</p>

      <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
        Introduction
      </h1>

      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        ware is an all-in-one Discord bot built for server moderation, security,
        configuration, utilities, economy, VoiceMaster, tickets, giveaways,
        logging, and more. These docs show you what each command does and how to
        use it.
      </p>

      <div className="mt-6">
        <Link
          to="/docs/"
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.07]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to docs
        </Link>
      </div>

      <section id="getting-started" className="scroll-mt-28">
        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          Getting Started
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Default prefix</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              ware uses a comma as the default command prefix.
            </p>
            <code className="mt-3 inline-block rounded bg-white/10 px-2 py-1 font-mono text-sm">
              ,help
            </code>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Server setup</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the setup command to begin configuring ware for your server.
            </p>
            <code className="mt-3 inline-block rounded bg-white/10 px-2 py-1 font-mono text-sm">
              ,setup
            </code>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Security</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure AntiNuke, moderation, AutoMod, logging, and other
              protections from the security sections.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">Command documentation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Each command entry includes its syntax, description, example, and
              aliases when available.
            </p>
          </div>
        </div>
      </section>

      <section id="commands" className="scroll-mt-28">
        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          Finding Commands
        </h2>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start gap-3">
            <Search className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Use the live search</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start typing a command name in the search bar. Matching commands
                appear while you type. Click a result to jump directly to that
                command and see how to use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="next-steps" className="scroll-mt-28">
        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          Next Steps
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/docs/$slug"
            params={{ slug: "commands" }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse all commands
          </Link>

          <Link
            to="/docs/$slug"
            params={{ slug: "security-setup" }}
            className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.07]"
          >
            Security setup
          </Link>
        </div>
      </section>
    </DocsLayout>
  );
}
