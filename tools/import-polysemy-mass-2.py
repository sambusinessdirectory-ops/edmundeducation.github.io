#!/usr/bin/env python3
"""Import Polysemy Mass Export 2 from the PDFs' authored MCQ meaning tables.

The PDFs are source data.  A damaged or mismatched source is held rather than
inventing lessons.  Every published choice is an exact row of its own PDF's
MCQ-ready Traditional Chinese table.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
from collections import Counter
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = Path('/Users/sammak/Downloads/Polysemy Mass Export 2')
HAN = re.compile(r'[\u3400-\u9fff]')
VERSION = '20261003-polysemy-mass-2'


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'tools' / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


old = load('polysemy_old_import', 'import-polysemy-mass.py')
audit = load('polysemy_mcq_audit', 'audit-polysemy-mcq.py')
audit.HEAD = re.compile(
    r'(?im)^\s*(?:#{1,3}\s*)?(?:[A-Z]{1,3}\.\s*)?'
    r'(?:Master comparison|MCQ-ready master list)(?:\s*[—–-].*)?$'
)
audit.END = re.compile(
    r'(?im)^\s*(?:#{1,3}\s*)?(?:For your original|For the original|'
    r'Passage recap|Your original|Original passage|Meaning map|Final recap|'
    r'[A-Z]{1,3}\.\s*PASSAGE RECAP)\b'
)


def normalized(pdf):
    return old.text_of(pdf).replace('\u200b', '').replace('\u2060', '')


def source_headings(lines, word, before):
    """Find the longest numbered lesson sequence; ignore numbered examples."""
    groups = []
    for kind, regex in (
        ('markdown', re.compile(r'^(#{1,3})\s*(\d+)\.\s+(.+)')),
        ('plain', re.compile(r'^(\d+)\.\s+(.+)')),
    ):
        for level in [0]:
            found = []
            for pos, line in enumerate(lines[:before]):
                match = regex.match(line)
                if not match:
                    continue
                if kind == 'markdown':
                    number, title = int(match.group(2)), match.group(3)
                else:
                    number, title = int(match.group(1)), match.group(2)
                    # A numbered exercise sentence has terminal punctuation.
                    if re.search(r'[.!?。？！]\s*[”"\']?$', title):
                        continue
                if number > 140:
                    continue
                found.append((pos, number, title))
            for start in range(len(found)):
                if found[start][1] != 1:
                    continue
                sequence = [found[start]]
                for item in found[start + 1:]:
                    if item[1] > sequence[-1][1]:
                        sequence.append(item)
                    elif item[1] == 1:
                        break
                if len(sequence) >= 2:
                    groups.append((len(sequence), kind == 'markdown', level, sequence))
    if not groups:
        return []
    return max(groups, key=lambda item: (item[0], item[1], -item[2]))[-1]


def clean_sentence(value):
    value = old.clean(value)
    value = re.sub(r'^\d+\.\s*', '', value)
    return value.strip(' >“”"「」‘’ ')


def pairs_in_block(lines, word):
    """Read bilingual practice pairs from both Markdown and plain-text PDFs."""
    pairs = []
    seen = set()
    starts = []
    in_exercises = False
    for i, raw in enumerate(lines):
        line = raw.strip()
        if re.match(r'^#{0,3}\s*(?:Practice(?:\s+\d+)?|Examples?)\b', line, re.I):
            in_exercises = True
            starts.append(i + 1)
        elif line.startswith(('>', '“', '"')) and re.search(r'[A-Za-z]', line):
            starts.append(i)
        elif in_exercises and re.match(r'^\d+\.\s*[A-Za-z]', line):
            starts.append(i)
    for start in dict.fromkeys(starts):
        english = []
        chinese = []
        for raw in lines[start:start + 9]:
            line = raw.strip()
            if not line or line.startswith(('#', '---')) or re.match(r'^Practice\b', line, re.I):
                if english or chinese:
                    break
                continue
            if HAN.search(line):
                if not english:
                    break
                chinese.append(line)
                if line.endswith(('。', '！', '？', '」', '”')):
                    break
            elif chinese:
                break
            elif len(english) < 4:
                if english and re.search(r'[.!?][”"]?$', english[-1]):
                    english = []
                    break
                english.append(line)
        en = clean_sentence(' '.join(english))
        zh = clean_sentence(' '.join(chinese))
        if not en or not zh or not HAN.search(zh):
            continue
        if len(en) < 12 or len(en) > 350 or len(zh) > 400 or ' = ' in en:
            continue
        if not re.search(r'[.!?]([”"])?$', en):
            continue
        target = old.target_for(' '.join(english), en, word)
        if not target:
            continue
        key = re.sub(r'\W+', '', en.lower())
        if key not in seen:
            pairs.append((en, zh, target))
            seen.add(key)
    return pairs


def fallback_module(number, word, pdf, text, rows):
    lines = [x.strip() for x in text.splitlines()]
    end = next((i for i, line in enumerate(lines) if audit.HEAD.match(line)), len(lines))
    headings = source_headings(lines, word, end)
    if not headings:
        raise ValueError('no reliable numbered meaning sections')
    senses, questions = [], []
    for k, (at, num, heading) in enumerate(headings):
        stop = headings[k + 1][0] if k + 1 < len(headings) else end
        if k + 1 == len(headings):
            for pos in range(at + 1, stop):
                line = lines[pos]
                if re.match(r'^(?:#{1,3}\s+)?[A-Z]{1,3}\.\s+[A-Z][A-Z /—–-]{5,}$', line):
                    stop = pos
                    break
        body = lines[at + 1:stop]
        examples = pairs_in_block(body, word)
        if not examples:
            continue
        form = audit.clean(heading.split(' — ')[0].split('—')[0])
        title = next((audit.clean(x) for x in re.findall(r'[\u3400-\u9fff][^*\n]{1,100}', heading)), '')
        if not title:
            for line in body[:25]:
                match = re.search(r'\*\*([\u3400-\u9fff][^*]{1,90})\*\*', line)
                if match:
                    title = audit.clean(match.group(1))
                    break
        title_from_source = bool(title)
        if not title:
            title = rows[min(k, len(rows) - 1)][1]
        sid = f'{word}-{num:02d}'
        sense = {'id': sid, 'title': title, 'form': form, 'en': form,
                 'zh': title, 'note': '', 'examples': [], 'options': [],
                 'excludedOverlaps': [], 'titleFromSource': title_from_source}
        senses.append(sense)
        for en, zh, target in examples:
            qid = f'{sid}-{len(sense["examples"])}'
            sense['examples'].append([en, zh, title])
            questions.append({'id': qid, 'sense': sid, 'en': en, 'zh': zh,
                              'masked': re.sub(re.escape(target), '____', en, count=1, flags=re.I),
                              'options': [], 'explanation': '',
                              'sentenceIndex': len(questions), 'sourcePractice': num,
                              'targets': [target], 'optionReasons': {}})
    if len(senses) < 2 or not questions:
        raise ValueError('fewer than two meanings with bilingual practice')
    module = {'id': word, 'word': word, 'number': number, 'version': 1,
              'mass': True, 'senses': senses, 'questions': questions,
              'comparisons': [], 'source': {
                  'path': f'manuals/{word}.pdf', 'file': pdf.name,
                  'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
                  'pages': len(PdfReader(pdf).pages)}}
    return module, {'sourceSentences': len(questions), 'duplicateSentences': 0,
                    'ambiguousSentences': [], 'missingTarget': []}


def strict_table(module, rows):
    """Remove source-derived distractors/answers; rebuild from exact table rows."""
    table_count = len(rows)
    table_senses = module['senses'][:table_count]
    table_ids = {s['id']: n for n, s in enumerate(table_senses)}
    kept = []
    for q in module['questions']:
        answer = table_ids.get(q.get('correctOption'))
        if answer is None:
            continue
        indices = audit.selected_options(rows, answer)
        if len(indices) < 2:
            continue
        q['options'] = [table_senses[j]['id'] for j in indices]
        q['sense'] = q['correctOption']
        q['optionReasons'] = {
            table_senses[j]['id']: ('本句指「' + rows[answer][1] + '」。' if j == answer
                                    else '「' + rows[j][1] + '」與本句語境不同。')
            for j in indices}
        kept.append(q)
    module['senses'] = table_senses
    module['questions'] = kept
    module['mcqSource'] = 'pdf-authored-master-table'
    return module


STOP_WORDS = {'a', 'an', 'the', 'to', 'of', 'on', 'in', 'for', 'with', 'and',
              'or', 'someone', 'something', 'somebody', 'ones', 'one', 'noun',
              'verb', 'adjective', 'general', 'passage', 'sense', 'x', 'y'}


def label_words(value):
    return re.findall(r'[a-z]+', value.lower().replace('’', "'"))


def fallback_to_table(module, rows):
    """Map each exercise section to a compatible authored row or hold it."""
    meanings = [
        {'id': f'{module["id"]}-mcq-{j+1:02d}', 'title': zh, 'form': form,
         'en': form, 'zh': zh, 'note': f'來源詞義：{zh}', 'examples': [],
         'options': [], 'excludedOverlaps': []}
        for j, (form, zh) in enumerate(rows)
    ]
    table_tokens = [label_words(form) for form, _ in rows]
    root_tokens = set(label_words(module['word']))
    assignments = {}
    unresolved = []
    for sense in module['senses']:
        source_tokens = label_words(sense['form'].split('=')[0].split('—')[0])
        if not source_tokens:
            unresolved.append(sense['id'])
            continue
        base = source_tokens[0]
        section_number = int(sense['id'].rsplit('-', 1)[-1])
        if section_number == 1 and table_tokens[0] and base in table_tokens[0]:
            assignments[sense['id']] = 0
            continue
        specific = {token for token in set(source_tokens) - STOP_WORDS
                    if not any(token == root or (len(root) >= 4 and token.startswith(root))
                               for root in root_tokens)}
        if not specific and '=' in sense['form']:
            qualifier = set(label_words(sense['form'].split('=', 1)[1])) - STOP_WORDS
            specific = {token for token in qualifier if len(token) >= 5}
        candidates = []
        for j, ((form, zh), tokens) in enumerate(zip(rows, table_tokens)):
            if not tokens:
                continue
            if specific and not specific.intersection(tokens):
                continue
            if base not in tokens and not any(x.startswith(base) or base.startswith(x)
                                              for x in tokens if len(x) >= 4):
                continue
            phrase = ' '.join(source_tokens)
            label = ' '.join(tokens)
            exact = phrase == label
            contained = (len(specific) > 0 and
                         (phrase in label or (label in phrase and
                                              len(set(tokens) - root_tokens - STOP_WORDS) > 0)))
            form_score = audit.similarity(phrase, label)
            chinese = (audit.chinese_similarity(sense['title'], zh)
                       if sense.get('titleFromSource') else 0)
            position = 1 - abs((int(sense['id'].rsplit('-', 1)[-1]) - 1) /
                               max(1, len(module['senses']) - 1) -
                               j / max(1, len(rows) - 1))
            score = .57 * form_score + .31 * chinese + .12 * position
            if exact:
                score += .4
            elif contained:
                score += .18
            candidates.append((score, j, exact, contained, chinese))
        candidates.sort(reverse=True)
        if not candidates:
            unresolved.append(sense['id'])
            continue
        best = candidates[0]
        # The table sometimes groups several source sections into one broader
        # row. Use only exact or specific phrase containment; fuzzy proximity
        # alone can select a completely different meaning near the table end.
        exact_or_specific = ((best[2] and bool(specific)) or
                             (best[3] and len(table_tokens[best[1]]) >= 2) or
                             (bool(specific) and best[4] >= .45 and best[0] >= .47))
        if not exact_or_specific:
            unresolved.append(sense['id'])
            continue
        assignments[sense['id']] = best[1]
    questions = []
    for q in module['questions']:
        answer = assignments.get(q['sense'])
        if answer is None:
            continue
        choices = audit.selected_options(rows, answer)
        q['sense'] = meanings[answer]['id']
        q['correctOption'] = q['sense']
        q['options'] = [meanings[j]['id'] for j in choices]
        q['explanation'] = f'本句的「{q["targets"][0]}」指「{rows[answer][1]}」。'
        q['optionReasons'] = {
            meanings[j]['id']: ('本句指「' + rows[answer][1] + '」。' if j == answer
                                else '「' + rows[j][1] + '」與本句語境不同。')
            for j in choices}
        meanings[answer]['examples'].append([q['en'], q['zh'], rows[answer][1]])
        questions.append(q)
    module['senses'] = meanings
    module['questions'] = questions
    module['version'] = 2
    module['mcqSource'] = 'pdf-authored-master-table'
    return module, {'sourceDerived': [], 'unresolved': unresolved}


def load_existing_mass_index():
    path = ROOT / 'polysemy-lab/mass-index.mjs'
    return json.loads(path.read_text().removeprefix('export default ').removesuffix(';\n'))


def module_index(module):
    return {'id': module['id'], 'word': module['word'], 'number': module['number'],
            'mass': True, 'senses': [{'id': s['id']} for s in module['senses']],
            'questions': [{'id': q['id'], 'sense': q['sense'],
                           'correctOption': q['correctOption'], 'en': q['en']}
                          for q in module['questions']]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    existing = load_existing_mass_index()
    existing_ids = {m['id'] for m in existing}
    existing_numbers = {m['number'] for m in existing}
    report = {'batch': 'Polysemy Mass Export 2', 'sourceFiles': 0,
              'imported': [], 'held': []}
    index = list(existing)
    for pdf in sorted(PDF_DIR.glob('*.pdf'), key=lambda x: int(x.name.split('_')[0])):
        report['sourceFiles'] += 1
        number, word = old.word_from_filename(pdf)
        entry = {'number': number, 'word': word, 'file': pdf.name}
        try:
            if number in existing_numbers or word in existing_ids:
                raise ValueError('number or module ID already exists')
            if pdf.stat().st_size == 0:
                raise ValueError('PDF is empty (0 bytes)')
            text = normalized(pdf)
            if not old.source_matches(word, text):
                raise ValueError('filename and PDF content disagree')
            rows = audit.table(text)
            if len(rows) < 2:
                raise ValueError('fewer than two authored MCQ table rows')
            try:
                module, source_stats = old.parse_module(number, word, pdf, text)
                parser_used = 'existing'
            except ValueError:
                module, source_stats = fallback_module(number, word, pdf, text, rows)
                parser_used = 'fallback'
            if parser_used == 'existing':
                repaired, map_stats = audit.repair_module(module, text)
                if repaired is None:
                    raise ValueError('could not map questions to authored MCQ table')
                total = len(repaired['questions'])
                repaired = strict_table(repaired, rows)
            else:
                total = len(module['questions'])
                repaired, map_stats = fallback_to_table(module, rows)
            if not repaired['questions']:
                raise ValueError('no questions with an authored-table answer')
            if any(q['correctOption'] not in {s['id'] for s in repaired['senses']}
                   for q in repaired['questions']):
                raise ValueError('non-table answer after strict review')
            record = entry | {'parser': parser_used, 'meanings': len(rows),
                              'questions': len(repaired['questions']),
                              'questionsHeld': total - len(repaired['questions']),
                              'sourceSentences': source_stats['sourceSentences'],
                              'sourceDerivedMeaningsHeld': len(map_stats['sourceDerived'])}
            report['imported'].append(record)
            if args.write:
                (ROOT / 'polysemy-lab/content' / f'{word}.mjs').write_text(
                    'export default ' + json.dumps(repaired, ensure_ascii=False, indent=2) + ';\n')
                shutil.copy2(pdf, ROOT / 'polysemy-lab/manuals' / f'{word}.pdf')
                index.append(module_index(repaired))
                existing_numbers.add(number)
                existing_ids.add(word)
        except Exception as exc:
            report['held'].append(entry | {'reason': str(exc)})
    report_path = ROOT / 'polysemy-lab/import-report-2.json' if args.write else Path('/private/tmp/polysemy-import-report-2.json')
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    if args.write:
        index.sort(key=lambda m: (m['number'], m['id']))
        (ROOT / 'polysemy-lab/mass-index.mjs').write_text(
            'export default ' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(json.dumps({'sourceFiles': report['sourceFiles'],
                      'imported': len(report['imported']), 'held': len(report['held']),
                      'questions': sum(x['questions'] for x in report['imported']),
                      'heldQuestions': sum(x['questionsHeld'] for x in report['imported']),
                      'parsers': dict(Counter(x['parser'] for x in report['imported'])),
                      'report': str(report_path)}, ensure_ascii=False))
    for entry in report['held']:
        print(entry['number'], entry['word'], entry['reason'])


if __name__ == '__main__':
    main()
