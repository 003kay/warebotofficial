import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/voicemaster")({
  head: () => ({ meta: [{ title: "VoiceMaster — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.voicemaster as Record<string, unknown>) ?? { enabled: false, joinChannelId: "", categoryId: "", defaultName: "{user}'s channel", userLimit: 0, autoDelete: true });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="voicemaster" eyebrow="Configuration" title="VoiceMaster" description="Configure temporary voice channels created by Ware when members join a designated creator channel." section="voicemaster" initial={initial} fields={[
    { key: "enabled", label: "Enable VoiceMaster", description: "Create temporary voice rooms when members join the creator channel.", type: "toggle" },
    { key: "joinChannelId", label: "Creator voice channel ID", description: "Members joining this channel trigger creation of their own room.", type: "text", placeholder: "Voice channel ID" },
    { key: "categoryId", label: "Voice category ID", description: "Category where temporary channels should be created.", type: "text", placeholder: "Category ID" },
    { key: "defaultName", label: "Default channel name", description: "Use {user} for the channel owner's display name.", type: "text", placeholder: "{user}'s channel" },
    { key: "userLimit", label: "Default user limit", description: "0 means unlimited.", type: "number" },
    { key: "autoDelete", label: "Delete empty channels", description: "Automatically remove temporary rooms when everyone leaves.", type: "toggle" },
  ]} />;
}
