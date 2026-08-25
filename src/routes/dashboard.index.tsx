import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";
import { getManagedGuildsFn } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ware" }] }),
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["managedGuilds"],
      queryFn: () => getManagedGuildsFn(),
    });
    if (!data.authenticated) {
      throw redirect({ href: "https://www.warebot.xyz/auth/discord/login" as never });
    }
    return null;
  },
  component: DashboardIndex,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      Failed to load servers: {error.message}
    </div>
  ),
});

function DashboardIndex() {
  const { data } = useSuspenseQuery({
    queryKey: ["managedGuilds"],
    queryFn: () => getManagedGuildsFn(),
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Your servers</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a server you manage to configure Ware. Only servers where you have Manage Server or
            Administrator are shown.
          </p>
        </div>

        {data.guilds.length === 0 ? (
          <div className="pill-surface rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">
              You don't manage any Discord servers. Create one or ask an admin to give you Manage
              Server permissions.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.guilds.map((g) => (
              <div key={g.id} className="pill-surface flex flex-col gap-3 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  {g.iconUrl ? (
                    <img src={g.iconUrl} alt="" className="h-14 w-14 rounded-2xl" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{g.name}</div>
                    <div className="text-xs text-muted-foreground">{g.owner ? "Owner" : "Manager"}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/dashboard/$guildId/tickets" params={{ guildId: g.id }} className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-center text-xs hover:bg-white/[0.06]">Tickets</Link>
                  <Link to="/dashboard/$guildId/security" params={{ guildId: g.id }} className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-center text-xs hover:bg-white/[0.06]">Security</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
