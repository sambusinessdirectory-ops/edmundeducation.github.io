"""Rebuild contrastive options. Run from repository root; never infer answer keys.
Only the reviewed section/question manifests can change an answer. Domain/lexical exclusions
are conservative candidate filters, not a substitute for editorial review.
"""
import json,hashlib,re,collections,argparse,subprocess
from pathlib import Path
from semantic import features,overlap
ROOT=Path.cwd(); HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--baseline',type=Path,required=True);args=parser.parse_args()
# Baseline must be a clean export of the pre-repair catalogue; repeatable builds
# must never infer legacy keys from a previously rebuilt output.
BASE=args.baseline
CUTOFF='2026-10-24T16:25:29Z'
question_review=json.loads((HERE/'reviewed-questions.json').read_text())
review=json.loads((HERE/'reviewed-sections.json').read_text())
BANK=[('purchase','用金錢購買某件物品'),('duration','某件事持續的一段時間'),('energy','消耗身體的體力或精力'),('sound','耳朵聽見的聲音'),('food','供人食用的食物'),('colour','物件表面呈現的顏色'),('distance','兩個地點之間的距離'),('weight','物件的重量'),('weather','某個地方的天氣狀況'),('plant','在泥土中生長的植物'),('building','供人居住的房屋'),('law','法院依法律作出的判決')]
report={'revision':'20261025-fairness1','modules':0,'questions':0,'changedAnswers':[],'optionCounts':{},'fallbackQuestions':0};count=collections.Counter();sql=[];index=[]
# Keep source documents and existing question IDs intact.
for p in sorted((ROOT/'polysemy-lab/content').glob('*.mjs')):
 original=json.loads((BASE/'polysemy-lab/content'/p.name).read_text()[15:-2]); m=json.loads(json.dumps(original)); sm={s['id']:s for s in m['senses']}
 for meaning in [*m['senses'],*m.get('mcqMeanings',[])]:
  meaning['title']=re.split(r'[；;]\s*例句[：:]',meaning['title'])[0].removeprefix('表示').removesuffix('；屬於').strip()
 for q in m['questions']:
  section=q['id'][len(m['id'])+1:].split('-')[0]
  title=review.get(m['id'],{}).get(str(int(section))) or question_review.get(q['id'])
  if not title:continue
  old=q.get('correctOption',q['sense']);sid=f"{m['id']}-reviewed-{hashlib.sha256(title.encode()).hexdigest()[:10]}"
  if sid not in sm:
   s={'id':sid,'title':title,'form':f"{m['word']} · source section {int(section)}",'en':title,'zh':title,'note':f'對照原始教材第 {int(section)} 節及例句核實。','examples':[],'options':[],'excludedOverlaps':[]};sm[sid]=s;m['senses'].append(s)
  if old!=sid:
   sm[old]['examples']=[e for e in sm[old].get('examples',[]) if e[0]!=q['en']]
   sm[sid]['examples'].append([q['en'],q['zh'],title])
   q['previousCorrectOption']=old;q['answerRevisedAt']=CUTOFF
   report['changedAnswers'].append({'module':m['id'],'question':q['id'],'old':old,'answer':sid,'sentence':q['en'],'meaning':title})
  q['sense']=sid;q['correctOption']=sid
  if m['id']=='spend':
   clue='strength 指體力' if 'strength' in q['en'] else 'energy 指精力'
   q['explanation']=f'本句的 {clue}。spent 表示這些力量被消耗了，並沒有提到花錢。完整意思：{q["zh"]}'
  else:q['explanation']=f'對照完整句子：「{q["zh"]}」。這裡的「{q.get("targets",[m["word"]])[0]}」表示「{title}」。'
 # Never use a question's accepted paraphrases as wrong alternatives.
 f={s['id']:features(s) for s in m['senses']}; valid=[s for s in m['senses'] if s.get('examples')]
 extra={}
 for q in m['questions']:
  answer=q.get('correctOption',q['sense']);chosen=[answer];accepted=set(q.get('acceptedSenses',[]))
  # Widest semantic separation first, rather than neighbouring source rows.
  candidates=sorted(valid,key=lambda s:(len(f[answer][0]&f[s['id']][0]), hashlib.sha256((q['id']+s['id']).encode()).hexdigest()))
  for s in candidates:
   sid=s['id']
   if sid in chosen or sid in accepted:continue
   if any(sid in sm[x].get('excludedOverlaps',[]) or x in s.get('excludedOverlaps',[]) for x in chosen):continue
   if all(not overlap(f[sid],f[x]) for x in chosen):chosen.append(sid)
   if len(chosen)==4:break
  # If the module is mainly grammatical variants of one meaning, supply a
  # clearly different meaning, never a near-synonym merely to reach six.
  if len(chosen)<2:
   report['fallbackQuestions']+=1
   for key,title in BANK:
    sid='contrast-'+key;feat=features({'title':title})
    if all(not overlap(feat,f[x]) for x in chosen):
     f[sid]=feat;extra[sid]={'id':sid,'title':title};chosen.append(sid)
    if len(chosen)==2:break
  if len(chosen)<2:raise ValueError(f'No safe contrast: {q["id"]}')
  q['options']=chosen
  q['optionReasons']={sid:(q.get('explanation') or sm[answer]['title']) if sid==answer else '請比較這個意思與句子中標示的用法。' for sid in chosen}
  count[len(chosen)]+=1;report['questions']+=1
 m['mcqMeanings']=[*m.get('mcqMeanings',[]),*extra.values()];m['choiceRevision']=report['revision']
 p.write_text('export default '+json.dumps(m,ensure_ascii=False,indent=2)+';\n');report['modules']+=1
 # New choices and corrected keys are explicit per question. Retain older
 # valid options separately so an already-open tab can still sync; only
 # options (2–4 meanings) are active in the new question catalogue.
 oldqs={q['id']:q for q in original['questions']}
 qs={q['id']:{'answer':q.get('correctOption',q['sense']),'options':q['options'],'legacyOptions':oldqs[q['id']]['options'],**({'previousAnswer':q['previousCorrectOption'],'answerRevisedAt':q['answerRevisedAt']} if 'previousCorrectOption' in q else {})} for q in m['questions']}
 payload=json.dumps(qs,ensure_ascii=False,separators=(',',':')).replace("'","''")
 senses=json.dumps(list(sm),separators=(',',':'))
 sql.append("update polysemy_private.catalogue set questions=questions || '"+payload+"'::jsonb, senses=(select jsonb_agg(distinct value) from jsonb_array_elements(senses || '"+senses+"'::jsonb)) where module='"+m['id'].replace("'","''")+"';")
 if m.get('mass'):
  index.append({k:m[k] for k in ['id','word','number','mass']}|{'senses':[{'id':s['id']} for s in m['senses']], 'questions':[{k:q[k] for k in ['id','sense','correctOption','en','previousCorrectOption','answerRevisedAt'] if k in q} for q in m['questions']]})
report['optionCounts']=dict(count)
(ROOT/'polysemy-lab/mass-index.mjs').write_text('export default '+json.dumps(sorted(index,key=lambda m:m['number']),ensure_ascii=False,separators=(',',':'))+';\n')
(HERE/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
D=Path('/private/tmp/polysemy-fairness/sql');D.mkdir(exist_ok=True)
for i in range(0,len(sql),20):(D/f'{i//20:03}.sql').write_text('begin;\n'+'\n'.join(sql[i:i+20])+'\ncommit;')
print(json.dumps({k:v if k!='changedAnswers' else len(v) for k,v in report.items()}))
