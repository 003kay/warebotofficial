import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ware" },
      { name: "description", content: "How the ware Discord bot and warebot.xyz collect, use, and protect your data." },
      { property: "og:title", content: "Privacy Policy — ware" },
      { property: "og:description", content: "How the ware Discord bot and warebot.xyz collect, use, and protect your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-10">
        <p className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Home</Link>
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 12, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
            <p className="mt-2">To run the bot and the dashboard, we store:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Your Discord user ID, username, and avatar (from Discord OAuth)</li>
              <li>Server IDs, channel IDs, and role IDs for the servers where ware is used</li>
              <li>Server configuration you create (prefixes, welcome messages, ticket panels, moderation settings)</li>
              <li>Moderation history — cases, warns, mutes, bans issued through ware</li>
              <li>Economy state — balances, inventories, and game progress</li>
              <li>OAuth access and refresh tokens for signing you back in to the dashboard</li>
              <li>Basic request logs (IP, timestamp, path) for abuse prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">What we don't collect</h2>
            <p className="mt-2">
              ware does not store the contents of your normal Discord messages. Message
              content is only processed transiently — for example, to check a command, run
              automod filters, or build a moderation log entry — and is not retained.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">How we use it</h2>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Run bot commands and enforce your server's configuration</li>
              <li>Show your servers on the dashboard and let you edit settings</li>
              <li>Detect abuse, raids, and bot spam</li>
              <li>Debug issues and improve the service</li>
            </ul>
            <p className="mt-2">We never sell your data or share it with advertisers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
            <p className="mt-2">
              warebot.xyz uses a single httpOnly session cookie to keep you signed in after
              you complete Discord OAuth. It is not used for tracking across other sites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Data retention</h2>
            <p className="mt-2">
              Server config and moderation history are kept for as long as ware is in your
              server. If ware is removed, related data becomes inactive and is periodically
              cleaned up. You can request full deletion at any time by joining the support
              server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Third parties</h2>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Discord — every command and OAuth flow goes through Discord's API</li>
              <li>Our hosting and database provider, which stores the data described above</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
            <p className="mt-2">
              You can ask us to export or delete your personal data at any time. Sign out
              of the dashboard to clear the session cookie. Removing ware from your server
              stops any further collection tied to that server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              For privacy requests, message the team in the support server at{" "}
              <a href="https://discord.gg/equip" className="text-foreground underline" target="_blank" rel="noreferrer">
                discord.gg/equip
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
