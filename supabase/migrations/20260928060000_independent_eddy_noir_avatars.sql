-- Purchased clothes stay account-wide; saved looks and outfit sets are per character.
-- Legacy boys equipment belongs to Eddy. Noir starts with his own empty look.
create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value-'headwear'-'top'-'girlsTop'-'eddyHeadwear'-'eddyTop'-'noirHeadwear'-'noirTop'-'celesteTop'-'phoebeTop'-'elsieTop')='{}'::jsonb
 and (not(value?'headwear') or value->>'headwear'='white-fedora')
 and (not(value?'eddyHeadwear') or value->>'eddyHeadwear'='white-fedora')
 and (not(value?'noirHeadwear') or value->>'noirHeadwear'='white-fedora')
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'eddyTop') or value->>'eddyTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'noirTop') or value->>'noirTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'girlsTop') or value->>'girlsTop' in ('cream-sherpa-jacket','pink-rain-jacket'))
 and (not(value?'celesteTop') or value->>'celesteTop' in ('cream-sherpa-jacket','pink-rain-jacket'))
 and (not(value?'phoebeTop') or value->>'phoebeTop' in ('cream-sherpa-jacket','pink-rain-jacket'))
 and (not(value?'elsieTop') or value->>'elsieTop' in ('cream-sherpa-jacket','pink-rain-jacket'));
$$;

create or replace function avatar_closet.independent_wardrobe(e jsonb,o jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare equipment jsonb:=coalesce(e,'{}')-'girlsTop'-'top'-'headwear'; outfits jsonb:='[]'; item jsonb; c text; fit jsonb;
begin
 if e?'top' and not(equipment?'eddyTop') then equipment:=equipment||jsonb_build_object('eddyTop',e->'top'); end if;
 if e?'headwear' and not(equipment?'eddyHeadwear') then equipment:=equipment||jsonb_build_object('eddyHeadwear',e->'headwear'); end if;
 if e->>'girlsTop' in ('cream-sherpa-jacket','pink-rain-jacket') then
  foreach c in array array['celeste','phoebe','elsie'] loop
   if not(equipment?(c||'Top')) then equipment:=equipment||jsonb_build_object(c||'Top',e->'girlsTop'); end if;
  end loop;
 end if;
 for item in select value from jsonb_array_elements(coalesce(o,'[]')) loop
  if item->>'group'='girls' and not(item?'character') then
   foreach c in array array['celeste','phoebe','elsie'] loop
    fit:=case when item->'equipped'->>'girlsTop' in ('cream-sherpa-jacket','pink-rain-jacket') then jsonb_build_object(c||'Top',item->'equipped'->'girlsTop') else '{}'::jsonb end;
    outfits:=outfits||jsonb_build_array(item||jsonb_build_object('character',c,'equipped',fit));
   end loop;
  elsif item->>'group'='girls' or item->>'character' in ('eddy','noir') then
   outfits:=outfits||jsonb_build_array(item);
  else
   fit:='{}'::jsonb;
   if item->'equipped'?'top' then fit:=fit||jsonb_build_object('eddyTop',item->'equipped'->'top'); end if;
   if item->'equipped'?'headwear' then fit:=fit||jsonb_build_object('eddyHeadwear',item->'equipped'->'headwear'); end if;
   outfits:=outfits||jsonb_build_array(item||jsonb_build_object('group','boys','character','eddy','equipped',fit));
  end if;
 end loop;
 return jsonb_build_object('equipped',equipment,'outfits',outfits);
end; $$;

create or replace function avatar_closet.change_character(current_value jsonb,p_character text,p_equipped jsonb,p_outfits jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; equipment jsonb; outfits jsonb; item jsonb; slots text[];
begin
 if p_character is null or p_character not in ('eddy','noir','celeste','phoebe','elsie') then raise exception 'Refresh the wardrobe before saving this character'; end if;
 slots:=case when p_character in ('eddy','noir') then array[p_character||'Headwear',p_character||'Top'] else array[p_character||'Top'] end;
 result:=avatar_closet.independent_wardrobe(current_value->'equipped',current_value->'outfits');
 equipment:=result->'equipped'; outfits:=result->'outfits';
 if p_equipped is not null then
  if not coalesce(avatar_closet.valid_equipment(p_equipped),false) or (p_equipped-slots)<>'{}'::jsonb then raise exception 'Invalid character equipment'; end if;
  equipment:=(equipment-slots)||p_equipped;
 end if;
 if p_outfits is not null then
  if jsonb_typeof(p_outfits)<>'array' or jsonb_array_length(p_outfits)>50 then raise exception 'Invalid outfit collection'; end if;
  for item in select value from jsonb_array_elements(p_outfits) loop
   if jsonb_typeof(item)<>'object' or length(btrim(coalesce(item->>'name',''))) not between 1 and 60
    or not coalesce(avatar_closet.valid_equipment(item->'equipped'),false)
    or ((item->'equipped')-slots)<>'{}'::jsonb
    or (item-'name'-'equipped'-'favorite'-'group'-'character')<>'{}'::jsonb
    or (item?'favorite' and jsonb_typeof(item->'favorite')<>'boolean')
    or coalesce(item->>'character','')<>p_character
    or (p_character in ('eddy','noir') and coalesce(item->>'group','')<>'boys')
    or (p_character not in ('eddy','noir') and coalesce(item->>'group','')<>'girls')
   then raise exception 'Invalid character outfit'; end if;
  end loop;
  select coalesce(jsonb_agg(value),'[]'::jsonb) into outfits from jsonb_array_elements(outfits) where value->>'character' is distinct from p_character;
  outfits:=outfits||p_outfits;
 end if;
 return jsonb_build_object('equipped',equipment,'outfits',outfits);
end; $$;

-- Convert saved rows once so future readers and older cached clients see canonical fields.
update avatar_closet.wardrobes as w
set equipped=(avatar_closet.independent_wardrobe(w.equipped,w.outfits))->'equipped',
    outfits=(avatar_closet.independent_wardrobe(w.equipped,w.outfits))->'outfits',
    updated_at=now()
where w.equipped is distinct from (avatar_closet.independent_wardrobe(w.equipped,w.outfits))->'equipped'
   or w.outfits is distinct from (avatar_closet.independent_wardrobe(w.equipped,w.outfits))->'outfits';
