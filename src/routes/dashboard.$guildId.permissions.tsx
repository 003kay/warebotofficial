import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
export const Route = createFileRoute("/dashboard/$guildId/permissions")({ component: Page });
function Page() {
 const { guildId } = Route.useParams();
 const { data } = useSuspenseQuery({queryKey:["dashboardSettings",guildId], queryFn:()=>getDashboardSettings({data:{guildId}})});
 return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="permissions" section="permissions" eyebrow="Configuration" title="Permissions" description="Configure staff role tracking and role removal during jail. Grant command permissions with fakepermissions in Discord." initial={{...{"staffRoleId": "", "jailRemoveRoles": true},...((data.settings.permissions as Record<string,unknown>) ?? {})}} fields={[{"key": "staffRoleId", "label": "Tracked staff role ID", "type": "text"}, {"key": "jailRemoveRoles", "label": "Remove roles when jailing", "type": "toggle"}]} />;
}
