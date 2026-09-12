import { PublicLayout, PublicTitle } from "@/components/site/PublicLayout";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, Settings, ShieldCheck, Share2 } from "lucide-react";
const guides = [
  {
    icon: ShieldCheck,
    title: "Security",
    body: "Antinuke, anti-raid, moderation and protection setup.",
    slug: "security-setup",
  },
  {
    icon: Settings,
    title: "Configuration",
    body: "Tickets, roles, messages and server behavior.",
    slug: "server-configuration",
  },
  {
    icon: Share2,
    title: "Roles & integrations",
    body: "Role utilities and connected server workflows.",
    slug: "integrations",
  },
  {
    icon: Code2,
    title: "Messages & embeds",
    body: "Embeds, message tools and presentation features.",
    slug: "embed-scripting",
  },
];
export const Route = createFileRoute("/documentation")({
  head: () => ({
    meta: [
      { title: "Docs" },
      {
        name: "description",
        content:
          "Ware setup guides, security documentation, configuration and feature documentation.",
      },
    ],
  }),
  component: DocumentationPage,
});
function DocumentationPage() {
  return (
    <PublicLayout>
      <div className="pub-width">
        <PublicTitle label="Ware / Documentation" title="Get Ware set up.">
          Start with the basics, then find the tools you need for your server.
        </PublicTitle>
        <div className="pub-doc-start">
          <a href="/docs/introduction">
            <span className="pub-label">Start here</span>
            <h2>Your first few commands</h2>
            <p>Adding Ware, the default prefix, and where to go next.</p>
            <span>Read the introduction ↗</span>
          </a>
          <div>
            <h3>Know what you're looking for?</h3>
            <p>Find syntax, examples, aliases, and permissions in the command reference.</p>
            <a className="pub-text-link" href="/commands">
              Browse commands ↗
            </a>
          </div>
        </div>
        <div className="pub-guide-list">
          {guides.map((g) => (
            <a key={g.slug} href={`/docs/${g.slug}`}>
              <h2>{g.title}</h2>
              <p>{g.body}</p>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
