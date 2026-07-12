import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
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
          "Help: https://warebot.xyz\nSupport: https://discord.gg/equip\nAdd: hurtfulol, or ilarpfundss on discord For More Help",
      },
      { property: "og:title", content: "ware — Discord's premier all-in-one app" },
      {
        property: "og:description",
        content:
          "Help: https://warebot.xyz\nSupport: https://discord.gg/equip\nAdd: hurtfulol, or ilarpfundss on discord For More Help",
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
      <Features />
      
      <Footer />
    </div>
  );
}
