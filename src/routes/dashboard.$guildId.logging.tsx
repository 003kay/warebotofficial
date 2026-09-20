import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
export const Route = createFileRoute("/dashboard/$guildId/logging")({ component: Page });
function Page() {
 const { guildId } = Route.useParams();
 const { data } = useSuspenseQuery({queryKey:["dashboardSettings",guildId], queryFn:()=>getDashboardSettings({data:{guildId}})});
 return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="logging" section="logging" eyebrow="Configuration" title="Logging" description="Choose the event log destination used by Stained. Fine-tune individual events with the log commands." initial={{...{"enabled": false, "channelId": ""},...((data.settings.logging as Record<string,unknown>) ?? {})}} fields={[{"key": "enabled", "label": "Enable event logging", "type": "toggle"}, {"key": "channelId", "label": "Log channel ID", "type": "text"}]} />;
}
