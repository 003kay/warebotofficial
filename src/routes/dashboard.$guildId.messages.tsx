import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/messages")({
  head: () => ({ meta: [{ title: "Messages — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});
function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const initial = ((data.settings.messages as Record<string, unknown>) ?? { welcomeEnabled: false, welcomeChannelId: "", welcomeMessage: "Welcome {user} to {server}.", leaveEnabled: false, leaveChannelId: "", leaveMessage: "{user} left the server." });
  return <FeatureSettingsPage guild={data.guild} guildId={guildId} active="messages" eyebrow="Configuration" title="Messages" description="Configure Ware's server welcome and leave messages. Variables such as {user} and {server} can be expanded by the bot runtime." section="messages" initial={initial} fields={[
    { key: "welcomeEnabled", label: "Welcome messages", description: "Send a message when a member joins.", type: "toggle" },
    { key: "welcomeChannelId", label: "Welcome channel ID", description: "Discord channel where welcome messages should be sent.", type: "text", placeholder: "Channel ID" },
    { key: "welcomeMessage", label: "Welcome message", description: "Supports {user}, {server} and {member_count}.", type: "text", placeholder: "Welcome {user}!" },
    { key: "leaveEnabled", label: "Leave messages", description: "Send a message when a member leaves.", type: "toggle" },
    { key: "leaveChannelId", label: "Leave channel ID", type: "text", placeholder: "Channel ID" },
    { key: "leaveMessage", label: "Leave message", type: "text", placeholder: "{user} left the server." },
  ]} />;
}
