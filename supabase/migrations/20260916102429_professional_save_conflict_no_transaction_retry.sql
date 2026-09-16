-- A stale client revision is a business conflict, not a database serialization failure.
-- PostgREST retries SQLSTATE 40001 internally; a permanent mismatch can otherwise
-- exhaust the API and block logins across all portals. Preserve all saved progress.
create or replace function public.special_flash_save(p_token uuid,p_deck uuid,p_version int,p_marks jsonb,p_study jsonb,p_revision bigint,p_mutation uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);d public.special_flash_decks;p public.special_flash_progress;payload jsonb;k text;val text;ids text[];
begin
 if a.id is null or not public._special_flash_access(a.id,p_deck) then raise exception 'This deck is not available to your account.' using errcode='42501';end if;
 select * into d from public.special_flash_decks where id=p_deck;
 if p_version is distinct from d.version or p_mutation is null or p_revision is null or p_revision<0 or p_marks is null or jsonb_typeof(p_marks)<>'object' or octet_length(p_marks::text)>500000 then raise exception 'Reopen this deck before continuing.' using errcode='22023';end if;
 select array_agg(c->>'id') into ids from jsonb_array_elements(d.cards) c;
 for k,val in select key,value from jsonb_each_text(p_marks) loop if not coalesce(k=any(ids),false) or val is null or val not in ('green','red') then raise exception 'Invalid card mark.' using errcode='22023';end if;end loop;
 if p_study is not null and p_study<>'null'::jsonb then
  if jsonb_typeof(p_study)<>'object' or octet_length(p_study::text)>500000 or jsonb_typeof(p_study->'queue') is distinct from 'array' or jsonb_array_length(p_study->'queue')>5000 or coalesce((p_study->>'position')::int,-1) not between 0 and jsonb_array_length(p_study->'queue') then raise exception 'Invalid study session.' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements_text(p_study->'queue') x where not coalesce(x=any(ids),false)) then raise exception 'Invalid study card.' using errcode='22023';end if;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('special-progress:'||a.id||p_deck,0));
 payload:=jsonb_build_object('version',p_version,'marks',p_marks,'study',p_study);
 select * into p from public.special_flash_progress where account_id=a.id and deck_id=p_deck for update;
 if p.mutation_id=p_mutation then if p.mutation_payload is distinct from payload then raise exception 'Save request changed.' using errcode='23505';end if;return jsonb_build_object('saved',true,'revision',p.revision,'mutation_id',p_mutation);end if;
 if coalesce(p.revision,0)<>p_revision then raise exception 'Progress changed on another device. Reopen this deck to load it.' using errcode='PT409';end if;
 insert into public.special_flash_progress(account_id,deck_id,version,marks,study,revision,mutation_id,mutation_payload) values(a.id,p_deck,p_version,p_marks,p_study,coalesce(p.revision,0)+1,p_mutation,payload) on conflict(account_id,deck_id) do update set version=excluded.version,marks=excluded.marks,study=excluded.study,revision=excluded.revision,mutation_id=excluded.mutation_id,mutation_payload=excluded.mutation_payload,updated_at=now() returning * into p;
 return jsonb_build_object('saved',true,'revision',p.revision,'mutation_id',p_mutation);
end$$;

notify pgrst, 'reload schema';
