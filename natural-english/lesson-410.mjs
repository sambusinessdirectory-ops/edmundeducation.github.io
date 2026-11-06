import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-410-v2-audio","audio","聽到這句，食物最可能黏在哪裏？",["口腔上方的上顎。", "上下牙齒之間的牙縫。", "嘴唇外側。", "舌頭下方。"],"口腔上方的上顎。","roof of my mouth 是口腔上方的上顎，不是牙齒或嘴唇。"),
  mc("native-410-v2-continue","continue","朋友問 Want some water? 你想接受，並說清楚花生醬黏在口腔哪裏。哪句最合適？",["Yes, please. It’s stuck to the roof of my mouth.", "No thanks, I’ll wait until it loosens on its own.", "Yes, I have something caught between my teeth.", "No thanks, I need a napkin instead."],"Yes, please. It’s stuck to the roof of my mouth.","接受水並指出黏在上顎，回應了朋友為何提供水。"),
  mc("native-410-v2-branch","branch","朋友問 Is it stuck in your teeth? 其實麵包黏在口腔上方。哪句回應好？",["No, it’s stuck to the roof of my mouth.", "Yes, it’s between my teeth.", "No, I dropped it on my shirt.", "Yes, it’s stuck to my lips."],"No, it’s stuck to the roof of my mouth.","朋友猜食物卡在牙齒，你先否定，再指出真正黏住的位置是口腔上方。"),
  mc("native-410-v2-tone","tone","你因花生醬黏住口腔上方而暫時說話不清；朋友問 Are you okay? 哪句既安撫他又說明具體原因？",["I’m okay; the peanut butter is stuck to the roof of my mouth.", "I’m fine; just give me a moment to finish chewing.", "It’s just sticky food; I’ll be okay.", "I’m okay, but I need to clear something from my teeth."],"I’m okay; the peanut butter is stuck to the roof of my mouth.","先說自己沒事，再說明花生醬黏在上顎，讓朋友知道為何你暫時說話不清。"),
  {id:"native-410-v2-final",type:'open',style:"final",prompt:"新的情境：吃了一顆黏軟糖後，糖黏在上顎，很難弄下來；朋友問你為何皺眉。寫一兩句英文說明並請他給點水。",answers:["The candy is stuck to the roof of my mouth. Could I have some water?", "I’m okay, but it’s stuck to the roof of my mouth. Can you pass me water?", "This candy is stuck to the roof of my mouth; I need a sip of water."],explanation:"說清食物黏在上顎，不是牙縫；補上想喝水的請求。"}
];

const steps=[
  {"id": "native-410-v2-audio", "style": "audio", "label": "先聽位置", "title": "食物黏在哪裏？", "intro": "先聽句子，再定位口腔部位。", "model": "It’s stuck to the roof of my mouth.", "zh": "它黏在我的上顎。", "audioOnly": true, "questions": ["native-410-v2-audio"]},
  {"id": "native-410-v2-speak", "style": "speak", "label": "口頭指出", "title": "花生醬黏住了", "intro": "先說出黏着的位置，再聽示範。", "model": "It’s stuck to the roof of my mouth.", "zh": "它黏在我的上顎。", "speakingPrompt": "花生醬黏在嘴巴上方；口頭說「它黏在我的上顎」。", "recording": "phrase", "questions": []},
  {"id": "native-410-v2-continue", "style": "continue", "label": "接續關心", "title": "朋友遞水", "intro": "回應對方的幫忙。", "questions": ["native-410-v2-continue"]},
  {"id": "native-410-v2-branch", "style": "branch", "label": "說清部位", "title": "不是卡牙縫", "intro": "根據對方問題回答。", "questions": ["native-410-v2-branch"]},
  {"id": "native-410-v2-tone", "style": "tone", "label": "餐桌語氣", "title": "嘴裏有食物時", "intro": "比較禮貌而清楚的說法。", "questions": ["native-410-v2-tone"]},
  {"id": "native-410-v2-final", "style": "final", "label": "新零食自寫", "title": "軟糖黏住上顎", "intro": "自己寫位置和需要，再看示例。", "questions": ["native-410-v2-final"]}
];

export default {revision:2,summary:"用 stuck to the roof of my mouth 描述黏食物貼在上顎，與黏在牙齒區分。",steps,questions,takeaways:["It’s stuck to the roof of my mouth.", "The food is stuck to my teeth."],completionTitle:"你能清楚指出食物黏在口腔上方，並自然請人給水。"};
