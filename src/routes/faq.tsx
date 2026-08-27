import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/faq")({ component: FAQPage });

const DISCORD_URL = "https://discord.gg/warebot";

const faqs = [
  ["What is Ware?", "Ware is an all-in-one Discord app built to help communities manage protection, moderation, tickets, utilities, music features, automation, and everyday server tools from one place."],
  ["Is Ware free to use?", "Ware includes features you can use without needing to stack multiple bots. Some features or services may have additional requirements depending on how Ware is configured."],
  ["How do I add Ware to my server?", "Use the Add to Discord option on the Ware website, choose a server you manage, and approve the requested permissions."],
  ["Where can I find Ware commands?", "Open the Commands page to browse Ware's command library by category and search for a specific command, alias, or feature."],
  ["Can I change the command prefix?", "Yes. Ware supports server prefix configuration. Check the Commands page or documentation for the current prefix commands and examples."],
  ["How do I configure Ware for my server?", "Sign in with Discord and open the Dashboard. Select a server you manage to access the available configuration pages and server tools."],
  ["What should I do if a command is not working?", "First check the command syntax, Ware's permissions, and your server configuration. If the issue continues, join the Ware Discord server and ask for support."],
  ["Where can I get support or report a problem?", "Join the official Ware Discord server. The support community can help with setup, commands, dashboard issues, and other Ware questions."],
  ["How do I keep up with Ware updates?", "Use the Ware website and official Discord server for product updates, support information, and announcements."],
] as const;

function FAQPage() {
  return <main className="min-h-screen bg-[#050606] text-white">
    <Navbar />
    <section className="mx-auto max-w-[1120px] px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-20">
      <div className="mb-12 border-b border-white/[.08] pb-10 md:flex md:items-end md:justify-between">
        <div className="max-w-[720px]">
          <div className="mb-5 text-[12px] font-semibold uppercase tracking-[.18em] text-white/38">Help center</div>
          <h1 className="text-[3.25rem] font-bold leading-[.98] tracking-[-.055em] text-white sm:text-6xl">Frequently asked<br/><span className="text-white/45">questions.</span></h1>
          <p className="mt-6 max-w-[650px] text-[16px] leading-7 text-white/52 md:text-[17px]">Quick answers about Ware, commands, setup, the dashboard, and getting support.</p>
        </div>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/[.12] bg-white/[.045] px-4 py-3 text-[14px] font-semibold text-white/85 transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[.08] hover:text-white md:mt-0">Need more help?<ExternalLink className="h-4 w-4"/></a>
      </div>

      <div className="grid gap-3">
        {faqs.map(([question, answer], index) => <details key={question} className="group overflow-hidden rounded-[18px] border border-white/[.08] bg-[#0d0e0e] transition duration-300 open:border-white/[.15] open:bg-[#101111] hover:border-white/[.14]">
          <summary className="flex min-h-[78px] cursor-pointer list-none items-center gap-5 px-5 py-5 sm:px-7 [&::-webkit-details-marker]:hidden">
            <span className="w-7 shrink-0 font-mono text-[11px] text-white/25">{String(index + 1).padStart(2,"0")}</span>
            <span className="flex-1 text-[16px] font-semibold tracking-[-.018em] text-white/88 sm:text-[17px]">{question}</span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[.08] bg-black/25 text-white/45 transition duration-300 group-open:rotate-180 group-open:bg-white/[.06] group-open:text-white"><ChevronDown className="h-4 w-4"/></span>
          </summary>
          <div className="border-t border-white/[.065] px-5 py-5 sm:px-[4.2rem] sm:py-6"><p className="max-w-[820px] text-[14px] leading-7 text-white/52 sm:text-[15px]">{answer}</p></div>
        </details>)}
      </div>

      <div className="mt-10 flex flex-col gap-4 rounded-[22px] border border-white/[.09] bg-gradient-to-r from-white/[.045] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div><div className="text-[17px] font-semibold text-white/90">Still need help?</div><div className="mt-1.5 text-[14px] text-white/42">Talk with the Ware community and support team.</div></div>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90">Join Ware Discord<ExternalLink className="h-4 w-4"/></a>
      </div>
    </section>
    <Footer />
  </main>;
}
