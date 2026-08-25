import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/permissions")({
  head: () => ({ meta: [{ title: "Permissions — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.permissions as Record<string, unknown>) ?? { managerRoleId: "", moderatorRoleId: "", supportRoleId: "", allowAdministrators: true, allowOwnerOverride: true });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="permissions" eyebrow="Security" title="Permissions" description="Define which server roles can manage Ware features. Role IDs are stored server-side and can be enforced by the bot runtime." section="permissions" initial={initial} fields={[
    { key: "managerRoleId", label: "Ware manager role ID", description: "Role allowed to configure dashboard features without full Administrator.", type: "text", placeholder: "Role ID" },
    { key: "moderatorRoleId", label: "Moderator role ID", description: "Role used for moderation actions and protected command access.", type: "text", placeholder: "Role ID" },
    { key: "supportRoleId", label: "Support role ID", description: "Default role used by ticket and support features.", type: "text", placeholder: "Role ID" },
    { key: "allowAdministrators", label: "Allow Discord administrators", description: "Administrators can manage Ware even if they do not have the configured role.", type: "toggle" },
    { key: "allowOwnerOverride", label: "Allow server owner override", description: "The Discord server owner always retains Ware access.", type: "toggle" },
  ]} />;
}
