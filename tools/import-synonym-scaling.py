#!/usr/bin/env python3
"""Import the supplied Synonym Exercise Scaling Markdown lessons as site modules.

The source files are deliberately kept alongside the generated data. The parser
accepts the different layouts used in this set, while refusing ambiguous answer
keys or incomplete choice sets instead of silently inventing an exercise.
"""

import csv
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_OUT = ROOT / 'synonyms/source'
SOURCE = SOURCE_OUT if SOURCE_OUT.is_dir() else Path('/Users/sammak/Desktop/Synonym Exercise Scaling')
DATA_OUT = ROOT / 'synonyms/lessons-data.mjs'
ORDER_OUT = ROOT / 'synonyms/module-order-03-62.csv'
ISSUES_OUT = ROOT / 'synonyms/import-issues-03-62.csv'
COVERAGE_OUT = ROOT / 'synonyms/content-coverage-03-62.csv'
ISSUES = []

# Approximate frequency of the headword or phrase in everyday English. Common
# conversational words precede specialized school, business, and sports terms.
ORDER = [
    'help', 'a lot of', 'begin', 'able', 'actually', 'remember', 'win',
    'asked', 'try it', 'a number of', 'in fact', 'immediately', 'a few years ago',
    'building', 'closed', 'youngster', 'amazing', 'calm', 'nervous', 'danger',
    'avoid', 'prepare', 'situation', 'ability', 'effect', 'goal', 'activity',
    'active', 'journey', 'train', 'encourage', 'assistance', 'access',
    'accessible', 'adapt', 'accidents', 'according to', 'account',
    'professional', 'quality', 'a variety of', 'a range of', 'achieve',
    'interested in', 'take up', 'shy', 'classmates', 'raised their hands',
    'actors', 'summer course', 'accommodation', 'academic', 'accuse',
    'recalls', 'call himself', 'opponent', 'accounting', 'adaptability',
    'footwork', 'adaptability quotient',
]

EX_HEAD = re.compile(r'^#{2,3}\s+(?:練習|Exercise)\s*(\d{1,2})(?:\.(\d))?(?:\s*[—–-]\s*(.+))?\s*$', re.M | re.I)
WORD_HEAD = re.compile(r'^#{2,3}\s+(\d{2})[.\s]+(.+?)\s*$', re.M)
SECTION_HEAD = re.compile(r'^#{1,2}\s+.*(?:False synonyms|False friends|Not close enough|練習與解釋|Practice|Exercises)', re.M | re.I)
OPTION_LINE = re.compile(r'^\s*-?\s*([A-F])\.\s+(.+?)\s*$', re.M)
TABLE_OPTION = re.compile(r'^\|\s*([A-F])\s*\|\s*(.*?)\s*\|\s*$', re.M)
LETTER_FEEDBACK = re.compile(r'^[ \t]*-?[ \t]*\*\*([A-F])\.[ \t]*(.+?)\*\*[ \t]*(.*)$', re.M)


def clean(value):
    value = value.strip().strip('> ').strip()
    value = re.sub(r'\*\*|(?<!\*)\*(?!\*)|`', '', value)
    return re.sub(r'\s+', ' ', value).strip()


def strip_heading(value):
    return clean(value.split(' · ', 1)[0].split(' — ', 1)[0])


def first_nonempty(block):
    for line in block.splitlines():
        line = clean(line)
        if line and line != '---' and not line.startswith('#'):
            return line
    return ''


def after_label(block, pattern):
    match = re.search(pattern, block, re.I | re.M)
    if not match:
        return ''
    rest = block[match.end():]
    return first_nonempty(rest)


def match_name(path):
    stem = path.stem.lower()
    if stem.startswith('a_few_years_ago_'): return 'a few years ago'
    if stem.startswith('a_lot_of_'): return 'a lot of'
    if stem.startswith('a_number_of_'): return 'a number of'
    if stem.startswith('a_range_of_'): return 'a range of'
    if stem.startswith('a_variety_of_'): return 'a variety of'
    for name in sorted(ORDER, key=len, reverse=True):
        if stem.startswith(name.replace(' ', '_') + '_'):
            return name
    raise ValueError(f'Unrecognized source filename: {path.name}')


def extract_guide(source, limit):
    text = source[:limit]
    headings = list(WORD_HEAD.finditer(text))
    words = []
    for i, heading in enumerate(headings):
        number, raw_word = heading.groups()
        if re.search(r'同義詞指南|Close synonyms|Synonym Guide|False synonyms', raw_word, re.I):
            continue
        if int(number) != len(words) + 1:
            continue
        body = text[heading.end():headings[i + 1].start() if i + 1 < len(headings) else len(text)]
        lines = [clean(line) for line in body.splitlines() if clean(line) and clean(line) != '---']
        meaning = ''
        for line in lines:
            if line.startswith('中文：') or line.startswith('Meaning:'):
                meaning = line.split('：', 1)[-1] if '：' in line else line.split(':', 1)[-1].strip()
                break
            if re.search(r'[\u3400-\u9fff]', line) and not line.startswith(('#', '-', '>', 'EXAMPLE', '例句', '用法')):
                meaning = line
                break
        example = after_label(body, r'^\s*(?:\*\*)?(?:EXAMPLE[^\n]*|Example:)(?:\*\*)?\s*$')
        if not example:
            quote = re.search(r'^>\s*(.+)$', body, re.M)
            if quote and re.search('[A-Za-z]', quote.group(1)): example = clean(quote.group(1))
        example_zh = ''
        if example:
            later = body.find(example)
            if later >= 0:
                example_zh = next((clean(line) for line in body[later + len(example):].splitlines()
                                   if re.search('[\u3400-\u9fff]', line) and not line.startswith('#')), '')
                example_zh = re.sub(r'^中文[：:]\s*', '', example_zh)
        note = next((line for line in lines if line != meaning and line != example and re.search('[\u3400-\u9fff]', line) and not line.startswith(('中文', 'EXAMPLE', '例句', '#'))), meaning)
        words.append({'order': int(number), 'word': strip_heading(raw_word), 'meaning': meaning or strip_heading(raw_word),
                      'note': note or meaning, 'example': example, 'exampleZh': example_zh, 'exercises': []})
    return words


def extract_false(source, start):
    match = re.search(r'^#{1,2}\s+[^\n]*(?:False synonyms|False friends|False / weaker|Not close enough)[^\n]*$', source[start:], re.M | re.I)
    if not match: return []
    start += match.end()
    end_match = re.search(r'^#{1,2}\s+\d{2}\s+(?:練習與解釋|Practice|Exercises|核心辨析|Contrast Sets|Collocation Bank)[^\n]*$', source[start:], re.M | re.I)
    body = source[start:start + end_match.start()] if end_match else source[start:]
    heads = list(WORD_HEAD.finditer(body))
    if not heads:
        heads = list(re.finditer(r'^###\s+([A-Za-z][^\n]+)$', body, re.M))
    items = []
    for i, head in enumerate(heads):
        item_body = body[head.end():heads[i + 1].start() if i + 1 < len(heads) else len(body)]
        lines = [clean(x) for x in item_body.splitlines() if clean(x) and clean(x) != '---' and not x.startswith('#')]
        if lines:
            zh = ' '.join(x for x in lines if re.search('[\u3400-\u9fff]', x))
            en = ' '.join(x for x in lines if not re.search('[\u3400-\u9fff]', x))
            items.append({'word': clean(head.group(2) if head.lastindex == 2 else head.group(1)), 'zh': zh or ' '.join(lines), 'point': en})
    return items


def extract_options(block):
    pre = re.split(r'^\s*(?:#{2,3}\s*)?(?:\*\*)?(?:CORRECT ANSWER|Best answer|SIX-OPTION FEEDBACK|FEEDBACK|答案：)', block, maxsplit=1, flags=re.M | re.I)[0]
    found = {letter: clean(text) for letter, text in OPTION_LINE.findall(pre)}
    found.update({letter: clean(text) for letter, text in TABLE_OPTION.findall(pre)})
    return found


def extract_feedback(block):
    feedback = {}
    marked = []
    hits = list(LETTER_FEEDBACK.finditer(block))
    for i, hit in enumerate(hits):
        letter, label, inline = hit.groups()
        if '✓' in label or '✓' in inline: marked.append(letter)
        if ' = ' in label:
            label, note = label.split(' = ', 1)
            inline = note + ' ' + inline
        label = clean(label.replace('✓', ''))
        tail = block[hit.end():hits[i + 1].start() if i + 1 < len(hits) else len(block)]
        tail = re.split(r'^#{1,3}\s+|^\*\*[A-F][–-][A-F]\.\*\*', tail, maxsplit=1, flags=re.M)[0]
        explanation = clean(inline + ' ' + tail).removesuffix(' ---').strip()
        feedback[letter] = {'label': label, 'explanation': explanation}
    for group in re.finditer(r'^\*\*([A-F])[–-]([A-F])\.\*\*[ \t]*\n([^\n]+)', block, re.M):
        start, end, explanation = group.groups()
        for code in range(ord(start), ord(end) + 1):
            letter = chr(code)
            feedback.setdefault(letter, {'label': letter, 'explanation': clean(explanation)})
    return feedback, marked


def extract_unlettered(block):
    rows = []
    for line in block.splitlines():
        m = re.match(r'^\s*-\s*(.+?)\s*(?:—|：|:)\s*(.+)$', line)
        if m and not re.match(r'^[A-F]\.\s', m.group(1)):
            label = m.group(1)
            rows.append((clean(label.replace('✓', '')), '✓' in label, clean(m.group(2))))
    if len(rows) != 6: return None
    options = {letter: text for letter, (text, _, _) in zip('ABCDEF', rows)}
    feedback = {letter: {'label': text, 'explanation': note} for letter, (text, _, note) in zip('ABCDEF', rows)}
    marked = [letter for letter, (_, yes, _) in zip('ABCDEF', rows) if yes]
    return options, feedback, marked


def extract_exercise(block, number, target, file):
    options = extract_options(block)
    feedback, marked = extract_feedback(block)
    if len(options) != 6 or len(feedback) != 6:
        unlettered = extract_unlettered(block)
        if unlettered: options, feedback, marked = unlettered
    if not options:
        # The Actually lesson deliberately has four choices and a shared explanation.
        options = {letter: clean(text) for letter, text in OPTION_LINE.findall(block)}
    answer_match = re.search(r'\*\*(?:Correct answer|Best answer):\*\*\s*\*\*(?:[A-F]\.\s*)?(.+?)\*\*', block, re.I)
    if not answer_match:
        answer_match = re.search(r'^\*\*CORRECT ANSWER:\*\*\s*(.+)$', block, re.M | re.I)
    explicit = ''
    if answer_match:
        explicit = clean(answer_match.group(1)).split(' · ', 1)[0]
        for letter, value in options.items():
            if value.casefold() == explicit.casefold() and letter not in marked: marked.append(letter)
    if not marked:
        section = re.search(r'(?:CORRECT ANSWER[^\n]*|答案：)(.*?)(?:SIX-OPTION FEEDBACK|FEEDBACK|\Z)', block, re.S | re.I)
        if section:
            candidate = re.search(r'\*\*(.+?)\*\*', section.group(1))
            value = clean(candidate.group(1)).split(' · ', 1)[0] if candidate else ''
            explicit = explicit or value
            for letter, option in options.items():
                if option.casefold() == value.casefold(): marked.append(letter)
    marked = list(dict.fromkeys(marked))
    if not options and file.name == 'building_synonym_teaching_material.md':
        raise ValueError(f'{file.name}: {number}: source supplies an answer-only prompt with no multiple-choice options')
    if len(options) not in (4, 6) or set(options) != set('ABCDEF'[:len(options)]):
        raise ValueError(f'{file.name}: {number}: expected 4 or 6 labelled options, got {options}')
    if len(marked) != 1:
        raise ValueError(f'{file.name}: {number}: source answer {explicit!r} does not match a supplied option')
    answer = options[marked[0]]
    if not feedback:
        why = after_label(block, r'^\*\*Explanation:\*\*|^\*\*Why:\*\*')
        feedback = {letter: {'explanation': why if letter == marked[0] else '本題教材沒有為此選項提供個別解釋。'} for letter in options}
    else:
        for letter in options:
            feedback.setdefault(letter, {'explanation': '本題教材沒有為此選項提供個別解釋。'})

    context = after_label(block, r'^\s*(?:#{2,3}\s*)?(?:\*\*)?(?:READ THE CONTEXT[^\n]*|Context:)(?:\*\*)?\s*$')
    if not context:
        lines = block.splitlines()[1:]
        context = next((clean(x) for x in lines if clean(x) and not x.startswith(('#', '**', '-', '|')) and not re.match(r'^[A-F]\. ', x.strip()) and re.search('[A-Za-z]', x)), '')
    zh = after_label(block, r'^\s*(?:#{2,3}\s*)?(?:\*\*)?中文翻譯(?:\*\*)?\s*$')
    if zh.startswith('A.'): zh = ''
    upgrade = after_label(block, r'^\s*(?:#{2,3}\s*)?(?:\*\*)?(?:Rewritten sentence:|CORRECT ANSWER[^\n]*|答案：)(?:\*\*)?\s*$')
    if upgrade and not re.search('[A-Za-z]', upgrade): upgrade = ''
    if not context:
        raise ValueError(f'{file.name}: {number}: no sentence context')
    return {'number': number, 'original': context, 'zh': zh, 'upgrade': upgrade or context,
            'answer': answer, 'options': [{'letter': letter, 'text': options[letter],
                                          'explanation': feedback[letter]['explanation']} for letter in options]}


def parse(path):
    source = path.read_text(encoding='utf-8').replace('\r\n', '\n')
    name = match_name(path)
    heading = re.findall(r'^#\s+(.+)$', source, re.M)
    title = name.title() if name not in ('a lot of', 'a number of', 'a range of', 'a variety of', 'a few years ago') else name[0].upper() + name[1:]
    if len(heading) > 1 and 'SYNONYMS' not in heading[1].upper() and not re.match(r'^\d', heading[1]):
        title = clean(heading[1]).split(' — ', 1)[0]
    first_ex = EX_HEAD.search(source)
    guide_heads = list(re.finditer(r'^#{1,2}\s+01\s+[^\n]*(?:同義詞指南|Close synonyms|Synonym Guide|Useful Synonyms)[^\n]*$', source, re.M | re.I))
    guide_start = guide_heads[-1].start() if guide_heads else 0
    false_candidates = list(re.finditer(r'^#{1,2}\s+[^\n]*(?:False synonyms|False friends|False / weaker|Not close enough)[^\n]*$', source, re.M | re.I))
    first_false = next((m for m in false_candidates if m.start() > guide_start), None)
    guide_end = min([m.start() for m in (first_ex, first_false) if m and m.start() > guide_start], default=len(source))
    words = extract_guide(source[guide_start:guide_end], guide_end - guide_start)
    if not words: raise ValueError(f'{path.name}: no guide entries')
    false = extract_false(source, guide_end)
    matches = list(EX_HEAD.finditer(source))
    for i, head in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(source)
        if i + 1 == len(matches):
            later = re.search(r'^#{1,2}\s+\d{2}\s+[^\n]+$', source[head.end():], re.M)
            if later: end = min(end, head.end() + later.start())
        wi, ei, target = head.groups()
        index = int(wi) - 1 if ei else None
        block = source[head.start():end]
        if index is None:
            target = ''
            ex_number = int(wi)
        else:
            ex_number = int(ei)
        try:
            exercise = extract_exercise(block, f'{wi}.{ei}' if ei else wi, target, path)
        except ValueError as error:
            ISSUES.append((path.name, f'{wi}.{ei}' if ei else wi, str(error)))
            continue
        exercise['number'] = ex_number
        if index is None:
            index = next((n for n, word in enumerate(words) if word['word'].casefold() == exercise['answer'].casefold()), None)
            if index is None:
                words.insert(0, {'order': 0, 'word': exercise['answer'], 'meaning': '其實；實際上', 'note': '根據語境選擇最貼切的說法。', 'example': '', 'exampleZh': '', 'exercises': []})
                index = 0
        if index >= len(words): raise ValueError(f'{path.name}: exercise {wi}.{ei} exceeds guide count {len(words)}')
        words[index]['exercises'].append(exercise)
    for word in words:
        for exercise in word['exercises']:
            for option in exercise['options']:
                if not option['explanation']:
                    option['explanation'] = word['note'] if option['text'] == exercise['answer'] else '原始教材未提供此選項的個別解釋。'
    description = ''
    for line in source.splitlines()[2:20]:
        if re.search('[\u3400-\u9fff]', line) and not line.startswith(('#', '>')):
            description = clean(line)
            break
    if not description: description = f'閱讀 {title} 的近義詞指南，按語境選擇準確的表達。'
    return {'id': None, 'moduleNumber': None, 'headword': name, 'title': title, 'subtitle': description[:90],
            'description': description, 'words': words, 'falseSynonyms': false,
            'sourceFile': f'/synonyms/source/{path.name}'}


def main():
    files = []
    for path in sorted(SOURCE.glob('*.md')):
        try: match_name(path)
        except ValueError: continue  # The user may add later lessons to this folder.
        files.append(path)
    if len(files) != 60: raise ValueError(f'Expected exactly 60 supplied lessons, found {len(files)}')
    items = {match_name(path): (path, parse(path)) for path in files}
    if set(items) != set(ORDER): raise ValueError(f'Ordering mismatch: {set(items) ^ set(ORDER)}')
    SOURCE_OUT.mkdir(parents=True, exist_ok=True)
    ordered = []
    for number, name in enumerate(ORDER, 3):
        path, lesson = items[name]
        # Previous, retracted lessons used lesson-003..102. Fresh keys keep
        # their saved answers and recordings separate from this new material.
        lesson['id'] = f'lesson-v2-{number:03d}'
        lesson['moduleNumber'] = number
        lesson['omittedExercises'] = sum(issue[0] == path.name for issue in ISSUES)
        ordered.append(lesson)
        destination = SOURCE_OUT / path.name
        if path.resolve() != destination.resolve():
            shutil.copyfile(path, destination)
    DATA_OUT.write_text('// Generated by tools/import-synonym-scaling.py from the supplied Markdown files.\n'
                        + 'export const lessons = ' + json.dumps(ordered, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    with ORDER_OUT.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(['module_number', 'headword', 'source_file', 'guide_entries', 'questions'])
        for item in ordered:
            writer.writerow([item['moduleNumber'], item['headword'], Path(item['sourceFile']).name,
                             len(item['words']), sum(len(w['exercises']) for w in item['words'])])
    with ISSUES_OUT.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(['source_file', 'exercise', 'issue'])
        writer.writerows(ISSUES)
    with COVERAGE_OUT.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(['module_number', 'headword', 'source_file', 'questions',
                         'omitted_exercises', 'questions_without_chinese_translation',
                         'options_without_individual_feedback', 'false_synonym_cards'])
        for item in ordered:
            exercises = [exercise for word in item['words'] for exercise in word['exercises']]
            missing_zh = sum(not exercise['zh'] for exercise in exercises)
            missing_feedback = sum(option['explanation'].startswith(('本題教材沒有為此選項提供個別解釋。',
                                                                       '原始教材未提供此選項的個別解釋。'))
                                   for exercise in exercises for option in exercise['options'])
            if item['omittedExercises'] or not exercises or missing_zh or missing_feedback or not item['falseSynonyms']:
                writer.writerow([item['moduleNumber'], item['headword'], Path(item['sourceFile']).name,
                                 len(exercises), item['omittedExercises'], missing_zh,
                                 missing_feedback, len(item['falseSynonyms'])])
    print(f"Imported {len(ordered)} lessons, {sum(len(x['words']) for x in ordered)} guide entries, "
          f"{sum(len(w['exercises']) for x in ordered for w in x['words'])} exercises; {len(ISSUES)} source issues")


if __name__ == '__main__': main()
