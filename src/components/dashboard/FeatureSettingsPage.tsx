import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { dashboardFields } from "@/lib/dashboard-contract";
import { Save, CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModernSelect } from "@/components/dashboard/ModernSelect";
import { saveDashboardSettings } from "@/lib/dashboard-settings.functions";

type GuildInfo = { id: string; name: string; iconUrl: string | null };
type Field =
  | { key: string; label: string; description?: string; type: "text" | "number"; placeholder?: string }
  | { key: string; label: string; description?: string; type: "toggle" }
  | { key: string; label: string; description?: string; type: "select"; options: { label: string; value: string; hint?: string }[]; placeholder?: string };

function Toggle({ checked, disabled, onChange }: { checked:boolean; disabled?:boolean; onChange:()=>void }) {
  return <button
    type="button"
    aria-pressed={checked}
    disabled={disabled}
    onClick={onChange}
    className={`inline-flex h-[30px] w-[54px] shrink-0 items-center rounded-full border p-[3px] transition-all duration-200 ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"} ${checked ? "border-emerald-300/30 bg-emerald-400/14 shadow-[inset_0_0_0_1px_rgba(52,211,153,.03)]" : "border-white/[.10] bg-[#090b0b]"}`}
  >
    <span className={`block h-[22px] w-[22px] rounded-full shadow-[0_2px_10px_rgba(0,0,0,.35)] transition-transform duration-200 ${checked ? "translate-x-[24px] bg-emerald-300" : "translate-x-0 bg-white/42"}`} />
  </button>;
}

export function FeatureSettingsPage({ guild, guildId, active, title, eyebrow, description, section, fields, initial }: { guild: GuildInfo; guildId: string; active: string; title: string; eyebrow: string; description: string; section: string; fields: Field[]; initial: Record<string, unknown>; }) {
  fields = fields.filter(field => dashboardFields[section]?.includes(field.key));
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (!dirty) setValues(initial); }, [initial, dirty]);
  const masterField = fields.find((field) => field.key === "enabled" && field.type === "toggle");
  const masterEnabled = masterField ? Boolean(values.enabled) : true;
  const set = (key:string,value:unknown)=>{setValues(current=>({...current,[key]:value}));setSaved(false);setDirty(true)};

  async function onSave(){setSaving(true);try{await saveDashboardSettings({data:{guildId,section,values:Object.fromEntries(Object.entries(values).filter(([key])=>dashboardFields[section]?.includes(key)))}});setSaved(true);setDirty(false);await queryClient.invalidateQueries({queryKey:["dashboardSettings",guildId]})}catch(error){alert((error as Error).message)}finally{setSaving(false)}}

  return <DashboardShell guild={guild} guildId={guildId} active={active}>
    <div className="mx-auto max-w-[1260px] pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/28">{eyebrow}</div><h1 className="mt-2 text-[36px] font-bold tracking-[-0.045em] text-white/95">{title}</h1><p className="mt-2 max-w-2xl text-[13px] font-medium leading-6 text-white/38">{description}</p></div>
        <button type="button" onClick={onSave} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-bold text-black transition hover:scale-[1.01] hover:bg-white/92 disabled:opacity-50">{saved?<CheckCircle2 className="h-4 w-4"/>:<Save className="h-4 w-4"/>}{saving?"Saving…":saved?"Saved":"Save changes"}</button>
      </div>
      <div className="overflow-visible rounded-[24px] border border-white/[0.065] bg-[#0d0f0f] shadow-[0_24px_80px_rgba(0,0,0,.18)]">
        {fields.map((field,index)=>{const locked=Boolean(masterField)&&field.key!=="enabled"&&!masterEnabled;return <div key={field.key} className={`grid gap-5 p-6 md:grid-cols-[minmax(0,1fr)_420px] md:items-center ${index?"border-t border-white/[0.05]":""} ${locked?"opacity-35":""}`}>
          <div><div className="text-[13px] font-bold text-white/84">{field.label}</div>{field.description?<div className="mt-1.5 max-w-xl text-[11px] font-medium leading-5 text-white/30">{field.description}</div>:null}{locked?<div className="mt-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/20">Enable {title.toLowerCase()} first</div>:null}</div>
          <div className={`${locked?"pointer-events-none":""} flex min-h-[46px] items-center md:justify-end`}>
            {field.type==="toggle"?<Toggle checked={Boolean(values[field.key])} disabled={locked} onChange={()=>set(field.key,!Boolean(values[field.key]))}/>:field.type==="select"?<div className="w-full"><ModernSelect value={String(values[field.key]??"")} onChange={value=>set(field.key,value)} disabled={locked} options={field.options} placeholder={field.placeholder}/></div>:<input type={field.type} disabled={locked} value={String(values[field.key]??"")} placeholder={field.placeholder} onChange={event=>set(field.key,field.type==="number"?Number(event.target.value):event.target.value)} className="w-full rounded-[16px] border border-white/[0.08] bg-[#090b0b] px-4 py-3 text-[12px] font-semibold text-white/78 outline-none placeholder:text-white/18 focus:border-white/[0.17] disabled:cursor-not-allowed"/>}
          </div>
        </div>})}
      </div>
    </div>
  </DashboardShell>;
}
