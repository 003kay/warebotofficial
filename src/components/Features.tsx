import {
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
    detail: "Always watching",
  },
  {
    icon: MessageSquare,
    number: "02",
    title: "Tickets & embeds",
    body: "Build clean support panels, custom embeds, dropdown flows, and staff tools without stacking multiple bots.",
    detail: "Built for support",
  },
  {
    icon: Crown,
    number: "03",
    title: "Boost perks",
    body: "Reward boosters with automated roles, vanity rewards, exclusive channels, and server-specific benefits.",
    detail: "Reward members",
  },
  {
    icon: Users,
    number: "04",
    title: "Role features",
    body: "Self roles, reaction roles, level rewards, permission tools, and role utilities from one command system.",
    detail: "Less manual work",
  },
  {
    icon: Zap,
    number: "05",
    title: "Utilities",
    body: "Giveaways, reminders, AFK, starboard, voice tools, economy, and the everyday commands your members expect.",
    detail: "1000+ commands",
  },
] as const;

export function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-8 md:px-10 md:pb-36">
      <div className="feature-heading-reveal mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px w-7 bg-white/20" />
            Everything in one place
          </div>
          <h2 className="text-4xl font-bold tracking-[-0.045em] md:text-6xl">
            Less bot clutter.
            <br />
            <span className="text-white/45">More control.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Ware replaces the pile of single-purpose bots with one cohesive
          system that feels fast, consistent, and easy to manage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {features.map((feature, index) => {
          const wide = index === 0 || index === 1;
          const span =
            index < 2
              ? "lg:col-span-3"
              : index === 4
                ? "md:col-span-2 lg:col-span-2"
                : "lg:col-span-2";

          return (
            <article
              key={feature.title}
              className={`modern-feature-card group relative min-h-[250px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6 ${span}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="feature-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.025] blur-3xl transition-all duration-700 group-hover:bg-white/[0.055]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:bg-white/[0.08]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-white/25">
                      {feature.number}
                    </span>
                    <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 text-white/20 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                </div>

                <div className="mt-auto pt-12">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {feature.body}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] text-white/35">
                    <span className="h-px w-5 bg-white/15 transition-all duration-300 group-hover:w-8 group-hover:bg-white/35" />
                    {feature.detail}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
