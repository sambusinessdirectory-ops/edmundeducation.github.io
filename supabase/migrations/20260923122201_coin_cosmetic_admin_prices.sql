begin;
set local lock_timeout='5s';

create table if not exists eddie_farm.cosmetic_price_audit (
 id bigint generated always as identity primary key,
 item_id text not null references eddie_farm.cosmetic_catalog(id),
 admin_id uuid not null references eddie_farm.admin_accounts(id),
 previous_price integer not null,
 new_price integer not null,
 changed_at timestamptz not null default now()
);
revoke all on eddie_farm.cosmetic_price_audit from public,anon,authenticated,service_role;

create or replace function eddie_farm.admin_cosmetic_catalog(p_token uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_admin uuid:=eddie_farm.admin_id(p_token);
begin
 return jsonb_build_object('items',coalesce((
  select jsonb_agg(jsonb_build_object(
   'id',c.id,'name',c.name,'price',c.price,'enabled',c.enabled,
   'image_character',case when c.id in ('cream-sherpa-jacket','pink-rain-jacket') then 'phoebe' else 'eddy' end
  ) order by c.name,c.id)
  from eddie_farm.cosmetic_catalog c
 ),'[]'::jsonb));
end $$;

create or replace function eddie_farm.admin_update_cosmetic_price(p_token uuid,p_item text,p_price integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_admin uuid:=eddie_farm.admin_id(p_token);v_before integer;v_after integer;
begin
 if p_price is null or p_price<1 or p_price>100000 then raise exception 'Enter a coin price from 1 to 100,000.' using errcode='22023';end if;
 select price into v_before from eddie_farm.cosmetic_catalog where id=p_item for update;
 if not found then raise exception 'This cosmetic could not be found.' using errcode='22023';end if;
 update eddie_farm.cosmetic_catalog set price=p_price where id=p_item returning price into v_after;
 if v_before<>v_after then insert into eddie_farm.cosmetic_price_audit(item_id,admin_id,previous_price,new_price) values(p_item,v_admin,v_before,v_after);end if;
 return jsonb_build_object('id',p_item,'price',v_after,'previous_price',v_before);
end $$;

create or replace function eddie_farm.admin_preview_cosmetics(p_token uuid) returns text[]
language plpgsql stable security definer set search_path='' as $$
declare v_admin uuid:=eddie_farm.admin_id(p_token);
begin
 return coalesce((select array_agg(id order by id) from eddie_farm.cosmetic_catalog where enabled),'{}'::text[]);
end $$;

create or replace function public.eddie_farm_admin_cosmetic_catalog(p_token uuid) returns jsonb
language sql security invoker set search_path='' as $$ select eddie_farm.admin_cosmetic_catalog(p_token) $$;
create or replace function public.eddie_farm_admin_update_cosmetic_price(p_token uuid,p_item text,p_price integer) returns jsonb
language sql security invoker set search_path='' as $$ select eddie_farm.admin_update_cosmetic_price(p_token,p_item,p_price) $$;
create or replace function public.eddie_farm_admin_preview_cosmetics(p_token uuid) returns text[]
language sql security invoker set search_path='' as $$ select eddie_farm.admin_preview_cosmetics(p_token) $$;

revoke all on function eddie_farm.admin_cosmetic_catalog(uuid),eddie_farm.admin_update_cosmetic_price(uuid,text,integer),eddie_farm.admin_preview_cosmetics(uuid),public.eddie_farm_admin_cosmetic_catalog(uuid),public.eddie_farm_admin_update_cosmetic_price(uuid,text,integer),public.eddie_farm_admin_preview_cosmetics(uuid) from public,anon,authenticated,service_role;
grant execute on function eddie_farm.admin_cosmetic_catalog(uuid),eddie_farm.admin_update_cosmetic_price(uuid,text,integer),eddie_farm.admin_preview_cosmetics(uuid),public.eddie_farm_admin_cosmetic_catalog(uuid),public.eddie_farm_admin_update_cosmetic_price(uuid,text,integer),public.eddie_farm_admin_preview_cosmetics(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
