begin;

-- Keep punctuation-insensitive scoring, but preserve letter case. The source
-- sentences are included only long enough to regenerate the private hashes.
with expected(module_key, sentence_number, answer) as (values
  ('the-last-train-2026', 1, 'Ron Green was taking the last train home from Bonnington to Chisley.'),
  ('the-last-train-2026', 2, 'The rain began hitting the carriage window as he checked his watch: 23.45.'),
  ('the-last-train-2026', 3, '‘Still ages to go,’ he muttered grumpily.'),
  ('the-last-train-2026', 4, '‘Can''t we go a bit faster?’'),
  ('the-last-train-2026', 5, 'The only other soul in the carriage was a man several rows ahead, facing away from him.'),
  ('the-last-train-2026', 6, 'The man was wearing a black baseball cap and red sweatshirt.'),
  ('the-last-train-2026', 7, 'Despite his very ordinary choice of outfit, something about the man gave Ron a sense of déjà vu.'),
  ('the-last-train-2026', 8, '‘Excuse me?’ Ron called over.'),
  ('the-last-train-2026', 9, '‘Do I know you?’'),
  ('the-last-train-2026', 10, 'The man did not move.'),
  ('the-last-train-2026', 11, '‘Must be asleep,’ Ron told himself.'),
  ('the-last-train-2026', 12, 'Soon after, the gentle rocking of the train lulled him, too, into sleep.'),
  ('the-last-train-2026', 13, 'The train jolted and Ron''s eyes sprang open.'),
  ('the-last-train-2026', 14, 'The man appeared to be a little closer now.'),
  ('the-last-train-2026', 15, '‘Perhaps his seat was uncomfortable,’ Ron thought, and fell back to sleep.'),
  ('the-last-train-2026', 16, 'Five minutes later, he awoke once more.'),
  ('the-last-train-2026', 17, 'The man was now just one row away.'),
  ('the-last-train-2026', 18, '‘Perhaps his armrest was broken,’ Ron speculated, as he started to feel a little uneasy.'),
  ('the-last-train-2026', 19, 'Again, Ron allowed himself to drift off.'),
  ('the-last-train-2026', 20, 'Shortly after, he awoke to the sound of his watch beeping.'),
  ('the-last-train-2026', 21, 'It was midnight.'),
  ('the-last-train-2026', 22, 'There was no sign of the man.'),
  ('the-last-train-2026', 23, 'He turned and let out a small scream.'),
  ('the-last-train-2026', 24, 'In the seat beside him sat the man, staring directly at him.'),
  ('the-last-train-2026', 25, 'Ron stared back and could hardly believe what he saw.'),
  ('the-last-train-2026', 26, 'It was like looking into a mirror, except that the man''s face was dripping with blood.'),
  ('the-last-train-2026', 27, '‘Has my demise taught you nothing?’ said the man with great tenderness.'),
  ('the-last-train-2026', 28, '‘More haste, less speed.'),
  ('the-last-train-2026', 29, 'Remember?'),
  ('the-last-train-2026', 30, 'Rush your life away and it will quickly disappear.’'),
  ('the-last-train-2026', 31, 'Ron''s doppelganger then closed his eyes and slumped forward in his seat.'),
  ('the-last-train-2026', 32, 'Nearly petrified, Ron edged past the corpse and ran like the wind through carriage after carriage.'),
  ('the-last-train-2026', 33, 'Eventually, he slumped down into a seat, breathing hard.'),
  ('the-last-train-2026', 34, 'Yesterday''s newspaper lay on the table before him.'),
  ('the-last-train-2026', 35, 'The headline read, ‘Remembering the Victims on the Anniversary of the Bonnington Train Crash.’'),
  ('the-last-train-2026', 36, 'Ron read on, ‘The only survivor of the crash, caused by a speeding train, was Ron Green.'),
  ('the-last-train-2026', 37, 'He has sustained grave brain injuries and is still in a coma.'),
  ('the-last-train-2026', 38, 'His identical twin, Martin, sadly did not survive the crash.’'),
  ('the-last-train-2026', 39, 'The train sped on, faster and faster.'),
  ('valentines-day-landmines-2026', 1, 'Roses are red.'),
  ('valentines-day-landmines-2026', 2, 'Violets are blue.'),
  ('valentines-day-landmines-2026', 3, 'I bought you flowers.'),
  ('valentines-day-landmines-2026', 4, 'You said boohoo.'),
  ('valentines-day-landmines-2026', 5, 'Nobody wants to unwittingly upset their lover on Valentine’s Day.'),
  ('valentines-day-landmines-2026', 6, 'It is therefore important to note that this festival is celebrated differently in different places.'),
  ('valentines-day-landmines-2026', 7, 'Especially when you are in a foreign country, misunderstandings are only an inflatable love heart or a cutesy teddy bear away.'),
  ('valentines-day-landmines-2026', 8, 'The idea that red roses represent love was probably influenced by the ancient Greek myth of Aphrodite, goddess of love¹.'),
  ('valentines-day-landmines-2026', 9, 'However, though they are popular, roses are not the standard Valentine’s Day gift in many places.'),
  ('valentines-day-landmines-2026', 10, 'In Wales, for example, people who are single desire something a bit more permanent than flowers – in the form of beautifully carved wooden spoons, which are gifted in January, earlier than romantic celebrations elsewhere.'),
  ('valentines-day-landmines-2026', 11, 'These spoons honour the Welsh patron saint of lovers, Saint Dwynwen².'),
  ('valentines-day-landmines-2026', 12, 'Although Dwynwen herself was unlucky in love, it was her wish that future couples should find happiness.'),
  ('valentines-day-landmines-2026', 13, 'Some people like to give chocolate as a romantic gift.'),
  ('valentines-day-landmines-2026', 14, 'If that’s you, you would be on safe ground in Ghana, which is one of the world’s biggest producers of cocoa beans.'),
  ('valentines-day-landmines-2026', 15, 'Here, lovers exchange delicious chocolate treats on 14 February, which is also known as National Chocolate Day in this West African country.'),
  ('valentines-day-landmines-2026', 16, 'In Japan, things are a little more complicated.'),
  ('valentines-day-landmines-2026', 17, 'Women have to give chocolates according to the category of recipient.'),
  ('valentines-day-landmines-2026', 18, 'Giri-choco, which means ‘obligation chocolate’, is given to classmates, co-workers or teachers.'),
  ('valentines-day-landmines-2026', 19, 'Tomo-choco, or ‘friendship chocolate’, is for close friends and family.'),
  ('valentines-day-landmines-2026', 20, 'Meanwhile, Honmei-choco, or ‘true love chocolate’, is given to a special someone.'),
  ('valentines-day-landmines-2026', 21, 'A mix-up in the gifts could be socially disastrous.'),
  ('valentines-day-landmines-2026', 22, 'These days, Valentine’s Day has become a highly commercialized affair, especially in the United States.'),
  ('valentines-day-landmines-2026', 23, 'In 2022, US$23.9 billion was spent on Valentine’s purchases for friends, partners and even pets.'),
  ('valentines-day-landmines-2026', 24, 'Don’t want to fall prey to marketers’ hype?'),
  ('valentines-day-landmines-2026', 25, 'Poetry can be extremely romantic, though it can also be cheesy³ or funny.'),
  ('valentines-day-landmines-2026', 26, 'One option is to learn from the Danes.'),
  ('valentines-day-landmines-2026', 27, 'They send anonymous cards with a funny poem to the person they admire³.'),
  ('valentines-day-landmines-2026', 28, 'After all, some say a shared sense of humour is the most important thing in a relationship.'),
  ('valentines-day-landmines-2026', 29, 'In Greek mythology, Aphrodite is associated with love, passion and beauty, and roses are one of her symbols.'),
  ('valentines-day-landmines-2026', 30, 'Legend has it that God promised Dwynwen that he would take care of all true lovers in the world through her.'),
  ('valentines-day-landmines-2026', 31, 'Known as ‘gaekkebrev’ in Denmark, it is a teasing note written on a piece of paper cut in an intricate pattern, and signed only with anonymous dots, so the recipient has to guess who the sender is.')
)
update public.junior_quiz_sentence_hashes as hashes
set answer_sha256 = pg_catalog.encode(
  extensions.digest(
    pg_catalog.btrim(pg_catalog.regexp_replace(expected.answer, '[^[:alnum:]]+', ' ', 'g')),
    'sha256'
  ),
  'hex'
)
from expected
where hashes.module_key = expected.module_key
  and hashes.sentence_number = expected.sentence_number;

create or replace function public.junior_quiz_submit(p_token uuid,p_module_key text,p_answers jsonb,p_final boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_student_id uuid; v_key text; v_raw text; v_answer text; v_normalized text;
  v_number integer; v_expected_count integer; v_correct boolean; v_count integer:=0; v_correct_count integer:=0;
  v_results jsonb:='{}'::jsonb;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers)<>'object' or p_final is null
     or pg_catalog.octet_length(p_answers::text)>25000 then
    raise exception 'Invalid submission' using errcode='22023';
  end if;
  select pg_catalog.count(*)::integer into v_expected_count
    from public.junior_quiz_sentence_hashes key_row where key_row.module_key=p_module_key;
  if v_expected_count not between 1 and 39 then raise exception 'Unknown quiz module' using errcode='22023'; end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id=session_row.student_id
  join public.junior_exam_module_access access_row on access_row.student_id=student.id and access_row.module_key=p_module_key
  where session_row.token=p_token and session_row.expires_at>pg_catalog.now() and student.deleted_at is null
    and student.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid
  limit 1;
  if v_student_id is null then raise exception 'This module is not assigned to this student' using errcode='42501'; end if;
  for v_key,v_raw in select item.key,item.value from pg_catalog.jsonb_each_text(p_answers) item(key,value) loop
    if v_key !~ '^[0-9]{2}$' then raise exception 'Invalid sentence number' using errcode='22023'; end if;
    v_number:=v_key::integer;
    v_answer:=pg_catalog.btrim(v_raw);
    if pg_catalog.char_length(v_answer) not between 1 and 500 then
      raise exception 'Invalid answer' using errcode='22023';
    end if;
    v_normalized:=pg_catalog.btrim(pg_catalog.regexp_replace(v_answer,'[^[:alnum:]]+',' ','g'));
    select key_row.answer_sha256=pg_catalog.encode(extensions.digest(v_normalized,'sha256'),'hex')
      into v_correct from public.junior_quiz_sentence_hashes key_row
      where key_row.module_key=p_module_key and key_row.sentence_number=v_number;
    if v_correct is null then raise exception 'Sentence is not part of this module' using errcode='22023'; end if;
    insert into public.junior_quiz_responses as existing(student_id,module_key,sentence_number,answer,correct,attempts,submitted_at)
      values(v_student_id,p_module_key,v_number,v_answer,v_correct,1,pg_catalog.now())
      on conflict(student_id,module_key,sentence_number) do update
      set answer=excluded.answer,correct=existing.correct or excluded.correct,attempts=existing.attempts+1,submitted_at=excluded.submitted_at;
    v_count:=v_count+1;
    v_correct_count:=v_correct_count+case when v_correct then 1 else 0 end;
    v_results:=pg_catalog.jsonb_set(v_results,array[v_key],pg_catalog.to_jsonb(v_correct),true);
  end loop;
  if v_count=0 or (p_final and v_count<>v_expected_count) then
    raise exception 'Submit at least one sentence; full submission needs every sentence' using errcode='22023';
  end if;
  insert into public.junior_quiz_submissions(student_id,module_key,submitted_count,correct_count,is_final)
    values(v_student_id,p_module_key,v_count,v_correct_count,p_final);
  return pg_catalog.jsonb_build_object('submitted',v_count,'correct',v_correct_count,'final',p_final,'results',v_results);
end;
$$;

revoke all on function public.junior_quiz_submit(uuid,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.junior_quiz_submit(uuid,text,jsonb,boolean) to authenticated;

commit;
