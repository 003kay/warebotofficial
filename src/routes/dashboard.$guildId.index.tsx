import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Hash,
  LayoutPanelTop,
  PanelsTopLeft,
  ShieldCheck,
  Users,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel } from "@/lib/dashboard.functions";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$guildId/")({
  head: () => ({ meta: [{ title: "Server Dashboard — ware" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: GuildDashboardHome,
});

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Hash;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const panel = data.panel as Record<string, unknown> | null;
  const panelType =
    panel && typeof panel.panel_type === "string" ? panel.panel_type : "Not configured";
  const supportRoles = Array.isArray(panel?.support_role_ids)
    ? panel.support_role_ids.length
    : 0;

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="home">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of Ware's ticket configuration for this Discord server.
            </p>
          </div>

          <Link
            to="/dashboard/$guildId/tickets"
            params={{ guildId }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
          >
            <LayoutPanelTop className="h-4 w-4" />
            Open Panel Designer
          </Link>
        </div>

        {!data.botInGuild && (
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4 text-sm text-amber-200">
            Ware is not currently available in this server. Invite the bot before
            configuring channels and roles.
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Panel Status"
            value={panel ? "Configured" : "Not Set"}
            hint={panel ? "A saved ticket panel exists." : "Create your first ticket panel."}
            icon={panel ? CheckCircle2 : PanelsTopLeft}
          />
          <MetricCard
            label="Panel Type"
            value={panelType === "dropdown" ? "Dropdown" : panelType === "button" ? "Button" : "—"}
            hint="Current ticket opening interaction."
            icon={LayoutPanelTop}
          />
          <MetricCard
            label="Support Roles"
            value={supportRoles}
            hint={`${data.roles.length} selectable server roles loaded.`}
            icon={Users}
          />
          <MetricCard
            label="Discord Channels"
            value={data.textChannels.length}
            hint={`${data.categories.length} channel categories available.`}
            icon={Hash}
          />
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1.25fr,0.75fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-semibold">Ticket System</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your live ticket panel configuration and quick actions.
              </p>
            </div>

            <div className="p-5">
              {panel ? (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {typeof panel.title === "string" ? panel.title : "Support"}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {typeof panel.description === "string"
                          ? panel.description
                          : "Ticket panel"}
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1 text-xs text-emerald-300">
                      Saved
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to="/dashboard/$guildId/panels"
                      params={{ guildId }}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/[0.05]"
                    >
                      View Panels
                    </Link>
                    <Link
                      to="/dashboard/$guildId/tickets"
                      params={{ guildId }}
                      className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
                    >
                      Edit Panel
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <PanelsTopLeft className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div className="mt-3 font-semibold">No ticket panel yet</div>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    Open the Panel Designer to create the message your members use
                    to open support tickets.
                  </p>
                  <Link
                    to="/dashboard/$guildId/tickets"
                    params={{ guildId }}
                    className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                  >
                    Create Panel
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="font-semibold">Configuration Health</h2>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Ware in server", data.botInGuild],
                ["Panel saved", Boolean(panel)],
                ["Panel channel selected", Boolean(panel?.channel_id)],
                ["Support role configured", supportRoles > 0],
                ["Log channel configured", Boolean(panel?.log_channel_id)],
              ].map(([label, ok]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
                >
                  <span className="text-muted-foreground">{String(label)}</span>
                  <span className={ok ? "text-emerald-400" : "text-muted-foreground"}>
                    {ok ? "Ready" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
