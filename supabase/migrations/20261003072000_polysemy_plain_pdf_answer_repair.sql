-- PDF-section-verified answer corrections. Each row is checked before mutation.
-- Regenerate with tools/build-polysemy-pdf-answer-migration.py.
do $repair$
declare
  patch jsonb;
  check_row record;
  old_answer record;
  new_senses jsonb;
begin
  for patch in select value from jsonb_array_elements($payload$[{"module":"assessment","kind":"questions","oldCount":188,"newSenses":["assessment-pdf-plain-050"],"oldAnswers":{"assessment-50-0":"assessment-mcq-144"},"questions":{"assessment-50-0":{"answer":"assessment-pdf-plain-050","options":["assessment-pdf-plain-050","assessment-mcq-143","assessment-mcq-145","assessment-mcq-142","assessment-mcq-146","assessment-mcq-141"]}}},{"module":"crowd","kind":"mcq","oldCount":22,"newSenses":["crowd-pdf-plain-005"],"oldAnswers":{"crowd-05-0":9,"crowd-05-1":9},"answers":{"crowd-05-0":22,"crowd-05-1":22},"options":{"22":[22,8,10,7,11,6]}},{"module":"diary","kind":"questions","oldCount":99,"newSenses":["diary-pdf-plain-055"],"oldAnswers":{"diary-55-0":"diary-mcq-15","diary-55-1":"diary-mcq-15"},"questions":{"diary-55-0":{"answer":"diary-pdf-plain-055","options":["diary-pdf-plain-055","diary-mcq-14","diary-mcq-16","diary-mcq-13","diary-mcq-17","diary-mcq-12"]},"diary-55-1":{"answer":"diary-pdf-plain-055","options":["diary-pdf-plain-055","diary-mcq-14","diary-mcq-16","diary-mcq-13","diary-mcq-17","diary-mcq-12"]}}},{"module":"entry","kind":"questions","oldCount":137,"newSenses":["entry-pdf-plain-061","entry-pdf-plain-064","entry-pdf-plain-065"],"oldAnswers":{"entry-61-0":"entry-mcq-90","entry-64-0":"entry-mcq-90","entry-65-0":"entry-mcq-90"},"questions":{"entry-61-0":{"answer":"entry-pdf-plain-061","options":["entry-pdf-plain-061","entry-mcq-89","entry-mcq-91","entry-mcq-88","entry-mcq-92","entry-mcq-87"]},"entry-64-0":{"answer":"entry-pdf-plain-064","options":["entry-pdf-plain-064","entry-mcq-89","entry-mcq-91","entry-mcq-88","entry-mcq-92","entry-mcq-87"]},"entry-65-0":{"answer":"entry-pdf-plain-065","options":["entry-pdf-plain-065","entry-mcq-89","entry-mcq-91","entry-mcq-88","entry-mcq-92","entry-mcq-87"]}}},{"module":"exhaust","kind":"mcq","oldCount":21,"newSenses":["exhaust-pdf-plain-022"],"oldAnswers":{"exhaust-22-0":20,"exhaust-22-1":20},"answers":{"exhaust-22-0":21,"exhaust-22-1":21},"options":{"21":[21,19,18,17,16,15]}},{"module":"generate","kind":"questions","oldCount":93,"newSenses":["generate-pdf-plain-076","generate-pdf-plain-080","generate-pdf-plain-091","generate-pdf-plain-103"],"oldAnswers":{"generate-76-0":"generate-mcq-76","generate-76-1":"generate-mcq-76","generate-80-0":"generate-mcq-76","generate-80-1":"generate-mcq-76","generate-91-0":"generate-mcq-76","generate-91-1":"generate-mcq-76","generate-103-0":"generate-mcq-38","generate-103-1":"generate-mcq-38"},"questions":{"generate-76-0":{"answer":"generate-pdf-plain-076","options":["generate-pdf-plain-076","generate-mcq-75","generate-mcq-77","generate-mcq-74","generate-mcq-78","generate-mcq-73"]},"generate-76-1":{"answer":"generate-pdf-plain-076","options":["generate-pdf-plain-076","generate-mcq-75","generate-mcq-77","generate-mcq-74","generate-mcq-78","generate-mcq-73"]},"generate-80-0":{"answer":"generate-pdf-plain-080","options":["generate-pdf-plain-080","generate-mcq-75","generate-mcq-77","generate-mcq-74","generate-mcq-78","generate-mcq-73"]},"generate-80-1":{"answer":"generate-pdf-plain-080","options":["generate-pdf-plain-080","generate-mcq-75","generate-mcq-77","generate-mcq-74","generate-mcq-78","generate-mcq-73"]},"generate-91-0":{"answer":"generate-pdf-plain-091","options":["generate-pdf-plain-091","generate-mcq-75","generate-mcq-77","generate-mcq-74","generate-mcq-78","generate-mcq-73"]},"generate-91-1":{"answer":"generate-pdf-plain-091","options":["generate-pdf-plain-091","generate-mcq-75","generate-mcq-77","generate-mcq-74","generate-mcq-78","generate-mcq-73"]},"generate-103-0":{"answer":"generate-pdf-plain-103","options":["generate-pdf-plain-103","generate-mcq-37","generate-mcq-39","generate-mcq-36","generate-mcq-40","generate-mcq-41"]},"generate-103-1":{"answer":"generate-pdf-plain-103","options":["generate-pdf-plain-103","generate-mcq-37","generate-mcq-39","generate-mcq-36","generate-mcq-40","generate-mcq-41"]}}},{"module":"home","kind":"mcq","oldCount":34,"newSenses":["home-pdf-plain-015","home-pdf-plain-017","home-pdf-plain-019"],"oldAnswers":{"home-15-0":13,"home-15-1":13,"home-17-0":14,"home-17-1":14,"home-19-0":15,"home-19-1":15},"answers":{"home-15-0":34,"home-15-1":34,"home-17-0":35,"home-17-1":35,"home-19-0":36,"home-19-1":36},"options":{"34":[34,12,14,11,15,10],"35":[35,13,15,12,16,11],"36":[36,14,16,13,17,12]}},{"module":"incorporate","kind":"questions","oldCount":110,"newSenses":["incorporate-pdf-plain-059"],"oldAnswers":{"incorporate-59-0":"incorporate-mcq-04"},"questions":{"incorporate-59-0":{"answer":"incorporate-pdf-plain-059","options":["incorporate-pdf-plain-059","incorporate-mcq-03","incorporate-mcq-05","incorporate-mcq-02","incorporate-mcq-06","incorporate-mcq-01"]}}},{"module":"instruction","kind":"questions","oldCount":141,"newSenses":["instruction-pdf-plain-140"],"oldAnswers":{"instruction-140-0":"instruction-mcq-77"},"questions":{"instruction-140-0":{"answer":"instruction-pdf-plain-140","options":["instruction-pdf-plain-140","instruction-mcq-76","instruction-mcq-78","instruction-mcq-75","instruction-mcq-79","instruction-mcq-74"]}}},{"module":"reduce","kind":"questions","oldCount":87,"newSenses":["reduce-pdf-plain-082","reduce-pdf-plain-083","reduce-pdf-plain-099","reduce-pdf-plain-101"],"oldAnswers":{"reduce-82-0":"reduce-mcq-59","reduce-82-1":"reduce-mcq-59","reduce-83-0":"reduce-mcq-59","reduce-83-1":"reduce-mcq-59","reduce-99-0":"reduce-mcq-73","reduce-99-1":"reduce-mcq-73","reduce-101-0":"reduce-mcq-73","reduce-101-1":"reduce-mcq-73"},"questions":{"reduce-82-0":{"answer":"reduce-pdf-plain-082","options":["reduce-pdf-plain-082","reduce-mcq-58","reduce-mcq-60","reduce-mcq-57","reduce-mcq-61","reduce-mcq-56"]},"reduce-82-1":{"answer":"reduce-pdf-plain-082","options":["reduce-pdf-plain-082","reduce-mcq-58","reduce-mcq-60","reduce-mcq-57","reduce-mcq-61","reduce-mcq-56"]},"reduce-83-0":{"answer":"reduce-pdf-plain-083","options":["reduce-pdf-plain-083","reduce-mcq-58","reduce-mcq-60","reduce-mcq-57","reduce-mcq-61","reduce-mcq-56"]},"reduce-83-1":{"answer":"reduce-pdf-plain-083","options":["reduce-pdf-plain-083","reduce-mcq-58","reduce-mcq-60","reduce-mcq-57","reduce-mcq-61","reduce-mcq-56"]},"reduce-99-0":{"answer":"reduce-pdf-plain-099","options":["reduce-pdf-plain-099","reduce-mcq-72","reduce-mcq-74","reduce-mcq-71","reduce-mcq-75","reduce-mcq-70"]},"reduce-99-1":{"answer":"reduce-pdf-plain-099","options":["reduce-pdf-plain-099","reduce-mcq-72","reduce-mcq-74","reduce-mcq-71","reduce-mcq-75","reduce-mcq-70"]},"reduce-101-0":{"answer":"reduce-pdf-plain-101","options":["reduce-pdf-plain-101","reduce-mcq-72","reduce-mcq-74","reduce-mcq-71","reduce-mcq-75","reduce-mcq-70"]},"reduce-101-1":{"answer":"reduce-pdf-plain-101","options":["reduce-pdf-plain-101","reduce-mcq-72","reduce-mcq-74","reduce-mcq-71","reduce-mcq-75","reduce-mcq-70"]}}},{"module":"rehearse","kind":"questions","oldCount":91,"newSenses":["rehearse-pdf-plain-123","rehearse-pdf-plain-138"],"oldAnswers":{"rehearse-123-0":"rehearse-mcq-79","rehearse-138-0":"rehearse-mcq-61","rehearse-138-1":"rehearse-mcq-61"},"questions":{"rehearse-123-0":{"answer":"rehearse-pdf-plain-123","options":["rehearse-pdf-plain-123","rehearse-mcq-78","rehearse-mcq-80","rehearse-mcq-77","rehearse-mcq-81","rehearse-mcq-76"]},"rehearse-138-0":{"answer":"rehearse-pdf-plain-138","options":["rehearse-pdf-plain-138","rehearse-mcq-60","rehearse-mcq-62","rehearse-mcq-59","rehearse-mcq-63","rehearse-mcq-58"]},"rehearse-138-1":{"answer":"rehearse-pdf-plain-138","options":["rehearse-pdf-plain-138","rehearse-mcq-60","rehearse-mcq-62","rehearse-mcq-59","rehearse-mcq-63","rehearse-mcq-58"]}}},{"module":"return","kind":"questions","oldCount":80,"newSenses":["return-pdf-plain-061","return-pdf-plain-064"],"oldAnswers":{"return-61-0":"return-mcq-05","return-61-1":"return-mcq-05","return-64-0":"return-mcq-58","return-64-1":"return-mcq-58"},"questions":{"return-61-0":{"answer":"return-pdf-plain-061","options":["return-pdf-plain-061","return-mcq-04","return-mcq-06","return-mcq-03","return-mcq-07","return-mcq-02"]},"return-61-1":{"answer":"return-pdf-plain-061","options":["return-pdf-plain-061","return-mcq-04","return-mcq-06","return-mcq-03","return-mcq-07","return-mcq-02"]},"return-64-0":{"answer":"return-pdf-plain-064","options":["return-pdf-plain-064","return-mcq-57","return-mcq-59","return-mcq-56","return-mcq-60","return-mcq-55"]},"return-64-1":{"answer":"return-pdf-plain-064","options":["return-pdf-plain-064","return-mcq-57","return-mcq-59","return-mcq-56","return-mcq-60","return-mcq-55"]}}},{"module":"work","kind":"mcq","oldCount":40,"newSenses":["work-pdf-plain-007"],"oldAnswers":{"work-07-0":1,"work-07-1":1},"answers":{"work-07-0":40,"work-07-1":40},"options":{"40":[40,0,2,3,4,5]}}]$payload$::jsonb)
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
