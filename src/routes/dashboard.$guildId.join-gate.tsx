import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
export const Route = createFileRoute("/dashboard/$guildId/join-gate")({ component: Page });
function Page() {
 const { guildId } = Route.useParams();
 const { data } = useSuspenseQuery({queryKey:["dashboardSettings",guildId], queryFn:()=>getDashboardSettings({data:{guildId}})});
 return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="joinGate" section="joinGate" eyebrow="Configuration" title="Join Gate" description="Apply the same account checks and mass-join rules used by the antiraid commands." initial={{...{"ageEnabled": false, "minimumAgeDays": 3, "requireAvatar": false, "action": "kick", "massjoinEnabled": false, "joinThreshold": 10, "lockChannels": false, "punishJoins": true},...((data.settings.joinGate as Record<string,unknown>) ?? {})}} fields={[{"key": "ageEnabled", "label": "Require a minimum account age", "type": "toggle"}, {"key": "minimumAgeDays", "label": "Minimum account age in days", "type": "number"}, {"key": "requireAvatar", "label": "Require an avatar", "type": "toggle"}, {"key": "action", "label": "Action", "type": "select", "options": [{"label": "Kick", "value": "kick"}, {"label": "Ban", "value": "ban"}]}, {"key": "massjoinEnabled", "label": "Enable mass-join detection", "type": "toggle"}, {"key": "joinThreshold", "label": "Joins within ten seconds", "type": "number"}, {"key": "lockChannels", "label": "Lock channels during a raid", "type": "toggle"}, {"key": "punishJoins", "label": "Punish incoming raid accounts", "type": "toggle"}]} />;
}
