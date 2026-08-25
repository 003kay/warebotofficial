import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/settings")({
  head: () => ({ meta: [{ title: "Settings — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});

function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.server as Record<string, unknown>) ?? { prefix: ",", timezone: "UTC", locale: "en-US", deleteCommandMessages: false, dmModerationActions: true });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="settings" eyebrow="Server" title="Settings" description="Core Ware behavior for this server. These values are stored per guild and can be consumed by the bot runtime." section="server" initial={initial} fields={[
    { key: "prefix", label: "Command prefix", description: "Prefix Ware should use for classic commands in this server.", type: "text", placeholder: "," },
    { key: "timezone", label: "Timezone", description: "Used when Ware formats scheduled actions, logs and reminders.", type: "text", placeholder: "America/Los_Angeles" },
    { key: "locale", label: "Locale", description: "Formatting locale for dates and numbers.", type: "select", options: [{ label: "English (US)", value: "en-US" }, { label: "English (UK)", value: "en-GB" }, { label: "Arabic", value: "ar" }] },
    { key: "deleteCommandMessages", label: "Delete command messages", description: "Remove successful command invocations when appropriate.", type: "toggle" },
    { key: "dmModerationActions", label: "DM moderation actions", description: "Send members a DM when they are muted, jailed or otherwise moderated.", type: "toggle" },
  ]} />;
}
