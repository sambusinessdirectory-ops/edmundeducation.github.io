-- Professional English uses its existing scoped account tokens. New features
-- cannot change enrollment, authentication, flashcard revisions or team scores.
create table public.special_flash_messages (
 id uuid primary key,
 body text not null check(length(btrim(body)) between 1 and 4000),
 revision integer not null default 1,
 created_by uuid references public.special_flash_accounts(id) on delete set null,
 updated_at timestamptz not null default now(),
 deleted boolean not null default false
);
alter table public.special_flash_messages enable row level security;
-- All access goes through the scoped-token RPC, so direct-table RLS intentionally has no policies.
revoke all on public.special_flash_messages from public,anon,authenticated,service_role;
create index special_flash_messages_author_idx on public.special_flash_messages(created_by);
create index special_flash_messages_published_idx on public.special_flash_messages(updated_at desc) where not deleted;

create function public.special_flash_messages(p_token uuid,p_action text default 'list',p_id uuid default null,p_body text default null,p_revision integer default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);m public.special_flash_messages;result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if p_action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'body',body,'revision',revision,'updated_at',updated_at) order by updated_at desc),'[]') into result
  from (select * from public.special_flash_messages where not deleted order by updated_at desc limit 100) messages;
  return result;
 end if;
 if a.role<>'admin' then raise exception 'Administrator access required.' using errcode='42501';end if;
 if p_action not in ('publish','delete') or p_id is null then raise exception 'Invalid message action.' using errcode='22023';end if;
 if p_action='publish' and (p_body is null or length(btrim(p_body)) not between 1 and 4000 or octet_length(p_body)>16000) then raise exception 'Write a message from 1 to 4000 characters.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('professional-message:'||p_id,0));
 select * into m from public.special_flash_messages where id=p_id for update;
 if p_action='publish' then
  if m.id is not null and not m.deleted and m.body=btrim(p_body) then return jsonb_build_object('saved',true,'id',m.id,'revision',m.revision,'deleted',false);end if;
  if m.id is not null or coalesce(p_revision,0)<>0 then raise exception 'This message already exists. Refresh the message board.' using errcode='PT409';end if;
  insert into public.special_flash_messages(id,body,created_by) values(p_id,btrim(p_body),a.id) returning * into m;
 else
  if m.id is null or m.deleted then return jsonb_build_object('deleted',true,'id',p_id);end if;
  if p_revision is distinct from m.revision then raise exception 'This message changed. Refresh the message board.' using errcode='PT409';end if;
  update public.special_flash_messages set deleted=true,revision=revision+1,updated_at=now() where id=p_id returning * into m;
 end if;
 return jsonb_build_object('saved',true,'id',m.id,'revision',m.revision,'deleted',m.deleted);
end $$;
revoke all on function public.special_flash_messages(uuid,text,uuid,text,integer) from public;
grant execute on function public.special_flash_messages(uuid,text,uuid,text,integer) to anon,authenticated;

create or replace function public.special_flash_learning_state(p_token uuid,p_key text default null,p_value jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if p_key is null then
  select coalesce(jsonb_object_agg(key,value),'{}') into result from public.special_learning_state where account_id=a.id and (key like 'font:%' or key like 'bookmark:%' or key like 'playlist:%' or key='pref:auto-audio');
  return result;
 end if;
 if length(p_key)>200 or p_key !~ '^(font:(home|flashcards|dialogue|polysemy)|draft:[a-zA-Z0-9:_-]+|bookmark:[a-zA-Z0-9:_-]+|playlist:[0-9a-f-]{36}|pref:auto-audio)$' then raise exception 'Invalid preference key.' using errcode='22023';end if;
 if p_value is not null then
  if octet_length(p_value::text)>100000 then raise exception 'Saved state is too large.' using errcode='22023';end if;
  if p_key like 'font:%' and p_value not in ('1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb) then raise exception 'Choose a font scale from 1 to 5.' using errcode='22023';end if;
  if p_key='pref:auto-audio' and jsonb_typeof(p_value) is distinct from 'boolean' then raise exception 'Invalid audio preference.' using errcode='22023';end if;
  if p_key like 'playlist:%' then
   if jsonb_typeof(p_value) is distinct from 'object' or jsonb_typeof(p_value->'name') is distinct from 'string' or length(btrim(p_value->>'name')) not between 1 and 80 or jsonb_typeof(p_value->'items') is distinct from 'array' then raise exception 'Invalid playlist.' using errcode='22023';end if;
   if jsonb_array_length(p_value->'items')>500 or exists(select 1 from jsonb_array_elements(p_value->'items') item where jsonb_typeof(item)<>'string' or length(item#>>'{}')>200 or (item#>>'{}') !~ '^bookmark:[a-zA-Z0-9:_-]+$') then raise exception 'Invalid playlist items.' using errcode='22023';end if;
  end if;
  insert into public.special_learning_state(account_id,key,value) values(a.id,p_key,p_value)
   on conflict(account_id,key) do update set value=excluded.value,updated_at=now();
 end if;
 select value into result from public.special_learning_state where account_id=a.id and key=p_key;
 return result;
end $$;
-- Literal, case-insensitive substring search works with Chinese text without
-- requiring an English tokenizer. Access is checked before returning any card.
create or replace function public.special_flash_search(p_token uuid,p_query text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);q text:=lower(btrim(coalesce(p_query,'')));matches jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if char_length(q)>200 then raise exception 'Use a search of 200 characters or fewer.' using errcode='22023';end if;
 if q='' then return jsonb_build_object('results','[]'::jsonb,'has_more',false);end if;
 select coalesce(jsonb_agg(row_data order by course_created,deck_created,ordinal),'[]') into matches from (
 select jsonb_build_object('deck_id',d.id,'deck_title',d.title,'course_title',c.title,'card_id',card->>'id','position',ordinal,'front',card->>'front','back',card->>'back','note',coalesce(card->>'note','')) as row_data,c.created_at as course_created,d.created_at as deck_created,ordinal
 from public.special_flash_decks d join public.special_flash_courses c on c.id=d.course_id cross join lateral jsonb_array_elements(d.cards) with ordinality as cards(card,ordinal)
 where public._special_flash_access(a.id,d.id) and (strpos(lower(card->>'front'),q)>0 or strpos(lower(card->>'back'),q)>0 or strpos(lower(coalesce(card->>'note','')),q)>0 or strpos(lower(coalesce((card->'examples')::text,'')),q)>0 or strpos(lower(coalesce((card->'examples_zh')::text,'')),q)>0)
 order by c.created_at,d.created_at,ordinal limit 101
 ) visible_matches;
 return jsonb_build_object('results',(select coalesce(jsonb_agg(value order by ordinality),'[]') from jsonb_array_elements(matches) with ordinality where ordinality<=100),'has_more',jsonb_array_length(matches)>100);
end$$;
revoke all on function public.special_flash_search(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_search(uuid,text) to anon,authenticated;

notify pgrst, 'reload schema';
