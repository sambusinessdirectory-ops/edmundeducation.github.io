-- Three character-fitted top-slot shirts for Eddy and Noir.
-- They remain compatible with headwear and footwear and are unavailable to girls.
insert into eddie_farm.cosmetic_catalog(id,name,price,enabled)
values
 ('black-ivory-retro-bowling-shirt','Black ivory retro bowling shirt',30,true),
 ('burgundy-hot-rod-bowling-shirt','Burgundy hot-rod bowling shirt',35,true),
 ('ivory-black-flame-shirt','Ivory black-flame camp shirt',30,true)
on conflict (id) do update set name=excluded.name,price=excluded.price,enabled=true;

create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value-'headwear'-'top'-'girlsTop'-'eddyHeadwear'-'eddyTop'-'eddyFeet'-'noirHeadwear'-'noirTop'-'noirFeet'-'celesteHeadwear'-'celesteTop'-'celesteFullBody'-'celesteFeet'-'phoebeHeadwear'-'phoebeTop'-'phoebeFullBody'-'phoebeFeet'-'elsieHeadwear'-'elsieTop'-'elsieFullBody'-'elsieFeet')='{}'::jsonb
 and (not(value?'headwear') or value->>'headwear' in ('white-fedora','ivory-botanical-cap'))
 and (not(value?'eddyHeadwear') or value->>'eddyHeadwear' in ('white-fedora','ivory-botanical-cap'))
 and (not(value?'noirHeadwear') or value->>'noirHeadwear' in ('white-fedora','ivory-botanical-cap'))
 and (not(value?'celesteHeadwear') or value->>'celesteHeadwear'='ivory-botanical-cap')
 and (not(value?'phoebeHeadwear') or value->>'phoebeHeadwear'='ivory-botanical-cap')
 and (not(value?'elsieHeadwear') or value->>'elsieHeadwear'='ivory-botanical-cap')
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt'))
 and (not(value?'eddyTop') or value->>'eddyTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt'))
 and (not(value?'noirTop') or value->>'noirTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt'))
 and (not(value?'girlsTop') or value->>'girlsTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee'))
 and (not(value?'celesteTop') or value->>'celesteTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee'))
 and (not(value?'phoebeTop') or value->>'phoebeTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee'))
 and (not(value?'elsieTop') or value->>'elsieTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee'))
 and (not(value?'celesteFullBody') or value->>'celesteFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'phoebeFullBody') or value->>'phoebeFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'elsieFullBody') or value->>'elsieFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'eddyFeet') or value->>'eddyFeet'='brown-shearling-lace-boots')
 and (not(value?'noirFeet') or value->>'noirFeet'='brown-shearling-lace-boots')
 and (not(value?'celesteFeet') or value->>'celesteFeet'='brown-shearling-lace-boots')
 and (not(value?'phoebeFeet') or value->>'phoebeFeet'='brown-shearling-lace-boots')
 and (not(value?'elsieFeet') or value->>'elsieFeet'='brown-shearling-lace-boots')
 and not(value?'celesteFullBody' and value?'celesteTop')
 and not(value?'phoebeFullBody' and value?'phoebeTop')
 and not(value?'elsieFullBody' and value?'elsieTop');
$$;

create or replace function avatar_closet.change_character(current_value jsonb,p_character text,p_equipped jsonb,p_outfits jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare result jsonb; equipment jsonb; outfits jsonb; item jsonb; slots text[];
begin
 if p_character is null or p_character not in ('eddy','noir','celeste','phoebe','elsie') then raise exception 'Refresh the wardrobe before saving this character'; end if;
 slots:=case when p_character in ('eddy','noir') then array[p_character||'Headwear',p_character||'Top',p_character||'Feet'] else array[p_character||'Headwear',p_character||'Top',p_character||'FullBody',p_character||'Feet'] end;
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
