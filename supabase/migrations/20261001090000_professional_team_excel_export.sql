-- The export uses the same totals as Team Effort, with an additional account gate.
create function public.special_flash_team_export(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
  a public.special_flash_accounts := public._special_flash_account(p_token);
  report jsonb;
begin
  if a.id is null then
    raise exception 'Please sign in again.' using errcode='42501';
  end if;
  if a.role <> 'admin' and lower(a.username) <> 'candy3gr' then
    raise exception 'Export is not available for this account.' using errcode='42501';
  end if;
  report := public.special_flash_team_effort(p_token);
  return jsonb_build_object(
    'generated_at', report->'generated_at',
    'courses', coalesce((
      select jsonb_agg(c)
      from jsonb_array_elements(report->'courses') c
      where c->>'course_title' = 'ProfessionalEnglish_ThreeGardenRoad_HK'
    ), '[]'::jsonb)
  );
end $$;
revoke all on function public.special_flash_team_export(uuid) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_team_export(uuid) to anon,authenticated;
notify pgrst, 'reload schema';
