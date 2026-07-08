import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Features } from "@/components/Features";

import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ware — Discord's premier all-in-one app" },
      {
        name: "description",
        content:
          "ware is the leading Discord bot for management and engagement — boost perks, vanity rewards, social feeds, roles, and moderation in one polished toolkit.",
      },
      { property: "og:title", content: "ware — Discord's premier all-in-one app" },
      {
        property: "og:description",
        content:
          "The leading Discord bot for management and engagement. Boost perks, vanity rewards, social feeds, roles, and moderation.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      
      <Footer />
    </div>
  );
}
