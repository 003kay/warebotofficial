import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

const WARE_LOGO = "/favicon.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ware" },
      {
        name: "description",
        content: "@003kay on instagram\nhttps://discord.gg/GEMMS5pxQs",
      },
      {
        property: "og:title",
        content: "Run your entire server from one bot.",
      },
      {
        property: "og:description",
        content: "@003kay on instagram\nhttps://discord.gg/GEMMS5pxQs",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: WARE_LOGO },
      { rel: "shortcut icon", type: "image/svg+xml", href: WARE_LOGO },
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
