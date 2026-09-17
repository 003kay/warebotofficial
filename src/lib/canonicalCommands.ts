import { commandCategoryDefinitions, legacyCommandCategories } from "./commandCategoryMap";
import { botCommandRegistry } from "./botCommandRegistry";
import { commandCategories } from "@/lib/commands";
import { lastFmCategory } from "@/lib/lastfmCommands";
import { referenceCommandCategories } from "@/lib/referenceCommands";

export type WareCommandEntry = {
  name: string;
  description: string;
  usage: string;
  example?: string;
  aliases?: string[];
  permission?: string;
};

export type WareCommandCategory = {
  slug: string;
  name: string;
  description: string;
  commands: WareCommandEntry[];
};

export const canonicalCommandNames = botCommandRegistry.map((command) => command.name);

export const WARE_COMMAND_COUNT = canonicalCommandNames.length;

const forbiddenStandaloneRoots = new Set<string>();
const canonicalSet = new Set(canonicalCommandNames.map((name) => name.toLowerCase()));

function mergeBaseCategories(): WareCommandCategory[] {
  const groups = [
    ...(commandCategories as unknown as WareCommandCategory[]),
    lastFmCategory as unknown as WareCommandCategory,
    ...(referenceCommandCategories as unknown as WareCommandCategory[]),
  ];
  const merged = new Map<string, WareCommandCategory>();
  const seen = new Set<string>();
  for (const category of groups) {
    if (forbiddenStandaloneRoots.has(category.slug.toLowerCase())) continue;
    const current = merged.get(category.slug);
    if (!current) {
      merged.set(category.slug, { ...category, commands: [] });
    }
    const target = merged.get(category.slug)!;
    for (const command of category.commands ?? []) {
      const key = command.name.toLowerCase();
      if (!canonicalSet.has(key) || seen.has(key)) continue;
      seen.add(key);
      if (forbiddenStandaloneRoots.has(key.split(" ")[0])) continue;
      if (!target.commands.some((item) => item.name.toLowerCase() === key)) {
        target.commands.push({ ...command });
      }
    }
  }
  return [...merged.values()];
}

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function generatedDescription(name: string) {
  const parts = name.split(" ");
  const action = parts[parts.length - 1];
  const subject = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
  const phrases: Record<string, string> = {
    add: `Add an entry to ${subject}.`,
    remove: `Remove an entry from ${subject}.`,
    list: `View the current ${subject} entries.`,
    clear: `Clear the saved ${subject} entries.`,
    reset: `Reset ${subject} back to its default state.`,
    enable: `Enable ${subject} for this server.`,
    disable: `Disable ${subject} for this server.`,
    setup: `Configure ${subject} for this server.`,
    status: `View the current ${subject} status.`,
    view: `View the current ${subject} configuration.`,
    create: `Create a new ${subject} entry.`,
    delete: `Delete a ${subject} entry.`,
    info: `View information about ${subject}.`,
    test: `Test the current ${subject} configuration.`,
    channel: `Set or view the channel used by ${subject}.`,
    role: `Set or view the role used by ${subject}.`,
  };
  return phrases[action] ?? `Use Stained's ${titleCase(name)} command.`;
}

function generatedUsage(name: string) {
  const action = name.split(" ").at(-1) ?? name;
  const argByAction: Record<string, string> = {
    add: "<value>",
    remove: "<value>",
    set: "<value>",
    create: "<name>",
    delete: "<name>",
    channel: "<#channel>",
    role: "<@role>",
    user: "<@user>",
    member: "<@member>",
    rename: "<name>",
    reason: "<reason>",
    message: "<message>",
    color: "<#hex>",
    icon: "<url>",
    position: "<position>",
  };
  const arg = argByAction[action];
  return arg ? `${name} ${arg}` : name;
}

function generatedExample(name: string) {
  const usage = generatedUsage(name);
  return usage
    .replace("<value>", "example")
    .replace("<name>", "example")
    .replace("<#channel>", "#general")
    .replace("<@role>", "@Member")
    .replace("<@user>", "@user")
    .replace("<@member>", "@member")
    .replace("<reason>", "rule violation")
    .replace("<message>", "hello from Stained")
    .replace("<#hex>", "#7c3aed")
    .replace("<url>", "https://example.com/icon.png")
    .replace("<position>", "1");
}

const baseCategories = mergeBaseCategories();
const commandToCategory = new Map<string, string>();
const rootToCategory = new Map<string, string>();
for (const category of baseCategories) {
  for (const command of category.commands) {
    commandToCategory.set(command.name.toLowerCase(), category.slug);
    const root = command.name.toLowerCase().split(" ")[0];
    if (!rootToCategory.has(root)) rootToCategory.set(root, category.slug);
  }
}

if (!baseCategories.some((category) => category.slug === "miscellaneous")) {
  baseCategories.push({
    slug: "miscellaneous",
    name: "Miscellaneous",
    description: "Additional Stained commands and utilities.",
    commands: [],
  });
}

const bySlug = new Map(baseCategories.map((category) => [category.slug, category]));
for (const name of canonicalCommandNames) {
  const key = name.toLowerCase();
  if (commandToCategory.has(key)) continue;
  const root = key.split(" ")[0];
  const slug = rootToCategory.get(root) ?? "miscellaneous";
  const category = bySlug.get(slug) ?? bySlug.get("miscellaneous")!;
  category.commands.push({
    name,
    description: generatedDescription(name),
    usage: generatedUsage(name),
    example: generatedExample(name),
  });
  commandToCategory.set(key, category.slug);
}

const registry = new Map(botCommandRegistry.map((command) => [command.name, command]));

const enrichedCategories: WareCommandCategory[] = baseCategories
  .map((category) => ({
    ...category,
    commands: category.commands
      .map((command) => {
        const live = registry.get(command.name)!;
        return {
          ...command,
          usage: live.usage,
          aliases: live.aliases,
          description: live.description || command.description,
        };
      })
      .filter(
        (command, index, all) =>
          all.findIndex((item) => item.name.toLowerCase() === command.name.toLowerCase()) === index,
      )
      .sort((a, b) => {
        if (category.slug !== "logs") return a.name.localeCompare(b.name);
        const order = [
          "log",
          "log remove",
          "log ignore",
          "log ignore list",
          "log color",
          "log color list",
          "log add",
        ];
        return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
      }),
  }))
  .filter((category) => category.commands.length > 0);

// Preserve existing documentation while assigning every registered command once.
const documentedCommands = new Map(
  enrichedCategories.flatMap((group) =>
    group.commands.map((command) => [command.name, command] as const),
  ),
);
const rootCategories = new Map<string, string>(
  commandCategoryDefinitions.flatMap((group) =>
    group.roots.map((root) => [root, group.slug] as const),
  ),
);

export function commandCategorySlug(name: string) {
  // The bot uses kick for moderation, and kick subcommands for stream alerts.
  if (name.startsWith("kick ")) return "social";
  return rootCategories.get(name.split(" ")[0]) ?? "utility";
}

export const canonicalCommands: WareCommandEntry[] = botCommandRegistry.map(
  (command) =>
    documentedCommands.get(command.name) ?? {
      ...command,
      description: command.description || generatedDescription(command.name),
    },
);

export const canonicalCommandCategories: WareCommandCategory[] = commandCategoryDefinitions
  .map((group) => ({
    slug: group.slug,
    name: group.name,
    description: group.description,
    commands: canonicalCommands
      .filter((command) => commandCategorySlug(command.name) === group.slug)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .filter((group) => group.commands.length > 0);

export function resolveCommandCategory(slug?: string) {
  const candidate = slug ? (legacyCommandCategories[slug] ?? slug) : "information";
  return canonicalCommandCategories.some((group) => group.slug === candidate)
    ? candidate
    : "information";
}
