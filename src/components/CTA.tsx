import { Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32 md:px-10">
      <div className="pill-surface relative overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, oklch(0.55 0.2 265 / 0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <h2 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
          <span className="text-gradient-hero">Ready to </span>
          <span className="text-gradient-accent italic">elevate</span>
          <span className="text-gradient-hero"> your server?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Add ware in seconds. No credit card, no setup wizard — just plug it in
          and configure what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Invite to Discord
          </a>
          <a
            href="#"
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
