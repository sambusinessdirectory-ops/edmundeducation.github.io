-- Sleeveless character-fitted top for Celeste, Phoebe and Elsie.
-- It occupies only the top slot and remains compatible with headwear and shoes.
insert into eddie_farm.cosmetic_catalog(id,name,price,enabled)
values ('navy-cream-knit-vest','Navy cream-trim knit vest',30,true)
on conflict (id) do update set name=excluded.name,price=excluded.price,enabled=true;

create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value-'headwear'-'top'-'girlsTop'-'eddyHeadwear'-'eddyTop'-'noirHeadwear'-'noirTop'-'celesteHeadwear'-'celesteTop'-'phoebeHeadwear'-'phoebeTop'-'elsieHeadwear'-'elsieTop'-'celesteFullBody'-'phoebeFullBody'-'elsieFullBody')='{}'::jsonb
 and (not(value?'headwear') or value->>'headwear' in ('white-fedora','ivory-botanical-cap'))
 and (not(value?'eddyHeadwear') or value->>'eddyHeadwear' in ('white-fedora','ivory-botanical-cap'))
 and (not(value?'noirHeadwear') or value->>'noirHeadwear' in ('white-fedora','ivory-botanical-cap'))
 and (not(value?'celesteHeadwear') or value->>'celesteHeadwear'='ivory-botanical-cap')
 and (not(value?'phoebeHeadwear') or value->>'phoebeHeadwear'='ivory-botanical-cap')
 and (not(value?'elsieHeadwear') or value->>'elsieHeadwear'='ivory-botanical-cap')
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'eddyTop') or value->>'eddyTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'noirTop') or value->>'noirTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'girlsTop') or value->>'girlsTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest'))
 and (not(value?'celesteTop') or value->>'celesteTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest'))
 and (not(value?'phoebeTop') or value->>'phoebeTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest'))
 and (not(value?'elsieTop') or value->>'elsieTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest'))
 and (not(value?'celesteFullBody') or value->>'celesteFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'phoebeFullBody') or value->>'phoebeFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'elsieFullBody') or value->>'elsieFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and not(value?'celesteFullBody' and value?'celesteTop')
 and not(value?'phoebeFullBody' and value?'phoebeTop')
 and not(value?'elsieFullBody' and value?'elsieTop');
$$;

create or replace function avatar_closet.change_character(current_value jsonb,p_character text,p_equipped jsonb,p_outfits jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; equipment jsonb; outfits jsonb; item jsonb; slots text[];
begin
 if p_character is null or p_character not in ('eddy','noir','celeste','phoebe','elsie') then raise exception 'Refresh the wardrobe before saving this character'; end if;
 slots:=case when p_character in ('eddy','noir') then array[p_character||'Headwear',p_character||'Top'] else array[p_character||'Headwear',p_character||'Top',p_character||'FullBody'] end;
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
