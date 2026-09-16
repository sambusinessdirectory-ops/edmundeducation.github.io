-- Pure-function regression: does not read or write student wardrobes.
do $$
declare w jsonb; original jsonb; rejected boolean:=false;
begin
 original:='{"equipped":{"top":"blue-swordsman-jacket","girlsTop":"cream-sherpa-jacket"},"outfits":[{"name":"Winter","group":"girls","equipped":{"girlsTop":"cream-sherpa-jacket"},"favorite":true}]}';
 w:=avatar_closet.independent_wardrobe(original->'equipped',original->'outfits');
 if jsonb_array_length(w->'outfits')<>3 or w->'equipped'?'girlsTop' then raise exception 'Legacy migration failed'; end if;
 if avatar_closet.independent_wardrobe(w->'equipped',w->'outfits')<>w then raise exception 'Migration is not idempotent'; end if;
 w:=avatar_closet.change_character(w,'elsie','{}',null);
 if w->'equipped'?'elsieTop' or w->'equipped'->>'phoebeTop'<>'cream-sherpa-jacket' or w->'equipped'->>'celesteTop'<>'cream-sherpa-jacket' then raise exception 'Removing Elsie affected others'; end if;
 w:=avatar_closet.change_character(w,'boys','{"headwear":"white-fedora"}','[]');
 if w->'equipped'->>'phoebeTop'<>'cream-sherpa-jacket' or jsonb_array_length(w->'outfits')<>3 then raise exception 'Boys save overwrote girls'; end if;
 begin perform avatar_closet.change_character(w,'elsie','{"phoebeTop":"cream-sherpa-jacket"}',null); exception when others then rejected:=true; end;
 if not rejected then raise exception 'Cross-character write was accepted'; end if;
 rejected:=false;
 begin perform avatar_closet.change_character(w,'elsie',null,'[{"name":"Bad","group":"girls","character":"phoebe","equipped":{}}]'); exception when others then rejected:=true; end;
 if not rejected then raise exception 'Cross-character set was accepted'; end if;
 if has_function_privilege('anon','public.character_closet_sync(uuid,text,jsonb,jsonb)','EXECUTE') then raise exception 'Anonymous RPC access'; end if;
 if has_function_privilege('authenticated','avatar_closet.change_character(jsonb,text,jsonb,jsonb)','EXECUTE') then raise exception 'Private merge helper exposed'; end if;
end $$;
select 'PASS independent wardrobes, legacy migration, unrelated-character preservation, invalid-slot rejection and grants' as result;
