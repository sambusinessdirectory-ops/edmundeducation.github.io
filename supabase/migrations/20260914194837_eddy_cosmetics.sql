-- Account-owned Eddy equipment and named outfit sets.
create schema if not exists avatar_closet;
revoke all on schema avatar_closet from public, anon;
grant usage on schema avatar_closet to authenticated;
create table avatar_closet.wardrobes (
 student_id uuid primary key references public.flashcard_students(id) on delete cascade,
 equipped jsonb not null default '{}', outfits jsonb not null default '[]', updated_at timestamptz not null default now()
);
alter table avatar_closet.wardrobes enable row level security;
revoke all on avatar_closet.wardrobes from public,anon,authenticated;
create function avatar_closet.valid_equipment(value jsonb) returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object' and (value - 'headwear' - 'top')='{}'::jsonb
 and (not (value ? 'headwear') or value->>'headwear'='white-fedora')
 and (not (value ? 'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck'));
$$;
revoke all on function avatar_closet.valid_equipment(jsonb) from public,anon;
create function avatar_closet.sync(p_token uuid,p_equipped jsonb default null,p_outfits jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; item jsonb; result jsonb;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
 if p_equipped is not null and not coalesce(avatar_closet.valid_equipment(p_equipped),false) then raise exception 'Invalid equipment'; end if;
 if p_outfits is not null then
  if jsonb_typeof(p_outfits)<>'array' or jsonb_array_length(p_outfits)>50 then raise exception 'Invalid outfit collection'; end if;
  for item in select value from jsonb_array_elements(p_outfits) loop
   if jsonb_typeof(item)<>'object' or length(btrim(coalesce(item->>'name',''))) not between 1 and 60
    or not coalesce(avatar_closet.valid_equipment(item->'equipped'),false)
    or (item - 'name' - 'equipped')<>'{}'::jsonb then raise exception 'Invalid outfit'; end if;
  end loop;
 end if;
 if p_equipped is not null or p_outfits is not null then
  insert into avatar_closet.wardrobes as w(student_id,equipped,outfits) values(student,coalesce(p_equipped,'{}'),coalesce(p_outfits,'[]'))
  on conflict(student_id) do update set equipped=coalesce(p_equipped,w.equipped),outfits=coalesce(p_outfits,w.outfits),updated_at=now();
 end if;
 select jsonb_build_object('equipped',w.equipped,'outfits',w.outfits,'updatedAt',w.updated_at) into result from avatar_closet.wardrobes w where w.student_id=student;
 return coalesce(result,jsonb_build_object('equipped','{}'::jsonb,'outfits','[]'::jsonb));
end $$;
revoke all on function avatar_closet.sync(uuid,jsonb,jsonb) from public,anon;
grant execute on function avatar_closet.sync(uuid,jsonb,jsonb) to authenticated;
create function public.eddy_closet_sync(p_token uuid,p_equipped jsonb default null,p_outfits jsonb default null)
returns jsonb language sql security invoker set search_path='' as $$ select avatar_closet.sync(p_token,p_equipped,p_outfits); $$;
revoke all on function public.eddy_closet_sync(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.eddy_closet_sync(uuid,jsonb,jsonb) to authenticated;
