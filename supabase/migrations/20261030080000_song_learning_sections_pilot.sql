alter table public.song_appreciation_songs add column if not exists learning_sections jsonb not null default '{}'::jsonb;
create table public.song_appreciation_section_progress (
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 song_id uuid not null references public.song_appreciation_songs(id) on delete cascade,
 section text not null check(section in ('advanced','structure')),
 version integer not null, question_number integer not null, selected integer not null check(selected between 0 and 3),
 updated_at timestamptz not null default now(), primary key(student_id,song_id,section,version,question_number)
);
alter table public.song_appreciation_section_progress enable row level security;
revoke all on public.song_appreciation_section_progress from public,anon,authenticated;
create function public.song_appreciation_learning_sections(p_token uuid,p_admin boolean default false)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare student uuid; result jsonb;
begin
 if p_admin then
  if public._song_appreciation_admin_id(p_token) is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 else
  student:=public._song_appreciation_student_id(p_token);
  if student is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'learning_sections',(
  select jsonb_object_agg(sec.key,case when sec.key='analysis' or p_admin then sec.value else
   jsonb_set(sec.value,'{questions}',(select coalesce(jsonb_agg(q-'answer'-'explanation'-'optionExplanations'),'[]') from jsonb_array_elements(sec.value->'questions') q)) end)
  from jsonb_each(s.learning_sections) sec),
 'section_progress',(select coalesce(jsonb_object_agg(p.section||':'||p.version||':'||p.question_number,
 jsonb_build_object('selected',p.selected,'answer',q->'answer','explanation',q->'explanation','optionExplanations',q->'optionExplanations')),'{}')
 from public.song_appreciation_section_progress p cross join lateral jsonb_array_elements(s.learning_sections->p.section->'questions') q
 where p.student_id=student and p.song_id=s.id and p.version=(s.learning_sections->p.section->>'version')::int and p.question_number=(q->>'number')::int))), '[]') into result
 from public.song_appreciation_songs s where s.learning_sections<>'{}' and (p_admin or public._song_appreciation_student_can_access(student,s.id));
 return result;
end $$;
create function public.song_appreciation_section_answer(p_student_token uuid,p_song_id uuid,p_section text,p_version integer,p_number integer,p_selected integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid:=public._song_appreciation_student_id(p_student_token); sec jsonb; q jsonb;
begin
 if student is null or not public._song_appreciation_student_can_access(student,p_song_id) then raise exception 'Unauthorized' using errcode='42501'; end if;
 if p_section is null or p_section not in ('advanced','structure') then raise exception 'Invalid section'; end if;
 select learning_sections->p_section into sec from public.song_appreciation_songs where id=p_song_id;
 if sec is null or p_version is distinct from (sec->>'version')::int then raise exception 'Lesson updated; reload before answering'; end if;
 select item into q from jsonb_array_elements(sec->'questions') item where (item->>'number')::int=p_number;
 if q is null or p_selected is null or p_selected<0 or p_selected>=jsonb_array_length(q->'options') then raise exception 'Invalid answer'; end if;
 insert into public.song_appreciation_section_progress(student_id,song_id,section,version,question_number,selected) values(student,p_song_id,p_section,p_version,p_number,p_selected)
 on conflict(student_id,song_id,section,version,question_number) do update set selected=excluded.selected,updated_at=now();
 return jsonb_build_object('selected',p_selected,'answer',q->'answer','explanation',q->'explanation','optionExplanations',q->'optionExplanations');
end $$;
revoke all on function public.song_appreciation_learning_sections(uuid,boolean),public.song_appreciation_section_answer(uuid,uuid,text,integer,integer,integer) from public;
grant execute on function public.song_appreciation_learning_sections(uuid,boolean),public.song_appreciation_section_answer(uuid,uuid,text,integer,integer,integer) to anon,authenticated;
notify pgrst,'reload schema';
