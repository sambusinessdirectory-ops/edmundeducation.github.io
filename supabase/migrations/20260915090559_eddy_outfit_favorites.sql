-- Preserve account-owned saved outfits and add an optional boolean heart.
create or replace function avatar_closet.sync(p_token uuid,p_equipped jsonb default null,p_outfits jsonb default null)
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
    or (item - 'name' - 'equipped' - 'favorite')<>'{}'::jsonb or (item ? 'favorite' and jsonb_typeof(item->'favorite')<>'boolean') then raise exception 'Invalid outfit'; end if;
  end loop;
 end if;
 if p_equipped is not null or p_outfits is not null then
  insert into avatar_closet.wardrobes as w(student_id,equipped,outfits) values(student,coalesce(p_equipped,'{}'),coalesce(p_outfits,'[]'))
  on conflict(student_id) do update set equipped=coalesce(p_equipped,w.equipped),outfits=coalesce(p_outfits,w.outfits),updated_at=now();
 end if;
 select jsonb_build_object('equipped',w.equipped,'outfits',w.outfits,'updatedAt',w.updated_at) into result from avatar_closet.wardrobes w where w.student_id=student;
 return coalesce(result,jsonb_build_object('equipped','{}'::jsonb,'outfits','[]'::jsonb));
end $$;
