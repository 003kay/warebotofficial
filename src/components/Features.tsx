import {
  ArrowRight,
  ArrowUpRight,
  Crown,
  MessageSquare,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Protection",
    body: "Anti-nuke, anti-raid, logging, moderation, and automated safeguards built to react before damage spreads.",
    detail: "Security commands",
  },
  {
    icon: MessageSquare,
    number: "02",
    title: "Tickets & embeds",
    body: "Build clean support panels, custom embeds, dropdown flows, transcripts, and staff tools without stacking multiple bots.",
    detail: "Support commands",
  },
  {
    icon: Crown,
    number: "03",
    title: "Boost perks",
    body: "Reward boosters with automated roles, vanity rewards, exclusive channels, and server-specific benefits.",
    detail: "Booster commands",
  },
  {
    icon: Users,
    number: "04",
    title: "Roles & community",
    body: "Self roles, reaction roles, level rewards, permission tools, member utilities, and community management.",
    detail: "Community commands",
  },
  {
    icon: Zap,
    number: "05",
    title: "Utilities",
    body: "Giveaways, reminders, AFK, starboard, voice tools, economy, and the everyday commands your members expect.",
    detail: "Utility commands",
  },
] as const;

export function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-8 md:px-10 md:pb-36">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px w-7 bg-white/20" />
            Explore the toolkit
          </div>
          <h2 className="text-4xl font-bold tracking-[-0.05em] md:text-6xl">
            One bot.
            <br />
            <span className="text-white/45">Every major system.</span>
          </h2>
        </div>
        <div className="max-w-sm">
          <p className="text-sm leading-6 text-muted-foreground">
            Stained replaces the pile of single-purpose bots with one cohesive
            command system. Pick a category and jump straight into the command library.
          </p>
          <a
            href="/docs/commands"
            className="group mt-4 inline-flex items-center gap-2 text-xs font-medium text-white/65 transition-colors hover:text-white"
          >
            Browse every command
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {features.map((feature, index) => {
          const span =
            index < 2
              ? "lg:col-span-3"
              : index === 4
                ? "md:col-span-2 lg:col-span-2"
                : "lg:col-span-2";

          return (
            <a
              key={feature.title}
              href="/docs/commands"
              className={`group relative min-h-[260px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[0.16] ${span}`}
            >
              <div className="feature-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.025] blur-3xl transition-all duration-700 group-hover:bg-white/[0.07]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:bg-white/[0.08]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-white/25">
                      {feature.number}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
                  </div>
                </div>

                <div className="mt-auto pt-12">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {feature.body}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] text-white/35 transition-colors group-hover:text-white/65">
                    <span className="h-px w-5 bg-white/15 transition-all duration-300 group-hover:w-8 group-hover:bg-white/35" />
                    {feature.detail}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <a
        href="/docs/commands"
        className="group mt-4 flex items-center justify-between rounded-[22px] border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-sm text-white/65 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.045] hover:text-white md:px-6"
      >
        <span>Not sure where to start? Open the full command directory.</span>
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </section>
  );
}

