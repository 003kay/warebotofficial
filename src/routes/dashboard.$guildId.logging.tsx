import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FeatureSettingsPage } from "@/components/dashboard/FeatureSettingsPage";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/logging")({
  head: () => ({ meta: [{ title: "Logging — Stained Dashboard" }] }),
  loader: async ({ context, params }) => { await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }); return null; },
  component: Page,
});

function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const stored = (data.settings.logging as Record<string, unknown> | undefined) ?? {};
  const initial = {
    enabled: Boolean(stored.enabled ?? false),
    moderationChannelId: String(stored.moderationChannelId ?? ""),
    memberChannelId: String(stored.memberChannelId ?? ""),
    messageChannelId: String(stored.messageChannelId ?? ""),
    ticketChannelId: String(stored.ticketChannelId ?? ""),
    includeIds: Boolean(stored.includeIds ?? false),
  };
  const channelOptions = [
    { label: "No channel selected", value: "", hint: "Stained will not send this log type" },
    ...data.textChannels.map((channel) => ({ label: `#${channel.name}`, value: channel.id, hint: `Discord channel · ${channel.id}` })),
  ];

  return <FeatureSettingsPage
    guild={data.guild}
    guildId={guildId}
    active="logging"
    eyebrow="Configuration"
    title="Logging"
    description="Choose exactly where Stained sends audit events. Logging stays completely off until you enable it yourself."
    section="logging"
    initial={initial}
    fields={[
      { key: "enabled", label: "Enable logging", description: "Nothing below runs until you turn logging on and save it.", type: "toggle" },
      { key: "moderationChannelId", label: "Moderation logs", description: "Bans, kicks, mutes, role actions and moderation events.", type: "select", options: channelOptions, placeholder: "Choose a Discord channel" },
      { key: "memberChannelId", label: "Member logs", description: "Joins, leaves and member updates.", type: "select", options: channelOptions, placeholder: "Choose a Discord channel" },
      { key: "messageChannelId", label: "Message logs", description: "Deleted and edited message events.", type: "select", options: channelOptions, placeholder: "Choose a Discord channel" },
      { key: "ticketChannelId", label: "Ticket logs", description: "Closed ticket summaries and transcript links.", type: "select", options: channelOptions, placeholder: "Choose a Discord channel" },
      { key: "includeIds", label: "Include Discord IDs", description: "Include user and channel IDs in detailed log events.", type: "toggle" },
    ]}
  />;
}

