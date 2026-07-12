import { commandCategories } from "@/lib/commands";

export interface DocSection {
  title: string;
  items: { label: string; slug: string }[];
}

export const docSections: DocSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Introduction", slug: "introduction" },
      { label: "Donator Perks", slug: "donator-perks" },
      { label: "FAQ", slug: "faq" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Security Setup", slug: "security-setup" },
      { label: "Server Configuration", slug: "server-configuration" },
      { label: "Integrations", slug: "integrations" },
      { label: "Embed Scripting", slug: "embed-scripting" },
    ],
  },
  {
    title: "Commands",
    items: [
      { label: "All Commands", slug: "commands" },
      ...commandCategories.map((c) => ({
        label: c.name,
        slug: `commands-${c.slug}`,
      })),
    ],
  },
];
