import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-199-v2-audio","audio","聽到這句，最可能看到甚麼？",["衣服因靜電貼住腿。", "裙子的腰圍太緊。", "裙子布料有膠黏在腿上。", "裙子剛洗過仍是濕的。"],"衣服因靜電貼住腿。","static cling 指靜電造成的黏附。"),
  mc("native-199-v2-explain","explain","冬天從乾衣機拿出裙子，它一直黏在腿上。最可能是哪種現象？",["static cling", "a loose thread", "a broken zipper", "a tight waistband"],"static cling","乾燥和摩擦容易產生靜電，令布料黏附身體；此處沒有膠水或濕氣；摩擦後的靜電令布料貼在腿上。"),
  mc("native-199-v2-repair","repair","朋友只說 My skirt is sticky，但裙子並沒有沾膠，只是乾燥天氣貼住腿。哪句更準確？",["There’s static cling.", "There’s sticky residue.", "The skirt is wet.", "The skirt is too small."],"There’s static cling.","沒有黏性物質時，用 static cling 表示靜電黏附。"),
  mc("native-199-v2-continue","continue","朋友說 Your skirt keeps sticking to your legs. 你會怎樣解釋？",["Yeah, there’s a lot of static cling today.", "Yeah, it’s a little damp from the rain.", "Yeah, the fabric is quite tight.", "Yeah, there may be some adhesive on it."],"Yeah, there’s a lot of static cling today.","這句把裙子黏腿和當天的靜電現象連起來；裙子反覆貼腿，正是 static cling 造成的現象，乾燥天氣尤其常見。"),
  {id:"native-199-v2-final",type:'open',style:"final",prompt:"新的情境：從乾衣機取出襯衫，襯衫一直黏在內衣上。寫一兩句英文向室友說明情況和可能原因。",answers:["There’s a lot of static cling. My shirt keeps sticking to my undershirt.", "My shirt is clinging to my undershirt because of static.", "The clothes have static cling after the dryer, so they keep sticking together."],explanation:"static cling 說明因靜電黏在一起；可加具體是哪兩件衣服。"}
];

const steps=[
  {"id": "native-199-v2-audio", "style": "audio", "label": "先聽現象", "title": "衣服怎麼了？", "intro": "先聽英文，再選情況。", "model": "There’s static cling.", "zh": "衣服有靜電黏附。", "audioOnly": true, "questions": ["native-199-v2-audio"]},
  {"id": "native-199-v2-explain", "style": "explain", "label": "解釋原因", "title": "不是尺寸太小", "intro": "辨認衣物黏附的現象。", "questions": ["native-199-v2-explain"]},
  {"id": "native-199-v2-speak", "style": "speak", "label": "口頭解釋", "title": "裙子為何黏腿", "intro": "先試着說出「有靜電黏附。」，再聽示範。", "model": "There’s static cling.", "zh": "有靜電黏附。", "speakingPrompt": "朋友問你為甚麼裙子一直黏着腿；口頭說是靜電。", "recording": "phrase", "questions": []},
  {"id": "native-199-v2-repair", "style": "repair", "label": "修正解釋", "title": "說清楚黏的原因", "intro": "把模糊描述改準確。", "questions": ["native-199-v2-repair"]},
  {"id": "native-199-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友發現裙子黏腿", "intro": "用原因回應觀察。", "questions": ["native-199-v2-continue"]},
  {"id": "native-199-v2-final", "style": "final", "label": "新情境自寫", "title": "乾衣機後的襯衫", "intro": "先寫，再對照自評。", "questions": ["native-199-v2-final"]}
];

export default {revision:2,summary:"用 static cling 描述衣服因靜電黏在身體或另一件衣物上。",steps,questions,takeaways:["There’s static cling.", "There’s a lot of static cling."],completionTitle:"你能解釋乾燥天氣時衣服黏身的原因。"};
