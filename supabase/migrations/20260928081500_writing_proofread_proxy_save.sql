-- The submission proxy attaches checklist usage after the existing Worker accepts an essay.
create function public.writing_submission_proofread_checklist_save(
  p_student_token uuid,
  p_id uuid,
  p_record jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_existing jsonb;
  v_checked_count integer;
  v_touched_count integer;
  v_distinct_count integer;
begin
  select profile.id into v_student_id
  from public.writing_submission_student_profile(p_student_token) profile;
  if v_student_id is null then return null; end if;

  if p_record is null or jsonb_typeof(p_record) <> 'object'
    or octet_length(p_record::text) > 4096
    or p_record ->> 'version' is distinct from '1'
    or jsonb_typeof(p_record -> 'checkedIds') is distinct from 'array'
    or jsonb_typeof(p_record -> 'touchedIds') is distinct from 'array'
    or coalesce(p_record ->> 'toggleCount', '') !~ '^[0-9]{1,6}$'
  then
    raise exception 'Invalid proofreading checklist' using errcode = '22023';
  end if;
  if (p_record ->> 'toggleCount')::integer > 100000 then
    raise exception 'Invalid proofreading count' using errcode = '22023';
  end if;

  select count(*), count(distinct item) into v_checked_count, v_distinct_count
  from jsonb_array_elements_text(p_record -> 'checkedIds') item;
  if v_checked_count > 24 or v_checked_count <> v_distinct_count then
    raise exception 'Invalid checked items' using errcode = '22023';
  end if;
  select count(*), count(distinct item) into v_touched_count, v_distinct_count
  from jsonb_array_elements_text(p_record -> 'touchedIds') item;
  if v_touched_count > 24 or v_touched_count <> v_distinct_count
    or (p_record ->> 'toggleCount')::integer < v_touched_count
  then
    raise exception 'Invalid touched items' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_record -> 'checkedIds') item
    where item not in (select touched from jsonb_array_elements_text(p_record -> 'touchedIds') touched)
  ) or exists (
    select 1 from jsonb_array_elements_text(p_record -> 'touchedIds') item
    where item not in (
      'articles','plural','pronouns','spelling','tense','sentence','capitals',
      'punctuation','missing-words','verb-form','be-verbs','prepositions',
      'reference','possessives','contractions','formal','word-meaning',
      'consistency','timeline','answer-topic','paragraph-idea','explanation',
      'support','opening-ending'
    )
  ) then
    raise exception 'Invalid proofreading item IDs' using errcode = '22023';
  end if;

  update public.writing_submissions submission
  set proofread_checklist = p_record
  where submission.id = p_id and submission.student_id = v_student_id
    and submission.proofread_checklist is null;

  select submission.proofread_checklist into v_existing
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = v_student_id;
  if v_existing is not null and v_existing is distinct from p_record then
    raise exception 'Submission proofreading checklist conflict' using errcode = '23505';
  end if;
  return v_existing;
end;
$$;

revoke all on function public.writing_submission_proofread_checklist_save(uuid, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.writing_submission_proofread_checklist_save(uuid, uuid, jsonb)
  to service_role;
