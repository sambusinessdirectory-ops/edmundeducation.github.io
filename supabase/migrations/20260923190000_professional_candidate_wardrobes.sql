begin;
set local lock_timeout='5s';
create function public.speaking_professional_wardrobes(p_token uuid,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor jsonb:=public.learning_hub_identity(p_token); ids uuid[]:='{}'; value jsonb; sid uuid;
begin
 if actor->>'kind'<>'admin' then raise exception 'Forbidden' using errcode='42501'; end if;
 if jsonb_typeof(p_payload->'ids')<>'array' or jsonb_array_length(p_payload->'ids')>4 then raise exception 'Invalid candidate list' using errcode='22023'; end if;
 for value in select * from jsonb_array_elements(p_payload->'ids') loop
  sid:=(value#>>'{}')::uuid;
  if sid=any(ids) then raise exception 'Duplicate candidate account' using errcode='22023'; end if;
  ids:=array_append(ids,sid);
 end loop;
 return coalesce((select jsonb_agg(jsonb_build_object('id',w.student_id,'equipped',avatar_closet.independent_wardrobe(w.equipped,w.outfits)->'equipped')) from avatar_closet.wardrobes w where w.student_id=any(ids)),'[]'::jsonb);
end $$;
revoke all on function public.speaking_professional_wardrobes(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.speaking_professional_wardrobes(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
