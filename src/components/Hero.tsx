import {
  ArrowRight,
  Check,
  Command,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
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

const commandRows = [
  { command: ",antinuke", result: "Protection enabled", icon: ShieldCheck },
  { command: ",setup", result: "Server configured", icon: Check },
  { command: ",ticket setup", result: "Panel created", icon: Terminal },
];

export function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10 md:pb-32 md:pt-20">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[110px]" />

      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr,0.95fr] lg:gap-20">
        <div className="animate-hero-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            All systems operational
            <span className="h-3 w-px bg-white/10" />
            <span className="text-white/80">1000+ commands</span>
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-6xl md:text-7xl xl:text-[82px]">
            Run your entire
            <br />
            server from{" "}
            <span className="relative whitespace-nowrap text-gradient-accent">
              one bot.
              <span className="absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Protection, moderation, tickets, economy, voice tools, custom embeds,
            and utilities — built into one fast Discord bot with a dashboard
            designed to stay out of your way.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="premium-button group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              <DiscordLogo />
              Invite to Discord
              <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-black/10 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3 w-3" />
              </span>
            </a>

            <a
              href="/docs/commands"
              className="glass-button group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
            >
              <Command className="h-4 w-4" />
              View commands
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-muted-foreground">
            {["Fast setup", "Built-in protection", "One clean toolkit"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full border border-white/10 bg-white/[0.04]">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="relative animate-hero-card-in">
          <div className="absolute -inset-12 -z-10 rounded-full bg-white/[0.04] blur-[80px]" />

          <div className="hero-console relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0c]/85 p-2 shadow-2xl backdrop-blur-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="rounded-[22px] border border-white/[0.07] bg-[#080809]/90">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/5" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    ware / command center
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-1 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </div>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="mb-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05]">
                      <Sparkles className="h-4 w-4" />
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0b0b0c] bg-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">ware is online</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Ready to manage your server.
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Zap className="h-4 w-4 text-white/50" />
                    </div>
                  </div>
                </div>

                {commandRows.map((row, index) => (
                  <div
                    key={row.command}
                    className="console-row group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
                    style={{ animationDelay: `${0.45 + index * 0.14}s` }}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035]">
                      <row.icon className="h-3.5 w-3.5 text-white/70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs text-white/90">
                        {row.command}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {row.result}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                      <Check className="h-3 w-3" />
                      done
                    </div>
                  </div>
                ))}

                <div className="relative mt-4 overflow-hidden rounded-xl border border-white/[0.07] bg-black/40 px-4 py-3">
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/[0.035] to-transparent" />
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="text-white/60">&gt;</span>
                    <span className="type-command">Type a command...</span>
                    <span className="h-4 w-px animate-cursor bg-white/70" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07]">
                {[
                  ["100%", "uptime"],
                  ["1000+", "commands"],
                  ["24/7", "protection"],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 py-4 text-center">
                    <div className="text-sm font-semibold">{value}</div>
                    <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="floating-chip absolute -left-5 top-20 hidden items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-2 text-xs shadow-xl backdrop-blur-xl sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            anti-nuke
          </div>

          <div className="floating-chip-delayed absolute -bottom-5 right-8 hidden items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-2 text-xs shadow-xl backdrop-blur-xl sm:flex">
            <Terminal className="h-3.5 w-3.5" />
            one prefix
          </div>
        </div>
      </div>
    </section>
  );
}
