-- PDF-section-verified answer corrections. Each row is checked before mutation.
-- Regenerate with tools/build-polysemy-pdf-answer-migration.py.
do $repair$
declare
  patch jsonb;
  check_row record;
  old_answer record;
  new_senses jsonb;
begin
  for patch in select value from jsonb_array_elements($payload$[{"module":"bear","kind":"questions","oldCount":25,"newSenses":[],"oldAnswers":{},"questions":{"bear-10-3":{"answer":"bear-mcq-04","options":["bear-mcq-04","bear-mcq-03","bear-mcq-05","bear-mcq-02","bear-mcq-06","bear-mcq-01"]},"bear-10-4":{"answer":"bear-mcq-02","options":["bear-mcq-02","bear-mcq-01","bear-mcq-03","bear-mcq-04","bear-mcq-05","bear-mcq-06"]}}},{"module":"big","kind":"mcq","oldCount":33,"newSenses":["big-pdf-reviewed-01"],"oldAnswers":{"big-40-0":27,"big-40-1":27},"answers":{"big-40-0":33,"big-40-1":33},"options":{"33":[33,26,28,25,29,24]}},{"module":"draw","kind":"mcq","oldCount":28,"newSenses":["draw-pdf-reviewed-01"],"oldAnswers":{"draw-31-0":27,"draw-31-1":27},"answers":{"draw-31-0":28,"draw-31-1":28},"options":{"28":[28,26,25,24,23,22]}},{"module":"handle","kind":"mcq","oldCount":37,"newSenses":["handle-pdf-reviewed-01"],"oldAnswers":{},"answers":{"handle-40-0":37,"handle-40-1":37},"options":{"37":[37,27,29,26,30,25]}},{"module":"mind","kind":"mcq","oldCount":41,"newSenses":["mind-pdf-reviewed-01"],"oldAnswers":{},"answers":{"mind-45-0":41,"mind-45-1":41},"options":{"41":[41,37,39,36,35,34]}},{"module":"mother","kind":"mcq","oldCount":23,"newSenses":["mother-pdf-reviewed-01"],"oldAnswers":{},"answers":{"mother-29-0":23,"mother-29-1":23},"options":{"23":[23,19,21,18,17,16]}},{"module":"script","kind":"mcq","oldCount":23,"newSenses":["script-pdf-reviewed-01"],"oldAnswers":{"script-27-0":20,"script-27-1":20},"answers":{"script-27-0":23,"script-27-1":23},"options":{"23":[23,19,21,18,22,17]}}]$payload$::jsonb)
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
