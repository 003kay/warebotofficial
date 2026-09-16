import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const DISCORD_URL = "https://discord.gg/warebot";

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-md bg-white/[.07] px-1.5 py-0.5 font-mono text-[13px] text-white/78">{children}</code>
);

const faqs: Array<{ question: string; answer: ReactNode }> = [
  { question: "What is Stained?", answer: "Stained is a public all-in-one Discord bot built for moderation, security, tickets, utilities, music and Last.fm, automation, server tools, and everyday community management." },
  { question: "Is Stained available for free and public use?", answer: "Yes. Stained can be invited publicly and its core server features are available after you add the bot. Premium-only functionality is kept separate under Stained's Premium commands." },
  { question: "How do I add Stained to my server?", answer: "Use the Add to Discord or Invite button on the Stained website, choose a server where you have Manage Server permission, then approve the permissions Stained requests." },
  { question: "What is Stained's default prefix?", answer: <span>Stained uses a comma by default. For example, use <Code>,help</Code> or <Code>,prefix</Code>.</span> },
  { question: "Can I change the prefix?", answer: <span>Yes. Use Stained's <Code>,prefix</Code> command and prefix settings to change the server prefix. Stained also supports personal-prefix behavior where it is configured.</span> },
  { question: "How do I configure Stained from the dashboard?", answer: <span>Sign in with Discord, choose a server you manage, and open that server's configuration pages. You can also use <Code>,setupdashboard</Code> in Discord to get the dashboard setup link.</span> },
  { question: "Why isn't a command working?", answer: "Check the command syntax, the required permission shown on the Commands page, Stained's role position in the server hierarchy, and the channel permissions. If everything looks correct and it still fails, use the support server." },
  { question: "Does Stained have premium?", answer: <span>Yes. Stained includes Premium commands such as <Code>,premium</Code>, <Code>,premium activate (key)</Code>, and <Code>,premium servers</Code>. For current pricing or premium-key availability, check the Stained support server.</span> },
  { question: "Where can I get support?", answer: <span>Join the official Stained Discord at <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-white/82 underline decoration-white/30 underline-offset-4 transition hover:text-white">stained support server</a> for setup help, bug reports, and questions.</span> },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ" }, { name: "description", content: "Frequently asked questions about Stained." }] }),
  component: FAQPage,
});

function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-[#090a0a] text-white">
      <Navbar />
      <main className="mx-auto max-w-[960px] px-5 pb-28 pt-12 sm:px-7 md:pt-16">
        <h1 className="text-[38px] font-semibold tracking-[-.05em] text-white sm:text-[46px]">Frequently Asked Questions</h1>
        <div className="mt-9 grid gap-3.5">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return <div key={item.question} className={`overflow-hidden rounded-[17px] border transition-colors duration-200 ${isOpen ? "border-white/[.14] bg-[#181919]" : "border-white/[.075] bg-[#141515] hover:border-white/[.13] hover:bg-[#171818]"}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} className="flex min-h-[78px] w-full items-center justify-between gap-6 px-5.5 py-4.5 text-left sm:px-6">
                <span className="text-[16px] font-medium tracking-[-.015em] text-white/88 sm:text-[17px]">{item.question}</span>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border bg-[#101111] transition duration-250 ${isOpen ? "rotate-180 border-white/[.16] text-white/80" : "border-white/[.08] text-white/42"}`}><ChevronDown className="h-4 w-4" /></span>
              </button>
              <div className="grid transition-[grid-template-rows,opacity] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}><div className="overflow-hidden"><div className="border-t border-white/[.065] px-5.5 py-5 text-[14px] leading-[1.75] text-white/52 sm:px-6 sm:text-[15px]">{item.answer}</div></div></div>
            </div>;
          })}
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 rounded-[16px] border border-white/[.07] bg-[#121313] px-5 py-4"><span className="text-[13px] text-white/42">Still need help?</span><a href={DISCORD_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[.11] bg-[#191a1a] px-4 py-2.5 text-[13px] font-medium text-white/76 transition hover:border-white/[.2] hover:bg-[#202121] hover:text-white">Join Stained Discord</a></div>
      </main>
      <Footer />
    </div>
  );
}

