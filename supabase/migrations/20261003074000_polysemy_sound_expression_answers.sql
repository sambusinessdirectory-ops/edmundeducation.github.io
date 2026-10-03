-- PDF-section-verified answer corrections. Each row is checked before mutation.
-- Regenerate with tools/build-polysemy-pdf-answer-migration.py.
do $repair$
declare
  patch jsonb;
  check_row record;
  old_answer record;
  new_senses jsonb;
begin
  for patch in select value from jsonb_array_elements($payload$[{"module":"sound","kind":"mcq","oldCount":17,"newSenses":["sound-pdf-like-sound","sound-pdf-not-like-sound"],"oldAnswers":{"sound-16-0":15,"sound-16-1":15,"sound-16-2":15,"sound-16-3":15},"answers":{"sound-16-0":17,"sound-16-1":17,"sound-16-2":18,"sound-16-3":18},"options":{"17":[17,14,16,13,12,11],"18":[18,14,16,13,12,11]}}]$payload$::jsonb)
  loop
    select senses, questions, mcq into check_row
    from polysemy_private.catalogue
    where module = patch->>'module'
    for update;
    if not found then
      raise exception 'Missing Polysemy module %', patch->>'module';
    end if;
    new_senses := patch->'newSenses';
    if patch->>'kind' = 'mcq' then
      if check_row.mcq is null then
        raise exception 'Missing MCQ catalogue %', patch->>'module';
      end if;
      if jsonb_array_length(new_senses) > 0
         and jsonb_array_length(check_row.mcq->'senses') =
         (patch->>'oldCount')::int + jsonb_array_length(new_senses)
         and (check_row.mcq->'senses') @> new_senses then
        continue;
      end if;
      if jsonb_array_length(check_row.mcq->'senses') <> (patch->>'oldCount')::int then
        raise exception 'Unexpected MCQ sense count in %', patch->>'module';
      end if;
      for old_answer in select key, value from jsonb_each(patch->'oldAnswers')
      loop
        if check_row.mcq->'answers'->>old_answer.key <> trim(both '"' from old_answer.value::text) then
          raise exception 'Unexpected old answer in % / %', patch->>'module', old_answer.key;
        end if;
      end loop;
      update polysemy_private.catalogue
      set mcq = jsonb_set(
        jsonb_set(
          jsonb_set(check_row.mcq, '{senses}', check_row.mcq->'senses' || new_senses),
          '{answers}', check_row.mcq->'answers' || patch->'answers'),
        '{options}', check_row.mcq->'options' || patch->'options')
      where module = patch->>'module';
    else
      if jsonb_array_length(new_senses) > 0
         and jsonb_array_length(check_row.senses) =
         (patch->>'oldCount')::int + jsonb_array_length(new_senses)
         and check_row.senses @> new_senses then
        continue;
      end if;
      if jsonb_array_length(check_row.senses) <> (patch->>'oldCount')::int then
        raise exception 'Unexpected sense count in %', patch->>'module';
      end if;
      for old_answer in select key, value from jsonb_each(patch->'oldAnswers')
      loop
        if check_row.questions->old_answer.key->>'answer' <> trim(both '"' from old_answer.value::text) then
          raise exception 'Unexpected old answer in % / %', patch->>'module', old_answer.key;
        end if;
      end loop;
      update polysemy_private.catalogue
      set senses = check_row.senses || new_senses,
          questions = check_row.questions || patch->'questions'
      where module = patch->>'module';
    end if;
  end loop;
end $repair$;
