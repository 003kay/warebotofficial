import { PublicLayout } from "@/components/site/PublicLayout";
import { INVITE_URL } from "@/lib/links";
import { createFileRoute } from "@tanstack/react-router";

const WARE_LOGO = "/ware-logo.svg?v=4";
const WARE_FAVICON = "/favicon.svg?v=4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ware" },
      {
        name: "description",
        content: "Protection, moderation, tickets, music, utilities and more — powered by Ware.",
      },
      { property: "og:title", content: "Run your entire server from one bot." },
      {
        property: "og:description",
        content: "Protection, moderation, tickets, music, utilities and more — powered by Ware.",
      },
      { property: "og:image", content: WARE_LOGO },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: WARE_FAVICON },
      { rel: "shortcut icon", type: "image/svg+xml", href: WARE_FAVICON },
      { rel: "apple-touch-icon", href: WARE_LOGO },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PublicLayout className="pub-home">
      <section className="pub-hero pub-width">
        <p className="pub-label">Ware / Discord bot</p>
        <h1>
          Your server.
          <br />
          <span>Your rules.</span>
        </h1>
        <div className="pub-hero-bottom">
          <p>
            Keep the peace. Set up support. Make the place your own. Ware handles moderation,
            tickets, music, and the everyday jobs behind your Discord server.
          </p>
          <div className="pub-actions">
            <a className="pub-button" href={INVITE_URL} target="_blank" rel="noreferrer">
              Add to Discord ↗
            </a>
            <a className="pub-text-link" href="/commands">
              See the commands
            </a>
          </div>
        </div>
      </section>
      <section className="pub-width pub-overview">
        <div>
          <p className="pub-label">Built for the day to day</p>
          <h2>
            Less admin.
            <br />
            More community.
          </h2>
          <p>Start with what your server needs. Configure the rest when you're ready.</p>
        </div>
        <div className="pub-feature-list">
          {[
            [
              "01",
              "Keep things in order",
              "Moderation, antinuke, and logging tools for your staff.",
              "/docs/security-setup",
            ],
            [
              "02",
              "Give people a place to ask",
              "Ticket panels and support tools that fit your server.",
              "/docs/server-configuration",
            ],
            [
              "03",
              "Make it feel like yours",
              "Roles, messages, and embeds for the way your community works.",
              "/embeds",
            ],
            [
              "04",
              "Keep the conversation going",
              "Music, Last.fm, and the commands people come back for.",
              "/commands",
            ],
          ].map(([num, title, body, href]) => (
            <a href={href} key={num}>
              <span className="pub-number">{num}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
      <section className="pub-width pub-start">
        <p className="pub-label">Getting started</p>
        <h2>
          In your server.
          <br />
          In a few steps.
        </h2>
        <ol>
          <li>
            <span>01</span>
            <h3>Invite Ware</h3>
            <p>Choose a server you manage and review the requested permissions.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Try a command</h3>
            <p>
              Type <code>,help</code> in Discord. The default prefix is a comma.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>Set things up</h3>
            <p>
              Open the <a href="/auth/discord/login">dashboard</a> or follow the{" "}
              <a href="/documentation">setup guides</a>.
            </p>
          </li>
        </ol>
      </section>
    </PublicLayout>
  );
}
