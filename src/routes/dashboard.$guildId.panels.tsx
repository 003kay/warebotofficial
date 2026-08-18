import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Edit3, Hash, LayoutPanelTop, Plus, Search } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/$guildId/panels")({
  head: () => ({ meta: [{ title: "Panels — ware dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: PanelsPage,
});

function PanelsPage() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const panel = data.panel as Record<string, unknown> | null;
  const channelId =
    panel && typeof panel.channel_id === "string" ? panel.channel_id : "";
  const channel = data.textChannels.find((c) => c.id === channelId);

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="panels">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Panels
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the ticket panel currently connected to this server.
            </p>
          </div>

          <div className="text-3xl font-semibold tracking-tight text-muted-foreground">
            {panel ? "1" : "0"} <span className="text-white">/ 1 Panel</span>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              disabled
              placeholder="Search panels..."
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Link
            to="/dashboard/$guildId/tickets"
            params={{ guildId }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            {panel ? "Edit Panel" : "Create Panel"}
          </Link>
        </div>

        <div className="mt-6">
          {panel ? (
            <article className="max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs">
                    {typeof panel.panel_type === "string" && panel.panel_type === "dropdown"
                      ? "Dropdown Panel"
                      : "Button Panel"}
                  </span>
                  {channel && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      {channel.name}
                    </span>
                  )}
                </div>

                <Link
                  to="/dashboard/$guildId/tickets"
                  params={{ guildId }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/[0.05]"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </div>

              <div className="p-5">
                <div className="rounded-xl border border-white/10 bg-[#101010] p-4">
                  <div className="flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                      W
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        ware <span className="text-xs text-muted-foreground">APP</span>
                      </div>

                      <div className="mt-2 rounded-lg border-l-4 border-white/30 bg-white/[0.035] p-3">
                        <div className="font-semibold">
                          {typeof panel.title === "string" ? panel.title : "Support"}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {typeof panel.description === "string"
                            ? panel.description
                            : "Click below to open a ticket."}
                        </p>
                      </div>

                      <div className="mt-2 inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black">
                        {typeof panel.button_emoji === "string"
                          ? panel.button_emoji
                          : "🎫"}{" "}
                        {typeof panel.button_label === "string"
                          ? panel.button_label
                          : "Open Ticket"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-5 py-3 text-xs text-muted-foreground">
                Ware currently supports one live ticket panel per guild. Multi-panel
                support is the next backend phase.
              </div>
            </article>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
              <LayoutPanelTop className="mx-auto h-9 w-9 text-muted-foreground" />
              <h2 className="mt-3 text-lg font-semibold">No Panels Created Yet</h2>
              <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">
                Create your first ticket panel and publish it to a Discord channel.
              </p>
              <Link
                to="/dashboard/$guildId/tickets"
                params={{ guildId }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
              >
                <Plus className="h-4 w-4" />
                Create Panel
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
