import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/webhooks")({
  head: () => ({ meta: [{ title: "Webhooks — Stained Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.webhooks as Record<string, unknown>) ?? { enabled: false, auditWebhookUrl: "", ticketWebhookUrl: "", username: "Stained", retryFailures: true });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="webhooks" eyebrow="Integrations" title="Webhooks" description="Configure optional outgoing webhook destinations for Stained events. Keep webhook URLs private." section="webhooks" initial={initial} fields={[
    { key: "enabled", label: "Enable outgoing webhooks", description: "Allow Stained to deliver configured events to external webhook URLs.", type: "toggle" },
    { key: "auditWebhookUrl", label: "Audit webhook URL", description: "Receives moderation and audit events.", type: "text", placeholder: "https://discord.com/api/webhooks/…" },
    { key: "ticketWebhookUrl", label: "Ticket webhook URL", description: "Receives ticket open/close events and transcript metadata.", type: "text", placeholder: "https://…" },
    { key: "username", label: "Webhook display name", type: "text", placeholder: "Stained" },
    { key: "retryFailures", label: "Retry failed deliveries", description: "Allow the bot runtime to retry temporary webhook errors.", type: "toggle" },
  ]} />;
}

