-- Idempotent production migration for the Sentence Structure correction-round
-- result fields introduced by the July 2026 interface update.

begin;

create or replace function public._sentence_structure_result_valid(
  p_lesson_id text,
  p_result jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_question_pattern text;
  v_question_id text;
  v_item jsonb;
  v_round jsonb;
  v_array_name text;
  v_key_count integer;
  v_has_correction_state boolean;
begin
  if p_lesson_id not in ('ss1', 'ss2', 'ss3', 'ss4')
    or p_result is null
    or jsonb_typeof(p_result) <> 'object'
    or octet_length(p_result::text) > 98304
  then
    return false;
  end if;

  v_question_pattern := '^' || p_lesson_id || '-q(0[1-9]|[1-4][0-9]|50)$';
  select count(*) into v_key_count from jsonb_object_keys(p_result);
  v_has_correction_state := p_result ? 'correctionMode'
    or p_result ? 'correctionIds'
    or p_result ? 'collapsedCorrectIds';

  if v_key_count not in (6, 9)
    or not (p_result ?& array[
      'round',
      'correctIds',
      'questionState',
      'rounds',
      'awaitingNextRound',
      'contentVersion'
    ])
    or exists (
      select 1
      from jsonb_object_keys(p_result) as key_row(key_name)
      where key_name not in (
        'round',
        'correctIds',
        'questionState',
        'rounds',
        'awaitingNextRound',
        'correctionMode',
        'correctionIds',
        'collapsedCorrectIds',
        'contentVersion'
      )
    )
    or (
      v_has_correction_state
      and not (p_result ?& array['correctionMode', 'correctionIds', 'collapsedCorrectIds'])
    )
  then
    return false;
  end if;

  if jsonb_typeof(p_result -> 'round') <> 'number'
    or coalesce(p_result ->> 'round', '') !~ '^[1-9][0-9]{0,3}$'
    or jsonb_typeof(p_result -> 'correctIds') <> 'array'
    or jsonb_array_length(p_result -> 'correctIds') > 50
    or jsonb_typeof(p_result -> 'questionState') <> 'object'
    or (select count(*) from jsonb_object_keys(p_result -> 'questionState')) > 50
    or jsonb_typeof(p_result -> 'rounds') <> 'array'
    or jsonb_array_length(p_result -> 'rounds') > 250
    or jsonb_typeof(p_result -> 'awaitingNextRound') <> 'boolean'
    or jsonb_typeof(p_result -> 'contentVersion') <> 'string'
    or p_result ->> 'contentVersion' <> '1'
  then
    return false;
  end if;

  if v_has_correction_state then
    if jsonb_typeof(p_result -> 'correctionMode') <> 'boolean'
      or jsonb_typeof(p_result -> 'correctionIds') <> 'array'
      or jsonb_array_length(p_result -> 'correctionIds') > 50
      or jsonb_typeof(p_result -> 'collapsedCorrectIds') <> 'array'
      or jsonb_array_length(p_result -> 'collapsedCorrectIds') > 50
    then
      return false;
    end if;

    foreach v_array_name in array array['correctionIds', 'collapsedCorrectIds']
    loop
      for v_item in
        select value
        from jsonb_array_elements(p_result -> v_array_name)
      loop
        if jsonb_typeof(v_item) <> 'string'
          or coalesce(v_item #>> '{}', '') !~ v_question_pattern
        then
          return false;
        end if;
      end loop;

      if (
        select count(*)
        from jsonb_array_elements(p_result -> v_array_name)
      ) <> (
        select count(distinct value #>> '{}')
        from jsonb_array_elements(p_result -> v_array_name)
      ) then
        return false;
      end if;
    end loop;

    if ((p_result ->> 'correctionMode')::boolean and jsonb_array_length(p_result -> 'correctionIds') = 0)
      or (not (p_result ->> 'correctionMode')::boolean and jsonb_array_length(p_result -> 'correctionIds') <> 0)
      or ((p_result ->> 'correctionMode')::boolean and (p_result ->> 'awaitingNextRound')::boolean)
      or exists (
        select 1
        from jsonb_array_elements_text(p_result -> 'correctionIds') as correction_id(question_id)
        where not (p_result -> 'questionState' ? correction_id.question_id)
          or coalesce(p_result -> 'questionState' -> correction_id.question_id ->> 'status', '') not in ('wrong', 'correct')
      )
      or exists (
        select 1
        from jsonb_array_elements_text(p_result -> 'collapsedCorrectIds') as collapsed_id(question_id)
        where not (p_result -> 'correctIds' ? collapsed_id.question_id)
      )
    then
      return false;
    end if;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_result -> 'correctIds')
  loop
    if jsonb_typeof(v_item) <> 'string'
      or coalesce(v_item #>> '{}', '') !~ v_question_pattern
    then
      return false;
    end if;
  end loop;

  if (
    select count(*)
    from jsonb_array_elements(p_result -> 'correctIds')
  ) <> (
    select count(distinct value #>> '{}')
    from jsonb_array_elements(p_result -> 'correctIds')
  ) then
    return false;
  end if;

  for v_question_id in
    select key_name
    from jsonb_object_keys(p_result -> 'questionState') as key_row(key_name)
  loop
    if v_question_id !~ v_question_pattern then
      return false;
    end if;
  end loop;

  for v_round in
    select value
    from jsonb_array_elements(p_result -> 'rounds')
  loop
    if jsonb_typeof(v_round) <> 'object' then
      return false;
    end if;

    foreach v_array_name in array array['checkedIds', 'correctIds', 'incorrectIds']
    loop
      if jsonb_typeof(v_round -> v_array_name) is distinct from 'array'
        or jsonb_array_length(v_round -> v_array_name) > 50
      then
        return false;
      end if;
      for v_item in
        select value
        from jsonb_array_elements(v_round -> v_array_name)
      loop
        if jsonb_typeof(v_item) <> 'string'
          or coalesce(v_item #>> '{}', '') !~ v_question_pattern
        then
          return false;
        end if;
      end loop;
    end loop;
  end loop;

  return true;
end;
$$;

commit;
