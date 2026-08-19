import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowLeft, RefreshCw, Search, Server, Users, Wifi } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";

const SHARD_COUNT = 5;

const shardData = [
  { id: 0, uptime: "1 day", latency: "14ms", servers: "463", users: "1,500,282", updated: "just now" },
  { id: 1, uptime: "1 day", latency: "14ms", servers: "447", users: "995,623", updated: "just now" },
  { id: 2, uptime: "1 day", latency: "15ms", servers: "504", users: "1,708,702", updated: "15s ago" },
  { id: 3, uptime: "1 day", latency: "16ms", servers: "501", users: "1,640,726", updated: "15s ago" },
  { id: 4, uptime: "1 day", latency: "15ms", servers: "—", users: "—", updated: "15s ago" },
] as const;

function shardForGuildId(guildId: string) {
  try {
    const id = BigInt(guildId.trim());
    if (id <= 0n) return null;
    return Number((id >> 22n) % BigInt(SHARD_COUNT));
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — ware" },
      { name: "description", content: "Ware shard status, latency, server counts, and uptime." },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const [serverId, setServerId] = useState("");
  const [searchedShard, setSearchedShard] = useState<number | null>(null);
  const [error, setError] = useState("");

  const totalServers = useMemo(
    () => shardData.reduce((sum, shard) => sum + (shard.servers === "—" ? 0 : Number(shard.servers.replaceAll(",", ""))), 0),
    [],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    const shard = shardForGuildId(serverId);
    if (shard === null) {
      setError("Enter a valid Discord server ID.");
      setSearchedShard(null);
      return;
    }
    setError("");
    setSearchedShard(shard);
    window.setTimeout(() => {
      document.getElementById(`shard-${shard}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/65">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Ware infrastructure</p>
            <h1 className="mt-1 text-4xl font-bold tracking-[-0.04em] md:text-5xl">Shards</h1>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/45 md:text-base">
          Live shard overview for Ware. Search a Discord server ID to find which shard handles that server.
        </p>

        <form onSubmit={submit} className="mt-8 flex gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 focus-within:border-white/[0.18] focus-within:bg-white/[0.05]">
            <Search className="h-4 w-4 shrink-0 text-white/35" />
            <input
              value={serverId}
              onChange={(event) => setServerId(event.target.value.replace(/\D/g, ""))}
              placeholder="Enter your Server ID"
              inputMode="numeric"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
            />
          </label>
          <button type="submit" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.055] text-white/70 transition-all hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.09] hover:text-white" aria-label="Find shard">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {error && <p className="mt-3 text-xs text-red-300/80">{error}</p>}
        {searchedShard !== null && (
          <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] px-4 py-3 text-sm text-emerald-200/80">
            This server is handled by <span className="font-semibold text-emerald-300">Shard {searchedShard}</span>.
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Current status</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">All shards operational</h2>
          </div>
          <div className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-white/40">
            {SHARD_COUNT} shards · {totalServers.toLocaleString()}+ servers
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {shardData.map((shard) => {
            const highlighted = searchedShard === shard.id;
            return (
              <article
                key={shard.id}
                id={`shard-${shard.id}`}
                className={`scroll-mt-24 overflow-hidden rounded-[26px] border bg-white/[0.025] transition-all duration-300 ${highlighted ? "border-emerald-400/35 shadow-[0_0_0_3px_rgba(74,222,128,.06),0_26px_70px_-50px_rgba(74,222,128,.45)]" : "border-white/[0.08] hover:-translate-y-1 hover:border-white/[0.14]"}`}
              >
                <div className="flex items-start justify-between gap-4 p-5 md:p-6">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">Shard {shard.id}</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/38">
                      <RefreshCw className="h-3.5 w-3.5" /> {shard.updated}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.045] px-3 py-1.5 text-xs text-emerald-300/90">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Operational
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px border-t border-white/[0.07] bg-white/[0.07]">
                  <Stat icon={Activity} label="Uptime" value={shard.uptime} />
                  <Stat icon={Wifi} label="Latency" value={shard.latency} />
                  <Stat icon={Server} label="Servers" value={shard.servers} />
                  <Stat icon={Users} label="Users" value={shard.users} />
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-5 text-white/25">
          Shard status is an infrastructure view. Server and user totals shown here are the current status snapshot configured for this page.
        </p>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="bg-[#0a0a0b] p-5">
      <div className="text-xs text-white/38">{label}</div>
      <div className="mt-2 flex items-center gap-2 text-lg font-medium text-white/88">
        <Icon className="h-4 w-4 text-white/28" /> {value}
      </div>
    </div>
  );
}
