#!/usr/bin/env python3
"""Generate clickable, source-aligned text regions for Task 1 diagrams."""
import csv
import io
import json
import re
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets/writing-practice/questions/ielts-task1'
OUTPUT = ROOT / 'ielts-chart-teaching/diagram-text-zones.mjs'


def scan(path):
    width, height = Image.open(path).size
    data = subprocess.check_output(['tesseract', str(path), 'stdout', 'tsv'], stderr=subprocess.DEVNULL, text=True)
    words = []
    for item in csv.DictReader(io.StringIO(data), delimiter='\t'):
        if item['level'] != '5' or float(item['conf']) < 35:
            continue
        token = item['text'].strip()
        if not token or not re.search(r'[\w\d]', token, re.UNICODE):
            continue
        if len(token) == 1 and not (token.isdigit() or token in 'NSEW'):
            continue
        words.append({
            'key': (item['block_num'], item['par_num'], item['line_num']),
            'text': token, 'x': int(item['left']), 'y': int(item['top']),
            'w': int(item['width']), 'h': int(item['height'])
        })
    grouped = {}
    for word in words:
        grouped.setdefault(word['key'], []).append(word)
    regions = []
    for line in grouped.values():
        line.sort(key=lambda word: word['x'])
        chunks = [[]]
        for word in line:
            if chunks[-1]:
                last = chunks[-1][-1]
                gap = word['x'] - last['x'] - last['w']
                if gap > max(24, 1.7 * max(word['h'], last['h'])):
                    chunks.append([])
            chunks[-1].append(word)
        for chunk in chunks:
            label = ' '.join(word['text'] for word in chunk)
            x1 = min(word['x'] for word in chunk)
            y1 = min(word['y'] for word in chunk)
            x2 = max(word['x'] + word['w'] for word in chunk)
            y2 = max(word['y'] + word['h'] for word in chunk)
            if x2 - x1 < 5 or y2 - y1 < 5:
                continue
            pad_x, pad_y = max(4, width * .004), max(3, height * .003)
            x1, x2 = max(0, x1 - pad_x), min(width, x2 + pad_x)
            y1, y2 = max(0, y1 - pad_y), min(height, y2 + pad_y)
            value = None
            match = re.fullmatch(r'([\d,]+(?:\.\d+)?)\s*(?:%|km|m|metres?|years?|months?)?', label, re.I)
            if match:
                value = float(match[1].replace(',', ''))
            regions.append({'label': label, 'x': round(100*x1/width,2), 'y': round(100*y1/height,2),
                            'w': round(100*(x2-x1)/width,2), 'h': round(100*(y2-y1)/height,2), 'value': value})
    regions.sort(key=lambda region: (region['y'], region['x']))
    return regions


result = {}
for kind, base, count in [('process-diagram', 24, 9), ('maps', 33, 10)]:
    for number in range(1, count + 1):
        result[f'T1-{base+number-1:03}'] = scan(ASSETS / f'model-essay-{number}-ielts-task1-{kind}.webp')
OUTPUT.write_text('// Generated from the original published figures by tools/generate-ielts-diagram-text-zones.py.\n'
                  'export const diagramTextZones = ' + json.dumps(result, ensure_ascii=False, separators=(',', ':')) + ';\n')
for key, zones in result.items():
    print(key, len(zones))
