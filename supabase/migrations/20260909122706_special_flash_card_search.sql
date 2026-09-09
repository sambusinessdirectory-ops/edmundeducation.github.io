-- Literal, case-insensitive substring search works with Chinese text without
-- requiring an English tokenizer. Access is checked before returning any card.
create function public.special_flash_search(p_token uuid,p_query text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);q text:=lower(btrim(coalesce(p_query,'')));matches jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if char_length(q)>200 then raise exception 'Use a search of 200 characters or fewer.' using errcode='22023';end if;
 if q='' then return jsonb_build_object('results','[]'::jsonb,'has_more',false);end if;
 select coalesce(jsonb_agg(row_data order by course_created,deck_created,ordinal),'[]') into matches from (
 select jsonb_build_object('deck_id',d.id,'deck_title',d.title,'course_title',c.title,'card_id',card->>'id','front',card->>'front','back',card->>'back','note',coalesce(card->>'note','')) as row_data,c.created_at as course_created,d.created_at as deck_created,ordinal
 from public.special_flash_decks d join public.special_flash_courses c on c.id=d.course_id cross join lateral jsonb_array_elements(d.cards) with ordinality as cards(card,ordinal)
 where public._special_flash_access(a.id,d.id) and (strpos(lower(card->>'front'),q)>0 or strpos(lower(card->>'back'),q)>0 or strpos(lower(coalesce(card->>'note','')),q)>0)
 order by c.created_at,d.created_at,ordinal limit 101
 ) visible_matches;
 return jsonb_build_object('results',(select coalesce(jsonb_agg(value order by ordinality),'[]') from jsonb_array_elements(matches) with ordinality where ordinality<=100),'has_more',jsonb_array_length(matches)>100);
end$$;
revoke all on function public.special_flash_search(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_search(uuid,text) to anon,authenticated;
