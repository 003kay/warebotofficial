import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Settings,
  Share2,
  Code2,
  Crown,
  ArrowRight,
  Info,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/docs/DocsLayout";

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "Introduction — ware docs" },
      {
        name: "description",
        content:
          "Learn how to set up ware in your server or enhance your everyday use with commands & more.",
      },
    ],
  }),
  component: DocsIndex,
});

interface Guide {
  icon: LucideIcon;
  title: string;
  body: string;
  slug: string;
}

const guides: Guide[] = [
  {
    icon: ShieldCheck,
    title: "Security Setup",
    body: "Quickly configure your server to use ware's advanced moderation system.",
    slug: "security-setup",
  },
  {
    icon: Settings,
    title: "Server Configuration",
    body: "Set up welcome & goodbye messages, reaction roles, and more for your server.",
    slug: "server-configuration",
  },
  {
    icon: Share2,
    title: "Integrations",
    body: "Seamlessly integrate your favorite platforms directly into your server through ware.",
    slug: "integrations",
  },
  {
    icon: Code2,
    title: "Embed Scripting",
    body: "Learn how to build embeds and use variables for your server's configurations.",
    slug: "embed-scripting",
  },
];

function DocsIndex() {
  return (
    <DocsLayout active="introduction" toc={[{ id: "guides", label: "Guides" }]}>
      <p className="text-sm text-muted-foreground">Overview</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
        Introduction
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Learn how to set up ware in your server or enhance your everyday use
        with commands & more.
      </p>

      <h2
        id="guides"
        className="mt-14 text-2xl font-semibold tracking-tight"
      >
        Guides
      </h2>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        <p>
          Server prefix is set to{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">
            ,
          </code>{" "}
          by default. Use{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">
            ,prefix set (symbol)
          </code>{" "}
          to change it for your server.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.slug}
            to="/docs/$slug"
            params={{ slug: g.slug }}
            className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <g.icon className="h-5 w-5 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold">{g.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{g.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-14 flex justify-end border-t border-white/5 pt-6">
        <Link
          to="/docs/$slug"
          params={{ slug: "donator-perks" }}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          <Crown className="h-4 w-4" />
          Donator Perks
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </DocsLayout>
  );
}
