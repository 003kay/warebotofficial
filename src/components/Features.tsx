import { Crown, ShieldCheck, Users, MessageSquare, Zap } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "Boost perks",
    body: "Reward server boosters with automated roles, custom vanities, and premium-only channels.",
  },
  {
    icon: ShieldCheck,
    title: "Moderation",
    body: "Powerful anti-nuke, anti-raid, and logging systems keep your community safe around the clock.",
  },
  {
    icon: Users,
    title: "Role features",
    body: "Reaction roles, level roles, and self-assignable menus that keep members engaged.",
  },
  {
    icon: MessageSquare,
    title: "Custom commands",
    body: "Design your own commands with variables, embeds, and per-role permissions.",
  },
  {
    icon: Zap,
    title: "Utilities",
    body: "AFK, reminders, tickets, giveaways, starboard — every essential in one clean toolkit.",
  },
] as const;


export function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32 md:px-10">
      <div className="mb-14 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          / features
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Every tool your server actually needs.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="pill-surface group relative overflow-hidden rounded-2xl p-6 transition-transform hover:-translate-y-0.5"
          >
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
