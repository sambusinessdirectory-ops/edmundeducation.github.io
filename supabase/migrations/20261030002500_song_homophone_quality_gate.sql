do $repair$ declare c jsonb; sid uuid; mi int; qi int; oi int; correct text; begin
 for c in select value from jsonb_array_elements($changes$[{"slug": "imagine", "mode": "medium", "number": 16, "old": "to", "new": "now", "answer": "too"}, {"slug": "imagine", "mode": "medium", "number": 16, "old": "two", "new": "soon", "answer": "too"}, {"slug": "imagine", "mode": "hard", "number": 14, "old": "no religion, two", "new": "no division, too", "answer": "no religion, too"}, {"slug": "imagine", "mode": "hard", "number": 14, "old": "no religion to", "new": "no religion now", "answer": "no religion, too"}, {"slug": "imagine", "mode": "hell", "number": 18, "old": "no religion, two", "new": "no division, too", "answer": "no religion, too"}, {"slug": "imagine", "mode": "hell", "number": 18, "old": "no religion to", "new": "no religion now", "answer": "no religion, too"}]$changes$::jsonb) loop
 select id into sid from public.song_appreciation_songs where slug=c->>'slug';
 for mi,qi,oi in select (m.ordinality-1)::int,(q.ordinality-1)::int,(o.ordinality-1)::int from public.song_appreciation_songs s,jsonb_array_elements(s.exercises) with ordinality m,jsonb_array_elements(m.value->'questions') with ordinality q,jsonb_array_elements_text(q.value->'options') with ordinality o where s.id=sid and m.value->>'id'=c->>'mode' and q.value->>'number'=c->>'number' and o.value=c->>'old' loop
 update public.song_appreciation_songs set exercises=jsonb_set(exercises,array[mi::text,'questions',qi::text,'options',oi::text],c->'new'),updated_at=now() where id=sid;
 end loop;
 end loop;
end $repair$;

create or replace function public.song_listening_audible_key(value text) returns text language plpgsql immutable set search_path=public as $$
declare s text:=replace(lower(value),'’',chr(39));begin
s:=regexp_replace(s,E'\\mto\\M','to','g');
s:=regexp_replace(s,E'\\mtoo\\M','to','g');
s:=regexp_replace(s,E'\\mtwo\\M','to','g');
s:=regexp_replace(s,E'\\mthere\\M','there','g');
s:=regexp_replace(s,E'\\mtheir\\M','there','g');
s:=regexp_replace(s,E'\\mthey''re\\M','there','g');
s:=regexp_replace(s,E'\\myour\\M','your','g');
s:=regexp_replace(s,E'\\myou''re\\M','your','g');
s:=regexp_replace(s,E'\\mhear\\M','hear','g');
s:=regexp_replace(s,E'\\mhere\\M','hear','g');
s:=regexp_replace(s,E'\\mits\\M','its','g');
s:=regexp_replace(s,E'\\mit''s\\M','its','g');
s:=regexp_replace(s,E'\\mno\\M','no','g');
s:=regexp_replace(s,E'\\mknow\\M','no','g');
s:=regexp_replace(s,E'\\mnew\\M','new','g');
s:=regexp_replace(s,E'\\mknew\\M','new','g');
s:=regexp_replace(s,E'\\mright\\M','right','g');
s:=regexp_replace(s,E'\\mwrite\\M','right','g');
s:=regexp_replace(s,E'\\mone\\M','one','g');
s:=regexp_replace(s,E'\\mwon\\M','one','g');
s:=regexp_replace(s,E'\\mweather\\M','weather','g');
s:=regexp_replace(s,E'\\mwhether\\M','weather','g');
s:=regexp_replace(s,E'\\mgrey\\M','grey','g');
s:=regexp_replace(s,E'\\mgray\\M','grey','g');
s:=regexp_replace(s,E'\\mtravelling\\M','travelling','g');
s:=regexp_replace(s,E'\\mtraveling\\M','travelling','g');
return regexp_replace(replace(replace(replace(replace(replace(replace(lower(s),'colour','color'),'favourite','favorite'),'honour','honor'),'centre','center'),'recognise','recognize'),'realise','realize'),'[^a-z0-9]','','g');end $$;
