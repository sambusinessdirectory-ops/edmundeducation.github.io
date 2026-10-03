-- PDF-section-verified answer corrections. Each row is checked before mutation.
-- Regenerate with tools/build-polysemy-pdf-answer-migration.py.
do $repair$
declare
  patch jsonb;
  check_row record;
  old_answer record;
  new_senses jsonb;
begin
  for patch in select value from jsonb_array_elements($payload$[{"module":"crowd","kind":"mcq","oldCount":23,"newSenses":["crowd-pdf-orphan-01"],"oldAnswers":{"crowd-10-2":15,"crowd-10-3":15,"crowd-10-4":15,"crowd-10-5":15,"crowd-10-6":15,"crowd-10-7":15},"answers":{"crowd-10-2":16,"crowd-10-3":23,"crowd-10-4":17,"crowd-10-5":17,"crowd-10-6":18,"crowd-10-7":19},"options":{"16":[16,14,13,17,12,0],"23":[23,14,16,13,17,12],"17":[17,14,16,13,12,0],"18":[18,14,16,13,17,12],"19":[19,14,16,13,17,12]}},{"module":"incorporate","kind":"questions","oldCount":111,"newSenses":[],"oldAnswers":{"incorporate-49-0":"incorporate-mcq-96","incorporate-66-0":"incorporate-mcq-96"},"questions":{"incorporate-49-0":{"answer":"incorporate-mcq-33","options":["incorporate-mcq-33","incorporate-mcq-95","incorporate-mcq-97","incorporate-mcq-94","incorporate-mcq-98","incorporate-mcq-93"]},"incorporate-66-0":{"answer":"incorporate-mcq-42","options":["incorporate-mcq-42","incorporate-mcq-95","incorporate-mcq-97","incorporate-mcq-94","incorporate-mcq-98","incorporate-mcq-93"]}}},{"module":"rehearse","kind":"questions","oldCount":93,"newSenses":["rehearse-pdf-orphan-01"],"oldAnswers":{"rehearse-43-0":"rehearse-mcq-79","rehearse-43-1":"rehearse-mcq-79","rehearse-121-0":"rehearse-mcq-79"},"questions":{"rehearse-43-0":{"answer":"rehearse-mcq-34","options":["rehearse-mcq-34","rehearse-mcq-78","rehearse-mcq-80","rehearse-mcq-77","rehearse-mcq-81","rehearse-mcq-76"]},"rehearse-43-1":{"answer":"rehearse-mcq-34","options":["rehearse-mcq-34","rehearse-mcq-78","rehearse-mcq-80","rehearse-mcq-77","rehearse-mcq-81","rehearse-mcq-76"]},"rehearse-121-0":{"answer":"rehearse-pdf-orphan-01","options":["rehearse-pdf-orphan-01","rehearse-mcq-78","rehearse-mcq-80","rehearse-mcq-77","rehearse-mcq-81","rehearse-mcq-76"]}}},{"module":"spirit","kind":"mcq","oldCount":24,"newSenses":[],"oldAnswers":{"spirit-15-16":14,"spirit-15-17":14},"answers":{"spirit-15-16":21,"spirit-15-17":21},"options":{"21":[21,13,15,12,16,11]}},{"module":"store","kind":"questions","oldCount":123,"newSenses":[],"oldAnswers":{"store-78-0":"store-mcq-100","store-78-1":"store-mcq-100","store-84-0":"store-mcq-99"},"questions":{"store-78-0":{"answer":"store-mcq-70","options":["store-mcq-70","store-mcq-99","store-mcq-101","store-mcq-98","store-mcq-102","store-mcq-97"]},"store-78-1":{"answer":"store-mcq-24","options":["store-mcq-24","store-mcq-99","store-mcq-101","store-mcq-98","store-mcq-102","store-mcq-97"]},"store-84-0":{"answer":"store-mcq-76","options":["store-mcq-76","store-mcq-98","store-mcq-100","store-mcq-97","store-mcq-101","store-mcq-96"]}}},{"module":"text","kind":"questions","oldCount":124,"newSenses":[],"oldAnswers":{"text-05-0":"text-mcq-111"},"questions":{"text-05-0":{"answer":"text-mcq-02","options":["text-mcq-02","text-mcq-01","text-mcq-03","text-mcq-04","text-mcq-05","text-mcq-06"]}}}]$payload$::jsonb)
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
