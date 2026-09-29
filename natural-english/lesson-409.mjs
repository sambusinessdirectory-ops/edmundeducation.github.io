import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-409-v2-audio","audio","聽到這句，最可能是甚麼？",["有人把螺旋蓋擰得過緊。", "瓶蓋螺紋一開始就旋歪。", "瓶蓋已經完全打開。", "瓶身有一條裂縫。"],"有人把螺旋蓋擰得過緊。","overtightened 是原本正確旋上，但用力旋得太緊；cross-threaded 是旋歪。"),
  mc("native-409-v2-reverse","reverse","水壺蓋沿正確螺紋旋上，但前一人再用力擰了很多下，現在很難開。哪詞最準？",["overtightened", "cross-threaded", "loose", "missing"],"overtightened","蓋子沒有歪，只是擰得過緊，所以用 overtightened。"),
  mc("native-409-v2-transfer","transfer","牙膏管蓋子被擰得太緊，打開很費力。哪句可用？",["The toothpaste cap is overtightened.", "The toothpaste cap is missing.", "The toothpaste cap is cross-threaded.", "The toothpaste tube is empty."],"The toothpaste cap is overtightened.","overtightened 可用於任何沿正確螺紋卻擰得過緊的蓋子。"),
  mc("native-409-v2-scene","scene","哪個畫面最支持 The cap is overtightened？",["蓋子平整旋到位，但轉開要很大力。", "蓋子一側高一側低，螺紋咬歪。", "蓋子只是放在瓶旁。", "瓶蓋一碰就掉下。"],"蓋子平整旋到位，但轉開要很大力。","旋到位但難開是過緊；斜着咬住更像 cross-threaded。"),
  {id:"native-409-v2-final",type:'open',style:"final",prompt:"新的情境：一瓶清潔劑的螺旋蓋旋得平整，但非常緊；你試了幾次都打不開。寫一兩句英文向室友說明並請他幫忙。",answers:["The cap is overtightened. Could you help me open this bottle?", "I think someone overtightened the cap. Can you give it a try?", "The cleaning bottle's cap is on straight but overtightened. Could you help?"],explanation:"說明蓋子平整但旋太緊，再提出開瓶求助；不要誤說旋歪。"}
];

const steps=[
  {"id": "native-409-v2-audio", "style": "audio", "label": "先聽原因", "title": "蓋子為何難開？", "intro": "先聽句子，再判斷前一次關蓋動作。", "model": "The cap is overtightened.", "zh": "瓶蓋旋得太緊。", "audioOnly": true, "questions": ["native-409-v2-audio"]},
  {"id": "native-409-v2-reverse", "style": "reverse", "label": "由操作選詞", "title": "過度用力鎖蓋", "intro": "找最精確的原因。", "questions": ["native-409-v2-reverse"]},
  {"id": "native-409-v2-speak", "style": "speak", "label": "口頭說明", "title": "瓶蓋擰太緊", "intro": "先說出蓋子過緊，再聽示範。", "model": "The cap is overtightened.", "zh": "瓶蓋被旋得太緊。", "speakingPrompt": "你轉不開水壺蓋，覺得有人擰太緊；口頭說「蓋子被旋得太緊」。", "recording": "phrase", "questions": []},
  {"id": "native-409-v2-transfer", "style": "transfer", "label": "換到牙膏管", "title": "另一個螺旋蓋", "intro": "把說法用在小容器。", "questions": ["native-409-v2-transfer"]},
  {"id": "native-409-v2-scene", "style": "scene", "label": "選問題畫面", "title": "太緊還是旋歪", "intro": "由瓶蓋位置判斷。", "questions": ["native-409-v2-scene"]},
  {"id": "native-409-v2-final", "style": "final", "label": "新瓶子自寫", "title": "清潔劑瓶蓋難開", "intro": "自己寫觀察和求助，再對照示例。", "questions": ["native-409-v2-final"]}
];

export default {revision:2,summary:"用 overtightened 描述螺旋蓋被旋得太緊，並和旋歪的 cross-threaded 區分。",steps,questions,takeaways:["The cap is overtightened.", "The cap is cross-threaded."],completionTitle:"你能分清旋太緊與螺紋旋歪，並在新容器情境描述問題。"};
