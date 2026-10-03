#!/usr/bin/env python3
"""Create an idempotent catalogue migration for PDF-verified MCQ corrections."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT/'polysemy-lab/PDF-ANSWER-AUDIT.json'
OUT = ROOT/'supabase/migrations/20261003070000_polysemy_pdf_answer_repair.sql'


def main():
    report = json.loads(REPORT.read_text())
    rows = []
    for patch in report['patches']:
        module = json.loads((ROOT/'polysemy-lab/content'/f"{patch['module']}.mjs").read_text()
                            .removeprefix('export default ').removesuffix(';\n'))
        sense_ids = [s['id'] for s in module['senses']]
        indices = {sid: i for i, sid in enumerate(sense_ids)}
        added = [s['id'] for s in patch['newSenses']]
        assert len(sense_ids) == patch['oldSenseCount'] + len(added)
        if patch['number'] < 565:
            old_answers = {c['question']: indices[c['oldSense']] for c in patch['changes']}
            answers = {c['question']: indices[c['newSense']] for c in patch['changes']}
            options = {}
            for c in patch['changes']:
                idx = str(indices[c['newSense']])
                value = [indices[sid] for sid in c['newOptions']]
                if idx in options and options[idx] != value:
                    raise ValueError(f"Different options for same sense {patch['module']} {idx}")
                options[idx] = value
            row = {'module': patch['module'], 'kind': 'mcq',
                   'oldCount': patch['oldSenseCount'], 'newSenses': added,
                   'oldAnswers': old_answers, 'answers': answers, 'options': options}
        else:
            old_answers = {c['question']: c['oldSense'] for c in patch['changes']}
            questions = {c['question']: {'answer': c['newSense'],
                                          'options': c['newOptions']} for c in patch['changes']}
            row = {'module': patch['module'], 'kind': 'questions',
                   'oldCount': patch['oldSenseCount'], 'newSenses': added,
                   'oldAnswers': old_answers, 'questions': questions}
        rows.append(row)
    payload = json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
    sql = f'''-- PDF-section-verified answer corrections. Each row is checked before mutation.
-- Regenerate with tools/build-polysemy-pdf-answer-migration.py.
do $repair$
declare
  patch jsonb;
  check_row record;
  old_answer record;
  new_senses jsonb;
begin
  for patch in select value from jsonb_array_elements($payload${payload}$payload$::jsonb)
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
      if jsonb_array_length(check_row.mcq->'senses') =
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
          jsonb_set(check_row.mcq, '{{senses}}', check_row.mcq->'senses' || new_senses),
          '{{answers}}', check_row.mcq->'answers' || patch->'answers'),
        '{{options}}', check_row.mcq->'options' || patch->'options')
      where module = patch->>'module';
    else
      if jsonb_array_length(check_row.senses) =
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
'''
    OUT.write_text(sql)
    print(json.dumps({'modules': len(rows), 'bytes': len(sql.encode()), 'path': str(OUT)}))


if __name__ == '__main__':
    main()
