"""Emit an idempotent, inactive Lesson 3 deck import. Activate only after Pages is live."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
cards=json.loads((root/'professional-english/content/lesson-3-flashcards.json').read_text())
assert len(cards)==113 and len({c['id'] for c in cards})==113
for c in cards:assert len(c['examples'])==len(c['examples_zh'])==5
payload=json.dumps(cards,ensure_ascii=False,separators=(',',':'))
assert '$lesson3$' not in payload
print("""begin;
do $import$
declare course uuid; existing uuid;
begin
  select id into strict course from public.special_flash_courses
    where title='ProfessionalEnglish_ThreeGardenRoad_HK';
  select id into existing from public.special_flash_decks
    where course_id=course and title='Class 3 · Complaint Handling and Calm Response · 第三課：投訴處理與冷靜回應';
  if existing is null then
    insert into public.special_flash_decks(course_id,title,cards,version,active)
    values(course,'Class 3 · Complaint Handling and Calm Response · 第三課：投訴處理與冷靜回應',$lesson3$"""+payload+"""$lesson3$::jsonb,1,false);
  elsif not exists(select 1 from public.special_flash_decks where id=existing and cards=$lesson3$"""+payload+"""$lesson3$::jsonb) then
    raise exception 'Existing Lesson 3 differs; review before replacing it';
  end if;
end $import$;
commit;
select title,active,jsonb_array_length(cards) card_count from public.special_flash_decks
where title='Class 3 · Complaint Handling and Calm Response · 第三課：投訴處理與冷靜回應';""")
