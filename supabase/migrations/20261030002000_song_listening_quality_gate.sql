create or replace function public.song_listening_audible_key(value text) returns text language sql immutable set search_path=public as $$
 select regexp_replace(replace(replace(replace(replace(replace(replace(replace(lower(value),'colour','color'),'favourite','favorite'),'honour','honor'),'centre','center'),'recognise','recognize'),'realise','realize'),'’',''),'[^a-z0-9]','','g');
$$;
do $repair$ declare c jsonb; sid uuid; mi int; qi int; oi int; correct text; begin
 for c in select value from jsonb_array_elements($changes$[{"slug": "a-thousand-years", "mode": "hard", "number": 2, "old": "Colors and promises", "new": "Shadows and promises", "answer": "Colours and promises"}, {"slug": "a-thousand-years", "mode": "hell", "number": 2, "old": "Colors and promises", "new": "Shadows and promises", "answer": "Colours and promises"}, {"slug": "happier", "mode": "medium", "number": 17, "old": "'Cause baby", "new": "Stay, baby", "answer": "Cause baby"}, {"slug": "happier", "mode": "hard", "number": 22, "old": "'Cause baby", "new": "Stay, baby", "answer": "Cause baby"}, {"slug": "happier", "mode": "hell", "number": 24, "old": "'Cause baby", "new": "Stay, baby", "answer": "Cause baby"}, {"slug": "you-give-love-a-bad-name", "mode": "hell", "number": 24, "old": "on your finger tips", "new": "on your rosy lips", "answer": "on your fingertips"}]$changes$::jsonb) loop
 select id into sid from public.song_appreciation_songs where slug=c->>'slug';
 for mi,qi,oi in select (m.ordinality-1)::int,(q.ordinality-1)::int,(o.ordinality-1)::int from public.song_appreciation_songs s,jsonb_array_elements(s.exercises) with ordinality m,jsonb_array_elements(m.value->'questions') with ordinality q,jsonb_array_elements_text(q.value->'options') with ordinality o where s.id=sid and m.value->>'id'=c->>'mode' and q.value->>'number'=c->>'number' and o.value=c->>'old' loop
 update public.song_appreciation_songs set exercises=jsonb_set(exercises,array[mi::text,'questions',qi::text,'options',oi::text],c->'new'),updated_at=now() where id=sid;
 end loop;
 end loop;
end $repair$;
create or replace function public.song_quality_guard() returns trigger language plpgsql set search_path=public as $$
declare m jsonb; q jsonb; p int; p1 int; p2 int; n int; distinct_n int;
begin
 for m in select value from jsonb_array_elements(new.exercises) loop
 p1:=null;p2:=null;
 for q in select value from jsonb_array_elements(m->'questions') order by (value->>'number')::int loop
 select count(*),count(distinct public.song_listening_audible_key(value)) into n,distinct_n from jsonb_array_elements_text(q->'options');
 if n<>distinct_n then raise exception 'Listening quality: % / % Q% has indistinguishable options',new.slug,m->>'id',q->>'number' using errcode='23514';end if;
 select ordinality::int into p from jsonb_array_elements_text(q->'options') with ordinality where value=q->>'answer';
 if p is null then raise exception 'Listening answer absent' using errcode='23514';end if;
 if p=p1 and p=p2 then raise exception 'Listening quality: % / % Q% repeats the correct position three times',new.slug,m->>'id',q->>'number' using errcode='23514';end if;
 p2:=p1;p1:=p;
 end loop;end loop;
 p1:=null;p2:=null;
 for q in select value from jsonb_array_elements(new.vocabulary) order by (value->>'number')::int loop
 p:=(q->>'answer')::int;
 if p=p1 and p=p2 then raise exception 'Vocabulary quality: three repeated answer positions' using errcode='23514';end if;
 p2:=p1;p1:=p;
 end loop;
 return new;
end $$;
create trigger song_quality_before_save before insert or update of exercises,vocabulary on public.song_appreciation_songs for each row execute function public.song_quality_guard();
