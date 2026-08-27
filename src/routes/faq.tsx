import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const DISCORD_URL = "https://discord.gg/warebot";

const faqs = [
  ["What is Ware?", "Ware is an all-in-one Discord app for moderation, protection, tickets, utilities, music, automation, and everyday server management."],
  ["Is Ware free to use?", "Ware is public and includes core features you can use without stacking multiple bots."],
  ["How do I add Ware to my server?", "Use the Add to Discord button on the Ware website, choose a server you manage, and approve the requested permissions."],
  ["What is Ware's command prefix?", "Ware uses a comma prefix by default. Server owners can configure the prefix for their server."],
  ["How do I configure Ware?", "Use Ware's commands and dashboard tools to configure the features available for your server."],
  ["What should I do if a command is not working?", "Check the command syntax, Ware's role position, required permissions, and your server settings. If it still does not work, contact support."],
  ["What permissions does Ware need?", "Permissions depend on the feature. Moderation and security features need the relevant Discord permissions to manage members, roles, channels, and messages."],
  ["Where can I get support?", "Join the official Ware Discord server for setup help, bug reports, and questions."],
  ["Where are Ware updates posted?", "Updates and announcements are posted through the Ware website and official Discord server."],
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Ware" }, { name: "description", content: "Frequently asked questions about Ware." }] }),
  component: FAQPage,
});

function FAQPage() {
  return <div className="min-h-screen bg-[#080808] text-white">
    <Navbar />
    <main className="mx-auto max-w-[980px] px-6 pb-28 pt-14 md:px-10 md:pt-20">
      <h1 className="text-4xl font-bold tracking-[-.045em] text-white sm:text-5xl md:text-6xl">Frequently Asked Questions</h1>

      <div className="mt-10 border-t border-white/[.08]">
        {faqs.map(([question, answer]) => <details key={question} className="group border-b border-white/[.08]">
          <summary className="flex min-h-[78px] cursor-pointer list-none items-center justify-between gap-6 px-1 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="text-[16px] font-medium tracking-[-.015em] text-white/90 sm:text-[17px]">{question}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/38 transition-transform duration-200 group-open:rotate-180 group-open:text-white/72" />
          </summary>
          <div className="pb-6 pr-10 text-[14px] leading-7 text-white/48 sm:text-[15px]">{answer}</div>
        </details>)}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/[.08] pt-7">
        <span className="text-sm text-white/42">Still need help?</span>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[.12] bg-[#121212] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-[#181818] hover:text-white">Join Ware Discord</a>
      </div>
    </main>
    <Footer />
  </div>;
}
