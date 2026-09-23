#!/usr/bin/env python3
"""Import the selected Polysemy PDFs as bilingual lesson modules.

The PDFs are lesson source data. Numbered meaning headings and numbered Practice
examples are the only material promoted into the student catalogue.
"""

import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = Path('/Users/sammak/Desktop/Polysemy Exercise')
PDTOTEXT = Path('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
PDFINFO = PDTOTEXT.with_name('pdfinfo')
LESSONS = {
    56: 'same', 57: 'feature', 58: 'sound', 59: 'still', 60: 'result',
    61: 'now', 62: 'solve', 63: 'luxury', 64: 'product', 65: 'television',
    66: 'live', 67: 'stress', 68: 'press', 69: 'put', 70: 'mention',
    71: 'believe', 72: 'commercial', 73: 'try', 74: 'calm',
    75: 'attention', 76: 'speak', 77: 'represent', 78: 'project',
    79: 'crowd', 80: 'exhaust', 82: 'say', 89: 'well', 90: 'mind',
    91: 'kind', 103: 'old', 106: 'start', 107: 'heart',
    124: 'event', 125: 'last', 126: 'senior', 127: 'front',
}
CHINESE = re.compile(r'[\u3400-\u9fff]')
HEADING = re.compile(r'^(?:#\s*)?(\d+)\.\s+(.+)$')
PRACTICE = re.compile(r'^(?:#{1,4}\s*)?Practice\s+(\d+)\b', re.I)


def clean(value):
    value = re.sub(r'\*\*([^*]+)\*\*', r'\1', value)
    value = value.replace('**', '').replace('`', '').replace('\u200b', '')
    value = re.sub(r'\s+', ' ', value)
    value = re.sub(r'(?<=[\u3400-\u9fff]) (?=[\u3400-\u9fff])', '', value)
    return value.strip(' \t\n>“”"「」')


def source(number):
    files = [p for p in PDF_DIR.glob('*.pdf') if p.name.endswith(f'_({number}).pdf')]
    if len(files) != 1:
        raise ValueError(f'Expected one PDF for lesson {number}, found {len(files)}')
    return files[0]


def sections(lines):
    heads = []
    markdown = any(re.match(r'^#\s*1\.\s+', line) for line in lines)
    for i, line in enumerate(lines):
        if markdown and not line.startswith('#'):
            continue
        match = HEADING.match(line)
        if not match or int(match.group(1)) != len(heads) + 1:
            continue
        first = match.group(2)
        bits = [first]
        end = i + 1
        if first.startswith('**'):
            while end < len(lines) and '**' not in ' '.join(bits)[2:]:
                bits.append(lines[end]); end += 1
        else:
            while end < len(lines) and '—' not in ' '.join(bits) and end <= i + 4:
                bits.append(lines[end]); end += 1
            while end < len(lines) and lines[end] and CHINESE.match(lines[end]) and not PRACTICE.match(lines[end]):
                bits.append(lines[end]); end += 1
        heading = clean(' '.join(bits))
        if '—' in heading:
            form, title = (clean(x) for x in heading.rsplit('—', 1))
        elif CHINESE.search(heading):
            first_chinese = CHINESE.search(heading).start()
            form, title = clean(heading[:first_chinese]), clean(heading[first_chinese:])
            form = form.rstrip(' =:：')
        else:
            raise ValueError(f'Meaning {len(heads)+1} has no Chinese heading: {heading}')
        if not CHINESE.search(title):
            raise ValueError(f'Meaning {len(heads)+1} has no Chinese title: {heading}')
        heads.append((i, end, form, title))
    return heads


def quoted_pair(lines):
    first_chinese = next((i for i, line in enumerate(lines) if line.startswith('「')), len(lines))
    english_quotes = []
    for i, line in enumerate(lines):
        if i >= first_chinese:
            break
        candidate = line.lstrip('> ').strip()
        if candidate.startswith(('“', '"')):
            english = [candidate]
            j = i + 1
            while j < len(lines) and not re.search(r'[”"]\s*$', english[-1]) and j < i + 8:
                english.append(lines[j].lstrip('> ').strip()); j += 1
            english_quotes.append(' '.join(english))
    raw = english_quotes[-1] if english_quotes else ''
    chinese_quotes = []
    i = first_chinese
    while i < len(lines) and lines[i].startswith('「'):
        chinese = [lines[i]]
        i += 1
        while i < len(lines) and '」' not in chinese[-1] and i < first_chinese + 7:
            chinese.append(lines[i]); i += 1
        chinese_quotes.append(' '.join(chinese))
    return clean(raw), clean(chinese_quotes[-1]) if chinese_quotes else '', raw


def target_for(raw, en, word):
    bold = [clean(x) for x in re.findall(r'\*\*([^*]+)\*\*', raw)]
    for target in bold:
        if target and re.search(re.escape(target), en, re.I):
            return target
    # Image-free PDFs have no bold span. Use the named word family, including
    # common irregular inflections, before falling back to a heading phrase.
    irregular = {
        'say': ['said'], 'speak': ['spoke', 'spoken'],
        'put': ['put'], 'live': ['lived', 'living'],
        'exhaust': ['exhausted', 'exhausting', 'exhaustion', 'exhaustive', 'inexhaustible'],
        'crowd': ['crowded', 'crowding', 'overcrowded', 'overcrowding'],
        'luxury': ['luxuriat', 'luxurious', 'luxuriously'],
        'believe': ['believable', 'believably', 'unbelievable', 'unbelievably', 'belief', 'disbelief'],
        'try': ['tried', 'tries', 'trying'],
    }
    variants = [word, *irregular.get(word, [])]
    candidates = []
    for variant in variants:
        candidates.extend(re.finditer(r'\b' + re.escape(variant) + r'[A-Za-z-]*\b', en, re.I))
    if candidates:
        return sorted(candidates, key=lambda m: m.start())[0].group()
    return ''


def build(number, word):
    pdf = source(number)
    text = subprocess.check_output([PDTOTEXT, '-raw', pdf, '-'], text=True).replace('\f', '\n')
    lines = [line.strip() for line in text.splitlines()]
    heads = sections(lines)
    if not heads:
        raise ValueError(f'No meanings in {pdf.name}')
    senses = []
    practice_rows = []
    issues = []
    for index, (start, body_start, form, title) in enumerate(heads):
        end = heads[index + 1][0] if index + 1 < len(heads) else len(lines)
        body = lines[body_start:end]
        meaning = form
        for line in body[:20]:
            m = re.match(r'^(?:\*\*)?Meaning:(?:\*\*)?\s*(.+)', line)
            if m:
                meaning = clean(m.group(1))
                break
        sid = f'{word}-{index+1:02d}'
        senses.append({
            'id': sid, 'title': title, 'form': form, 'en': meaning, 'zh': title,
            'note': f'留意語境：{form}。這裡指「{title}」。',
            'examples': [], 'options': [], 'excludedOverlaps': [],
        })
        marks = [(j, int(m.group(1))) for j, line in enumerate(body) if (m := PRACTICE.match(line))]
        for pidx, (j, pnumber) in enumerate(marks):
            chunk = body[j + 1:marks[pidx + 1][0] if pidx + 1 < len(marks) else len(body)]
            en, zh, raw = quoted_pair(chunk)
            if not en or not zh or not CHINESE.search(zh):
                issues.append(f'Practice {pnumber} in {word}: missing English or Chinese sentence')
                continue
            target = target_for(raw, en, word)
            if not target:
                issues.append(f'Practice {pnumber} in {word}: target not found: {en}')
                continue
            senses[-1]['examples'].append([en, zh, title])
            practice_rows.append((pnumber, sid, en, zh, target))
    if issues:
        raise ValueError('\n'.join(issues))
    ids = [s['id'] for s in senses]
    labels = [s['title'] for s in senses]
    for index, sense in enumerate(senses):
        if labels.count(sense['title']) > 1:
            sense['title'] += f'（用法 {index + 1}）'
    questions = []
    for sentence_index, (pnumber, sid, en, zh, target) in enumerate(sorted(practice_rows)):
        i = ids.index(sid)
        opts = [ids[(i + j) % len(ids)] for j in range(min(6, len(ids)))]
        masked = re.sub(re.escape(target), '____', en, count=1, flags=re.I)
        if masked == en:
            raise ValueError(f'Cannot mask {word} Practice {pnumber}: {target}')
        title = senses[i]['title']
        reasons = {oid: (f'本句的意思是「{title}」。' if oid == sid else f'「{senses[ids.index(oid)]["title"]}」與本句語境不同。') for oid in opts}
        questions.append({
            'id': f'{sid}-{sum(q["sense"] == sid for q in questions)}',
            'sense': sid, 'en': en, 'zh': zh, 'masked': masked,
            'options': opts, 'explanation': senses[i]['note'],
            'sentenceIndex': sentence_index, 'sourcePractice': pnumber,
            'targets': [target], 'optionReasons': reasons,
        })
    pages = int(re.search(r'^Pages:\s+(\d+)', subprocess.check_output([PDFINFO, pdf], text=True), re.M).group(1))
    module = {
        'id': word, 'word': word, 'number': number, 'version': 1,
        'senses': senses, 'questions': questions, 'comparisons': [],
        'source': {'path': f'manuals/{word}.pdf', 'file': pdf.name,
                   'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'pages': pages},
    }
    return module, pdf, len(re.findall(r'(?m)^(?:#{1,4}\s*)?Practice\s+\d+\b', text, re.I))


def main():
    report = []
    for number, word in LESSONS.items():
        module, pdf, expected = build(number, word)
        count = len(module['questions'])
        if count != expected:
            raise ValueError(f'{word}: found {expected} Practice headings but imported {count} questions')
        target = ROOT / 'polysemy-lab/content' / f'{word}.mjs'
        target.write_text('export default ' + json.dumps(module, ensure_ascii=False, indent=2) + ';\n')
        shutil.copy2(pdf, ROOT / 'polysemy-lab/manuals' / f'{word}.pdf')
        report.append({'number': number, 'id': word, 'meanings': len(module['senses']),
                       'questions': count, 'pdf': pdf.name})
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
