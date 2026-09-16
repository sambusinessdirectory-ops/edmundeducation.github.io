-- Catalog availability is shared; girls' equipped state and outfit sets are not.
create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value-'headwear'-'top'-'girlsTop'-'celesteTop'-'phoebeTop'-'elsieTop')='{}'::jsonb
 and (not(value?'headwear') or value->>'headwear'='white-fedora')
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie'))
 and (not(value?'girlsTop') or value->>'girlsTop'='cream-sherpa-jacket')
 and (not(value?'celesteTop') or value->>'celesteTop'='cream-sherpa-jacket')
 and (not(value?'phoebeTop') or value->>'phoebeTop'='cream-sherpa-jacket')
 and (not(value?'elsieTop') or value->>'elsieTop'='cream-sherpa-jacket');
$$;

create function avatar_closet.independent_wardrobe(e jsonb,o jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare equipment jsonb:=coalesce(e,'{}')-'girlsTop'; outfits jsonb:='[]'; item jsonb; c text; fit jsonb;
begin
 if e->>'girlsTop'='cream-sherpa-jacket' then
  foreach c in array array['celeste','phoebe','elsie'] loop
   if not(equipment?(c||'Top')) then equipment:=equipment||jsonb_build_object(c||'Top','cream-sherpa-jacket'); end if;
  end loop;
 end if;
 for item in select value from jsonb_array_elements(coalesce(o,'[]')) loop
  if item->>'group'='girls' and not(item?'character') then
   foreach c in array array['celeste','phoebe','elsie'] loop
    fit:=case when item->'equipped'->>'girlsTop'='cream-sherpa-jacket' then jsonb_build_object(c||'Top','cream-sherpa-jacket') else '{}'::jsonb end;
    outfits:=outfits||jsonb_build_array(item||jsonb_build_object('character',c,'equipped',fit));
   end loop;
  else outfits:=outfits||jsonb_build_array(item); end if;
 end loop;
 return jsonb_build_object('equipped',equipment,'outfits',outfits);
end $$;
revoke all on function avatar_closet.independent_wardrobe(jsonb,jsonb) from public,anon,authenticated;

-- Pure merge helper is also exercised by database regression checks without student writes.
create function avatar_closet.change_character(current_value jsonb,p_character text,p_equipped jsonb,p_outfits jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; equipment jsonb; outfits jsonb; item jsonb; slots text[];
begin
 if p_character is null or p_character not in ('boys','celeste','phoebe','elsie') then raise exception 'Invalid character'; end if;
 slots:=case when p_character='boys' then array['headwear','top'] else array[p_character||'Top'] end;
 result:=avatar_closet.independent_wardrobe(current_value->'equipped',current_value->'outfits');
 equipment:=result->'equipped'; outfits:=result->'outfits';
 if p_equipped is not null then
  if not coalesce(avatar_closet.valid_equipment(p_equipped),false) or (p_equipped-slots)<>'{}' then raise exception 'Invalid character equipment'; end if;
  equipment:=(equipment-slots)||p_equipped;
 end if;
 if p_outfits is not null then
  if jsonb_typeof(p_outfits)<>'array' or jsonb_array_length(p_outfits)>50 then raise exception 'Invalid outfit collection'; end if;
  for item in select value from jsonb_array_elements(p_outfits) loop
   if jsonb_typeof(item)<>'object' or length(btrim(coalesce(item->>'name',''))) not between 1 and 60
    or not coalesce(avatar_closet.valid_equipment(item->'equipped'),false)
    or ((item->'equipped')-slots)<>'{}'
    or (item-'name'-'equipped'-'favorite'-'group'-'character')<>'{}'
    or (item?'favorite' and jsonb_typeof(item->'favorite')<>'boolean')
    or (p_character='boys' and (item?'group' or item?'character'))
    or (p_character<>'boys' and (coalesce(item->>'group','')<>'girls' or coalesce(item->>'character','')<>p_character))
   then raise exception 'Invalid character outfit'; end if;
  end loop;
  select coalesce(jsonb_agg(value),'[]') into outfits from jsonb_array_elements(outfits)
   where case when p_character='boys' then value->>'group'='girls' else (value->>'character') is distinct from p_character end;
  outfits:=outfits||p_outfits;
 end if;
 return jsonb_build_object('equipped',equipment,'outfits',outfits);
end $$;
revoke all on function avatar_closet.change_character(jsonb,text,jsonb,jsonb) from public,anon,authenticated;

create function avatar_closet.sync_character(p_token uuid,p_character text,p_equipped jsonb default null,p_outfits jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; current_value jsonb; result jsonb;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
 insert into avatar_closet.wardrobes(student_id) values(student) on conflict(student_id) do nothing;
 select jsonb_build_object('equipped',w.equipped,'outfits',w.outfits) into current_value
  from avatar_closet.wardrobes w where w.student_id=student for update;
 result:=avatar_closet.change_character(current_value,p_character,p_equipped,p_outfits);
 update avatar_closet.wardrobes set equipped=result->'equipped',outfits=result->'outfits',updated_at=now() where student_id=student;
 return result;
end $$;
revoke all on function avatar_closet.sync_character(uuid,text,jsonb,jsonb) from public,anon;
grant execute on function avatar_closet.sync_character(uuid,text,jsonb,jsonb) to authenticated;
create function public.character_closet_sync(p_token uuid,p_character text,p_equipped jsonb default null,p_outfits jsonb default null)
returns jsonb language sql security invoker set search_path='' as $$
 select avatar_closet.sync_character(p_token,p_character,p_equipped,p_outfits);
$$;
revoke all on function public.character_closet_sync(uuid,text,jsonb,jsonb) from public,anon;
grant execute on function public.character_closet_sync(uuid,text,jsonb,jsonb) to authenticated;

-- Older pages can restore, but cannot overwrite independent looks with a shared snapshot.
create or replace function avatar_closet.sync(p_token uuid,p_equipped jsonb default null,p_outfits jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; result jsonb;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
 if p_equipped is not null or p_outfits is not null then raise exception 'The wardrobe has been updated. Please refresh this page before saving.'; end if;
 select avatar_closet.independent_wardrobe(w.equipped,w.outfits) into result from avatar_closet.wardrobes w where w.student_id=student;
 return coalesce(result,jsonb_build_object('equipped','{}'::jsonb,'outfits','[]'::jsonb));
end $$;
