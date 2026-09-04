"""Archive the unchanged PDF and every extracted line; build page-sized reading steps."""
import argparse
from collections import Counter
import hashlib
import json
import logging
from pathlib import Path
import re
import shutil
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Users/sammak/Downloads/Edmund Sir - 2023 Reading A - Question Analysis 2.pdf')
OUT = ROOT / 'dse-reading-analysis/dse-2023-a'
STARTS = [35,48,54,59,64,72,102,123,127,133,137,145,149,154,205,210,234,242,253,264,279,302]

def digest(content): return hashlib.sha256(content).hexdigest()

def category(title):
    if re.search(r'不[是能成立用填答]|錯|陷阱|誤讀', title): return 'traps'
    if re.search(r'原文|定位|對應|mapping|Evidence', title): return 'evidence'
    if re.search(r'技巧|總結|reasoning chain', title): return 'technique'
    if re.search(r'答案|示範', title): return 'answer'
    if re.search(r'Question|題目|先看.*[問考]', title): return 'task'
    return 'reasoning'


def source_highlight(char, rectangles):
    x = (char['x0'] + char['x1']) / 2
    y = (char['top'] + char['bottom']) / 2
    for rect in rectangles:
        color = rect.get('non_stroking_color')
        if not isinstance(color, (tuple, list)) or len(color) != 3: continue
        if rect['bottom']-rect['top'] > 80: continue  # Paper background is not emphasis.
        if max(color)-min(color) < .15: continue
        if not (rect['x0']-.2 <= x <= rect['x1']+.2 and rect['top']-1 <= y <= rect['bottom']+1): continue
        red, green, blue = color
        if red > .8 and green > .8 and blue < .4: return 'yellow'
        if red < .4 and green > .7 and blue > .7: return 'cyan'
        if red > .7 and green < .8 and blue < .8: return 'pink' if blue > .3 else 'orange'
        if green > .7 and red < .5: return 'green'
        return 'lavender'
    return ''

def rich_body(page, header_end, footer, original_body):
    # The original text stays untouched. Visual rows use a slightly wider baseline
    # tolerance to keep enlarged mixed Latin/CJK words in their printed position.
    ids = set()
    line = 0
    for text, char in page.get_textmap().tuples:
        if text == '\n': line += 1
        elif char and header_end <= line < footer: ids.add(id(char))
    rows = [[]]
    for text, char in page.get_textmap(y_tolerance=6).tuples:
        if text == '\n': rows.append([])
        else: rows[-1].append((text, char))
    result = []
    previous_bottom = None
    for row in rows:
        indexes = [i for i,(_,char) in enumerate(row) if char and id(char) in ids]
        if not indexes: continue
        selected = row[indexes[0]:indexes[-1]+1]
        runs = []
        glyphs = [char for _,char in selected if char and id(char) in ids]
        for text, char in selected:
            if char and id(char) not in ids: continue
            if char:
                style = dict(size=round(char['size'],1), bold='Bold' in char['fontname'],
                             italic=any(name in char['fontname'] for name in ['Italic','Oblique']),
                             highlight=source_highlight(char,page.rects))
            else:
                style = runs[-1]['style'] if runs else dict(size=14,bold=False,italic=False,highlight='')
            if runs and runs[-1]['style'] == style: runs[-1]['text'] += text
            else: runs.append(dict(text=text,style=style))
        top = min(c['top'] for c in glyphs)
        gap = max(0,top-previous_bottom) if previous_bottom is not None else 0
        previous_bottom = max(c['bottom'] for c in glyphs)
        result.append(dict(runs=runs,gap=round(gap,1)))
    plain = ''.join(run['text'] for row in result for run in row['runs'])
    assert Counter(c for c in plain if not c.isspace()) == Counter(c for c in '\n'.join(original_body) if not c.isspace()), f'Rich text lost source glyphs on page {page.page_number}'
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--reuse-images', action='store_true', help='Do not re-render existing unchanged source pages')
    args = parser.parse_args()
    logging.getLogger('pdfminer').setLevel(logging.ERROR)
    archived = json.loads((OUT / 'index.json').read_text()) if args.check else None
    if not args.check: OUT.mkdir(parents=True, exist_ok=True)
    pages = []
    with pdfplumber.open(SOURCE) as pdf:
        assert len(pdf.pages) == 322
        for number, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ''
            assert text.strip(), f'Empty source page {number}'
            lines = text.splitlines()
            footer = next((i for i,line in enumerate(lines) if line.startswith('“- Knowledge')), len(lines))
            header_end = 2 if lines[0].startswith('Edmund Education') else 0
            body = lines[header_end:footer]
            title = ' '.join(body[:min(2,len(body))]) if body and len(body[0]) < 14 else (body[0] if body else f'Page {number}')
            record = dict(number=number, text=text, sha256=digest(text.encode()), header=lines[:header_end], body=body, footer=lines[footer:], title=title, category=category(title), image=f'page-{number:03}.webp')
            record['richBody'] = rich_body(page, header_end, footer, body)
            assert '\n'.join(record['header'] + record['body'] + record['footer']) == text
            if args.check:
                assert archived['pages'][number-1] == record, f'Page {number} differs'
                assert (OUT / record['image']).is_file()
            elif not args.reuse_images or not (OUT / record['image']).is_file():
                page.to_image(resolution=135).original.convert('RGB').save(OUT / record['image'], 'WEBP', quality=88)
            pages.append(record)
    answers = {}
    for line in pages[33]['body']:
        match = re.match(r'^(\d+)\. (.*)', line)
        if match:
            current = int(match[1]); answers[current] = match[2]
        elif answers: answers[current] += '\n' + line
    questions = []
    for index,start in enumerate(STARTS):
        end = STARTS[index+1]-1 if index+1 < len(STARTS) else 321
        assert re.search(rf'Question {index+1}\b', pages[start-1]['text'])
        questions.append(dict(number=index+1, startPage=start, endPage=end, pages=list(range(start,end+1)), answer=answers[index+1]))
    data = dict(version='20260904-deep1', formattingVersion='20260904-emphasis1', articleId='dse-2023-a', sourceName=SOURCE.name, sourceSha256=digest(SOURCE.read_bytes()), sourcePdf='original.pdf', pageCount=len(pages), pages=pages, questions=questions, supplementaryPages=list(range(1,35))+[322])
    assert sorted([p for q in questions for p in q['pages']] + data['supplementaryPages']) == list(range(1,323))
    if args.check:
        assert archived == data
        assert digest((OUT / 'original.pdf').read_bytes()) == data['sourceSha256']
    else:
        shutil.copyfile(SOURCE, OUT / 'original.pdf')
        (OUT / 'index.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    print(f'{"Verified" if args.check else "Imported"}: 322 pages, 22 questions, unchanged PDF; every extracted line accounted for.')

if __name__ == '__main__': main()
