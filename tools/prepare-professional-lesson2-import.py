"""Emit an idempotent, inactive Lesson 2 deck import. Activate only after Pages is live."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
cards=json.loads((root/'professional-english/content/lesson-2-flashcards.json').read_text())
assert len(cards)==50 and len({c['id'] for c in cards})==50
for c in cards:assert len(c['examples'])==len(c['examples_zh'])==3
payload=json.dumps(cards,ensure_ascii=False,separators=(',',':'))
assert '$lesson2$' not in payload
print("""begin;
do $import$
declare course uuid; existing uuid;
begin
  select id into strict course from public.special_flash_courses
    where title='ProfessionalEnglish_ThreeGardenRoad_HK';
  select id into existing from public.special_flash_decks
    where course_id=course and title='Class 2 · Visitor Directions and Assistance · 第二課：訪客指引與協助';
  if existing is null then
    insert into public.special_flash_decks(course_id,title,cards,version,active)
    values(course,'Class 2 · Visitor Directions and Assistance · 第二課：訪客指引與協助',$lesson2$"""+payload+"""$lesson2$::jsonb,1,false);
  elsif not exists(select 1 from public.special_flash_decks where id=existing and cards=$lesson2$"""+payload+"""$lesson2$::jsonb) then
    raise exception 'Existing Lesson 2 differs; review before replacing it';
  end if;
end $import$;
commit;
select title,active,jsonb_array_length(cards) card_count from public.special_flash_decks
where title='Class 2 · Visitor Directions and Assistance · 第二課：訪客指引與協助';""")
