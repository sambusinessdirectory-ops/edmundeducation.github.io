-- Add approved Synonyms modules 3–102 while preserving the first two modules and account records.
begin;
alter table public.synonyms_important_answers drop constraint synonyms_important_answers_question_key_check;
alter table public.synonyms_important_answers add constraint synonyms_important_answers_question_key_check
  check (question_key ~ '^((social-)?([1-9]|1[0-4])-[12]|lesson-(00[3-9]|0[1-9][0-9]|10[0-2])-[1-8]-[12])$');
alter table public.synonyms_important_recordings drop constraint synonyms_important_recordings_question_key_check;
alter table public.synonyms_important_recordings add constraint synonyms_important_recordings_question_key_check
  check (question_key ~ '^((social-)?([1-9]|1[0-4])-[12]|lesson-(00[3-9]|0[1-9][0-9]|10[0-2])-[1-8]-[12])$');

create or replace function public.synonyms_important_record(
  p_token uuid, p_question_key text, p_attempts integer, p_mastered boolean,
  p_last_choice text, p_last_correct boolean
)
returns table(question_key text, attempts integer, mastered boolean, last_choice text, last_correct boolean, updated_at timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  if p_question_key is null or p_question_key !~ '^((social-)?([1-9]|1[0-4])-[12]|lesson-(00[3-9]|0[1-9][0-9]|10[0-2])-[1-8]-[12])$'
     or p_attempts is null or p_attempts not between 1 and 10000
     or p_mastered is null or p_last_correct is null
     or p_last_choice is null or p_last_choice !~ '^[A-F]$' then
    raise exception 'Invalid Synonyms answer' using errcode = '22023';
  end if;
  select s.student_id into v_student_id
  from public.flashcard_student_sessions s
  join public.flashcard_students student on student.id = s.student_id
  where s.token = p_token and s.expires_at > pg_catalog.now() and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;

  insert into public.synonyms_important_answers as saved
    (student_id, question_key, attempts, mastered, last_choice, last_correct, updated_at)
  values (v_student_id, p_question_key, p_attempts, p_mastered, p_last_choice, p_last_correct, pg_catalog.now())
  on conflict on constraint synonyms_important_answers_pkey do update set
    attempts = greatest(saved.attempts, excluded.attempts),
    mastered = saved.mastered or excluded.mastered,
    last_choice = case when excluded.attempts >= saved.attempts then excluded.last_choice else saved.last_choice end,
    last_correct = case when excluded.attempts >= saved.attempts then excluded.last_correct else saved.last_correct end,
    updated_at = case when excluded.attempts >= saved.attempts then pg_catalog.now() else saved.updated_at end;

  insert into public.learning_portal_progress_events
    (student_id, system_key, event_key, activity_count, duration_ms, occurred_at)
  values (v_student_id, 'synonyms', case when p_question_key like 'lesson-%' then 'lesson:' || p_question_key when p_question_key like 'social-%' then 'social-media:' || p_question_key else 'important:' || p_question_key end, 1, 0, pg_catalog.now())
  on conflict (student_id, system_key, event_key) do nothing;

  return query
  select a.question_key, a.attempts, a.mastered, a.last_choice, a.last_correct, a.updated_at
  from public.synonyms_important_answers a where a.student_id = v_student_id and a.question_key = p_question_key;
end;
$$;


create or replace function public.synonyms_important_recording(p_token uuid, p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid; v_id uuid; v_question text; v_mime text; v_audio bytea; v_result jsonb;
begin
  if auth.uid() is null or p_token is null then raise exception 'Student authentication is required' using errcode='42501'; end if;
  select s.student_id into v_student_id from public.flashcard_student_sessions s
  join public.flashcard_students student on student.id=s.student_id
  where s.token=p_token and s.expires_at>pg_catalog.now() and student.deleted_at is null limit 1;
  if v_student_id is null then raise exception 'Student session is invalid or expired' using errcode='42501'; end if;
  if p_action='list' then
    select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'question',r.question_key,'mime',r.mime,'at',r.recorded_at) order by r.recorded_at desc),'[]'::jsonb)
    into v_result from public.synonyms_important_recordings r where r.student_id=v_student_id;
    return v_result;
  end if;
  if p_action='get' then
    if (p_payload->>'id') is null then raise exception 'Recording ID required' using errcode='22023'; end if;
    v_id:=(p_payload->>'id')::uuid;
    select jsonb_build_object('id',r.id,'question',r.question_key,'mime',r.mime,'audio',encode(r.audio,'base64'),'at',r.recorded_at)
    into v_result from public.synonyms_important_recordings r where r.student_id=v_student_id and r.id=v_id;
    if v_result is null then raise exception 'Recording not found' using errcode='P0002'; end if;
    return v_result;
  end if;
  if p_action='save' then
    v_id:=(p_payload->>'id')::uuid;
    v_question:=p_payload->>'question';
    v_mime:=p_payload->>'mime';
    if v_id is null or v_question is null or v_question !~ '^((social-)?([1-9]|1[0-4])-[12]|lesson-(00[3-9]|0[1-9][0-9]|10[0-2])-[1-8]-[12])$' or v_mime not in ('audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/wav') then
      raise exception 'Invalid recording details' using errcode='22023';
    end if;
    if length(coalesce(p_payload->>'audio','')) > 2800000 then raise exception 'Recording too large' using errcode='22023'; end if;
    v_audio:=decode(p_payload->>'audio','base64');
    if octet_length(v_audio) not between 1 and 2097152 then raise exception 'Recording size invalid' using errcode='22023'; end if;
    insert into public.synonyms_important_recordings(id,student_id,question_key,mime,audio)
    values(v_id,v_student_id,v_question,v_mime,v_audio)
    on conflict on constraint synonyms_important_recordings_pkey do nothing;
    return jsonb_build_object('saved',true,'id',v_id);
  end if;
  raise exception 'Unknown recording action' using errcode='22023';
end;
$$;

revoke all on function public.synonyms_important_record(uuid,text,integer,boolean,text,boolean) from public, anon, authenticated;
revoke all on function public.synonyms_important_recording(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.synonyms_important_record(uuid,text,integer,boolean,text,boolean) to authenticated;
grant execute on function public.synonyms_important_recording(uuid,text,jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
