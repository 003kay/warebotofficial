import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ware" },
      { name: "description", content: "The terms governing your use of the ware Discord bot and warebot.xyz." },
      { property: "og:title", content: "Terms of Service — ware" },
      { property: "og:description", content: "The terms governing your use of the ware Discord bot and warebot.xyz." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-10">
        <p className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Home</Link>
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 12, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance</h2>
            <p className="mt-2">
              By adding ware to your Discord server, using its commands, or signing in to
              warebot.xyz, you agree to these Terms of Service. If you do not agree, remove
              ware from your servers and stop using the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Eligibility</h2>
            <p className="mt-2">
              You must be at least 13 years old (or the minimum age required by Discord in
              your country) to use ware. Server administrators are responsible for the
              members and content in their servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Acceptable use</h2>
            <p className="mt-2">You agree not to use ware to:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Break Discord's Terms of Service or Community Guidelines</li>
              <li>Harass, dox, or target other users or communities</li>
              <li>Distribute illegal content, malware, or invite-link spam</li>
              <li>Abuse rate limits, resell access, or attempt to reverse-engineer the bot</li>
              <li>Use moderation tools against members you don't have authority over</li>
            </ul>
            <p className="mt-2">
              We may blacklist users or servers that violate these rules without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Availability</h2>
            <p className="mt-2">
              ware is provided as-is. While we work hard to keep uptime high, we don't
              guarantee the service will be uninterrupted, error-free, or that any specific
              feature will remain available. Premium features may change over time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Content in your server</h2>
            <p className="mt-2">
              You own the content posted in your Discord servers. By using ware you grant us
              permission to process that content solely so the bot can respond to commands
              and enforce the settings your server has configured.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Termination</h2>
            <p className="mt-2">
              You can stop using ware at any time by removing it from your server. We can
              suspend or terminate access to ware, warebot.xyz, or any specific feature at
              any time and for any reason.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Changes</h2>
            <p className="mt-2">
              We may update these terms as ware evolves. Meaningful changes will be
              announced in the official support server. Continued use after changes means
              you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
            <p className="mt-2">
              Questions? Join the support server at{" "}
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
