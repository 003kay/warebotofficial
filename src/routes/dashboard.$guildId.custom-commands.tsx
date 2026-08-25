import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/custom-commands")({
  head: () => ({ meta: [{ title: "Custom Commands — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.customCommands as Record<string, unknown>) ?? { enabled: true, defaultCooldown: 5, allowMentions: false, caseSensitive: false, maxPerGuild: 100 });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="customCommands" eyebrow="Configuration" title="Custom Commands" description="Control Ware's custom-response command engine. These server-level settings apply to custom commands created by your bot runtime." section="customCommands" initial={initial} fields={[
    { key: "enabled", label: "Enable custom commands", description: "Allow custom text response commands in this server.", type: "toggle" },
    { key: "defaultCooldown", label: "Default cooldown (seconds)", description: "Per-user cooldown for custom commands unless overridden.", type: "number" },
    { key: "allowMentions", label: "Allow mentions in responses", description: "Permit custom responses to mention members and roles.", type: "toggle" },
    { key: "caseSensitive", label: "Case-sensitive triggers", description: "Require exact capitalization when matching custom commands.", type: "toggle" },
    { key: "maxPerGuild", label: "Command limit", description: "Maximum custom commands Ware should load for this server.", type: "number" },
  ]} />;
}
