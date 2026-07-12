import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Crown,
  Sparkles,
  ShieldCheck,
  Users,
  Ban,
  Lock,
  EyeOff,
  Ticket,
  UserCog,
  MessageSquare,
  Star,
  Mic,
  Trophy,
  Coins,
  Bot,
  Wrench,
  Gamepad2,
  Terminal,
} from "lucide-react";
import { commandCategories } from "@/lib/commands";

export interface DocItem {
  label: string;
  slug: string;
  icon?: LucideIcon;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

const CMD_ICONS: Record<string, LucideIcon> = {
  moderation: Ban,
  anti: ShieldCheck,
  voicemaster: Mic,
  logging: BookOpen,
  welcome: Users,
  economy: Coins,
  ai: Bot,
  utility: Wrench,
  fun: Gamepad2,
  "message-tools": MessageSquare,
  administration: Terminal,
};

export const docSections: DocSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Introduction", slug: "introduction", icon: BookOpen },
      { label: "Donator Perks", slug: "donator-perks", icon: Crown },
      { label: "Customization", slug: "customization", icon: Sparkles },
    ],
  },
  {
    title: "Security Setup",
    items: [
      { label: "Antinuke", slug: "security-setup", icon: ShieldCheck },
      { label: "Join Gate", slug: "join-gate", icon: Lock },
      { label: "Moderation", slug: "moderation-guide", icon: Ban },
      { label: "Fake Permissions", slug: "fake-permissions", icon: EyeOff },
    ],
  },
  {
    title: "Server Configuration",
    items: [
      { label: "Tickets", slug: "server-configuration", icon: Ticket },
      { label: "Roles", slug: "integrations", icon: UserCog },
      { label: "Messages", slug: "embed-scripting", icon: MessageSquare },
      { label: "Starboard", slug: "starboard", icon: Star },
      { label: "VoiceMaster", slug: "commands-voicemaster", icon: Mic },
      { label: "Level Rewards", slug: "level-rewards", icon: Trophy },
    ],
  },
  {
    title: "Commands",
    items: [
      { label: "All Commands", slug: "commands", icon: Terminal },
      ...commandCategories.map((c) => ({
        label: c.name,
        slug: `commands-${c.slug}`,
        icon: CMD_ICONS[c.slug],
      })),
    ],
  },
];

