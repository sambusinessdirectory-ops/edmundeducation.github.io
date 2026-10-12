#!/usr/bin/env python3
"""Import the teacher's numbered S2 Word Form DOCX without rewriting its questions."""
from collections import Counter
from hashlib import sha256
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/Users/sammak/Downloads/S2_Word_Form_Mixed_Practice_470_Questions.docx')
OUTPUT = ROOT / 'junior-exam-prep' / 's2-oct-2026-questions.json'
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
QUESTION = re.compile(r'^(\d{3})\.\s+(.+?)\s+\(([^()]*)\)\s+（(.+)）$')
ANSWER = re.compile(r'^(\d{3})\.\s+(.+)$')

with ZipFile(SOURCE) as archive:
    body = ET.fromstring(archive.read('word/document.xml')).find('w:body', NS)
questions, answers = {}, {}
in_key = False
for block in body:
    kind = block.tag.rsplit('}', 1)[-1]
    if kind == 'p':
        line = ''.join(part.text or '' for part in block.findall('.//w:t', NS)).strip()
        if line.startswith('ANSWER KEY'):
            in_key = True
        elif not in_key and re.match(r'^\d{3}\.', line):
            match = QUESTION.fullmatch(line)
            if not match:
                raise ValueError(f'Unexpected question format: {line}')
            number = int(match[1])
            if number in questions:
                raise ValueError(f'Duplicate question: {number}')
            sentence = re.sub(r'_{5,}', '_____', match[2])
            if sentence.count('_____') != 1:
                raise ValueError(f'Question {number} must have exactly one answer blank')
            questions[number] = {'number': number, 'sentence': sentence, 'clue': match[3], 'translation': match[4]}
    elif kind == 'tbl' and in_key:
        for cell in block.findall('.//w:tc', NS):
            line = ''.join(part.text or '' for part in cell.findall('.//w:t', NS)).strip()
            if not line:
                continue
            match = ANSWER.fullmatch(line)
            if not match:
                raise ValueError(f'Unexpected answer format: {line}')
            number = int(match[1])
            if number in answers:
                raise ValueError(f'Duplicate answer: {number}')
            answers[number] = match[2].strip()

expected = set(range(1, 471))
if set(questions) != expected or set(answers) != expected:
    raise ValueError(f'Incomplete source: questions={len(questions)}, answers={len(answers)}')
forms = Counter(value.casefold() for value in answers.values())
if len(forms) != 47 or set(forms.values()) != {10}:
    raise ValueError(f'Unexpected form coverage: {len(forms)} forms, counts={sorted(set(forms.values()))}')

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
payload = {
    'module': 's2-exam-prep-oct-2026',
    'sourceSha256': sha256(SOURCE.read_bytes()).hexdigest(),
    'questionCount': len(questions),
    'formCount': len(forms),
    'questions': [questions[number] for number in sorted(questions)],
}
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
Path('/tmp/s2-oct-2026-answer-key.json').write_text(json.dumps({str(number): answers[number] for number in sorted(answers)}, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'Imported {len(questions)} questions; {len(forms)} forms × 10; SHA-256 {payload["sourceSha256"]}')
