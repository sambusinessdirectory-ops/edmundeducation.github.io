alter table public.song_appreciation_songs
  add column if not exists cover_url text not null default '',
  add column if not exists audio_url text not null default '',
  add column if not exists vocabulary jsonb not null default '[]'::jsonb;
create table if not exists public.song_appreciation_vocabulary_progress (
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 song_id uuid not null references public.song_appreciation_songs(id) on delete cascade,
 question_number integer not null check(question_number>0),
 selected integer not null check(selected between 0 and 3),
 updated_at timestamptz not null default now(),
 primary key(student_id,song_id,question_number)
);
alter table public.song_appreciation_vocabulary_progress enable row level security;
revoke all on public.song_appreciation_vocabulary_progress from public,anon,authenticated;

create or replace function public.song_appreciation_lesson_extras(p_token uuid,p_admin boolean default false)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_student uuid; v_result jsonb;
begin
 if p_admin then
  if public._song_appreciation_admin_id(p_token) is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 else
  v_student:=public._song_appreciation_student_id(p_token);
  if v_student is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'cover_url',s.cover_url,'audio_url',s.audio_url,
 'vocabulary',case when p_admin then s.vocabulary else (select coalesce(jsonb_agg(q-'answer'-'explanation'-'optionExplanations'),'[]'::jsonb) from jsonb_array_elements(s.vocabulary) q) end,
 'vocabulary_progress',(select coalesce(jsonb_object_agg(p.question_number::text,jsonb_build_object('selected',p.selected,'answer',q->'answer','explanation',q->'explanation','optionExplanations',q->'optionExplanations')),'{}'::jsonb)
 from public.song_appreciation_vocabulary_progress p cross join lateral jsonb_array_elements(s.vocabulary) q
 where p.student_id=v_student and p.song_id=s.id and (q->>'number')::int=p.question_number))), '[]'::jsonb)
 into v_result from public.song_appreciation_songs s
 where p_admin or public._song_appreciation_student_can_access(v_student,s.id);
 return v_result;
end $$;

create or replace function public.song_appreciation_vocabulary_answer(p_student_token uuid,p_song_id uuid,p_number integer,p_selected integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_student uuid:=public._song_appreciation_student_id(p_student_token); q jsonb;
begin
 if v_student is null or not public._song_appreciation_student_can_access(v_student,p_song_id) then raise exception 'Unauthorized' using errcode='42501'; end if;
 select item into q from public.song_appreciation_songs s cross join lateral jsonb_array_elements(s.vocabulary) item where s.id=p_song_id and (item->>'number')::int=p_number;
 if q is null or p_selected is null or p_selected<0 or p_selected>=jsonb_array_length(q->'options') then raise exception 'Invalid answer' using errcode='22023'; end if;
 insert into public.song_appreciation_vocabulary_progress(student_id,song_id,question_number,selected) values(v_student,p_song_id,p_number,p_selected)
 on conflict(student_id,song_id,question_number) do update set selected=excluded.selected,updated_at=now();
 return jsonb_build_object('selected',p_selected,'answer',q->'answer','explanation',q->'explanation','optionExplanations',q->'optionExplanations');
end $$;

create or replace function public.song_appreciation_admin_save_lesson(p_admin_token uuid,p_details jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_song jsonb; v_id uuid; v_cover text:=coalesce(p_details->>'cover_url',''); v_audio text:=coalesce(p_details->>'audio_url','');
begin
 if public._song_appreciation_admin_id(p_admin_token) is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 if length(v_cover)>750000 or (v_cover<>'' and v_cover!~'^(https://|assets/|data:image/(webp|png|jpeg);base64,)') or length(v_audio)>2000 or (v_audio<>'' and v_audio!~'^(https://|assets/)') then raise exception 'Invalid media URL' using errcode='22023'; end if;
 select to_jsonb(saved) into v_song from public.song_appreciation_admin_upsert_song(
 p_admin_token,nullif(p_details->>'id','')::uuid,p_details->>'slug',p_details->>'title',p_details->>'singer',p_details->>'exerciseName',p_details->>'description',nullif(p_details->>'youtubeUrl',''),
 array(select jsonb_array_elements_text(p_details->'tags')),p_details->'translations',p_details->'modes',(p_details->>'published')::boolean,(p_details->>'sortOrder')::integer) saved;
 v_id:=(v_song->>'id')::uuid;
 update public.song_appreciation_songs set cover_url=v_cover,audio_url=v_audio where id=v_id;
 return v_song||jsonb_build_object('cover_url',v_cover,'audio_url',v_audio,'vocabulary',(select vocabulary from public.song_appreciation_songs where id=v_id));
end $$;
revoke all on function public.song_appreciation_lesson_extras(uuid,boolean),public.song_appreciation_vocabulary_answer(uuid,uuid,integer,integer),public.song_appreciation_admin_save_lesson(uuid,jsonb) from public;
grant execute on function public.song_appreciation_lesson_extras(uuid,boolean),public.song_appreciation_vocabulary_answer(uuid,uuid,integer,integer),public.song_appreciation_admin_save_lesson(uuid,jsonb) to anon,authenticated;
notify pgrst,'reload schema';
