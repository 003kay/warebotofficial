import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/automations")({
  head: () => ({ meta: [{ title: "Automations — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.automations as Record<string, unknown>) ?? { enabled: true, autoRoleId: "", autoRoleDelaySeconds: 0, bumpReminderEnabled: false, bumpReminderChannelId: "", inactivityDays: 30 });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="automations" eyebrow="Configuration" title="Automations" description="Server automation defaults Ware can use for autoroles, bump reminders and inactivity workflows." section="automations" initial={initial} fields={[
    { key: "enabled", label: "Enable automations", description: "Allow Ware to execute configured server automations.", type: "toggle" },
    { key: "autoRoleId", label: "Autorole ID", description: "Role assigned automatically to new members.", type: "text", placeholder: "Role ID" },
    { key: "autoRoleDelaySeconds", label: "Autorole delay (seconds)", description: "Delay before assigning the autorole after a member joins.", type: "number" },
    { key: "bumpReminderEnabled", label: "Bump reminders", description: "Enable reminders after supported bump-bot commands.", type: "toggle" },
    { key: "bumpReminderChannelId", label: "Bump reminder channel ID", type: "text", placeholder: "Channel ID" },
    { key: "inactivityDays", label: "Inactivity threshold (days)", description: "Default threshold for inactivity-driven actions.", type: "number" },
  ]} />;
}
