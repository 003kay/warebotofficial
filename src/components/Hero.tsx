import { Sparkles, ArrowRight, Crown, Users, ShieldCheck } from "lucide-react";
import { FeaturePill } from "./FeaturePill";
import { INVITE_URL } from "@/lib/links";

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 md:grid-cols-2 md:px-10 md:pb-32 md:pt-24">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
          100% uptime — all systems operational
        </div>
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          One bot. Every module your server actually runs on.
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
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Invite to Discord
          </a>
          <a
            href="/docs"
            className="pill-surface group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
          >
            View docs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/5 pt-6">
          <div>
            <div className="text-2xl font-semibold tracking-tight">100%</div>
            <div className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">200+</div>
            <div className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Commands</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">14k+</div>
            <div className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">Servers</div>
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

        <div
          className="pointer-events-none absolute inset-x-10 top-1/2 -z-10 h-72 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.55 0.2 265 / 0.5), transparent)",
          }}
          aria-hidden
        />
      </div>
    </section>
  );
}
