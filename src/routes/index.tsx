import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Run your entire server from one bot." },
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
