import { PublicLayout } from "@/components/site/PublicLayout";
import { createFileRoute, Link } from "@tanstack/react-router";
const UPDATED = "August 19th 2026 3:19 PM";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ware" },
      {
        name: "description",
        content:
          "How Ware collects, uses, stores, and protects information across the Discord bot and warebot.xyz.",
      },
      { property: "og:title", content: "Privacy Policy — ware" },
    ],
  }),
  component: PrivacyPage,
});
function PrivacyPage() {
  return (
    <PublicLayout className="pub-legal">
      <article className="pub-legal-article">
        <div className="pub-legal-date">
          <span className="font-semibold text-white">Last updated:</span> {UPDATED}
        </div>
        <p className="text-base text-white/80">
          <Link to="/" className="transition hover:text-white">
            ← Home
          </Link>
        </p>
        <h1 className="pub-legal-title">Privacy Policy</h1>
        <p className="pub-legal-intro">
          This Policy describes information handled when you use the Ware Discord bot, warebot.xyz,
          the dashboard, commands, moderation and security features, and related services.
        </p>
        <div className="pub-legal-body">
          <section>
            <h2 className="pub-clause-title">Information we process</h2>
            <p className="mt-2">
              Depending on the features you use, Ware may process Discord user identifiers and
              profile information supplied through Discord; guild, channel, message, role, emoji,
              webhook, and permission identifiers; server configuration; command interactions;
              moderation and security records; ticket and panel configuration; feature settings; and
              other information required to perform a requested function.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Dashboard and authentication</h2>
            <p className="mt-2">
              When you sign in through Discord OAuth, Ware receives information authorized by the
              OAuth scopes used for sign-in and server management. Authentication credentials or
              tokens required to maintain an authorized session may be stored securely for the
              period needed to provide that session and related dashboard functionality.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Message content</h2>
            <p className="mt-2">
              Ware may process message content when a feature requires it, such as commands,
              automod, anti-spam, moderation, logging, tickets, message utilities, or other
              configured server features. Ware does not use ordinary Discord conversations for
              advertising. Information may be retained when a specific feature requires a record,
              such as a moderation case, ticket, configured message, or security event.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Technical information</h2>
            <p className="mt-2">
              Our website and infrastructure may process technical information such as IP address,
              request time, route, browser or device information, error information, session
              identifiers, and security logs. This information is used to operate, secure, diagnose,
              and protect the service.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">How information is used</h2>
            <p className="mt-2">
              We use information to execute commands; authenticate dashboard users; display and
              modify authorized server settings; provide moderation, ticketing, role, logging,
              automation, security, and other bot features; prevent abuse and raids; investigate
              technical or security problems; maintain service integrity; and improve Ware.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Cookies and sessions</h2>
            <p className="mt-2">
              warebot.xyz may use session cookies or similar storage required for authentication,
              security, preferences, and core site functionality. We do not use this information to
              sell advertising profiles.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Sharing and service providers</h2>
            <p className="mt-2">
              Information may be processed by Discord and by infrastructure providers necessary to
              host Ware, operate databases, deliver the website, monitor reliability, or secure the
              service. We may also disclose information when required by law or when reasonably
              necessary to protect users, Ware, or our systems. Ware does not sell personal
              information to advertisers.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Retention</h2>
            <p className="mt-2">
              Retention depends on the type of data and feature. Configuration and operational
              records may remain while needed to provide the service. Security, moderation, or
              diagnostic records may be retained for legitimate operational, abuse-prevention, or
              legal purposes. Data that is no longer reasonably required may be deleted or
              de-identified.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Data security</h2>
            <p className="mt-2">
              We use reasonable technical and organizational safeguards designed to protect
              information handled by Ware. No online system can guarantee absolute security, so
              users and server administrators should also protect their Discord accounts,
              permissions, credentials, and authorized integrations.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Your choices and requests</h2>
            <p className="mt-2">
              You can stop future server-level use by removing Ware from a server and can end a
              dashboard session by signing out. Requests concerning access, correction, or deletion
              of data associated with Ware can be submitted to the Ware team. Some records may need
              to be retained when required for security, legal, fraud-prevention, or operational
              reasons.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Children</h2>
            <p className="mt-2">
              Ware is intended only for users who satisfy Discord's applicable minimum age
              requirements. We do not knowingly provide the service to users who are not permitted
              to use Discord.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Policy changes</h2>
            <p className="mt-2">
              We may update this Policy as Ware's functionality or data practices change. The
              timestamp at the top identifies the current version.
            </p>
          </section>
          <section>
            <h2 className="pub-clause-title">Contact</h2>
            <p className="mt-2">
              Privacy questions and data requests can be directed to the Ware team through the
              official support server.
            </p>
          </section>
        </div>
      </article>
    </PublicLayout>
  );
}
