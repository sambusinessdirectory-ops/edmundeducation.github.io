#!/usr/bin/env python3
"""Import the ranked synonym Markdown collection without renumbering saved lesson IDs."""
from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.util
import json
import re
import shutil
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RANKS = ROOT / 'synonyms/priority-order.csv'
CATALOG = ROOT / 'synonyms/lesson-catalog.mjs'
LESSONS = ROOT / 'synonyms/lessons'
SOURCE_OUT = ROOT / 'synonyms/source'
AUDIT = ROOT / 'synonyms/priority-import-audit.csv'
ISSUES = ROOT / 'synonyms/priority-import-issues.csv'
OLD_DATA = ROOT / 'synonyms/lessons-data.mjs'
SPEC = importlib.util.spec_from_file_location('legacy_importer', ROOT / 'tools/import-synonym-scaling.py')
legacy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(legacy)

HEAD = re.compile(r'^#{2,3}\s+(?:(?:練習|练习|Exercise)\s*|(?=\d{1,2}\.))(\d{1,2})(?:\.(\d))?(?:\s*[—–-]\s*(.+))?\s*$', re.M | re.I)
legacy.EX_HEAD = HEAD
legacy_our_options = legacy.extract_options

def options(block):
    found = legacy_our_options(block)
    if found:
        return found
    before = re.split(r'^\s*(?:#{2,3}\s*)?(?:\*\*)?(?:CORRECT ANSWER|Best answer|答案|正确答案)', block, maxsplit=1, flags=re.M | re.I)[0]
    pattern = r'^\s*-?\s*\*\*([A-F])\.\s*(.+?)\*\*'
    found = {letter: legacy.clean(label.replace('✓', '')) for letter, label in re.findall(pattern, before, re.M)}
    if not found:
        found = {letter: legacy.clean(label.replace('✓', '')) for letter, label in re.findall(pattern, block, re.M)}
    return found

def unlettered(block):
    # Labelled A–F choices must never be replaced by the later feedback list.
    if legacy_our_options(block):
        return None
    block = re.split(r'^\s*(?:#{1,3}\s*)?(?:\*\*)?(?:SIX-OPTION FEEDBACK|FEEDBACK)', block, maxsplit=1, flags=re.M | re.I)[0]
    rows = []
    for line in block.splitlines():
        hit = re.match(r'^\s*-\s*(.+?)\s*(?:—|：|:)\s*(.+)$', line)
        if hit and not re.match(r'^\*{0,2}[A-F]\.\s', hit.group(1)):
            rows.append((legacy.clean(hit.group(1).replace('✓', '')), '✓' in hit.group(1), legacy.clean(hit.group(2))))
    if len(rows) not in (4, 6):
        return None
    labels = 'ABCDEF'[:len(rows)]
    return ({letter: row[0] for letter, row in zip(labels, rows)},
            {letter: {'label': row[0], 'explanation': row[2]} for letter, row in zip(labels, rows)},
            [letter for letter, row in zip(labels, rows) if row[1]])

legacy.extract_options = options
legacy.extract_unlettered = unlettered

def source_blocks(source):
    matches = list(HEAD.finditer(source))
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(source)
        number = match.group(1) + ('.' + match.group(2) if match.group(2) else '')
        yield number, source[match.start():end]

def review_from_block(number, block, reason=''):
    # These cards preserve answer-only prompts and source defects without grading them.
    answer_match = re.search(r'^\*\*(?:答案|Answer:?)\s*[：:]?\*\*\s*(.+)$', block, re.M | re.I)
    if not answer_match:
        answer_match = re.search(r'^(?:#{2,3}\s+|\*\*)CORRECT ANSWER[^\n]*\n\s*\*\*(.+?)\*\*', block, re.M | re.I)
    answer = legacy.clean(answer_match.group(1)) if answer_match else ''
    context = legacy.after_label(block, r'^\s*(?:#{2,3}\s*)?(?:\*\*)?(?:READ THE CONTEXT[^\n]*|Context:)(?:\*\*)?\s*$')
    if not context:
        context = next((legacy.clean(line) for line in block.splitlines()[1:]
                        if legacy.clean(line) and not line.startswith(('#', '**', '-', '|'))
                        and re.search(r'[A-Za-z]', line)), '')
    if not answer:
        quote = re.findall(r'^>\s*(.+)$', block, re.M)
        if len(quote) > 1:
            answer = legacy.clean(quote[1])
    if not context or not answer:
        return None
    return {'number': number, 'original': context, 'answer': answer, 'reason': reason or '原始教材提供改寫題，未提供可評分的選項。'}

def q_answer_cards(source):
    cards = []
    pattern = re.compile(r'^\*\*Q(\d+)\*\*\s*(.+?)\s{2,}\s*\n\*\*Answer:\*\*\s*(.+)$', re.M | re.I)
    for i, hit in enumerate(pattern.finditer(source), 1):
        cards.append({'number': str(i), 'original': legacy.clean(hit.group(2)),
                      'answer': legacy.clean(hit.group(3)),
                      'reason': '原始教材是句子改寫題，按一下查看參考答案。'})
    return cards

def parse_old_data():
    raw = OLD_DATA.read_text(encoding='utf-8')
    match = re.search(r'export const lessons = (\[.*\]);\s*$', raw, re.S)
    if not match:
        raise RuntimeError('Existing lesson data cannot be decoded')
    return {Path(item['sourceFile']).name: item for item in json.loads(match.group(1))}

def validate(item):
    reasons = []
    for word in item['words']:
        keep = []
        for ex in word['exercises']:
            for choice in ex['options']:
                prefix = choice['letter'] + '. '
                if choice['text'].startswith(prefix):
                    choice['text'] = choice['text'][len(prefix):]
                    if ex['answer'].startswith(prefix):
                        ex['answer'] = ex['answer'][len(prefix):]
            labels = [choice['letter'] for choice in ex['options']]
            texts = [choice['text'].casefold().strip() for choice in ex['options']]
            if labels != list('ABCDEF'[:len(labels)]) or len(labels) not in (4, 6):
                reasons.append((ex, '選項數量或標籤不完整'))
            elif len(set(texts)) != len(texts):
                reasons.append((ex, '原始教材有重複選項'))
            elif texts.count(ex['answer'].casefold().strip()) != 1:
                reasons.append((ex, '正確答案未唯一對應選項'))
            elif not ex['original']:
                reasons.append((ex, '缺少原句'))
            else:
                keep.append(ex)
        word['exercises'] = keep
    return reasons

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=Path('/Users/sammak/Desktop/Synonym Exercise Scaling'))
    args = parser.parse_args()
    ranked = list(csv.DictReader(RANKS.open(newline='', encoding='utf-8')))
    assert len(ranked) == 1845
    assert [int(row['rank']) for row in ranked] == list(range(1, 1846))
    assert len({row['file'] for row in ranked}) == len(ranked)
    old = parse_old_data()
    legacy.match_name = lambda path: by_file[path.name]['term']
    by_file = {row['file']: row for row in ranked}
    LESSONS.mkdir(exist_ok=True)
    SOURCE_OUT.mkdir(exist_ok=True)
    catalog, audit, issues = [], [], []
    for row in ranked:
        path = args.source / row['file']
        if not path.is_file():
            raise FileNotFoundError(path)
        source = path.read_text(encoding='utf-8').replace('\r\n', '\n')
        issue_start = len(legacy.ISSUES)
        parsed = legacy.parse(path)
        # Retain every existing graded-question ID while still auditing its source.
        item = old.get(path.name, parsed)
        item['moduleNumber'] = int(row['rank'])
        item['priorityRank'] = int(row['rank'])
        if not item.get('id'):
            digest = hashlib.sha256(path.name.encode()).hexdigest()[:14]
            item['id'] = 'lesson-src-' + digest
        item['sourceFile'] = '/synonyms/source/' + path.name
        removed = validate(item)
        raw_issues = legacy.ISSUES[issue_start:]
        by_number = {number: block for number, block in source_blocks(source)}
        review = q_answer_cards(source) if path.name == 'answer_close_synonyms_teaching_material.md' else []
        for file, number, detail in raw_issues:
            card = review_from_block(number, by_number.get(number, ''), detail)
            if card:
                review.append(card)
            issues.append((row['rank'], file, number, detail, 'self-check' if card else 'source only'))
        for ex, detail in removed:
            number = str(ex['number'])
            card = {'number': number, 'original': ex['original'], 'answer': ex.get('upgrade') or ex['answer'], 'reason': detail}
            review.append(card)
            issues.append((row['rank'], path.name, number, detail, 'self-check'))
        if review:
            item['reviewExercises'] = review
        item['omittedExercises'] = max(int(item.get('omittedExercises') or 0), len(raw_issues) + len(removed))
        guide_count = len(item['words'])
        question_count = sum(len(word['exercises']) for word in item['words'])
        if not guide_count:
            raise ValueError(f'{path.name}: no guide entries')
        output = LESSONS / (item['id'] + '.json')
        output.write_text(json.dumps(item, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        destination = SOURCE_OUT / path.name
        if destination.resolve() != path.resolve():
            shutil.copyfile(path, destination)
        catalog.append({'id': item['id'], 'rank': int(row['rank']), 'headword': row['term'],
                        'title': item['title'], 'subtitle': item['subtitle'], 'sourceFile': item['sourceFile'],
                        'guideCount': guide_count, 'questionCount': question_count,
                        'reviewCount': len(review), 'dataFile': './lessons/' + output.name})
        audit.append((row['rank'], row['term'], path.name, item['id'], guide_count,
                      question_count, len(review), len(raw_issues), len(removed), output.stat().st_size))
    if len({item['id'] for item in catalog}) != len(catalog):
        raise RuntimeError('Duplicate lesson IDs')
    legacy_catalog = []
    ranked_files = {row['file'] for row in ranked}
    for filename, item in old.items():
        if filename in ranked_files:
            continue
        match = next((entry for entry in catalog if entry['headword'].casefold() == item['headword'].casefold()), None)
        if not match:
            raise ValueError(f'Existing lesson has no ranked word: {filename}')
        item['moduleNumber'] = match['rank']
        item['priorityRank'] = match['rank']
        output = LESSONS / (item['id'] + '.json')
        output.write_text(json.dumps(item, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        legacy_catalog.append({'id': item['id'], 'rank': match['rank'], 'headword': item['headword'],
                               'title': item['title'] + ' · 原有版本', 'subtitle': item['subtitle'],
                               'sourceFile': item['sourceFile'], 'guideCount': len(item['words']),
                               'questionCount': sum(len(word['exercises']) for word in item['words']),
                               'reviewCount': len(item.get('reviewExercises', [])),
                               'dataFile': './lessons/' + output.name, 'legacy': True})
    CATALOG.write_text('// Generated by tools/import-synonym-priority.py from synonyms/priority-order.csv.\n'
                       + 'export const catalog = ' + json.dumps(catalog, ensure_ascii=False, separators=(',', ':')) + ';\n'
                       + 'export const legacyCatalog = ' + json.dumps(legacy_catalog, ensure_ascii=False, separators=(',', ':')) + ';\n',
                       encoding='utf-8')
    with AUDIT.open('w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['rank','headword','source_file','lesson_id','guide_entries','graded_questions',
                         'self_check_questions','source_issues','quarantined_questions','json_bytes'])
        writer.writerows(audit)
    with ISSUES.open('w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['rank','source_file','question','issue','disposition'])
        writer.writerows(issues)
    print('lessons', len(catalog), 'prior_uploads', len(old), 'legacy_extras', len(legacy_catalog),
          'graded', sum(item[5] for item in audit),
          'self_check', sum(item[6] for item in audit),
          'source_issues', len(issues),
          'data_mib', round(sum(item[9] for item in audit)/1048576, 2))
    print('dispositions', Counter(item[4] for item in issues))

if __name__ == '__main__':
    main()
