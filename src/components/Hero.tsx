import { Sparkles, ArrowRight, Crown, Users, ShieldCheck } from "lucide-react";
import { FeaturePill } from "./FeaturePill";
import { INVITE_URL } from "@/lib/links";

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 md:grid-cols-2 md:px-10 md:pb-32 md:pt-24">
      <div>
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          Ware is Discord's all in one app
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
          Meet the leading bot for management and engagement. Built to elevate
          your community's experience, streamline server operations, and unlock
          premium tools for every necessity.
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
