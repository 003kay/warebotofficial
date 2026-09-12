import { PublicLayout, PublicTitle } from "@/components/site/PublicLayout";
import { createFileRoute } from "@tanstack/react-router";

import { type ReactNode } from "react";

const DISCORD_URL = "https://discord.gg/warebot";

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-md bg-white/[.07] px-1.5 py-0.5 font-mono text-[13px] text-white/78">
    {children}
  </code>
);

const faqs: Array<{ question: string; answer: ReactNode }> = [
  {
    question: "What is Ware?",
    answer:
      "Ware is a public all-in-one Discord bot built for moderation, security, tickets, utilities, music and Last.fm, automation, server tools, and everyday community management.",
  },
  {
    question: "Is Ware available for free and public use?",
    answer:
      "Yes. Ware can be invited publicly and its core server features are available after you add the bot. Premium-only functionality is kept separate under Ware's Premium commands.",
  },
  {
    question: "How do I add Ware to my server?",
    answer:
      "Use the Add to Discord or Invite button on the Ware website, choose a server where you have Manage Server permission, then approve the permissions Ware requests.",
  },
  {
    question: "What is Ware's default prefix?",
    answer: (
      <span>
        Ware uses a comma by default. For example, use <Code>,help</Code> or <Code>,prefix</Code>.
      </span>
    ),
  },
  {
    question: "Can I change the prefix?",
    answer: (
      <span>
        Yes. Use Ware's <Code>,prefix</Code> command and prefix settings to change the server
        prefix. Ware also supports personal-prefix behavior where it is configured.
      </span>
    ),
  },
  {
    question: "How do I configure Ware from the dashboard?",
    answer: (
      <span>
        Sign in with Discord, choose a server you manage, and open that server's configuration
        pages. You can also use <Code>,setupdashboard</Code> in Discord to get the dashboard setup
        link.
      </span>
    ),
  },
  {
    question: "Why isn't a command working?",
    answer:
      "Check the command syntax, the required permission shown on the Commands page, Ware's role position in the server hierarchy, and the channel permissions. If everything looks correct and it still fails, use the support server.",
  },
  {
    question: "Does Ware have premium?",
    answer: (
      <span>
        Yes. Ware includes Premium commands such as <Code>,premium</Code>,{" "}
        <Code>,premium activate (key)</Code>, and <Code>,premium servers</Code>. For current pricing
        or premium-key availability, check the Ware support server.
      </span>
    ),
  },
  {
    question: "Where can I get support?",
    answer: (
      <span>
        Join the official Ware Discord at{" "}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer"
          className="text-white/82 underline decoration-white/30 underline-offset-4 transition hover:text-white"
        >
          discord.gg/warebot
        </a>{" "}
        for setup help, bug reports, and questions.
      </span>
    ),
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ" },
      { name: "description", content: "Frequently asked questions about Ware." },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <PublicLayout>
      <div className="pub-reading">
        <PublicTitle label="Help / FAQ" title="A few common questions.">
          Adding Ware, setting it up, and getting help when something isn't working.
        </PublicTitle>
        <div className="pub-faq">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <div>{item.answer}</div>
            </details>
          ))}
        </div>
        <p className="pub-help-line">
          Still stuck?{" "}
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">
            Talk to us in the support server ↗
          </a>
        </p>
      </div>
    </PublicLayout>
  );
}
