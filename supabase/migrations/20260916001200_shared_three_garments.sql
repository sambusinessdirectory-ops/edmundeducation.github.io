-- Allow three paired Eddy/Noir tops in the existing student-owned wardrobe.
-- Item IDs are shared; character-specific visual assets remain client-side.
create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value - 'headwear' - 'top')='{}'::jsonb
 and (not (value ? 'headwear') or value->>'headwear'='white-fedora')
 and (not (value ? 'top') or value->>'top' in (
  'cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket',
  'brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie'
 ));
$$;
