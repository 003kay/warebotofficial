import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/logging")({
  head: () => ({ meta: [{ title: "Logging — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.logging as Record<string, unknown>) ?? { enabled: true, moderationChannelId: "", memberChannelId: "", messageChannelId: "", ticketChannelId: "", includeIds: true });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="logging" eyebrow="Configuration" title="Logging" description="Route Ware events into dedicated Discord channels. Ticket close logs can include the authenticated View Transcript button." section="logging" initial={initial} fields={[
    { key: "enabled", label: "Enable logging", description: "Allow Ware to post configured audit events.", type: "toggle" },
    { key: "moderationChannelId", label: "Moderation log channel ID", type: "text", placeholder: "Channel ID" },
    { key: "memberChannelId", label: "Member log channel ID", description: "Joins, leaves and member updates.", type: "text", placeholder: "Channel ID" },
    { key: "messageChannelId", label: "Message log channel ID", description: "Deleted and edited message events.", type: "text", placeholder: "Channel ID" },
    { key: "ticketChannelId", label: "Ticket log channel ID", description: "Closed ticket summaries and transcript links.", type: "text", placeholder: "Channel ID" },
    { key: "includeIds", label: "Include Discord IDs", description: "Include user/channel IDs in detailed logs.", type: "toggle" },
  ]} />;
}
