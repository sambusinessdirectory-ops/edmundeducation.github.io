#!/usr/bin/env python3
"""Extract numbered Native English lessons for validation and editorial review."""
import argparse
import difflib
import hashlib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDFTOTEXT = Path(os.environ.get('PDFTOTEXT') or shutil.which('pdftotext') or
    '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
OVERRIDES = {
    423: 'One of the slats is bent.', 424: 'There’s a tear in the screen.',
    425: 'The stain has set.', 426: 'My umbrella turned inside out.',
    428: 'My necklace is tangled.', 429: 'The cake is dense.',
    430: 'The cake is fluffy.', 431: "It's gooey.",
    433: 'The watch band is cracking.', 434: 'My phone case has yellowed.',
    435: "I'm bloated.", 438: 'The audio is out of sync.',
    440: "The seat belt won't retract.", 441: 'The seat belt is twisted.',
    443: "The sensor isn’t picking up my hands.", 444: 'The ticket dispenser is jammed.',
    445: 'The meter expired.', 446: 'The elevator is out of service.',
    447: 'The vending machine ate my money.', 448: 'The key is double-typing.',
    449: 'The ice cubes have frozen together.', 450: 'The smell is lingering.',
    452: 'The paper straw has gone soggy.', 453: 'The straw is clogged.',
    454: 'There’s condensation on the cup.', 456: 'The marker bled through the paper.',
    457: 'The pen keeps skipping.', 458: 'It’s lost its stickiness.',
    460: 'There are bubbles under the screen protector.',
    461: 'The arms on my glasses are loose.', 462: 'One of the nose pads fell off.',
    464: 'I bit my tongue.', 465: 'I bit the inside of my cheek.',
    466: 'Half my mouth is still numb.', 467: 'My palms are sweaty.',
    469: 'The numbness is wearing off.', 470: 'I’m having a coughing fit.',
    471: 'The lens fogged up.', 473: 'The download stalled at 99%.',
    476: "The curtains won’t close all the way.",
    478: 'The corner of the rug is curling up.', 479: 'It left a heat mark.',
    487: 'The corner got crushed.', 543: "I can't find the end of the tape.",
    545: 'The plastic wrap keeps clinging to itself.',
    546: "The seal won’t close properly.", 547: 'The nozzle is clogged.',
    549: 'The pull tab snapped off.',
}
HOLD = {
    15: 'PDF 內容仍是第 12 課「手機放哪去了」，與檔名不符。',
    38: 'PDF 內容仍是第 37 課「回電」，與檔名不符。',
    46: 'PDF 內容仍是第 45 課「讓我在這裏下車」，與檔名不符。',
    105: 'PDF 內容仍是第 104 課「還有五分鐘」，與檔名不符。',
    148: 'PDF 內容仍是第 147 課「算了吧」，與檔名不符。',
    171: 'PDF 內容仍是第 170 課「今天不能來」，與檔名不符。',
    180: 'PDF 內容仍是第 179 課「快感冒了」，與檔名不符。',
    217: 'PDF 內容仍是第 218 課「網頁打不開」，與檔名不符。',
    231: 'PDF 內容仍是第 230 課「毛毛細雨」，與檔名不符。',
    239: 'PDF 內容仍是第 238 課「扣子快掉了」，與檔名不符。',
    242: 'PDF 內容仍是第 215 課「油漆鼓起」，與檔名不符。',
    244: 'PDF 內容仍是第 251 課「床墊凹下去」，與檔名不符。',
    268: 'PDF 內容仍是第 269 課「正在排隊嗎」，與檔名不符。',
    311: '課名以 viscous 為目標，但原稿第 1、3 步的正確答案是較日常的 too thick；需要釐清教學重點。',
    338: 'PDF 內容是「紙張邊角被折到」，缺少書頁折角作記號的教學。',
    474: 'PDF 內容仍是第 473 課「下載卡在 99%」，與滑鼠雙擊檔名不符。',
    475: 'PDF 內容仍是第 472 課「App 卡在載入」，與驗證碼檔名不符。',
}

def clean(value):
    value = re.sub(r'\*\*|`|^>\s*', '', value.strip())
    return re.sub(r'\s+', ' ', value).strip()

def english(value):
    return bool(re.search(r'[A-Za-z]{2}', value)) and not re.search(r'[\u3400-\u9fff]', value)

def phrases(text):
    out = []
    for raw in re.findall(r'\*\*(.*?)\*\*|>\s*([^\n]+)', text, re.S):
        value = clean(raw[0] or raw[1])
        if english(value) and 5 <= len(value) <= 150 and value not in out:
            out.append(value)
    return out

def title_target(text, number):
    first = next((line.strip() for line in text.splitlines() if line.strip()), '')
    title = clean(re.sub(r'^#+\s*', '', first))
    match = re.search(r'[:：]\s*([A-Za-z][^\n]+)$', title)
    target = OVERRIDES.get(number) or (clean(match.group(1)) if match else '')
    if not target:
        raise ValueError(f'{number}: missing English target')
    if match:
        title = clean(title[:match.start()])
    else:
        title = ''
    return title, target

def step_sections(text):
    matches = list(re.finditer(r'(?im)^#{1,3}\s*(?:Step\s*([1-8])\b|第\s*([1-8])\s*步)', text))
    if len(matches) == 8:
        return [text[m.start():(matches[i+1].start() if i+1 < 8 else len(text))].strip()
                for i, m in enumerate(matches)]
    parts = [p.strip() for p in re.split(r'(?m)^---\s*$', text) if p.strip()]
    if len(parts) >= 8:
        return parts[:7] + ['\n\n'.join(parts[7:])]
    return [text[:1000]] + [''] * 7

def options(section):
    lines = section.splitlines()
    groups, current = [], []
    for line in lines:
        raw = line.strip()
        match = re.match(r'^(?:\*\*)?([A-F])(?:[.)]|\*\*)\s*(.+)$', raw)
        if match:
            letter, value = match.groups()
            if letter == 'A' and current:
                groups.append(current); current = []
            current.append((letter, clean(value)))
        elif current and (not raw or raw.startswith('#')):
            if len(current) >= 2:
                groups.append(current)
            current = []
    if len(current) >= 2:
        groups.append(current)
    return [group for group in groups if len(group) >= 2]

def choice_from(section, target, fallback):
    for group in options(section):
        answer_match = re.search(r'(?:正確答案|答案)\s*[:：]\s*([A-F])', section, re.I)
        answer = next((v for key, v in group if answer_match and key == answer_match.group(1)), '')
        if not answer:
            answer = next((v for _, v in group if v.casefold() == target.casefold()), '')
        if answer:
            vals = list(dict.fromkeys(v for _, v in group))
            if answer in vals and len(vals) >= 2:
                return vals, answer
    vals = list(dict.fromkeys([target, fallback]))
    if len(vals) < 2:
        vals.append('這句在此情境不合適。')
    return vals, target

def changed_phrase(target, wrong):
    a, b = wrong.split(), target.split()
    matcher = difflib.SequenceMatcher(a=[w.casefold() for w in a], b=[w.casefold() for w in b])
    changes = [(j, k) for tag, _, _, j, k in matcher.get_opcodes() if tag in ('insert', 'replace') and j < k]
    if changes:
        j, k = max(changes, key=lambda pair: pair[1]-pair[0])
        return j, k
    candidates = [i for i, token in enumerate(b) if len(token.strip('.,!?')) >= 4]
    j = candidates[-1] if candidates else max(0, len(b)-1)
    return j, j+1

def source_blanks(section):
    """Read actual fill-in prompts from the source's recall stage."""
    lines=section.splitlines(); found=[]
    for i,line in enumerate(lines):
        template=clean(line)
        if not re.search(r'_{3,}',template) or not re.search(r'[A-Za-z]',template):
            continue
        split=re.split(r'(?:_+\s*)+',template,maxsplit=1)
        if len(split)!=2:
            continue
        answer=''
        awaiting=False
        for next_line in lines[i+1:i+11]:
            candidate=clean(next_line)
            match=re.match(r'^(?:答案|目標答案)\s*[:：]\s*(.+)$',candidate)
            if match and english(match.group(1)):
                answer=match.group(1);break
            if re.match(r'^(?:答案|目標答案)\s*[:：]?$',candidate):
                awaiting=True;continue
            if awaiting and candidate and english(candidate) and not re.search(r'_{3,}',candidate) \
               and not candidate.lower().startswith(('完整句','correct','audio')):
                answer=candidate;break
        if answer and len(answer)<=100:
            before,after=split
            if (before,after,answer) not in found:found.append((before,after,answer))
    return found[:3]

def dialogue_model(section, fallback):
    turns=[]
    for line in section.splitlines():
        match=re.match(r'^\s*(?:\*\*)?([A-Za-z][A-Za-z ]{1,25}):(?:\*\*)?\s*(.+)$',line)
        if not match:continue
        role,utterance=match.groups();utterance=clean(utterance)
        if role.lower() in ('audio','dialect','register','can-do','target','answer','scenario'):
            continue
        if english(utterance) and '_' not in utterance and len(utterance)<=110 and re.search(r'[.!?]$',utterance):
            turns.append(utterance)
    turns=list(dict.fromkeys(turns))
    joined=' '.join(turns[:3])
    return joined if len(turns)>=2 and len(joined)<=220 else fallback

def import_pdf(path):
    number = int(path.name.split('_', 1)[0])
    text = subprocess.check_output([str(PDFTOTEXT), '-layout', str(path), '-'], text=True).replace('\f', '\n').strip()
    title, target = title_target(text, number)
    if not title:
        title = path.name.split('_', 1)[1].rsplit('_Native English.pdf', 1)[0]
    phrases_found = phrases(text)
    wrong = next((p for p in phrases_found if p != target and len(p.split()) > 2 and re.search(r'[.!?。？]$',p)
                  and not p.lower().startswith(('dialect:', 'register:', 'can-do:','real-world'))), target)
    context = re.search(r'\*\*情境[:：]\*\*\s*([^\n]+)', text)
    summary = clean(context.group(1)) if context else title
    sections = step_sections(text)
    main_section = sections[0]
    first_options, first_answer = choice_from(main_section, target, wrong)
    later_options, later_answer = choice_from(sections[2], target, wrong)
    if english(first_answer) and first_answer != target and target not in first_options:
        first_options = list(dict.fromkeys([target] + first_options))
        first_answer = target
    if english(later_answer) and later_answer != target and target not in later_options:
        later_options = list(dict.fromkeys([target] + later_options))
        later_answer = target
    en_candidates = [p for p in phrases_found if p not in (target, wrong) and p != first_answer and re.search(r'[.!?]$', p)
                     and len(p.split()) >= 3 and '_' not in p and not p.lower().startswith(('answer:', 'the answer'))]
    extra = next((p for p in phrases_found if p in sections[5] and p not in (target,wrong)
                  and english(p) and '_' not in p and re.search(r'[.!?]$',p)), '') or next((p for p in en_candidates if p in '\n'.join(sections[5:])), '') or (en_candidates[0] if en_candidates else target)
    extra_tail = sections[5].split(extra, 1)[-1] if extra in sections[5] else ''
    extra_zh = next((clean(line.strip('「」* >')) for line in extra_tail.splitlines()[:8]
                     if re.search(r'[\u3400-\u9fff]{2}', line) and not re.search(r'(?i)正確|答案|correct|提示|挑戰|重點|情境|小結|留意|意思是', line)
                     and len(clean(line.strip('「」* >'))) <= 50), '')
    listen_options, listen_answer = choice_from(sections[1], target, wrong)
    extra_options, extra_answer = choice_from(sections[5], extra, target)
    listen_model=dialogue_model(sections[1],target)
    dialogue_audio=dialogue_model(sections[6],target)
    words = target.split()
    j, k = changed_phrase(target, wrong)
    key = ' '.join(words[j:k]).strip('.,!?') or words[-1].strip('.,!?')
    before = ' '.join(words[:j]); after = ' '.join(words[k:])
    if words[k-1].endswith(('.', '?', '!')) and not after:
        after = words[k-1][-1]
    prefix = f'native-{number:03}'
    def mc(id, prompt, opts, answer, explanation):
        return {'id':f'{prefix}-{id}','type':'mc','prompt':prompt,'options':opts[:6],'answers':[answer],'explanation':explanation}
    def blank(id, prompt, before, after, answer, hint):
        return {'id':f'{prefix}-{id}','type':'blank','prompt':prompt,'before':before,'after':after,'answers':[answer],'hint':hint,'explanation':f'完整表達：{target}'}
    questions = [
        mc('spot', f'這個情境：{title}。哪個說法更貼切？', first_options, first_answer, f'原稿的重點表達是：{target}'),
        mc('listen', '聽完示範，這句主要在表達甚麼？', listen_options, listen_answer, f'{target} 對應「{title}」。'),
        mc('choose', f'要表達「{title}」，應選哪句？', later_options, later_answer, f'這課的自然說法是：{target}'),
        blank('blank1', '填入這課的關鍵部分', before, after, key, f'留意這句的關鍵表達：{key}。'),
        blank('blank2', '把整句自然英文寫出來', '', '', target, f'參考原稿的示範：{target}'),
        blank('blank3', '再練一次，不看選項', before, after, key, f'這裏需要：{key}。'),
        mc('extra', '聽完第二句，哪一句最符合新情境？', extra_options, extra_answer,
           f'這個情境更貼切的是 {extra_answer}。' if extra_answer!=extra else f'再聽一次：{extra}'),
        blank('dialogue1', '在對話中說出這課的自然英文', '', '', target, f'這課的示範是：{target}'),
        blank('dialogue2', '再完成一次重點部分', before, after, key, f'重點是：{key}。'),
        blank('final', f'最後挑戰：{title}', '', '', target, '不看選項，完整寫出這課的表達。'),
    ]
    for position,(source_before,source_after,source_answer) in enumerate(source_blanks(sections[3])):
        q=questions[3+position]
        q.update(before=source_before,after=source_after,answers=[source_answer],
                 prompt=f'根據原稿完成句子：{title}',hint=f'留意完整句子的用字：{source_answer}。',
                 explanation=f'填入「{source_answer}」後：{source_before}{source_answer}{source_after}')
    steps = [
        {'id':f'{prefix}-surprise','label':'發現驚喜','title':f'{title}，怎樣說更自然？','intro':summary,'sentence':wrong,'reveal':f'原稿示範：{target}','model':target,'zh':title,'questions':[questions[0]['id']]},
        {'id':f'{prefix}-listen','label':'聽懂句子','title':'先聽，再理解意思','intro':f'聽示範，辨認「{title}」的意思。','model':listen_model,'zh':title,'questions':[questions[1]['id']]},
        {'id':f'{prefix}-choose','label':'選對一句','title':'選出符合情境的一句','intro':summary,'questions':[questions[2]['id']]},
        {'id':f'{prefix}-blanks','label':'自己填空','title':'不看選項，自己寫','intro':f'先填關鍵部分，再寫整句：{title}。','questions':[q['id'] for q in questions[3:6]]},
        {'id':f'{prefix}-speak','label':'開口練習','title':'換你說一次','intro':'先聽示範，再錄下自己的聲音。這一步可以跳過。','model':target,'zh':title,'recording':'phrase','questions':[]},
        {'id':f'{prefix}-extra','label':'第二個情境','title':'再聽一個實用說法','intro':'把表達放進另一個生活情境。','model':extra,'zh':extra_zh,'questions':[questions[6]['id']]},
        {'id':f'{prefix}-dialogue','label':'完成對話','title':'輪到你回應','intro':f'把「{title}」放進自然對話。','model':dialogue_audio,'zh':title,'recording':'dialogue','questions':[questions[7]['id'],questions[8]['id']]},
        {'id':f'{prefix}-final','label':'最後挑戰','title':'不用提示，完整說一次','intro':f'最後用自然英文表達「{title}」。','questions':[questions[9]['id']]},
    ]
    return {'id':prefix,'number':number,'slug':prefix,'titleZh':title,'titleEn':target,'heading':title,'summary':summary[:220],
            'surpriseLabel':'你可能會這樣說…','steps':steps,'questions':questions,'takeaways':list(dict.fromkeys([target,extra])),
            'completionTitle':f'你已學會表達「{title}」！',
            'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sourceFile':path.name}

def main():
    p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--output',type=Path,default=ROOT/'natural-english'/'imported-lessons.json');args=p.parse_args()
    if not PDFTOTEXT.is_file():raise SystemExit('pdftotext not found; set PDFTOTEXT to the Poppler binary')
    paths=sorted(args.source.glob('*.pdf'),key=lambda path:int(path.name.split('_',1)[0]))
    sources=[path for path in paths if int(path.name.split('_',1)[0])>=7]
    assert len(sources)==477 and len({int(path.name.split('_',1)[0]) for path in sources})==477
    lessons=[import_pdf(path) for path in sources if int(path.name.split('_',1)[0]) not in HOLD]
    for lesson in lessons:
        listen=lesson['questions'][1]
        if listen['options']==[lesson['titleEn'], lesson['steps'][0]['sentence']]:
            others=[item['titleZh'] for item in lessons
                    if item['number']!=lesson['number'] and item['titleZh']!=lesson['titleZh']
                    and abs(item['number']-lesson['number'])<=6]
            if len(others)<3:
                others=[item['titleZh'] for item in lessons if item['number']!=lesson['number'] and item['titleZh']!=lesson['titleZh']]
            listen['options']=[lesson['titleZh']]+list(dict.fromkeys(others))[:3]
            listen['answers']=[lesson['titleZh']]
        alternatives=[item['titleEn'] for item in sorted(lessons,key=lambda item:abs(item['number']-lesson['number']))
                      if item['number']!=lesson['number'] and item['titleEn'] not in
                      (lesson['titleEn'],lesson['steps'][0]['sentence'],lesson['steps'][5]['model'])]
        for position in (0,2,6):
            question=lesson['questions'][position]
            if len(question['options'])<3:
                question['options']=list(dict.fromkeys(question['options']+alternatives))[:4]
    assert len(lessons)+len(HOLD)==477
    assert all(len(lesson['steps'])==8 and len(lesson['questions'])==10 for lesson in lessons)
    args.output.write_text(json.dumps(lessons,ensure_ascii=False,separators=(',',':'))+'\n')
    (args.output.parent/'imported-lessons.mjs').write_text('export default '+json.dumps(lessons,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    review=ROOT/'natural-english'/'IMPORT-REVIEW.md'
    review.write_text('# Native English 暫緩上線清單\n\n'
        '以下 17 課已暫緩上線。請核對並修正對應 PDF；檔名與內容不符，或課名與原稿答案互相矛盾。'
        '修正後可從原稿重新匯入。\n\n'
        '| Lesson | Source PDF | Issue |\n| ---: | --- | --- |\n'
        +''.join(f'| {int(path.name.split("_",1)[0])} | `{path.name}` | {HOLD[int(path.name.split("_",1)[0])]} |\n'
                 for path in sources if int(path.name.split('_',1)[0]) in HOLD),encoding='utf-8')
    print(len(lessons),'lessons written; ',len(HOLD),'held for review; data bytes',args.output.stat().st_size)

if __name__=='__main__':main()
