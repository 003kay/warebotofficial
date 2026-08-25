import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/discord-apps")({
  head: () => ({ meta: [{ title: "Discord Apps — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.discordApps as Record<string, unknown>) ?? { slashCommandsEnabled: true, contextMenusEnabled: true, commandSyncMode: "automatic", ephemeralErrors: true });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="discordApps" eyebrow="Integrations" title="Discord Apps" description="Configure how Ware exposes Discord application commands and interaction responses for this server." section="discordApps" initial={initial} fields={[
    { key: "slashCommandsEnabled", label: "Slash commands", description: "Enable Ware application commands where supported by the bot runtime.", type: "toggle" },
    { key: "contextMenusEnabled", label: "Context menus", description: "Enable supported user/message context menu commands.", type: "toggle" },
    { key: "commandSyncMode", label: "Command sync mode", description: "Controls how the bot runtime syncs guild commands.", type: "select", options: [{ label: "Automatic", value: "automatic" }, { label: "Manual", value: "manual" }] },
    { key: "ephemeralErrors", label: "Private interaction errors", description: "Show supported slash-command errors only to the invoking member.", type: "toggle" },
  ]} />;
}
