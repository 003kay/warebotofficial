import { ArrowRight, Crown, Users, ShieldCheck, Heart } from "lucide-react";
import { FeaturePill } from "./FeaturePill";
import { INVITE_URL } from "@/lib/links";

function DiscordLogo() {
  return (
    <svg
      viewBox="0 0 127.14 96.36"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 md:grid-cols-2 md:px-10 md:pb-32 md:pt-24">
      <div>
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          Run your entire server from{" "}
          <span className="text-gradient-accent">one bot.</span>
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
          ware bundles protection, economy, voice tools, custom embeds, and AI
          into a single prefix system with a dashboard you'll actually open —
          without stitching seven different bots together.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] hover:bg-white/5"
          >
            <DiscordLogo />
            Invite to Discord
          </a>
          <a
            href="/docs/commands"
            className="pill-surface group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
          >
            View commands
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-white/5 pt-6">
          <div>
            <div className="text-2xl font-semibold tracking-tight">100%</div>
            <div className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">1000+</div>
            <div className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Commands</div>
          </div>
        </div>
      </div>

      <div className="relative min-h-[420px]">
        <FeaturePill
          icon={<Crown className="h-3 w-3" />}
          label="boost perks"
          className="absolute left-4 top-4 animate-float-slow"
        />
        <FeaturePill
          icon={<ShieldCheck className="h-3 w-3" />}
          label="vanity rewards"
          className="absolute right-2 top-24 animate-float-slower"
        />
        <FeaturePill
          icon={<Users className="h-3 w-3" />}
          label="role features"
          className="absolute left-8 bottom-8 animate-float-slower"
        />
        <FeaturePill
          icon={<Heart className="h-3 w-3" />}
          label="Made by @003kay"
          className="absolute right-6 bottom-16 animate-float-slow"
        />
      </div>
    </section>
  );
}
