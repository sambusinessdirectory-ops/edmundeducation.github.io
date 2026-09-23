begin;
grant execute on function eddie_farm.cosmetic_purchase(uuid,text,uuid),public.eddie_farm_cosmetic(uuid,text,uuid),public.eddie_farm_owned_cosmetics(uuid) to anon,authenticated;
commit;
