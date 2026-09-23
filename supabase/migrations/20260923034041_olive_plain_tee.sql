create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value-'headwear'-'top'-'girlsTop'-'celesteTop'-'phoebeTop'-'elsieTop')='{}'::jsonb
 and (not(value?'headwear') or value->>'headwear'='white-fedora')
 and (not(value?'top') or value->>'top' in ('cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee'))
 and (not(value?'girlsTop') or value->>'girlsTop'='cream-sherpa-jacket')
 and (not(value?'celesteTop') or value->>'celesteTop'='cream-sherpa-jacket')
 and (not(value?'phoebeTop') or value->>'phoebeTop'='cream-sherpa-jacket')
 and (not(value?'elsieTop') or value->>'elsieTop'='cream-sherpa-jacket');
$$;
