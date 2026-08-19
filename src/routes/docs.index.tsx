import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck,Settings,Share2,Code2,Crown,ArrowRight,Info,BookOpen } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/docs/DocsLayout";
const UPDATED="August 19th 2026 3:19 PM";
export const Route=createFileRoute("/docs/")({head:()=>({meta:[{title:"Introduction — ware docs"},{name:"description",content:"Current documentation for Ware commands, security, moderation, configuration, and server tools."}]}),component:DocsIndex});
interface Guide{icon:LucideIcon;title:string;body:string;slug:string;}
const guides:Guide[]=[
{icon:ShieldCheck,title:"Security Setup",body:"Configure Ware's antinuke, anti-raid, moderation, and server protection systems.",slug:"security-setup"},
{icon:Settings,title:"Server Configuration",body:"Set up tickets, roles, messages, server utilities, and other configurable features.",slug:"server-configuration"},
{icon:Share2,title:"Integrations & Roles",body:"Manage role utilities and connected server workflows through Ware.",slug:"integrations"},
{icon:Code2,title:"Messages & Embeds",body:"Build cleaner server messages and use Ware's message and embed tools.",slug:"embed-scripting"},
];
function DocsIndex(){return <DocsLayout active="introduction" toc={[{id:"guides",label:"Guides"}]}>
<div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs text-muted-foreground"><span className="font-semibold text-white">Last updated:</span> {UPDATED}</div>
<div className="mt-8"><div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45"><BookOpen className="h-3 w-3"/>Ware Documentation</div><h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] md:text-6xl">Documentation</h1><p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">Set up Ware, understand its security and moderation systems, configure server features, and browse the complete command library.</p></div>
<div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0"/><p>The default server prefix is <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">,</code>. Use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-foreground">,prefix set (symbol)</code> to change it for your server.</p></div>
<div className="mt-6"><Link to="/docs/commands" className="group flex items-center justify-between rounded-2xl border border-white/[0.11] bg-white/[0.045] p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"><div><p className="text-xs uppercase tracking-[0.16em] text-white/35">Command center</p><h2 className="mt-1 text-xl font-semibold">Browse All Commands</h2><p className="mt-2 text-sm text-muted-foreground">Search commands and filter the library by category.</p></div><ArrowRight className="h-5 w-5 text-white/45 transition-transform group-hover:translate-x-1"/></Link></div>
<h2 id="guides" className="mt-14 text-2xl font-semibold tracking-tight">Guides</h2><div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{guides.map(g=><Link key={g.slug} to="/docs/$slug" params={{slug:g.slug}} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"><g.icon className="h-5 w-5 text-muted-foreground"/><h3 className="mt-3 text-base font-semibold">{g.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{g.body}</p></Link>)}</div>
<div className="mt-14 flex justify-end border-t border-white/5 pt-6"><Link to="/docs/$slug" params={{slug:"donator-perks"}} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"><Crown className="h-4 w-4"/>Donator Perks<ArrowRight className="h-4 w-4"/></Link></div>
</DocsLayout>;}
