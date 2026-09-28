-- Student-owned Synonyms recordings. Access is through a token-checked RPC only.
create table if not exists public.synonyms_important_recordings (
  id uuid primary key,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  question_key text not null check (question_key ~ '^([1-9]|1[0-4])-[12]$'),
  mime text not null check (mime in ('audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/wav')),
  audio bytea not null check (octet_length(audio) between 1 and 2097152),
  recorded_at timestamptz not null default now()
);
create index if not exists synonyms_important_recordings_student_time_idx on public.synonyms_important_recordings(student_id, recorded_at desc);
alter table public.synonyms_important_recordings enable row level security;
revoke all on public.synonyms_important_recordings from public, anon, authenticated;

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
    if v_id is null or v_question is null or v_question !~ '^([1-9]|1[0-4])-[12]$' or v_mime not in ('audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/wav') then
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
revoke all on function public.synonyms_important_recording(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.synonyms_important_recording(uuid,text,jsonb) to authenticated;
notify pgrst, 'reload schema';
