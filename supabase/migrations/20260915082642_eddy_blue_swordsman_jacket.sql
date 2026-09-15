-- Add one Eddy top without changing wardrobe ownership, RPCs or grants.
create or replace function avatar_closet.valid_equipment(value jsonb)
returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(value)='object'
 and (value - 'headwear' - 'top')='{}'::jsonb
 and (not (value ? 'headwear') or value->>'headwear'='white-fedora')
 and (not (value ? 'top') or value->>'top' in (
  'cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket'
 ));
$$;
