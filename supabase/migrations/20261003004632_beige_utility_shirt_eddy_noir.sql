-- One boys' top catalog item with independent fitted artwork for Eddy and Noir.
insert into eddie_farm.cosmetic_catalog(id,name,price,enabled)
values ('beige-utility-shirt','Beige rolled-sleeve utility shirt',30,true)
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
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt','beige-utility-shirt'))
 and (not(value?'eddyTop') or value->>'eddyTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt','beige-utility-shirt'))
 and (not(value?'noirTop') or value->>'noirTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt','beige-utility-shirt'))
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
