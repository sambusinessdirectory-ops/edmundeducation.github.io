"""Import the author's text-based 57-page 2021 guide (no OCR or invented content).

Usage: python import-2021-guide.py /absolute/path/to/guide.pdf
Requires pdfplumber. Existing audio/transcripts are read only; Part B is untouched.
The output is a generated, reviewable JSON asset, lazy-loaded only for 2021.
"""
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import pdfplumber

ROOT = Path(__file__).resolve().parents[2]
source = Path(sys.argv[1])

def join_lines(text):
    # PDF line wrapping must not introduce spaces inside Chinese words.
    return re.sub(r'\s*\n\s*', '\n', text).replace('\n', ' ').strip() if not re.search(r'[\u3400-\u9fff]', text) else re.sub(
        r'([^\W_])\n(?=[A-Za-z0-9])', r'\1 ', re.sub(r'[ \t]+', ' ', text)).replace('\n', '').strip()

def tokens(text):
    return re.findall(r"[a-z0-9]+", text.lower().replace('’', "'"))

with pdfplumber.open(source) as pdf:
    assert len(pdf.pages) == 57
    analysis_pages = []
    transcripts = {}
    task = 0
    speaker = ''
    for i, page in enumerate(pdf.pages):
        if 2 <= i <= 21:
            text = page.crop((70, 70, 550, 710)).extract_text(x_tolerance=2, y_tolerance=3)
            analysis_pages.append((i + 1, text))
        elif i >= 22:
            text = page.crop((70, 70, 550, 710)).extract_text(x_tolerance=2, y_tolerance=3)
            match = re.search(r'Task (\d) —', text)
            if match:
                task = int(match[1])
                transcripts[task] = []
                speaker = ''
            for table in page.find_tables():
                if table.bbox[1] < 70 or table.bbox[1] > 710:
                    continue  # Exclude branded header/footer, not content.
                for cells in table.extract(x_tolerance=2, y_tolerance=3):
                    # Some body tables touch the footer grid. pdfplumber then
                    # reports extra empty columns; they are not missing content.
                    cells = [cell for cell in cells if cell is not None]
                    if len(cells) != 2:
                        continue
                    en, zh = cells
                    if not en or en in ['English', 'Task 1', 'Task 2', 'Task 3', 'Task 4', 'Meeting Transcript', 'Lecture Transcript', 'Conversation Transcript']:
                        continue
                    en = re.sub(r'\s+', ' ', en).strip()
                    if re.match(r'(?:Cherie|Julian|Bonnie|Leo|Prof Leung):', en):
                        speaker, en = en.split(':', 1)
                    assert speaker and zh, (i + 1, en)
                    zh = re.sub(r'^(?:[A-Za-z ]+|梁教授)[：:]\s*', '', join_lines(zh)).strip()
                    row = {'speaker': speaker.replace('Prof Leung', 'Professor Leung'), 'text': en.strip(), 'zh': zh, 'sourcePages': [i + 1]}
                    # A table row may continue over a PDF page break.
                    previous = transcripts[task][-1] if transcripts[task] else None
                    if previous and previous['sourcePages'][-1] != i + 1 and not re.search(r'[.!?…][”\")]*$', previous['text']) and not re.match(r'(?:Cherie|Julian|Bonnie|Leo|Prof Leung):', cells[0]):
                        previous['text'] += ' ' + row['text']
                        previous['zh'] += row['zh']
                        previous['sourcePages'].extend(row['sourcePages'])
                    else:
                        transcripts[task].append(row)

analysis = {}
for page, text in analysis_pages:
    matches = list(re.finditer(r'(?m)^(\d+)\.\s*(?:(?:Bonnie|Cherie|Julian)\s*—\s*)?答案：', text))
    for i, match in enumerate(matches):
        number = int(match[1])
        block = text[match.end():matches[i+1].start() if i+1 < len(matches) else len(text)].strip()
        lines = block.splitlines()
        answer = [lines.pop(0)]
        while lines and not re.search(r'[\u3400-\u9fff]', lines[0]):
            answer.append(lines.pop(0))
        analysis[number] = {'answer': ' '.join(answer), 'explanation': join_lines('\n'.join(lines)), 'sourcePages': [page], 'task': 1 if number <= 16 else 2 if number <= 31 else 3 if number <= 43 else 4}
assert sorted(analysis) == list(range(1, 57))
assert sorted({page for rows in transcripts.values() for row in rows for page in row['sourcePages']}) == list(range(23, 58)), 'Every transcript page must be imported'
assert all(row['explanation'] and row['answer'] for row in analysis.values())

# Match the PDF's corrected speaker-labelled text to the existing split-track
# transcript, retaining its time basis. Interpolated word positions are navigation
# cues, not a claim that a fresh forced alignment has been performed.
old = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs'),vm=require('vm'),c={window:{}};vm.runInNewContext(fs.readFileSync('dse-listening-2021-transcript.js','utf8'),c);process.stdout.write(JSON.stringify(c.window.EDMUND_DSE_LISTENING_2021_TRANSCRIPT.partA));"], cwd=ROOT))
audit = {}
for task, rows in transcripts.items():
    old_words, times = [], []
    for row in old[str(task)]:
        words = tokens(row['text'])
        old_words.extend(words)
        for i in range(len(words)):
            times.append((row['start'] + (row['end'] - row['start']) * i / len(words), row['start'] + (row['end'] - row['start']) * (i + 1) / len(words)))
    words = [word for row in rows for word in tokens(row['text'])]
    mapping = {}
    for match in difflib.SequenceMatcher(None, words, old_words, autojunk=False).get_matching_blocks():
        for i in range(match.size):
            mapping[match.a + i] = match.b + i
    offset = 0
    audit[task] = []
    for index, row in enumerate(rows):
        count = len(tokens(row['text']))
        matched = [mapping[i] for i in range(offset, offset + count) if i in mapping]
        assert matched, (task, row)
        row['start'] = round(times[matched[0]][0], 2)
        row['end'] = round(times[matched[-1]][1], 2)
        audit[task].append({'row': index + 1, 'matched': round(len(matched) / count, 3), 'start': row['start'], 'text': row['text']})
        offset += count
    assert all(rows[i]['start'] <= rows[i+1]['start'] for i in range(len(rows)-1))

result = {'year': 2021, 'source': {'title': '2021 – DSE Listening – 5** Past Paper 題解書 (Edmund Sir)', 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'pages': 57, 'scope': 'Part A Tasks 1–4, Questions 1–56', 'timingBasis': 'PDF text matched to existing split-track transcript; navigation cues are approximate.'}, 'analysis': analysis, 'transcript': transcripts}
output = ROOT / 'assets/dse-listening/2021/guide.json'
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
audit_path = Path('/private/tmp/dse-2021-guide/alignment-audit.json')
audit_path.parent.mkdir(exist_ok=True, parents=True)
audit_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2))
print('Imported answers:', len(analysis), 'Transcript rows:', {task: len(rows) for task, rows in transcripts.items()})
print('Alignment rows below 70%:', [(task, row['row'], row['matched'], row['text']) for task, rows in audit.items() for row in rows if row['matched'] < .7])
