import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

const WARE_LOGO = "/stained-logo.png?v=1";
const WARE_FAVICON = "/stained-logo.png?v=1";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "stained" },
      { name: "description", content: "Protection, moderation, tickets, music, utilities and more — powered by Stained." },
      { property: "og:title", content: "Run your entire server from one bot." },
      { property: "og:description", content: "Protection, moderation, tickets, music, utilities and more — powered by Stained." },
      { property: "og:image", content: WARE_LOGO },
    ],
    links: [
      { rel: "icon", type: "image/png", href: WARE_FAVICON },
      { rel: "shortcut icon", type: "image/png", href: WARE_FAVICON },
      { rel: "apple-touch-icon", href: WARE_LOGO },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="page-ambient pointer-events-none fixed inset-0" />
      <Starfield />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Footer />
    </div>
  );
}

