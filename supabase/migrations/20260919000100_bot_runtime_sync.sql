create table if not exists public.guild_bot_runtime (
  guild_id text primary key,
  snapshot jsonb not null default '{}'::jsonb,
  applied jsonb not null default '{}'::jsonb,
  errors jsonb not null default '{}'::jsonb,
  command_count integer not null default 0,
  version text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.guild_bot_runtime enable row level security;
revoke all on public.guild_bot_runtime from anon, authenticated;
grant all on public.guild_bot_runtime to service_role;

create or replace function public.save_stained_dashboard_section(
  p_guild_id text, p_section text, p_values jsonb, p_user_id text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  if p_section !~ '^[a-zA-Z0-9_-]{1,40}$' or p_section like '\_%' or jsonb_typeof(p_values) <> 'object' then
    raise exception 'Invalid section';
  end if;
  insert into public.guild_dashboard_settings (guild_id, settings, updated_by, updated_at)
  values (p_guild_id, jsonb_build_object(p_section, p_values, '_revisions', jsonb_build_object(p_section, 1)), p_user_id, now())
  on conflict (guild_id) do update set
    settings = public.guild_dashboard_settings.settings || jsonb_build_object(p_section, p_values, '_revisions',
      coalesce(public.guild_dashboard_settings.settings->'_revisions', '{}'::jsonb) ||
      jsonb_build_object(p_section, coalesce((public.guild_dashboard_settings.settings->'_revisions'->>p_section)::bigint, 0) + 1)),
    updated_by = p_user_id, updated_at = now()
  returning settings into result;
  return result;
end;
$$;
revoke all on function public.save_stained_dashboard_section(text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.save_stained_dashboard_section(text,text,jsonb,text) to service_role;
