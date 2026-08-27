#!/usr/bin/env python3
"""Independently check that no bilingual PDF table text or question page was lost."""
import argparse,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--extracted',type=Path,required=True)
args=p.parse_args()
normalize=lambda text:re.sub(r'\s+','',text.replace('\u00ad',''))
count=0
for source in sorted(args.extracted.glob('practice-*.json')):
    raw=json.loads(source.read_text());data=json.loads((ROOT/f"assets/listening/practices/practice-{raw['practice']}.json").read_text())
    last_key=max(page['page'] for page in raw['pages'] if re.match(r'Part [1-4] Ans',page['text']))
    first_analysis=next(page['page'] for page in raw['pages'] if re.search(r'(?m)^\d{1,2}[.\s–—-].*答案\s*[：:]',page['text']))
    expected={str(part):{'en':[],'zh':[]} for part in range(1,5)};part=None
    for page in raw['pages']:
        if not last_key<page['page']<first_analysis:continue
        for table in page['tables']:
            for row in table['rows']:
                cells=[value for value in row if value is not None]
                if len(cells)<2:continue
                en,zh=cells[0].strip(),cells[-1].strip()
                marker=re.fullmatch(r'PART\s+([1-4])',en,re.I)
                if marker:part=marker[1];continue
                if not part or en=='English' or not en or 'Knowledge pays' in en or '港大畢業' in en:continue
                expected[part]['en'].append(en);expected[part]['zh'].append(zh)
    for part in expected:
        for language in ['en','zh']:
            original=normalize(''.join(expected[part][language]))
            imported=normalize(''.join(row[language] for row in data['transcript'][part]))
            assert original==imported,f"Practice {raw['practice']} part {part} {language}: source text lost or changed"
    # Original question pages, including image-only pages, must all be represented.
    for part in data['parts']:
        assert set(part['sourcePages'])=={block['page'] for block in part['sourceBlocks']},f"Missing question page {raw['practice']}.{part['part']}"
    count+=1
print(f'{count} PDFs: all extracted English/Chinese transcript text and question pages accounted for.')
