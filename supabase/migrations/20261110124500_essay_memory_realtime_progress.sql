begin;

create schema if not exists essay_memory_private;
revoke all on schema essay_memory_private from public, anon;
grant usage on schema essay_memory_private to authenticated;

create sequence essay_memory_private.progress_revision;
revoke all on sequence essay_memory_private.progress_revision from public, anon, authenticated;

create table essay_memory_private.progress (
  student_id uuid not null,
  essay_key text not null,
  content_version text not null,
  revision bigint not null default nextval('essay_memory_private.progress_revision'),
  mutation uuid not null,
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, essay_key)
);

alter table essay_memory_private.progress enable row level security;
revoke all on essay_memory_private.progress from public, anon, authenticated;

create function essay_memory_private.sync_progress(
  p_token uuid,
  p_essay_key text,
  p_content_version text,
  p_base_revision bigint default 0,
  p_progress jsonb default null,
  p_mutation uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid;
  current_row essay_memory_private.progress;
  next_progress jsonb;
  merged_solved jsonb;
  next_revision bigint;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;
  student := public.flashcard_session_student_id(p_token);
  if student is null then
    raise exception 'Student session expired' using errcode = '28000';
  end if;
  if p_essay_key is null or p_essay_key !~ '^[a-z0-9-]+:[0-9]+$' or length(p_essay_key) > 120
     or p_content_version is null or length(p_content_version) not between 1 and 80 then
    raise exception 'Invalid essay progress scope' using errcode = '22023';
  end if;

  select * into current_row
  from essay_memory_private.progress
  where student_id = student and essay_key = p_essay_key
  for update;

  if p_progress is not null then
    if jsonb_typeof(p_progress) is distinct from 'object'
       or octet_length(p_progress::text) > 131072
       or p_mutation is null
       or jsonb_typeof(coalesce(p_progress->'solved', '{}'::jsonb)) is distinct from 'object' then
      raise exception 'Invalid essay progress' using errcode = '22023';
    end if;

    if current_row.mutation is distinct from p_mutation then
      select coalesce(jsonb_object_agg(key, greatest(old_score, new_score)), '{}'::jsonb)
      into merged_solved
      from (
        select key,
          max(case when source = 'old' then score else 0 end) as old_score,
          max(case when source = 'new' then score else 0 end) as new_score
        from (
          select key, case when value::text in ('1','2') then value::text::int else 0 end score, 'old' source
          from jsonb_each(coalesce(current_row.progress->'solved', '{}'::jsonb))
          union all
          select key, case when value::text in ('1','2') then value::text::int else 0 end score, 'new' source
          from jsonb_each(coalesce(p_progress->'solved', '{}'::jsonb))
        ) scores
        group by key
      ) merged;

      if current_row.student_id is null or coalesce(p_base_revision, 0) >= current_row.revision then
        next_progress := p_progress;
      else
        next_progress := current_row.progress;
      end if;
      next_progress := jsonb_set(next_progress, '{solved}', merged_solved, true);
      next_progress := jsonb_set(
        next_progress,
        '{completed}',
        to_jsonb(coalesce((current_row.progress->>'completed')::boolean, false)
          or coalesce((p_progress->>'completed')::boolean, false)),
        true
      );
      next_revision := nextval('essay_memory_private.progress_revision');

      insert into essay_memory_private.progress(student_id, essay_key, content_version, revision, mutation, progress)
      values(student, p_essay_key, p_content_version, next_revision, p_mutation, next_progress)
      on conflict(student_id, essay_key) do update
        set content_version = excluded.content_version,
            revision = excluded.revision,
            mutation = excluded.mutation,
            progress = excluded.progress,
            updated_at = now();
    end if;
  end if;

  select * into current_row
  from essay_memory_private.progress
  where student_id = student and essay_key = p_essay_key;
  if not found then
    return jsonb_build_object('revision', 0, 'progress', null);
  end if;
  return jsonb_build_object(
    'revision', current_row.revision,
    'contentVersion', current_row.content_version,
    'progress', current_row.progress,
    'updatedAt', current_row.updated_at
  );
end;
$$;

revoke all on function essay_memory_private.sync_progress(uuid,text,text,bigint,jsonb,uuid) from public, anon;
grant execute on function essay_memory_private.sync_progress(uuid,text,text,bigint,jsonb,uuid) to authenticated;

create function public.essay_memory_progress_sync(
  p_token uuid,
  p_essay_key text,
  p_content_version text,
  p_base_revision bigint default 0,
  p_progress jsonb default null,
  p_mutation uuid default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select essay_memory_private.sync_progress(
    p_token, p_essay_key, p_content_version, p_base_revision, p_progress, p_mutation
  )
$$;

revoke all on function public.essay_memory_progress_sync(uuid,text,text,bigint,jsonb,uuid) from public, anon;
grant execute on function public.essay_memory_progress_sync(uuid,text,text,bigint,jsonb,uuid) to authenticated;

create or replace function classroom_private.sync(p_token uuid,p_system text,p_scope text,p_since bigint,p_payload jsonb,p_mutation uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; item classroom_private.live_state; fresh boolean;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Student session expired' using errcode='28000'; end if;
 if p_system is null or p_system not in ('synonyms','natural-english','advanced-native','common-expressions','sentence-structure','idiom','proverb','phrasal-verb','writing','flashcards','essay-memory')
 or p_scope is null or length(p_scope) not between 1 and 180 then raise exception 'Invalid classroom scope' using errcode='22023';end if;
 if p_payload is not null then
  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>524288 or p_mutation is null then raise exception 'Invalid classroom state' using errcode='22023';end if;
  delete from classroom_private.live_receipts where student_id=student and created_at<now()-interval '24 hours';
  insert into classroom_private.live_receipts(student_id,mutation) values(student,p_mutation) on conflict do nothing;
  fresh:=found;
  if fresh then
  delete from classroom_private.live_state where student_id=student and updated_at<now()-interval '24 hours';
  insert into classroom_private.live_state(student_id,system,scope,mutation,payload)
   values(student,p_system,p_scope,p_mutation,p_payload)
  on conflict(student_id,system,scope) do update set payload=excluded.payload,mutation=excluded.mutation,
   revision=nextval('classroom_private.live_revision'),updated_at=now()
  where live_state.mutation is distinct from excluded.mutation;
  end if;
 end if;
 select * into item from classroom_private.live_state where student_id=student and system=p_system and scope=p_scope and updated_at>now()-interval '24 hours';
 if not found then return jsonb_build_object('revision',0);end if;
 return jsonb_build_object('revision',item.revision,'payload',case when item.revision<>coalesce(p_since,0) then item.payload else null end);
end;$$;

commit;
