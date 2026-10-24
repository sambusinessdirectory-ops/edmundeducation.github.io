"""Repair parser-generated contrasts without changing any canonical source answer."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
repairs=[]
def repair(text):
 text=re.sub(r'\b([Tt]here) (did|does|do) not be no (sign|need|working product)\b',lambda m:m[1]+(' was a ' if m[2]=='did' else ' is a ')+m[3],text)
 text=re.sub(r'\b([Tt]here) (did|does|do) not be no (point|shame|doubt|bad blood|smoke and mirrors|sacred cows)\b',lambda m:m[1]+(' were some ' if m[3]=='sacred cows' and m[2]=='did' else ' are some ' if m[3]=='sacred cows' else ' was ' if m[2]=='did' else ' is ')+('some ' if m[3] in ['point','shame','doubt'] else '')+m[3],text)
 text=re.sub(r'\b([Tt]here) (did|does|do) not be\b',lambda m:m[1]+{'did':' was not','does':' is not','do':' are not'}[m[2]],text)
 text=text.replace('Nora slowly might have opened','Nora might have slowly opened').replace('Nora slowly did not open','Nora did not slowly open')
 text=text.replace('None of the small shops in the street might have bitten the dust yet.','Perhaps none of the small shops in the street has bitten the dust yet.').replace('None of the small shops in the street has not bitten the dust yet.','All the small shops in the street have bitten the dust already.')
 text=text.replace('No one does not want to get it in the neck','Everyone wants to get it in the neck').replace('No one might want to get it in the neck','Perhaps no one wants to get it in the neck')
 text=text.replace('Nine times out of ten, it does not do.','Nine times out of ten, it does not.').replace('Nine times out of ten, it might do.','Nine times out of ten, it might.')
 text=text.replace('To put a tiger in your tank, might start the day with some exercise.','To put a tiger in your tank, start the day by staying awake all night.')
 return text
for batch in ['32-108','109-138']:
 path=root/f'content/idiom-compass-{batch}/grammar-contrasts.json';data=json.loads(path.read_text())
 for key,entry in data.items():
  for c in entry['candidates']:
   before=c[0];after=repair(before)
   if before!=after:
    c[0]=after
    c[1]='這個選項改變了原句的肯定、否定或確定程度，沒有保留題目所述情況。'
    if key=='idiom-109-q19':c[1]='原題建議以運動開始一天，這句改成通宵不睡。'
    repairs.append({'id':key,'before':before,'after':after})
 path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 p=root/f'tools/build-idiom-compass-{batch}.py';s=p.read_text();needle="   replacement=caps(new,m[0]);text="
 s=s.replace(needle,"   if old=='fair' and re.search(r'(school|village|book)\\s+$',answer[:m.start()],re.I):new='concert';axis='活動'\n"+needle)
 p.write_text(s)
(root/'content/idiom-compass-guide-zh/grammar-repairs.json').write_text(json.dumps(repairs,ensure_ascii=False,indent=2)+'\n')
print('Repaired',len(repairs),'cached contrasts')
