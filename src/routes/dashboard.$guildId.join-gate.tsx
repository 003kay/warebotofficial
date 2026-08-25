import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/join-gate")({
  head: () => ({ meta: [{ title: "Join Gate — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.joinGate as Record<string, unknown>) ?? { enabled: false, minimumAccountAgeHours: 24, blockNewAccounts: true, requireAvatar: false, alertChannelId: "" });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="joinGate" eyebrow="Security" title="Join Gate" description="Control how Ware treats new joins before they receive normal server access." section="joinGate" initial={initial} fields={[
    { key: "enabled", label: "Enable Join Gate", description: "Apply the configured checks to new members.", type: "toggle" },
    { key: "minimumAccountAgeHours", label: "Minimum account age (hours)", description: "Accounts younger than this threshold can be flagged or blocked.", type: "number" },
    { key: "blockNewAccounts", label: "Block accounts below minimum age", description: "When disabled, Ware only logs the account instead of blocking it.", type: "toggle" },
    { key: "requireAvatar", label: "Require profile avatar", description: "Flag accounts using Discord's default avatar.", type: "toggle" },
    { key: "alertChannelId", label: "Alert channel ID", description: "Channel where Join Gate events should be posted.", type: "text", placeholder: "Discord channel ID" },
  ]} />;
}
