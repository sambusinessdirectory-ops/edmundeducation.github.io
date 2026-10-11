-- Three independently fitted upper-body garments for Celeste, Phoebe and Elsie.
-- Prepared for review only; deployment remains gated by the visual-acceptance manifests.
insert into eddie_farm.cosmetic_catalog(id,name,price,enabled)
values
 ('ivory-bow-neck-blouse','Ivory bow-neck blouse',30,true),
 ('brown-zip-front-jacket','Brown zip-front jacket',35,true),
 ('dusty-rose-oversized-sweatshirt','Dusty rose oversized sweatshirt',30,true)
on conflict (id) do update set name=excluded.name,price=excluded.price,enabled=true;

create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value-'headwear'-'top'-'girlsTop'-'eddyHeadwear'-'eddyTop'-'eddyLower'-'eddyFullBody'-'eddyFeet'-'noirHeadwear'-'noirTop'-'noirLower'-'noirFullBody'-'noirFeet'-'celesteHeadwear'-'celesteTop'-'celesteFullBody'-'celesteFeet'-'phoebeHeadwear'-'phoebeTop'-'phoebeFullBody'-'phoebeFeet'-'elsieHeadwear'-'elsieTop'-'elsieFullBody'-'elsieFeet')='{}'::jsonb
 and (not(value?'headwear') or value->>'headwear' in ('white-fedora','ivory-botanical-cap','navy-fish-bucket-hat','ivory-racecar-baseball-cap'))
 and (not(value?'eddyHeadwear') or value->>'eddyHeadwear' in ('white-fedora','ivory-botanical-cap','navy-fish-bucket-hat','ivory-racecar-baseball-cap'))
 and (not(value?'noirHeadwear') or value->>'noirHeadwear' in ('white-fedora','ivory-botanical-cap','navy-fish-bucket-hat','ivory-racecar-baseball-cap'))
 and (not(value?'celesteHeadwear') or value->>'celesteHeadwear' in ('ivory-botanical-cap','navy-fish-bucket-hat','ivory-racecar-baseball-cap'))
 and (not(value?'phoebeHeadwear') or value->>'phoebeHeadwear' in ('ivory-botanical-cap','navy-fish-bucket-hat','ivory-racecar-baseball-cap'))
 and (not(value?'elsieHeadwear') or value->>'elsieHeadwear' in ('ivory-botanical-cap','navy-fish-bucket-hat','ivory-racecar-baseball-cap'))
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt','beige-utility-shirt','white-shirt-black-tie','black-v-neck-collar-sweater','navy-blazer-cream-sweatshirt','white-navy-oxford','navy-cream-rugby','forest-burgundy-rugby'))
 and (not(value?'eddyTop') or value->>'eddyTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt','beige-utility-shirt','white-shirt-black-tie','black-v-neck-collar-sweater','navy-blazer-cream-sweatshirt','white-navy-oxford','navy-cream-rugby','forest-burgundy-rugby'))
 and (not(value?'noirTop') or value->>'noirTop' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee','white-oversized-tee','black-ivory-retro-bowling-shirt','burgundy-hot-rod-bowling-shirt','ivory-black-flame-shirt','beige-utility-shirt','white-shirt-black-tie','black-v-neck-collar-sweater','navy-blazer-cream-sweatshirt','white-navy-oxford','navy-cream-rugby','forest-burgundy-rugby'))
 and (not(value?'eddyLower') or value->>'eddyLower' in ('charcoal-wash-jeans','classic-blue-jeans'))
 and (not(value?'noirLower') or value->>'noirLower' in ('charcoal-wash-jeans','classic-blue-jeans'))
 and (not(value?'eddyFullBody') or value->>'eddyFullBody' in ('crimson-gilded-court-coat','shadow-thorn-robe','ivory-wayfarer-robe'))
 and (not(value?'noirFullBody') or value->>'noirFullBody' in ('crimson-gilded-court-coat','shadow-thorn-robe','ivory-wayfarer-robe'))
 and (not(value?'girlsTop') or value->>'girlsTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee','ivory-bow-neck-blouse','brown-zip-front-jacket','dusty-rose-oversized-sweatshirt'))
 and (not(value?'celesteTop') or value->>'celesteTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee','ivory-bow-neck-blouse','brown-zip-front-jacket','dusty-rose-oversized-sweatshirt'))
 and (not(value?'phoebeTop') or value->>'phoebeTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee','ivory-bow-neck-blouse','brown-zip-front-jacket','dusty-rose-oversized-sweatshirt'))
 and (not(value?'elsieTop') or value->>'elsieTop' in ('cream-sherpa-jacket','pink-rain-jacket','navy-cream-knit-vest','white-oversized-tee','ivory-bow-neck-blouse','brown-zip-front-jacket','dusty-rose-oversized-sweatshirt'))
 and (not(value?'celesteFullBody') or value->>'celesteFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'phoebeFullBody') or value->>'phoebeFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'elsieFullBody') or value->>'elsieFullBody' in ('camel-coat-dress','ivory-tiered-dress'))
 and (not(value?'eddyFeet') or value->>'eddyFeet'='brown-shearling-lace-boots')
 and (not(value?'noirFeet') or value->>'noirFeet'='brown-shearling-lace-boots')
 and (not(value?'celesteFeet') or value->>'celesteFeet'='brown-shearling-lace-boots')
 and (not(value?'phoebeFeet') or value->>'phoebeFeet'='brown-shearling-lace-boots')
 and (not(value?'elsieFeet') or value->>'elsieFeet'='brown-shearling-lace-boots')
 and not(value?'eddyFullBody' and (value?'eddyTop' or value?'eddyLower' or value?'top'))
 and not(value?'noirFullBody' and (value?'noirTop' or value?'noirLower'))
 and not(value?'celesteFullBody' and value?'celesteTop')
 and not(value?'phoebeFullBody' and value?'phoebeTop')
 and not(value?'elsieFullBody' and value?'elsieTop');
$$;
